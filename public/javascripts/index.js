/**
 * Created with JetBrains WebStorm.
 * User: sasko
 * Date: 2.2.14
 * Time: 22:11
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function(){
    $('#btnResourceURI').click(function(){
        var resURI = $('#txtResourceURI').val();

        //this should be replaced with jsonp ajax call
        $.get("/resource?url=" + resURI, function(data){
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
});