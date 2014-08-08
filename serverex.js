#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var _ = require('underscore');
var cnt = require("./content");
var mpath = require('path');

var app = express();
var id = 0;
var path = process.argv[2];
var cache = 'cache';

if(!fs.existsSync(path)) {
    console.log('Invalid or non-existing path ' + path);
    process.exit(-1);
}

var port = 3000;

console.log("Serving ruller [" + path + "]");

var content = new cnt.Content(path, cache);

app.use('/static', express.static(path));
app.use('/static', express.static('js'));
app.use('/static', express.static('css'));
app.use('/thumbs', express.static(cache));
app.engine('jade', require('jade').__express);

app.get('/', function(req, res) {
    var folder_name = mpath.basename(path);
    var title = "Serving images from [" + folder_name + "]";
    res.render('main.jade', {Title:title});
});

function nav(inc) {
    var resp = {};
    if(inc)
        id++;
    else {
        id = content.files.length - 1;
        id %= content.files.length;
    }
    if(!_.isEmpty(content.files)) {
        var filepath = content.files[id % content.files.length];
        resp = {
            title: filepath.split('.')[0],
            path: filepath
        };
    }
    return resp;
}

app.get('/images', function(req, res) {
        res.send({files:content.files});
});

app.listen(port);
console.log('Open your browser at http://localhost:' + port + ' ...');
