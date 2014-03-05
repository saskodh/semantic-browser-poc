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

        rdfstore.create(function(store) {
            var url = 'LOAD <' + req.query.uri + '> INTO GRAPH <http://example.org/resource>';

            try {
                store.execute(url, function() {

                    store.graph("http://example.org/resource", function(success, graph){
                        //console.log(graph);

                        var query = "SELECT * WHERE {<" + req.query.uri + "> ?property ?object}";
                        try{
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
                                     value: 'http://dbpedia.org/resource/Category:Fellows_of_the_American_Academy'
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

                                    //clear the store
                                    store.clear();

                                    res.json(response);
                                }else {
                                    //console.log("errrorr");
                                }
                            });
                        }catch(error){
                            console.log('error');
                            var errorNode = {
                                name: 'Internal error',
                                group: -1
                            }
                            var errorLiteral = {
                                name: 'Internal error',
                                value: 'Internal error'
                            }

                            var response = {
                                nodes: [errorNode],
                                links: [],
                                literals: [errorLiteral]
                            }
                            res.json(response);
                        }

                    });
                });
            }catch(error){
                //console.log('error');
                var errorNode = {
                    name: 'The resource is not valid, please check the URI.',
                    group: -1
                }
                var errorLiteral = {
                    name: 'URI loading error',
                    value: 'The resource is not valid, please check the URI.'
                }

                var response = {
                    nodes: [errorNode],
                    links: [],
                    literals: [errorLiteral]
                }
                res.json(response);
            }
        });
    }
}

Controller.query = function(request, response){
    var endpoint = request.query.endpoint;
    var keyword = request.query.keyword;

    //console.log(endpoint);
    //console.log(keyword);

    if(endpoint && keyword){

        var query = 'SELECT distinct ?subject WHERE {?subject <http://www.w3.org/2000/01/rdf-schema#label> ?object .' +
            '?object bif:contains "\'' + keyword + '\'"} limit 100';

        //console.log(query);

        var path = endpoint;
        path += '?query=' + query;
        path += '&format=application/sparql-results+json';
        path += '&timeout=3000';

        //console.log(path);

        path = encodeURI(path);
        //console.log(path);

        //doesn't work with path
        var location = endpoint + "?query=SELECT+distinct+%3Fsubject+WHERE+%7B%3Fsubject+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label%3E+%3Fobject+.+%3Fobject+bif%3Acontains+%22%27"+ keyword +"%27%22%7D+limit+20%0D%0A&format=application%2Fsparql-results%2Bjson&timeout=5000";

        //console.log(location);

        unirest.get(location)
            //.headers({ 'Accept': 'application/rdf+json' })
            .end(function (res) {
                console.log(res);
                var result = [];
                try{
                    var data = JSON.parse(res.body);
                    //var data = res.body;
                    for(var i=0; i<data.results.bindings.length; i++){
                        result.push(data.results.bindings[i].subject.value);
                    }
                }catch(e){
                    console.log(e);
                }
                response.json(result);
            });
    }else {
        response.writeHead(200);
        response.end("You must provide endpoint and keyword as query string parametars!");
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