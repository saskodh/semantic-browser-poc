semanticgraphbrowser
====================

The Semantic Graph Browser aims to provide a nice visualization of a given semantic resource(e.g. http://dbpedia.org/resource/Tim_Berners-Lee) with the ability to go back and forth through the connected resources.

The project backend is build with Node.js[1] + express[2] + ejs[3]. RDF data is loaded and parsed with rdfstore-js[4]. The visualization on the client-side is done with d3.js[5] force-directed graph.
 
A demo is available at: 
http://semanticbrowser-rtg.rhcloud.com/


[1] http://nodejs.org/
[2] https://github.com/visionmedia/express
[3] http://embeddedjs.com/
[4] https://github.com/antoniogarrote/rdfstore-js
[5] https://github.com/mbostock/d3
