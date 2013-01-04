(function ($) {

    //Définition des variable
    var $oError, $oInputVal, $oSearchResult;


    //Ajout de la série dans le sessionsStorage
    var addSerie = function (serie) {
        console.log("test add ok");
        var monobjet = serie;
        var monobjet_json = JSON.stringify(monobjet);
        localStorage.setItem("objet", monobjet_json);
        showMySeries();
    }

    //Affichage du sessionStorage
    var showMySeries = function () {
        var monobjet_json = localStorage.getItem("objet");
        var monobjet = JSON.parse(monobjet_json);

        $(".favoritSeries").append("<li>" + monobjet.description + "</li>");
        console.log(monobjet.description);
    }

//Affiche le listing de mes séries
    /*var showMesSeries = function (shows) {

     /*  MES SERIES */
    /* var listingMesSeries = $(".pageFavorit ul");

     for (y in shows) {
     listingMesSeries.append('<h3>' + shows.title + '</h3>');
     listingMesSeries.append('<div class="moreInfo"></div>');
     listingMesSeries.append("<button>Enlever de mes favoris</button>");
     }
     // $("ul").listview();
     };*/


    //Recherche d'une série
    var searchSerie = function (e) {
        var sMySerie = $("#searchSerie").val();
        var sSearch = "http://api.betaseries.com/shows/search.json?title=" + sMySerie + "&key=bf7f369ce177";
        var $searchList = $(".searchList");

        $.ajax({
            url:sSearch,
            dataType:"jsonp",
            success:function (dataSearch) {
                var rechercheSection = $searchList
                var searchResult = dataSearch.root.shows;

                for (b in searchResult) {
                    rechercheSection.append('<li ><a href="javascript:void(0);" rel="serieDescription" class="' + searchResult[b].url + '">' + searchResult[b].title + '</a></li>');
                }

                $searchList.find('a').on('click', listSerieClick)
            }

        });
    }

    //Déscription de la série après click dans le listing de recherche
    var listSerieClick = function () {
        var tabId = $(".searchList a").attr('rel');
        var sUrlSerie = $(".searchList a").attr('class');

        history.pushState({
            id:tabId
        }, $('div#' + tabId).find('h2').text(), tabId + '.html');

        $('li.active, div.tab-pane.active').removeClass('active');
        $('a[rel="' + tabId + '"]').parent().addClass('active');
        $("div#" + tabId).addClass('active');

        showSerie(sUrlSerie);

    };

    //Application pour jQuery mobile, intégration ds HTML
    //Affichage de la série
    var showSerie = function (sUrlSerie) {

        //  $(document).on("mobileinit", function () {
        var sUrl = "http://api.betaseries.com/shows/display/" + sUrlSerie + ".json?key=bf7f369ce177";

        $("#serieDescription p").remove();

        $(document).load($.ajax({
            url:sUrl,
            dataType:"jsonp",
            success:function (data) {
                var serie = data.root.show;

                $(".serieDescriptionTitle").append(serie.title);
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

                $(".addFavorit").on("click", function () {
                    addSerie(serie)

                });
            }
        }))
    };

//JSONP uniquement pr qd on est en local
//  });

    var menuClick = function (e) {
        e.preventDefault();

        //Vérifie sur l'élément à la classe active, si oui, return et ne fait pas le reste
        if ($(this).parent().hasClass('active')) {
            return;
        }

        //Récupére l'attr rel
        var tabId = $(this).attr('rel');

        //Méthode pushStat pour l'historique, contient un objet, accès à l'historique du navigateur
        history.pushState({
            //récupère l'id via le rel
            id:tabId
        }, $('div#' + tabId).find('h3').text(), tabId + '.html');

        switchTab(tabId);
    };

//Affichage de l'onglet
    var switchTab = function (tabId) {
        var $oSerieDescription = $("#serieDescription");

        $('li.active, div.tab-pane.active').removeClass('active');
        $('a[rel="' + tabId + '"]').parent().addClass('active');
        $("div#" + tabId).addClass('active');

        if (tabId == 'serieDescription') {
            $oSerieDescription.find("section").remove();
            $oSerieDescription.append("<p>Il n'y a pas de série sélectionnée. Faites d'abord une recherche.</p>");
        }
    };

//Load de routine
    $(function () {
        $oError = $(".searchError p");
        $oInputVal = $("input").val();
        $oSearchResult = $(".searchResult li");

        $(this).keypress(function (e) {
            if (e.which == 13) {
                if ($("input").val() !== "") {
                    if ($("input").val().length < 2) {
                        $oError.remove();
                        $oSearchResult.remove();
                        $oError.append('<p>Il faut minimum 2 lettres pour avoir un résultat de recherche</p>');

                    }
                    else {
                        $oError.remove();
                        $oSearchResult.remove();

                        searchSerie();
                    }

                }
                else {
                    $oError.remove();
                    $oSearchResult.remove();
                    $oError.append("<p>Entrez le nom d'une série pour la retrouvée dans le listing de BetaSerie</p>")
                }
            }
        });

        $('ul.nav-tabs li a').on('click', menuClick);

    });

})
    (jQuery);