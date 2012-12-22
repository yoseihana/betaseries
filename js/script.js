(function($){

    var sUrl = "http://api.betaseries.com/shows/display/Dexter.json?key=bf7f369ce177";
    //var sUrl = "http://api.betaseries.com/shows/display/" + sMySerie + ".json?key=bf7f369ce177";

    $(document).on("mobileinit", function(){

        var spanH3 = $(".ui-btn-text");

        $.ajax({
            url : sUrl,
            dataType : "jsonp",
            success : function(data){
                console.log(data.root.show.title);
                console.log(spanH3.text(data.root.show.title));

            }
        });
        //JSONP uniquement pr qd on est en local
    });



    $(function(){

	});

})(jQuery);