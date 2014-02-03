/**
 * Created with JetBrains WebStorm.
 * User: sasko
 * Date: 2.2.14
 * Time: 20:26
 * To change this template use File | Settings | File Templates.
 */

var unirest = require('unirest');

var Controller = module.exports = {};

Controller.indexGet = function(request, response){
    response.render('index', { title: 'Express' });
};

Controller.indexPost = function(request, response){

    response.render('index', {});
};

Controller.resourcefetch = function(request, response){
    if(request.query.url){

        unirest.get(request.query.url)
            .headers({ 'Accept': 'application/rdf+json' })
            .end(function (res) {
                response.writeHead(200);
                response.end(res.body);
            });
    }
}