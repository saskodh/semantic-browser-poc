/**
 * Created with JetBrains WebStorm.
 * User: sasko
 * Date: 2.2.14
 * Time: 22:11
 * To change this template use File | Settings | File Templates.
 */
var loader = null;

$(document).ready(function(){

    var visPanel = $("#visualization .panel-body");
    loader = $('#loader');
    var loaderImg = $('#loader img');
    var top = visPanel.height()/2 - loaderImg.height()/2;
    var left = visPanel.width()/2 - loaderImg.width()/2;
    loaderImg.css('top', Math.round(top) + 'px');
    loaderImg.css('left', Math.round(left) + 'px');

    d3.json("miserables.json", function(error, graph){

        loader.hide();
        drawGraph(graph);
    });


    $('#btnResourceURI').click(function(){
        var resURI = $('#txtResourceUri').val();

        loader.show();
        //this should be replaced with jsonp ajax call
        $.get("/resource?uri=" + resURI, function(data){
            console.log(data);
            loader.hide();
            drawGraph(data);
        });
    });
});

function drawGraph(graph){
    var visPanel = $("#visualization .panel-body");
    var width = visPanel.width(),
        height = visPanel.height();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(50)
        .size([width, height]);

    //console.log(d3.select("#visualization"));
    //visPanel.empty();
    $('svg').remove();

    var svg = d3.select("#visualization .panel-body").append("svg")
        .attr("width", width)
        .attr("height", height);
    var color = d3.scale.category20();

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
        .attr("r", 10)
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);

    node.on("dblclick", function (d) {
        console.log("double click");
        loader.show();

        $.get("/resource?uri=" + d.name, function(data){
            console.log(data);
            loader.hide();
            drawGraph(data);
        });
    });

    node.on("click", function (d) {
        console.log("single click: ");
        console.log(d);
    });

    node.append("text")
        .attr("dy", "4")
        .attr("dx", "-7")
        //.attr("text-anchor", "middle")
        .text(function (d) {
            return d.name;
        });


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


    //show the literals
    if(graph.literals){
        var list = $('#info .panel-body');

        list.empty();
        for(var i=0; i<graph.literals.length; i++){
            list.append(createLiteralTemplate(graph.literals[i].name, graph.literals[i].value));
        }
    }
}

function createLiteralTemplate(name, value){
    var span = $(document.createElement('span')).html(name);
    var p = $(document.createElement('p')).html(value);

    var result = $(document.createElement('div')).addClass('literalTemplate');

    return result.append(span).append(p);
}

