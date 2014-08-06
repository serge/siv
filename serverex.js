#!/usr/bin/env node

var fs = require('fs');
var express = require('express');
var _ = require('underscore');
var cnt = require("./content");

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

app.get('/', function(req, res) {
    res.set('Content-Type', 'text/html');
    var resp = "<!DOCTYPE html><html><head><title>Serving images from \"" +
            path + "\" folder</title>"  +
            "<script src='//ajax.googleapis.com/ajax/libs/angularjs/1.2.14/angular.min.js'></script>" +
            "<script src='/static/main.js'></script>" +
            "<link rel='stylesheet' href='/static/main.css' />" +
            " </head><body ng-app='main' ng-controller='ctr' >" +
            "<div class='title'>{{title}}</div>" +
            "<div class='image' style='background-image:{{url}}'>" +
            "<div id='prev' ng-click='prev()'><div arrow-prev></div></div>" +
            "<div id='next' ng-click='next()'><div arrow-next></div></div>" +
            "</div>" +
//            "<div class='bottom_panel' thumbs-gallery></div>" +
            "</body></html>";
    res.send(resp);
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
app.get('/next', function(req, res) {
    res.send(nav(true));
});

app.get('/prev', function(req, res) {
    res.send(nav(false));
});

app.get('/images', function(req, res) {
        res.send({files:content.files});
});

app.listen(port);
console.log('Open your browser at http://localhost:' + port + ' ...');
