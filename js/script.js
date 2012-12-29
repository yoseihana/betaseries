(function ($) {

    //Définition des variable


    //Application pour jQuery mobile, intégration ds HTML
    var showSerie = function (urlApi) {

        //  $(document).on("mobileinit", function () {
        var sUrl = "http://api.betaseries.com/shows/display/" + urlApi + ".json?key=bf7f369ce177";

        $(document).load($.ajax({
            url:sUrl,
            dataType:"jsonp",
            success:function (data) {

                var serie = data.root.show;

                $(".serieDescription").append(serie.title);
                $("img").attr("src", serie.banner);
                $(".description").append(serie.description);
                $(".gender").append(serie.genres);
                $(".timing").append(serie.duration);
                $(".status").append(serie.status);

                //Boucle des seasons
                for (x in serie.seasons) {
                    var seasons = serie.seasons[x].number;
                    var episodes = serie.seasons[x].episodes;

                    $(".seasons").append("<li><p> Saisons: " + seasons + "</p><p>Nombre d'épisodes: " + episodes + "</p></li>");

                }

                $("#addFavorit").on("click", function(){addSerie(serie)});
                //$("#mySerie").on("click", mySeries);
            }
        }))


    };
//JSONP uniquement pr qd on est en local
//  });


    var addSerie = function (serie) {
        var monobjet = serie;
        var monobjet_json = JSON.stringify(monobjet);
        sessionStorage.setItem("objet", monobjet_json);

    }

    var mySeries = function(){

        console.log("ok");
        var monobjet_json = sessionStorage.getItem("objet");
        var monobjet = JSON.parse(monobjet_json);
// Affichage dans la console
        //console.log(monobjet);
        if($('body').attr("id") == "mesSeries"){
            console.log(monobjet);
        }
        $('section').append("<p>Test</p>");


    }

//Affiche le listing de mes séries
    var showMesSeries = function (shows) {

        /*  MES SERIES */
        var listingMesSeries = $("#mesSeries ul");

        for (y in shows) {
            listingMesSeries.append('<h3>' + shows.title + '</h3>');
            listingMesSeries.append('<div class="moreInfo"></div>');
            listingMesSeries.append("<button>Enlever de mes favoris</button>");
        }
        // $("ul").listview();
    };


//Recherche d'une série
    var searchSerie = function (e) {

        var sMySerie = document.getElementById("search").value;

        var sSearch = "http://api.betaseries.com/shows/search.json?title=" + sMySerie + "&key=bf7f369ce177";

        $.ajax({
            url:sSearch,
            dataType:"jsonp",
            success:function (dataSearch) {
                var rechercheSection = $("#recherche");
                var searchResult = dataSearch.root.shows;

                for (b in searchResult) {
                    rechercheSection.append('<li class="' + searchResult[b].url + '"><a href="./html/serie.html" title="Vers la page de description de la série">' + searchResult[b].title + '</a></li>');
                }

                var urlApi = rechercheSection.find("li").attr("class");

                $("#recherche a").click(

                    function (e) {

                        showSerie(urlApi)

                    });
            }
        });
    }

    $(function () {


        $(this).keypress(function (e) {

            if (e.which == 13) {
                if ($("input").val() !== "") {
                    if ($("input").val().length < 2) {
                        $(".searchInfo p").remove();
                        $(".resultatRecherche li").remove();
                        $(".searchInfo").append('<p>Il faut minimum 2 lettres pour avoir un résultat de recherche</p>');

                    }
                    else {
                        $(".searchInfo p").remove();
                        $(".resultatRecherche li").remove();

                        searchSerie();
                    }

                }
                else {
                    $(".searchInfo p").remove();
                    $(".resultatRecherche li").remove();
                    $(".searchInfo").append("<p>Entrez le nom d'une série pour la retrouvée dans le listing de BetaSerie</p>")
                }
            }
        });

        $("")

    });

})
    (jQuery);