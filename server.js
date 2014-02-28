
/**
 * Module dependencies.
 */

var express = require('express');
var Controller = require('./routes/Controller');
var http = require('http');
var path = require('path');
var url = require('url');

var app = express();

// all environments
app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', Controller.indexGet);
app.get('/resource', Controller.resource);
app.get('/rdftranslator', Controller.rdftranslator);
app.get('/miserables.json', function(req, res){
    var miserables = require('./routes/miserables');
    res.json(miserables);
})

http.createServer(app).listen(app.get('port'), app.get('ipaddr'), function(){
  console.log('Express server listening on ' + app.get('ipaddr') + ":" + app.get('port'));
});