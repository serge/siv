#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var _ = require('underscore');
var cnt = require("./content");
var mpath = require('path');
var Q = require('q');
var ei = require('easyimage');

var app = express();
var id = 0;
var path = process.argv[2];
var cache_path = 'cache';
var image_info = {};

function main(exists) {

    if(!exists) {
        console.log('Invalid or non-existing path ' + path);
        process.exit(-1);
    }

    var port = process.env.PORT;

    console.log("Serving ruller [" + path + "]");

    var content = new cnt.Content(path, cache_path);

    app.use('/static', express.static(path));
    app.use('/static', express.static('js'));
    app.use('/static', express.static('css'));
    app.use('/thumbs', express.static(cache_path));
    app.engine('jade', require('jade').__express);

    app.get('/', function(req, res) {
        var folder_name = mpath.basename(path);
        var title = "Serving images from [" + folder_name + "]";
        res.render('main.jade', {Title:title});
    });

    app.get('/images', function(req, res) {
        res.send({files:content.files});
    });

    app.get('/image/:id', function(req, res) {
        var id = parseInt(req.params.id);
        var image_file = content.files[id];
        var respond = function(info) {
            var data = {
                id: id,
                url:image_file,
                width: info.width,
                height: info.height
            };
            image_info[image_file] = data;
            res.send(data);
        };
        if(_.has(image_info, image_file)){
            respond(image_info[image_file]);
        } else
            ei.info(path + '/' + image_file).then(respond, function(err) {
                console.dir(err);
                console.log('responding with default size');
                respond({width:100, height:100});
            });
    });

    app.listen(port);
    console.log('Open your browser at http://localhost:' + port + ' ...');

}

Q.nfcall(fs.exists, path).then(function() {} ,main);
