/**
 * Created with JetBrains WebStorm.
 * User: sasko
 * Date: 2.2.14
 * Time: 20:26
 * To change this template use File | Settings | File Templates.
 */

var unirest = require('unirest');
var rdfstore = require('rdfstore');

var Controller = module.exports = {};

Controller.indexGet = function(request, response){
    response.render('index', { title: 'Express' });
};

Controller.indexPost = function(request, response){

    response.render('index', {});
};

Controller.resource = function(req, res){
    if(req.query.uri){
        console.log(req.query.uri);
        rdfstore.create(function(store) {
            var url = 'LOAD <' + req.query.uri + '> INTO GRAPH <http://example.org/resource>';

            store.execute(url, function() {

                store.graph("http://example.org/resource", function(success, graph){
                    console.log(graph);

                    if(success){
                        graph.filter(function(triple, thisGraph){
                            return true;
                        })

                        res.json(graph.toArray());
                    }
                    /*for(var i=0; i<graph.triples.length; i++){
                     console.log('------------triple------------');
                     console.log('    '+ graph.triples[i].subject);
                     console.log('    '+ graph.triples[i].predicate);
                     console.log('    '+ graph.triples[i].object);
                     }*/
                });
            });
        });
    }
}

Controller.resourcefetch = function(request, response){
    if(request.params.resource){



        unirest.get(request.params.resource)
            .headers({ 'Accept': 'application/rdf+json' })
            .end(function (res) {
                response.writeHead(200);
                response.end(res.body);
            });
    }
}

Controller.rdftranslator = function(req, res){
    if(req.query.url){

        unirest.get("http://rdf-translator.appspot.com/convert/detect/rdf-json-pretty/" + req.query.url)
            .end(function (result) {

                console.log(result.body[req.query.url]);
                res.json(result.body);

            });
    }
}