(function($){

    var sUrl = "http://api.betaseries.com/shows/display/Dexter.json?key=bf7f369ce177";
    //var sUrl = "http://api.betaseries.com/shows/display/" + sMySerie + ".json?key=bf7f369ce177";

    $(document).on("mobileinit", function(){

       var spanH3 = $("ui-btn-text");

        $.ajax({
            url : sUrl,
            dataType : "jsonp",
            success : function(data){
                console.log(spanH3);
                console.log(data.root.show.title);
                spanH3.text(data.root.show.title);

                var output = '<h3>test</h3>';
                //now append the buffered output to the listview and either refresh the listview or create it (meaning have jQuery Mobile style the list)
                //or if the listview has yet to be initialized, use `.trigger('create');` instead of `.listview('refresh');`
                $('.serieTitle').append(output).trigger('create');

            }

        });
        //JSONP uniquement pr qd on est en local


    });

    $(function(){

    });

})(jQuery);