
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
app.set('port', process.env.PORT || 3000);
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//var rdfstore = require('rdfstore');

/*rdfstore.create(function(store) {
    store.execute('LOAD <http://dbpedia.org/resource/Tim_Berners-Lee> INTO GRAPH <http://example.org/people>', function() {
        // simple query execution
        store.execute("SELECT * { ?s ?p ?o }", function(success, results){
            if(success) {
                // process results
                console.log(results);
                *//*if(results[0].s.token === 'uri') {
                 console.log(results[0].s.value);
                 }*//*
            }
        });
    });
}) ;*/

//rdfstore.create(function(store) {
//    store.execute('LOAD <http://dbpedia.org/resource/Tim_Berners-Lee> INTO GRAPH <http://example.org/people>', function() {
//
//        store.graph("http://example.org/people", function(success, graph){
//            //console.log(graph);
//
//            /*for(var i=0; i<graph.triples.length; i++){
//                console.log('------------triple------------');
//                console.log('    '+ graph.triples[i].subject);
//                console.log('    '+ graph.triples[i].predicate);
//                console.log('    '+ graph.triples[i].object);
//            }*/
//        });
//
//        store.setPrefix('dbp', 'http://dbpedia.org/resource/');
//        // simple query execution
//        var query = "SELECT * WHERE {?subject ?property ?object}";
//
//        store.execute(query, ["http://example.org/people"], [], function(success, results){
//                if(success) {
//                // process results
//                console.log(results);
//                /*if(results[0].s.token === 'uri') {
//                    console.log(results[0].s.value);
//                }*/
//            }
//        });
//
//
//        store.node(store.rdf.resolve('dbp:Tim_Berners-Lee'), "http://example.org/people", function(success, graph) {
//
//            //console.log(graph);
//            var peopleGraph = graph.filter(store.rdf.filters.type(store.rdf.resolve("foaf:Person")));
//
//            //console.log(peopleGraph);
//            //console.log(peopleGraph.triples[0].subject);
//            //console.log(peopleGraph.triples[0].predicate);
//            //console.log(peopleGraph.triples[0].object);
//
//            store.execute('PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
//                     PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
//                     PREFIX : <http://example.org/>\
//                     SELECT ?s FROM NAMED :people { GRAPH ?g { ?s rdf:type foaf:Person } }',
//                function(success, results) {
//
//                    console.log(peopleGraph.toArray()[0].subject.valueOf() === results[0].s.value);
//
//                });
//
//        });
//
//    });
//})


/*rdfstore.create(function(store) {
    console.log(store);

    store.execute('LOAD <http://dbpedia.org/resource/Woody_Allen> INTO GRAPH <http://example.org/people>', function(success) {

        console.log("------------------------------------------------------------------------------------------------" + success);
        store.graph(function(success, graph){
            console.log(graph);
        });


        // simple query execution
        store.execute("SELECT * { ?s ?p ?o }", function(success, results){
            if(success) {
                // process results
                console.log(results);
                *//*if(results[0].s.token === 'uri') {
                    console.log(results[0].s.value);
                }*//*
            }
        });

        store.setPrefix('dbp', 'http://dbpedia.org/resource/');

       *//* store.execute('SELECT * WHERE {dbp:Woody_Allen ?property ?value FILTER (isLiteral(?value))} ',
            function(success, result){
                console.log(success);
                console.log(result);
            });*//*

        *//*store.node(store.rdf.resolve('dbp:Woody_Allen'), "http://example.org/people", function(success, graph) {

            var peopleGraph = graph.filter(store.rdf.filters.type(store.rdf.resolve("foaf:Person")));
            console.log(peopleGraph);

            store.execute('PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                     PREFIX foaf: <http://xmlns.com/foaf/0.1/>\
                     PREFIX : <http://example.org/>\
                     SELECT ?s FROM NAMED :people { GRAPH ?g { ?s rdf:type foaf:Person } }',
                function(success, results) {

                    console.log(peopleGraph.toArray()[0].subject.valueOf() === results[0].s.value);

                });

        });*//*

    });
})*/

/*store.execute('LOAD <http://dbpedialite.org/titles/Lisp_%28programming_language%29>\
               INTO GRAPH <lisp>', function(success){
    if(success) {
        var query = 'PREFIX foaf:<http://xmlns.com/foaf/0.1/> SELECT ?o \
                 FROM NAMED <lisp> { GRAPH <lisp> { ?s foaf:page ?o} }';
        store.execute(query, function(success, results) {
            // process results
        });
    }
})*/

//var rdf2json = require("./routes/lib/rdf2json/index");
//
//rdf2json.convertURLIntoRDFJSON("http://www.w3.org/TR/owl-guide/wine.rdf", "sparql", function(err, rdfjson){
//    if(err){
//        console.log("something wrong!");
//    }
//    var obj = eval("("+ rdfjson +")");
//    console.log(JSON.stringify(obj));
//});
//
//console.log("Hello World first!");
