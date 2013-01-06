(function ($) {

    //Définition des variable
    var $oError, $oInputVal, $oSearchResult, sOIKey = "abcdef0123456789";

    //Test le champ de recherche
    var searchTest = function (e) {

        $oSearchResult = $('.searchResult');

        //Si appuie sur "Enter"
        if (e.which == 13) {
            //Si il y a une valeur ds le champ
            if ($('input').val() !== "") {
                //Si valeur < 2
                if ($('input').val().length < 2) {
                    //Remove ancien avertissement, ajout avertissement
                    $oSearchResult.find('p').remove();
                    $oSearchResult.find('li').remove();
                    $oSearchResult.find('div').append('<p>Il faut minimum 2 lettres pour avoir un résultat de recherche</p>');
                }
                else {
                    //Remove avertissement et listing si + de 2 lettres
                    $oSearchResult.find('p').remove();
                    $oSearchResult.find('li').remove();

                    //Fais la recherche de série
                    searchSerie();
                }

            }
            else {
                //Remove l'ancien message d'erreur et l'ancien listing + ajout message erreur
                $oSearchResult.find('p').remove();
                $oSearchResult.find('li').remove();
                $oSearchResult.find('div').append('<p>Entrez le nom d\'une série pour la retrouvée dans le listing de BetaSerie</p>');
            }
        }
    };

    //Recherche d'une série
    var searchSerie = function (e) {
        var sMySerie = $("#searchSerie").val();
        var sSearch = "http://api.betaseries.com/shows/search.json?title=" + sMySerie + "&key=bf7f369ce177";
        var $searchList = $(".searchList");
        $oSearchResult = $('.searchResult');

        $.ajax({
            url:sSearch,
            dataType:"jsonp",
            success:function (dataSearch) {
                var rechercheSection = $searchList
                var searchResult = dataSearch.root.shows;

                if (searchResult.length < 1) {
                    $oSearchResult.find('p').remove();
                    $oSearchResult.find('li').remove();
                    $oSearchResult.find('div').append('<p>Il n\'y a pas de résultat pour cette recherche.</p>');

                } else {

                    for (b in searchResult) {
                        rechercheSection.append('<li><a href="javascript:void(0);" rel="serieDescription" class="' + searchResult[b].url + '">' + searchResult[b].title + '</a></li>');
                        urlResult = searchResult[b].url;
                    }

                    $searchList.find('a').on('click', listSerieClick);
                }
            }

        });
    }


    //Déscription de la série après click dans le listing de recherche
    var listSerieClick = function (e) {
        $target = $(e.target);

        if ($('.searchList a').length) {

            var tabId = $(".searchList a").attr('rel');
            var sUrlSerie = $target.attr('class');


        } else if ($('.favoritList a').length) {
            var tabId = $(".favoritList a").attr('rel');
            var sUrlSerie = $target.attr('class');
        }

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
        var sUrl = 'http://api.betaseries.com/shows/display/' + sUrlSerie + '.json?key=bf7f369ce177';
        var $serieTitle = $('.serieDescriptionTitle');
        var $serieDescription = $('.description');
        var $serieGender = $('.gender');
        var $serieTiming = $('.timing');
        var $serieStatus = $('.status');


        $('.descriptionError p').remove();
        $('#serieDescription section').show();
        $serieTitle.empty();
        $serieDescription.empty();
        $serieGender.empty();
        $serieTiming.empty();
        $serieStatus.empty();

        $(document).load($.ajax({
                url:sUrl,
                dataType:'jsonp',
                success:function (data) {
                    var serie = data.root.show;

                    console.log(serie.genres);

                    $serieTitle.append(serie.title);
                    $('img').attr('src', serie.banner);
                    $serieDescription.append(serie.description);
                    $serieGender.append(serie.genres);
                    $serieTiming.append(serie.duration);
                    $serieStatus.append(serie.status);

                    //Boucle des seasons
                    for (x in serie.seasons) {
                        var seasons = serie.seasons[x].number;
                        var episodes = serie.seasons[x].episodes;

                        $('.seasons').append('<li><p> Saisons: ' + seasons + '</p><p>Nombre d\'épisodes: ' + episodes + '</p></li>');
                    }

                    $('.addFavorit').on('click', function () {
                        addSerie(serie);

                    });
                }
            }
        ))
    };

    var genObjectItem = function () {
        //ID commence par s_
        var sOI = 's_', i;

        //Nbre de lettres générées
        for (i = 0; i < 8; i++) {
            sOI += sOIKey.charAt(Math.floor(Math.random() * sOIKey.length));
        }
        ;

        return sOI;
    };

//Ajout de la série dans le sessionsStorage
    var addSerie = function (serie) {

        var oSerieFav = serie;
        var oSerieFav_json = JSON.stringify(oSerieFav);

        localStorage.setItem(genObjectItem(), oSerieFav_json)
    }

//Affichage du sessionStorage
    var showMySeries = function () {

        for (sKey in localStorage) {

            if (localStorage.key(sKey)) {
                //Retourne true si la clef existe
                var oSerieFav_json = localStorage.getItem(sKey);
                var oSerieFav = JSON.parse(oSerieFav_json);

                $('.favoritList').append('<li><h3><a href="javascript:void(0);" rel="serieDescription" class="' + oSerieFav.url + '">' + oSerieFav.title + '</a></h3></li>');
                $('.favoritList li').append('<p>Etat de la série: ' + oSerieFav.status + '</p>');
                var len = $.map(oSerieFav.seasons,function (n, i) {
                    return i;
                }).length;

                $('.favoritList li').append('<p>Nombre de: ' + len + '</p>');

                $('h3 a').on('click', listSerieClick);
            }
        }

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
        var $oSerieDescription = $('#serieDescription');

        $('li.active, div.tab-pane.active').removeClass('active');
        $('a[rel="' + tabId + '"]').parent().addClass('active');
        $('div#' + tabId).addClass('active');

        if (tabId == 'serieDescription') {
            $('#serieDescription section').hide();
            $('.descriptionError p').remove()
            $('.descriptionError').append('<p>Il n\'y a pas de série sélectionnée. Faites d\'abord une recherche.</p>');
        }

        if (tabId == "myFavorit") {
            $('.favoritList li').remove();
            showMySeries();
        }

        if (tabId == "planning") {
            $('.planningList li').remove();
            showPlanning();
        }
    };

    var showPlanning = function () {
        var sPlanningApi = "http://api.betaseries.com/planning/general.json?key=bf7f369ce177";


        $(document).load($.ajax({
            url:sPlanningApi,
            dataType:'jsonp',
            success:function (dataPlanning) {

                var oPlanning = dataPlanning.root.planning;

                for (c in oPlanning) {
                    for (sKey in localStorage) {

                        if (localStorage.key(sKey)) {
                            //Retourne true si la clef existe
                            var oSerieFav_json = localStorage.getItem(sKey);
                            var oSerieFav = JSON.parse(oSerieFav_json);

                            if (oPlanning[c].show == oSerieFav.title) {

                                var date = new Date();
                                $('.planningList').append('<li><p>' + oPlanning[c].show + '</p></li>');
                                $('.planningList li').append('<p>' + oPlanning[c].number + '</p>');
                                $('.planningList li').append('<p>' + date.toDateString(oPlanning[c].date) + '</p>');
                            } else {
                                //TODO
                                console.log("Aucune programmation");
                            }
                        }

                    }
                }
            }
        }));

    }

//Load de routine
    $(function () {

        $(this).on('keypress', searchTest);
        $('ul.nav-tabs li a').on('click', menuClick);

    });

})
    (jQuery);