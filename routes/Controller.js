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

Controller.resource = function(req, res){
    if(req.query.uri){
        console.log(req.query.uri);
        rdfstore.create(function(store) {
            var url = 'LOAD <' + req.query.uri + '> INTO GRAPH <http://example.org/resource>';

            store.execute(url, function() {

                store.graph("http://example.org/resource", function(success, graph){
                    //console.log(graph);

                    var query = "SELECT * WHERE {<" + req.query.uri + "> ?property ?object}";

                    store.execute(query, ["http://example.org/resource"], [], function(success, results){
                            if(success) {
                            // process results
                            /*
                            *   oblikot na rezultatite
                            [
                                {
                                    property: {
                                        token: 'uri',
                                        value: 'http://purl.org/dc/terms/subject'
                                    },
                                    object: {
                                        token: 'uri',
                                        value: 'http://dbpedia.org/resource/Category:Fellows_of_the_American_Academy_of_Arts_and_Sciences'
                                    }
                                },
                                 {
                                    property: {
                                        token: 'uri',
                                        value: 'http://www.w3.org/2000/01/rdf-schema#label'
                                    },
                                    object: {
                                        token: 'literal',
                                        value: 'Woody Allen', lang: 'fr'
                                    }
                                }
                            ]
                            *
                            * */
                            //console.log(results);

                            var nodes = [];
                            var links = [];
                            var literals = [];
                            var resourcePropsHash = {};

                            var mainNode = {
                                name: req.query.uri,
                                attributes: results,
                                group: "main"
                            };
                            nodes.push(mainNode);

                            for(var i=0; i<results.length; i++){
                                if('literal' == results[i].object.token){
                                    var literal = {
                                        name: results[i].property.value,
                                        value: results[i].object.value
                                    }

                                    literals.push(literal);
                                }

                                if('uri' == results[i].object.token){
                                    if(!resourcePropsHash[results[i].property.value]){
                                        resourcePropsHash[results[i].property.value] = [];
                                    }
                                    resourcePropsHash[results[i].property.value].push(results[i].object.value);

                                    /*var propNode = {
                                        name: results[i].object.value,
                                        attributes: false,
                                        group: results[i].property.value
                                    };

                                    nodes.push(propNode);

                                    var link = {
                                        "source": 0,
                                        "target": nodes.length-1,
                                        "value": 10,
                                        name: results[i].property.value
                                    }
                                    links.push(link);*/
                                }
                            }

                            for(var prop in resourcePropsHash){
                                if(resourcePropsHash.hasOwnProperty(prop)){
                                    //push the propNode
                                    var propNode = {
                                        name: prop,
                                        attributes: false,
                                        group: "property"
                                    };
                                    nodes.push(propNode);
                                    var propIndex = nodes.length-1;

                                    var link = {
                                        "source": 0,
                                        "target": propIndex,
                                        "value": 10,
                                        name: prop
                                    }
                                    links.push(link);

                                    //push the nodes linked with that property
                                    for(var i=0; i<resourcePropsHash[prop].length; i++){
                                        var node = {
                                            name: resourcePropsHash[prop][i],
                                            attributes: false,
                                            group: prop
                                        };
                                        nodes.push(node);

                                        var link = {
                                            "source": propIndex,
                                            "target": nodes.length-1,
                                            "value": 10,
                                            name: prop
                                        }
                                        links.push(link);
                                    }

                                }
                            }

                            if(resourcePropsHash['http://dbpedia.org/ontology/thumbnail']){
                                nodes[0].image = resourcePropsHash['http://dbpedia.org/ontology/thumbnail'];
                            }

                            //return the response
                            var response = {
                                "nodes": nodes,
                                "links": links,
                                "literals": literals
                            }
                            res.json(response);
                        }else {
                            console.log("errrorr");
                        }
                    });
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