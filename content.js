var fs = require('fs');
var _ = require('underscore');
var thumbs = require('./thumbs');
var Q = require('q');

function Content(path, cache) {
    this.path = path;
    this.files = [];
    this.create_content();
    this.cache = cache;
}

function chain(nfiles, path, cache) {
    var n = 0;
    var fn = function(cpath) {
        while(n<nfiles.length) {
            var filename = nfiles[n++];
            var thumbPath = cache + '/' + filename;
            if(!fs.existsSync(thumbPath)) {
                thumbs.convert(path + '/' + filename, 128, thumbPath)
                .then(fn, function(v) {
                    console.dir(v);
                    fn(0);
                });
                break;
            }
        };
    };
    return fn;
}

Content.prototype.create_content = function () {
    var ctn = this;

    function parse() {
        fs.readdir(ctn.path, function(err, nfiles) {
            nfiles = _.filter(nfiles, function(v) {
                return fs.statSync(ctn.path + '/' + v).isFile();
            });
            ctn.files = _.object(_.range(nfiles.length),
                                 _.map(nfiles,
                                       function (url, i) {
                                           return {id:i, url:url};
                                       }));
            var fn = chain(nfiles, ctn.path, ctn.cache);
            fn(0);
        });
    };

    Q.nfcall(fs.exists, this.cache).then(function() {}, function(exists) {
        if(exists)
            parse();
        Q.nfcall(fs.mkdir, ctn.cache).then(function () {
            parse();
        });
    });
};

exports.Content = Content;
