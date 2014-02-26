/**
 * Created with JetBrains WebStorm.
 * User: sasko
 * Date: 2.2.14
 * Time: 22:11
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function(){
    $('#btnResourceURI').click(function(){
        var resURI = $('#txtResourceUri').val();

        //this should be replaced with jsonp ajax call
        $.get("/resource?uri=" + resURI, function(data){
            console.log(data);
        });

        //lets try with jsonp

//        $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
//            {
//                tags: "dogs",
//                tagmode: "any",
//                format: "json"
//            },
//            function(data) {
//                $.each(data.items, function(i,item){
//                    $("<img/>").attr("src", item.media.m).appendTo("#images");
//                    if ( i == 3 ) return false;
//                });
//            });
    });


    var visPanel = $("#visualization .panel-body");
    var width = visPanel.width(),
        height = visPanel.height();

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

    console.log(d3.select("#visualization"));

    var svg = d3.select("#visualization .panel-body").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("miserables.json", function(error, graph) {
        force
            .nodes(graph.nodes)
            .links(graph.links)
            .start();

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });

        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
    });

});

