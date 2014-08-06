var fs = require('fs');
var _ = require('underscore');
var thumbs = require('./thumbs');

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
            console.log(thumbPath);
            if(!fs.existsSync(thumbPath)) {
                thumbs.convert(path + '/' + filename, 128, thumbPath, fn);
                break;
            }
        };
    };
    return fn;
}

Content.prototype.create_content = function () {
    var that = this;
    fs.readdir(this.path, function(err, nfiles) {
        _.extend(that.files, nfiles);
        var fn = chain(nfiles, that.path, that.cache);
        fn(0);
    });
};

exports.Content = Content;
