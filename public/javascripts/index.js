var visPanel = null;

/**
 * Created with JetBrains WebStorm.
 * User: sasko
 * Date: 2.2.14
 * Time: 22:11
 * To change this template use File | Settings | File Templates.
 */
var loader = null;
var infoPanel = null;
var loaderImg = null;
var btnBack = null;

var graphData = null;
var navigator = [''];

function resize(){
    var dy = $(window).height() - $('body').height();
    visPanel.height(visPanel.height() + dy -25);
    infoPanel.height(infoPanel.height() + dy -25);

    var top = visPanel.height()/2 - loaderImg.height()/2;
    var left = visPanel.width()/2 - loaderImg.width()/2;
    loaderImg.css('top', Math.round(top) + 'px');
    loaderImg.css('left', Math.round(left) + 'px');

    $('#btnBack').height($('#txtFields').height() - 45);

    //redraw the graph
    drawGraph(graphData);
}

$(document).ready(function(){
    visPanel = $("#visualization .panel-body");
    infoPanel = $('#info .panel-body');
    loaderImg = $('#loader img');
    loader = $('#loader');
    btnBack = $('#btnBack');

    btnBack.prop('disabled', true);
    //resize to match the window height
    resize();
    $( window ).resize(resize);

    d3.json("miserables.json", function(error, graph){
        graphData = graph;
        loader.hide();
        drawGraph(graph);
    });


    $('#btnResourceURI').click(function(){
        var resURI = $('#txtResourceUri').val();

        loader.show();

        if(resURI == ''){
            d3.json("miserables.json", function(error, graph){
                $('#txtResourceUri').val('');
                graphData = graph;
                loader.hide();
                drawGraph(graph);
            });
        }else {
            $.get("/resource?uri=" + resURI, function(data){
                //console.log(data);
                $('#txtResourceUri').val(resURI);
                graphData = data;
                loader.hide();
                drawGraph(data);
            });

            btnBack.prop('disabled', false);
        }
        navigator.push(resURI);
        //console.log(navigator);
    });

    $('#txtResourceUri').keydown(function(event){
        if(event.keyCode==13){
            $('#btnResourceURI').trigger('click');
        }
    });

    btnBack.click(function(){
//        console.log('back button click');
//        console.log(navigator);

        if(navigator.length > 1){
            $('#txtResourceUri').val(navigator[navigator.length-2]);
            navigator.pop();
            navigator.pop();
            $('#btnResourceURI').trigger('click');
            if(navigator.length == 1){
                btnBack.prop('disabled', true);
            }
        }
    });
});

function drawGraph(graph){
    if(!graph)
        return;

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
        .attr("height", height)
        .append('svg:g')
        .call(d3.behavior.zoom().on("zoom", redraw))
        .append('svg:g');

    function redraw() {
        //console.log("here", d3.event.translate, d3.event.scale);
        //console.log(svg);
        svg.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");
    }

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
        .attr("r", function(d){
            if(d.group == 'main')
                return 20;
            return 10;
        })
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);

    node.on("dblclick", function (d) {
        //console.log("double click");
        if(d.group == 'property' || d.group == 'main')
            return;

        loader.show();

        $('#txtResourceUri').val(d.name);
        $('#btnResourceURI').trigger('click');
    });

    node.on("click", function (d) {
        //console.log("single click: ");
        //console.log(d);
    });

    svg.select(".node")
        .append("svg:image")
        .attr("xlink:href", function (d) {
            if(d.image)
                return d.image;
            return "./public/images/noimg.jpg";
        })
        .attr("x", "-12px")
        .attr("y", "-12px")
        .attr("width", "24px")
        .attr("height", "24px");

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