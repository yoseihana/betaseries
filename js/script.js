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

                //Vérifie si il y a un résultat pour la recherche
                if (searchResult.length < 1) {
                    $oSearchResult.find('p').remove();
                    $oSearchResult.find('li').remove();
                    $oSearchResult.find('div').append('<p>Il n\'y a pas de résultat pour cette recherche.</p>');

                }
                else {
                    //Ajout du listing de recherche
                    for (b in searchResult) {
                        rechercheSection.append('<li><a href="javascript:void(0);" rel="serieDescription" class="' + searchResult[b].url + '">' + searchResult[b].title + '</a></li>');
                        urlResult = searchResult[b].url;
                    }

                    //Affiche l'onglet de description de série
                    $searchList.find('a').on('click', listSerieClick);
                }
            }

        });
    }

    //Déscription de la série après click dans le listing de recherche
    var listSerieClick = function (e) {
        $target = $(e.target);

        //Ajout de la class active
        if ($('.searchList a').length) {
            var tabId = $(".searchList a").attr('rel');
            var sUrlSerie = $target.attr('class');

        }
        else if ($('.favoritList a').length) {
            var tabId = $(".favoritList a").attr('rel');
            var sUrlSerie = $target.attr('class');
        }

        //Affiche le bon div
        history.pushState({
            id:tabId
        }, $('div#' + tabId).find('h2').text(), tabId + '.html');

        $('li.active, div.tab-pane.active').removeClass('active');
        $('a[rel="' + tabId + '"]').parent().addClass('active');
        $("div#" + tabId).addClass('active');

        showSerie(sUrlSerie);
    };

    //Affichage de la série
    var showSerie = function (sUrlSerie) {

        //  $(document).on("mobileinit", function () {
        var sUrl = 'http://api.betaseries.com/shows/display/' + sUrlSerie + '.json?key=bf7f369ce177';
        var $serieTitle = $('.serieDescriptionTitle');
        var $serieImg = $('img');
        var $serieDescription = $('.description');
        var $serieGender = $('.gender');
        var $serieTiming = $('.timing');
        var $serieStatus = $('.status');

        //Enlève les anciens éléments
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

                    $serieTitle.append(serie.title);

                    //Vérifie si une img existe
                    if (serie.banner) {
                        $serieImg.attr('src', serie.banner);
                    }
                    else {
                        $serieImg.attr('src', 'img/no-pre.png')
                    }

                    $serieDescription.append(serie.description);
                    $serieGender.append(serie.genres);
                    $serieTiming.append(serie.duration);
                    $serieStatus.append(serie.status);

                    //Boucle des seasons
                    for (x in serie.seasons) {
                        var seasons = serie.seasons[x].number;
                        var episodes = serie.seasons[x].episodes;
                        $('.seasons').append('<li>Saisons: ' + seasons + '. Nombre d\'épisodes: ' + episodes + '.<ol class="'+seasons+'"></ol></li>');



                        for(var x = 0; x<episodes; ++x){
                            urlEpisode = 'http://api.betaseries.com/shows/episodes/'+serie.url+'.json?season=1&episode=1&summary=1?key=bf7f369ce177'

                            $.ajax({
                                url: urlEpisode,
                                dataType: 'jsonp',
                                success: function(dataEpisode){

                                    $('ol .'+seasons).append('<li>'+dataEpisode+'</li>');
                                }
                            });

                        }

                    }
                    /* $('.addFavorit').on('click', function () {
                     addSerie(serie);

                     });*/
                    //Appel la fct pour le localStorage
                    var show = null;
                    var titre = "fringe";
                    $('.addFavorit').on('click', function (e) {
                        getShow(serie, useLocalStorage);
                    })

                }
            }
        ))
    };

    //Ajout de la série dans localStorage en JSON
    var setJsonItem = function (key, json) {
        return localStorage.setItem(key, JSON.stringify(json));
    };

    //Retourne la/les série(s) du localStorage sans JSON
    var getJsonItem = function (key) {
        return JSON.parse(localStorage.getItem(key));
    };

    //
    var getShow = function (serie, callback) {
        callback(serie);
    };

    //PLace la série dans le listing
    var useLocalStorage = function (e) {
        show = e
        // console.log(JSON.stringify(show));

        var favs = [];
        favs[favs.length] = show;

        setJsonItem('favs_s', favs);
        //console.log("From localStorage: " + getJsonItem('favs_s'));
        //console.log(getJsonItem('favs_s'))

        //var favs2 = JSON.stringify(getJsonItem('fav_s'));
        //console.log(favs2);
    }

    //Affichage du sessionStorage
    var showMySeries = function () {
        var myFav = getJsonItem('favs_s');

        //@TODO: boucle

        //Affiche les infos de ma séries favorite
        $('.favoritList').append('<li><h3><a href="javascript:void(0);" rel="serieDescription" class="' + myFav[0].url + '">' + myFav[0].title + '</a></h3></li>');
        $('.favoritList li').append('<p>Etat de la série: ' + myFav[0].status + '</p>');
        var len = $.map(myFav[0].seasons,function (n, i) {
            return i;
        }).length;

        $('.favoritList li').append('<p>Nombre de: ' + len + '</p>');
        $('h3 a').on('click', listSerieClick);

    };

//JSONP uniquement pr qd on est en local
//  });
    //Lorsqu'on clique sur les onglet du menu
    var menuClick = function (e) {
        e.preventDefault();

        //Vérifie sur l'élément à la classe active
        if ($(this).parent().hasClass('active')) {
            return;
        }

        //Récupére l'attr rel
        var tabId = $(this).attr('rel');

        history.pushState({
            id:tabId
        }, $('div#' + tabId).find('h3').text(), tabId + '.html');

        switchTab(tabId);
    };

    //Affichage de l'onglet
    var switchTab = function (tabId) {
        var $oSerieDescription = $('#serieDescription');

        //Enlève les anciens éléments
        $('li.active, div.tab-pane.active').removeClass('active');
        $('a[rel="' + tabId + '"]').parent().addClass('active');
        $('div#' + tabId).addClass('active');

        //Si sur la page description
        if (tabId == 'serieDescription') {
            $('#serieDescription section').hide();
            $('.descriptionError p').remove()
            $('.descriptionError').append('<p>Il n\'y a pas de série sélectionnée. Faites d\'abord une recherche.</p>');
        }

        //Si sur la page des favoris
        if (tabId == "myFavorit") {

            if (getJsonItem('favs_s') !== null) {
                $('.favoritList li').remove();
                $('.favoritError p').remove()
                showMySeries();
            }
            else {
                $('.favoritList li').remove();
                $('.favoritError p').remove()
                $('.favoritError').append('<p>Il n\'y a pas de série favorite.</p>');
            }
        }

        //Si sur la page du planning
        if (tabId == "planning") {
            if (getJsonItem('favs_s') !== null) {
                $('.planningError').remove();
                $('.planningList li').remove();
                showPlanning();
            }
            else {
                $('.planningList li').remove();
                $('.planningError').append('<p>Il n\'y a aucune série favorite sélectionnée.</p>');
            }
        }
    };

    //Affichage du planning
    var showPlanning = function () {
        var sPlanningApi = "http://api.betaseries.com/planning/general.json?key=bf7f369ce177";
        var myFavPlanning = getJsonItem('favs_s');

        $(document).load($.ajax({
            url:sPlanningApi,
            dataType:'jsonp',
            success:function (dataPlanning) {

                var oPlanning = dataPlanning.root.planning;

                for (c in oPlanning) {
                    //Affichage du planning si le titre est dans mes favoris
                    if (oPlanning[c].show == myFavPlanning[0].title) {
                        var date = new Date();

                        $('.planningList').append('<li><p>' + oPlanning[c].show + '</p></li>');
                        $('.planningList li').append('<p>' + oPlanning[c].number + '</p>');
                        $('.planningList li').append('<p>' + date.toDateString(oPlanning[c].date) + '</p>');
                    }
                    else {
                        //TODO
                        console.log("Aucune programmation");
                    }
                }
            }
        }));
    };

    //Load de routine
    $(function () {

        $(this).on('keypress', searchTest);
        $('ul.nav-tabs li a').on('click', menuClick);

    });

})
    (jQuery);