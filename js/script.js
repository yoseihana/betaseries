(function ($) {

    //Variable globale
    var API_BASE_URL = 'http://api.betaseries.com/';
    var API_AUTH_KEY = 'key=bf7f369ce177';

    //Recherche de série(s)
    var searchSerie = function (keyword) {
        var tabName = 'search';
        var tab = $('.tab#' + tabName);
        var searchUrl = API_BASE_URL + 'shows/search.json?title=' + keyword + '&' + API_AUTH_KEY;

        //Enlève les anciennes recherches
        $(tab).find('ul.searchResults li').remove();

        //Test de la valeur dans le champ input
        if (keyword.length < 2) {
            showTabMsg(tabName, 'Il faut entrer au minimum 2 caractères pour faire une recherche');
        } else {
            $.ajax({
                url:searchUrl,
                dataType:'jsonp',
                success:function (data) {
                    showSearchResults(data.root.shows)
                }
            });
        }
    }

    //Affichage du résultat de la recherche
    var showSearchResults = function (searchResults) {
        var tabName = 'search';
        var tab = $('.tab#' + tabName);

        //Test le résultat de recherche
        if (searchResults.length <= 0) {
            showTabMsg(tabName, 'Il n\'y a aucun résultat pour cette recherche');
        } else {
            //Boucle sur le résultat de recherche
            $.each(searchResults, function (i, searchResult) {
                var ul = $(tab).find('ul.searchResults').append('<li><a href="#" rel="' + searchResult.url + '">' + searchResult.title + '</a></li>');

                //Vérifie sur la série est déjà dans les favoris pour lui ajouter une classe (utile lors de l'affichage de la série
                if (isFavorite(searchResult.url)) {
                    $(ul).find('li:last a').addClass(CLASS_IS_FAVORITE);
                }
            });

            //Event lors du clique sur 1 série du listing
            $(tab).find('ul.searchResults li a').on('click', function (e) {

                e.preventDefault();
                //Pas d'arguement dans showSerieDescription car le paramètre est passé implicitement
                showTabMsg('search','Récupération de la série. Un instant SVP.')
                getSerie($(e.target).attr('rel'), showSerieDescription);

            })

            //Appel de l'affichage de la bonne section
            showTabMain(tabName);
        }
    }

    //Information de l'API, au success, ce sera le second argument qui sera appelé
    var getSerie = function (title, callback) {
        var serieUrl = API_BASE_URL + 'shows/display/' + title + '.json?' + API_AUTH_KEY;

        $.ajax({
            url:serieUrl,
            dataType:'jsonp',
            success:function (dataSerie) {
                //Vérifie que le callback existe
                if (callback && $.isFunction(callback)) {
                    var serie = dataSerie.root.show;

                    // On a la serie et les épisodes
                    getSeasons(serie.url, function (dataSeasons) {
                        serie.seasons = dataSeasons;
                        callback(serie);
                    })


                }
            }
        });
    }

//Affichage d'une série sélectionnée
    var showSerieDescription = function (serie) {
        var tabName = 'description';
        var tab = $('.tab#' + tabName);

        // Remplissage des infos de la serie à décrire
        //Si la série est dans les favoris ou pas
        if (serie) {

            //Vérifie si une img existe
            if (serie.banner) {
                $(tab).find('img.banner')
                    .attr('src', serie.banner)
                    .attr('alt', serie.title)
                    .attr('title', serie.title);
            }
            else {
                $(tab).find('img.banner')
                    .attr('src', 'img/no-pre.png')
                    .attr('alt', 'Pas d\'image pour cette série')
                    .attr('title', 'Pas d\'image pour cette série');
            }

            // Affiche le titre
            $(tab).find('h3.title').text(serie.title);

            // Favoris
            $(tab).find('p.favorite a')
                .attr('rel', serie.url)
                .text(isFavorite(serie.url) ? 'Supprimer des favoris' : 'Ajouter aux favoris');

            // Description, genre, duration, status
            $(tab).find('p.description').text(serie.description);
            $(tab).find('p.gender').text(serie.genres);
            $(tab).find('p.duration').text(serie.duration + ' min');
            $(tab).find('p.status').text(serie.status);

            var tpl = '{{#seasons}}<li class="seas-list">' +
                '<h4>Saison {{number}}</h4>' +
                '<ol class="episodes">' +
                '{{#episodes}}<li class="icon-cancel ep-list">{{number}} - {{title}}</li>{{/episodes}}' +
                '</ol>' +
                '</li>{{/seasons}}';

            $(tab).find('ol.seasons').html(Mustache.render(tpl, serie));

            $(tab).find('ol.seasons li.seas-list h4')
                .on('click', function (e) {
                    $(this).parent().find('ol.episodes').slideToggle();
                })
                .trigger('click'); // On les cachent par défaut

            if (!isFavorite(serie.url)) {
                $(tab).find('ol.seasons li').removeClass('icon-cancel');
            } else {
                $(tab).find('li[class*=icon-]').on('click', function () {
                    if ($(this).hasClass('icon-cancel')) {
                        $(this)
                            .removeClass('icon-cancel')
                            .addClass('icon-check');
                    } else if ($(this).hasClass('icon-check')) {
                        $(this)
                            .removeClass('icon-check')
                            .addClass('icon-cancel');
                    }
                });
            }


            //Appel de l'affichage de la bonne section
            showTabMain('description');
        } else {
            //Appel de l'affichage d'erreur
            showTabMsg(tabName, 'Aucune série sélectionnée pour afficher sa déscription. Sélectionnez une série de vos favoris ou faites une recherche');
        }
    };

    /* *********** *
     *  Favorites
     * *********** */
    var FAVORITES_STORAGE_KEY = 'favorites';
    var CLASS_IS_FAVORITE = 'is-favorite';
    var CLASS_IS_NOT_FAVORITE = 'is-not-favorite';

//Affichage de la série favorite
    var showFavorites = function () {
        var tabName = 'favorites';
        var tab = $('.tab#' + tabName);

        //Récupération du json à la clef FAVORITES_STORAGE_KEY
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);

        //Enlève les anciens éléments
        $(tab).find('ul.fav-list li').remove();

        //Boucle pour affiche le listing des favoris, i = index, élément à parcourir, fav = fonction décrivant ce qu'on fait à chaque item donc la valeur
        $.each(favorites, function (i, fav) {
            $(tab).find('ul.fav-list').append('<li><a href="#" rel="' + i + '">' + fav.serie.title
                + '</a><p>Status: ' + fav.serie.status
                + '</p></li>');
        });

        //Event lors du clic sur un favoris
        $(tab).find('ul.fav-list li a').on('click', function (e) {
            e.preventDefault();

            //Appel de la fonction de déscription avec les élément du json dans le localStorage
            var urlSerie = $(e.target).attr('rel');
            showSerieDescription(favorites[urlSerie].serie);
        });

        $('li a[rel = description]').on('click', function (e) {
            showTabMsg('description', '>Aucune série sélectionnée pour afficher sa description. Sélectionnez une série de vos favoris ou faites une recherche')
        });

    }

//Ajout de la série dans les favoris
    var addToFavorites = function (urlKey) {
        //Récupération de l'élément json à la clef FAVORITES_STORAGES_KEY
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);

        if (!favorites) {
            favorites = {}; //Création d'un objet vide si rien dans le favorites
        }
        favorites[urlKey] = {};

        setJsonItem(FAVORITES_STORAGE_KEY, favorites);

        getSerie(urlKey, function (serie) {
            var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
            favorites[urlKey].serie = serie;
            setJsonItem(FAVORITES_STORAGE_KEY, favorites);
        });

        // show favs in search results
        $('.tab#search ul.searchResults li a[rel=' + urlKey + ']').addClass(CLASS_IS_FAVORITE);

        // tab description
        $('.tab#description p.favorite a')
            .removeClass(CLASS_IS_NOT_FAVORITE)
            .addClass(CLASS_IS_FAVORITE)
            .text("Supprimer des favoris");
    }

//Le favoris est enlevé du localStorage
    var removeFromFavorites = function (urlKey) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);

        if (favorites) {
            delete favorites[urlKey];
            setJsonItem(FAVORITES_STORAGE_KEY, favorites);
        }

        // unshow favs in search results
        $('.tab#search ul.searchResults li a[rel=' + urlKey + ']').removeClass(CLASS_IS_FAVORITE);

        //Modification pour bouton de ajouter/enlever favoris
        $('.tab#description p.favorite a')
            .removeClass(CLASS_IS_FAVORITE)
            .addClass(CLASS_IS_NOT_FAVORITE)
            .text("Ajouter aux favoris");
    }

    var getFavorite = function (urlKey) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
        return (favorites && favorites.hasOwnProperty(urlKey)) ? favorites[urlKey] : undefined;
    }

    var setFavorite = function (urlKey, favorite) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
        favorites[urlKey] = favorite;
    }

    var isFavorite = function (urlKey) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
        return (favorites && favorites.hasOwnProperty(urlKey));
    }

    var hasSeenEpisodeToggle = function (serieUrl, seasonId, episodeId) {
        var favorite = getFavorite(serieUrl);
        favorite.serie.seasons[seasonId].episodes[episodeId].has_seen != favorite.serie.seasons[seasonId].episodes[episodeId].has_seen;
        setFavorite(serieUrl, favorite);
    }

    /* ******* *
     *  Utils  *
     * ******* */

    var getSeasons = function (urlKey, callback) {
        var seasonsUrl = API_BASE_URL + 'shows/episodes/' + urlKey + '.json?hide_notes=1&' + API_AUTH_KEY;

        $.ajax({
            url:seasonsUrl,
            dataType:'jsonp',
            success:function (data) {
                var seasons = data.root.seasons;

                if (callback) {
                    // Post-processing sur la data reçue de l'API
                    $.each(seasons, function (i, season) {
                        $.each(season.episodes, function (i, episode) {
                            // Supprime les sous-titres (inutile ici)
                            delete episode.subs;

                            // ajout de la propriété "has_seen"
                            episode.has_seen = false;
                        })
                    })

                    // Appelle le callback avec les seasons filtrées
                    callback(seasons);
                }
            }
        });
    }

    /* ************** *
     * Show Planning
     * *************  */

    //Récupération des données du planning de l'API
    var getPlanning = function (callback) {
        var planningUrl = API_BASE_URL + 'planning/general.json?' + API_AUTH_KEY;

        $.ajax({
            url:planningUrl,
            dataType:'jsonp',
            success:function (data) {
                var planning = data.root.planning;

                if (callback && $.isFunction(callback)) {

                    var planningFavorites = []; // Array not object

                    $.each(planning, function (i, episodes) {
                        var nowDate = $.now() / 1000; // trim timestamp to minutes

                        if (episodes.date >= nowDate && isFavorite(episodes.url)) {
                            planningFavorites.push(episodes);
                        }
                    });

                    callback(planningFavorites);
                }
            }
        });
    }

    //Affichage du planning des 8 prochains jours
    var showPlanning = function (planningShow) {
        var tabName = 'planning';
        var tab = $('.tab#' + tabName);

        $(tab).find('ul.plan-list li').remove();

        if (!planningShow || !$.isArray(planningShow) || planningShow.length < 1) {
            showTabMsg('planning', 'Il n\'y a aucune série favorite pour le planning');
        } else {

            var planningTemplate = '<li>' +
                '<a href="#" rel="{{url}}">{{show}}</a>' +
                '<p class="date">{{date}}</p>' +
                '<p class="episode">{{number}} - {{title}}</p>' +
                '</li>';

            $.each(planningShow, function (i, plan) {
                // Convertion de la date au format standard
                plan.date = (new Date()).toLocaleDateString(plan.date);

                // Render le template
                $(tab).find('ul.plan-list').append(Mustache.render(planningTemplate, plan))
            });

            $(tab).find('ul.plan-list li a').on('click', function (e) {
                e.preventDefault();
                showSerieDescription(getFavorite($(this).attr('rel')).serie);
            });
            showTabMain('planning');
        }
    };

    /* ************** *
     * Episodes
     * *************  */

    //Affichage des épisodes dans les saisons
    var showEpisode = function (seasons) {

        $.each(seasons, function (i, season) {
            var episodes = season.episodes[i];
            $('li.seas-lis').append('<ol><li>' + episodes.number + ' - ' + episodes.title + '</li></ol>');
        });
    };

    //Change l'affichage selon la tabulation
    var showTab = function (tabName) {
        var tab = $('.tab#' + tabName);

        //Affichage de la section en relation avec la tab et cacher les autres sections
        $('.tab').hide();
        $(tab).trigger('beforeShow', tab); //déclancher un évènement, le créer car qd on clique sur les favaris on doit afficher les favoris
        $(tab).show();

        //Ajoute la class "active" au tab-header tab-footer sélectionné
        $('.tab-header[rel!=' + tabName + '], .tab-footer[rel!=' + tabName + ']').removeClass('active');
        $('.tab-header[rel=' + tabName + '], .tab-footer[rel=' + tabName + ']').addClass('active');

        //Simulation d'un changement de page
        //history.pushState(null, tabName, tabName);

        //Retourne le contenu du tab affocher
        return tab;
    }

//Affichage d'erreur
    var showTabMsg = function (tabName, errorMsg) {
        var tab = showTab(tabName);

        $(tab).find('section.main').hide();
        $(tab).find('section.msg')
            .text(errorMsg)
            .show();
    }

//Affichage des bonnes section
    var showTabMain = function (tabName) {
        var tab = showTab(tabName);

        $(tab).find('section.main').show();
        $(tab).find('section.msg').hide();
    }

//Ajout de qqch dans localStorage en JSON
    var setJsonItem = function (key, json) {
        return localStorage.setItem(key, JSON.stringify(json));
    };

//Retourne qqch du localStorage sans JSON
    var getJsonItem = function (key) {
        return JSON.parse(localStorage.getItem(key));
    };

//Load de routine
    $(function () {

        //Clique sur la navigation header/footer
        $('.tab-header,.tab-footer').on('click', function (e) {
            e.preventDefault();
            showTab($(e.target).attr('rel'));
        });

        // Affiche la .tab#search par défaut
        showTab('search');

        //Déclenchement event lors du clique de recherche
        $('.tab#search').find('form').on('submit', function (e) {
            e.preventDefault();
            searchSerie($(e.target).find('input[type=search]').val());
        });
        $('.tab#favorites').on('beforeShow', function (e) { //Est utilisé lorsqu'on déclenche le switchTab
            showFavorites();
        });

        $('li a[rel = planning]').on('click', function (e) {
            showTabMsg('planning', 'Récupération du planning. Un instant SVP.');
            getPlanning(showPlanning);
        });

        $('li a[rel = description]').on('click', function (e) {
            showTabMsg('description', 'Aucune série sélectionnée pour afficher sa description. Sélectionnez une série de vos favoris ou faites une recherche');
        });

        //Event lors du clique pour favoris/enlever des favoris
        $('.tab#description p.favorite a').on('click', function (e) {
            e.preventDefault();
            var rel = $(this).attr('rel');
            if (isFavorite(rel)) {
                removeFromFavorites(rel);
            } else {
                addToFavorites(rel);
            }
        })

    });

})
    (jQuery);