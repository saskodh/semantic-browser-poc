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
    console.log(new Date());
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
      .distance(150)
      .gravity(.03)
      .size([width, height]);

    $('svg').remove();

    var svg = d3.select("#visualization .panel-body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append('svg:g')
      .call(d3.behavior.zoom().on("zoom", redraw))
      .append('svg:g');

    function redraw() {
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
      .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

    node.append("image")
      .attr("xlink:href", function (d) {
          if(d.image != undefined && d.image.length > 0)
              return d.image[0];
          return "./public/images/noimg.png";
      })
      .attr("x", function(d){
        var dimension = 30;
        if(d.group == 'main')
            dimension = 50;
        return -dimension/2;
      })
      .attr("y", function(d){
        var dimension = 30;
        if(d.group == 'main')
            dimension = 50;
        return -dimension/2;
      })
      .attr("width", function(d){
        var dimension = 30;
        if(d.group == 'main')
            dimension = 50;
        return dimension;
      })
      .attr("height", function(d){
        var dimension = 30;
        if(d.group == 'main')
            dimension = 50;
        return dimension;
      })

    node.append("text")
      .attr("dx", function(d){
        var dimension = 24;
        if(d.group == 'main')
            dimension = 30;
        return dimension;
      })
      .attr("dy", function(d){
        var dimension = 5;
        if(d.group == 'main')
            dimension = 8;
        return dimension;
      })
      .attr('class', 'text')
      .text(function(d) { return d.name });


    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });

    node.on("dblclick", function (d) {
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

    node.on('mouseover', function(d){
      var text = d3.select(this).select("text")
      text.transition()
          .duration(500)
          .style('opacity', 1);
      var image = d3.select(this).select("image")
      image.transition()
        .duration(250)
        .attr("transform","scale(1.5)");
    });

    node.on('mouseout', function(d){
      var text = d3.select(this).select("text")
      text.transition()
          .duration(250)
          .style('opacity', 0);

      var image = d3.select(this).select("image")
      image.transition()
        .duration(250)
        .attr("transform","scale(1)");

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