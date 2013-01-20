(function ($) {

    //Variable globale
    var API_BASE_URL = 'http://api.betaseries.com/';
    var API_AUTH_KEY = 'key=bf7f369ce177';

    var TAB_SEARCH = 'search';
    var TAB_DESCRIPTION = 'description';
    var TAB_FAVORITES = 'favorites';
    var TAB_PLANNING = 'planning';

    /* ******* *
     *  Utils  *
     * ******* */

    /**
     * Retourne un object jQuery de class tab et d'id tabName
     *
     * @param tabName
     * @return {*|jQuery|HTMLElement}
     */
    var getTab = function (tabName) {
        var $tab = $('.tab#' + tabName);
        return $tab;
    };

    /**
     * Récupère le tab dont l'ID n'est pas celui actif
     *
     * @param tabName
     * @return {*|jQuery|HTMLElement}
     */
    var getOtherTabs = function (tabName) {
        var $tabs = $('.tab[id!=' + tabName + ']');
        return $tabs;
    };

    /**
     * Récupère le tab qui est actif
     *
     * @param tabName
     * @return {*|jQuery|HTMLElement}
     */
    var getTabNavs = function (tabName) {
        var $tabNav = $('.tab-nav[rel=' + tabName + ']');
        return $tabNav;
    };

    /**
     * Récupère la tab dont le rel est tabName
     *
     * @param tabName
     * @return {*|jQuery|HTMLElement}
     */
    var getOtherTabNavs = function (tabName) {
        var $tabNavs = $('.tab-nav[rel!=' + tabName + ']');
        return $tabNavs;
    };

    /**
     * Change l'affichage selon la tabulation
     *
     * @param tabName
     * @return {*|jQuery|HTMLElement}
     */
    var showTab = function (tabName) {
        var $tab = getTab(tabName);

        //Affichage de la section en relation avec la tab et cacher les autres sections
        getOtherTabs(tabName).hide();
        $tab.trigger('beforeShow', $tab)//déclancher un évènement, le créer car qd on clique sur les favaris on doit afficher les favoris
            .show();

        //Ajoute la class "active" au tab-header tab-footer sélectionné
        getOtherTabNavs(tabName).removeClass('active');
        getTabNavs(tabName).addClass('active');

        //Retourne le contenu du tab affocher
        return $tab;
    };

    /**
     * Affichage de la section main section d'un tab donné
     *
     * @param tabName
     */
    var showTabMain = function (tabName) {
        var $tab = showTab(tabName);

        $tab.find('section.main').show();
        $tab.find('section.msg').hide();
    };

    /**
     * Affichage de la section msg d'un tab donné
     *
     * @param tabName
     * @param msg
     */
    var showTabMsg = function (tabName, msg) {
        var $tab = showTab(tabName);

        $tab.find('section.main').hide();
        $tab.find('section.msg')
            .text(msg)
            .show();
    };

    /**
     * Ajout de qqch dans localStorage en JSON
     *
     * @param key
     * @param json
     */
    var setJsonItem = function (key, json) {
        return localStorage.setItem(key, JSON.stringify(json));
    };

    /**
     * Retourne qqch en JSON du localStorage
     *
     * @param key
     * @return {*}
     */
    var getJsonItem = function (key) {
        return JSON.parse(localStorage.getItem(key));
    };

    /**
     * Interroge l'API de betaseries pour obtenir les informations completes d'une serie
     *
     * @param title
     * @param callback
     */
    var getSerie = function (title, callback) {
        var serieUrl = API_BASE_URL + 'shows/display/' + title + '.json?' + API_AUTH_KEY;

        $.ajax({
            url:serieUrl,
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
    };

    /**
     * Interroge l'API de betaseries pour obtenir les saisons et épisodes d'une série donnée.
     * Sur le données reçues :
     *  - on supprime tout les infos pour les sous-titres
     *  - on ajoute une propriété has_seen
     *
     * @param urlKey
     * @param callback
     */
    var getSeasons = function (urlKey, callback) {
        var seasonsUrl = API_BASE_URL + 'shows/episodes/' + urlKey + '.json?hide_notes=1&' + API_AUTH_KEY;

        $.ajax({
            url:seasonsUrl,
            success:function (data) {
                var seasons = data.root.seasons;

                if (callback && $.isFunction(callback)) {
                    // Post-processing sur la data reçue de l'API
                    $.each(seasons, function (i, season) {
                        $.each(season.episodes, function (i, episode) {
                            // Supprime les sous-titres (inutile ici)
                            delete episode.subs;

                            // ajout de la propriété "has_seen"
                            episode.has_seen = false;
                        })
                    });

                    // Appelle le callback avec les seasons filtrées
                    callback(seasons);
                }
            }
        });
    };

    /* ************ *
     *  Search Tab  *
     * ************ */

    /**
     * Recherche de série(s)
     *
     * @param keyword
     */
    var searchSerie = function (keyword) {
        var $tab = getTab(TAB_SEARCH);
        var searchUrl = API_BASE_URL + 'shows/search.json?title=' + keyword + '&' + API_AUTH_KEY;

        //Enlève les anciennes recherches
        $tab.find('ul.searchResults li').remove();

        //Test de la valeur dans le champ input
        if (keyword.length < 2) {
            showTabMsg(TAB_SEARCH, 'Il faut entrer au minimum 2 caractères pour faire une recherche');
        } else {
            $.ajax({
                url:searchUrl,
                success:function (data) {
                    showSearchResults(data.root.shows)
                }
            });
        }
    };

    /**
     * Affichage des résultats de la recherche
     *
     * @param searchResults
     */
    var showSearchResults = function (searchResults) {
        var $tab = getTab(TAB_SEARCH);

        //Test le résultat de recherche
        if (searchResults.length <= 0) {
            showTabMsg(TAB_SEARCH, 'Il n\'y a aucun résultat pour cette recherche');
        } else {
            //Boucle sur le résultat de recherche
            $.each(searchResults, function (i, searchResult) {
                var $ul = $tab.find('ul.searchResults').append('<li><a href="#" rel="' + searchResult.url + '">' + searchResult.title + '</a></li>');

                //Vérifie sur la série est déjà dans les favoris pour lui ajouter une classe (utile lors de l'affichage de la série
                if (isFavorite(searchResult.url)) {
                    $ul.find('li:last a').addClass(CLASS_IS_FAVORITE);
                }
            });

            //Event lors du clique sur 1 série du listing
            $tab.find('ul.searchResults li a')
                .on('click', function (e) {
                    e.preventDefault();
                    //Pas d'arguement dans showSerieDescription car le paramètre est passé implicitement
                    showTabMsg(TAB_SEARCH, 'Récupération de la série. Un instant SVP.');
                    getSerie($(e.target).attr('rel'), showSerieDescription);

                });

            //Appel de l'affichage de la bonne section
            showTabMain(TAB_SEARCH);
        }
    };

    /* ***************** *
     *  Description Tab  *
     * ***************** */

    /**
     * Affichage d'une série sélectionnée
     *
     * @param serie
     */
    var showSerieDescription = function (serie) {
        var $tab = getTab(TAB_DESCRIPTION);

        // Remplissage des infos de la serie à décrire
        //Si la série est dans les favoris ou pas
        if (serie) {

            //Vérifie si une img existe
            if (serie.banner) {
                $tab.find('img.banner')
                    .attr('src', serie.banner)
                    .attr('alt', serie.title)
                    .attr('title', serie.title);
            }
            else {
                $tab.find('img.banner')
                    .attr('src', 'img/no-pre.png')
                    .attr('alt', 'Pas d\'image pour cette série')
                    .attr('title', 'Pas d\'image pour cette série');
            }

            // Affiche le titre
            $tab.find('h3.title').text(serie.title);

            // Favoris
            $tab.find('p.favorite a')
                .attr('rel', serie.url)
                .text(isFavorite(serie.url) ? 'Supprimer des favoris' : 'Ajouter aux favoris');

            // Description, genre, duration, status
            $tab.find('p.description').text(serie.description);
            $tab.find('p.gender').text(serie.genres);
            $tab.find('p.duration').text(serie.duration + ' min');
            $tab.find('p.status').text(serie.status);

            var tpl = '{{#seasons}}<li class="seas-list">' +
                '<h4>Saison {{number}}</h4>' +
                '<ol class="episodes">' +
                '{{#episodes}}<li class="icon-cancel ep-list">{{number}} - {{title}}</li>{{/episodes}}' +
                '</ol>' +
                '</li>{{/seasons}}';

            $tab.find('ol.seasons').html(Mustache.render(tpl, serie));

            $tab.find('ol.seasons li.seas-list h4')
                .on('click', function () {
                    $(this).parent().find('ol.episodes').slideToggle();
                })
                .trigger('click'); // On les cachent par défaut

            if (!isFavorite(serie.url)) {
                $tab.find('ol.seasons li').removeClass('icon-cancel');
            } else {
                $tab.find('li[class*=icon-]').on('click', function () {
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
            showTabMain(TAB_DESCRIPTION);
        } else {
            //Appel de l'affichage d'erreur
            showTabMsg(TAB_DESCRIPTION, 'Aucune série sélectionnée pour afficher sa déscription. Sélectionnez une série de vos favoris ou faites une recherche');
        }
    };

    /* *************** *
     *  Favorites Tab  *
     * *************** */

    var FAVORITES_STORAGE_KEY = 'favorites';
    var CLASS_IS_FAVORITE = 'is-favorite';
    var CLASS_IS_NOT_FAVORITE = 'is-not-favorite';

    /**
     * Affichage de la série favorite
     */
    var showFavorites = function () {
        var $tab = getTab(TAB_FAVORITES);

        //Récupération du json à la clef FAVORITES_STORAGE_KEY
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);

        //Enlève les anciens éléments
        $tab.find('ul.fav-list li').remove();

        //Boucle pour affiche le listing des favoris, i = index, élément à parcourir, fav = fonction décrivant ce qu'on fait à chaque item donc la valeur
        $.each(favorites, function (i, fav) {
            $tab.find('ul.fav-list').append('<li><a href="#" rel="' + i + '">' + fav.serie.title
                + '</a><p>Status: ' + fav.serie.status
                + '</p></li>');
        });

        //Event lors du clic sur un favoris
        $tab.find('ul.fav-list li a').on('click', function (e) {
            e.preventDefault();

            //Appel de la fonction de déscription avec les élément du json dans le localStorage
            var urlSerie = $(e.target).attr('rel');
            showSerieDescription(favorites[urlSerie].serie);
        });
    };

    /**
     * Ajout de la série dans les favoris
     *
     * @param urlKey
     */
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

        // tab description
        getTab(TAB_DESCRIPTION).find('p.favorite a')
            .removeClass(CLASS_IS_NOT_FAVORITE)
            .addClass(CLASS_IS_FAVORITE)
            .text("Supprimer des favoris");
    };

    /**
     * Le favoris est enlevé du localStorage
     *
     * @param urlKey
     */
    var removeFromFavorites = function (urlKey) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);

        if (favorites) {
            delete favorites[urlKey];
            setJsonItem(FAVORITES_STORAGE_KEY, favorites);
        }

        //Modification pour bouton de ajouter/enlever favoris
        getTab(TAB_DESCRIPTION).find('p.favorite a')
            .removeClass(CLASS_IS_FAVORITE)
            .addClass(CLASS_IS_NOT_FAVORITE)
            .text("Ajouter aux favoris");
    };

    /**
     * Retourne un favoris
     *
     * @param urlKey
     * @return {*}
     */
    var getFavorite = function (urlKey) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
        return (favorites && favorites.hasOwnProperty(urlKey)) ? favorites[urlKey] : undefined;
    };

    /**
     * Ajoute/Affecte un favoris à une clé donnée
     *
     * @param urlKey
     * @param favorite
     */
    var setFavorite = function (urlKey, favorite) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
        favorites[urlKey] = favorite;
    };

    /**
     * Retourne s'il y a un favoris pour la clé donnée
     *
     * @param urlKey
     * @return {*|Boolean}
     */
    var isFavorite = function (urlKey) {
        var favorites = getJsonItem(FAVORITES_STORAGE_KEY);
        return (favorites && favorites.hasOwnProperty(urlKey));
    };

    /**
     * Change le status vu/non vu d'un épisode
     *
     * @param serieUrl
     * @param seasonId
     * @param episodeId
     */
    var hasSeenEpisodeToggle = function (serieUrl, seasonId, episodeId) {
        var favorite = getFavorite(serieUrl);
        favorite.serie.seasons[seasonId].episodes[episodeId].has_seen = !favorite.serie.seasons[seasonId].episodes[episodeId].has_seen;
        setFavorite(serieUrl, favorite);
    };

    /* ************** *
     *  Planning Tab
     * ************** */

    /**
     * Récupération des données du planning de l'API
     * Sur les données reçues on garde juste le planning des épisodes futures pour les series favorites
     *
     * @param callback
     */
    var getPlanning = function (callback) {
        var planningUrl = API_BASE_URL + 'planning/general.json?' + API_AUTH_KEY;

        $.ajax({
            url:planningUrl,
            success:function (data) {
                var planning = data.root.planning;

                if (callback && $.isFunction(callback)) {

                    var planningFavorites = []; // Array not object

                    var nowDate = $.now() / 1000; // trim timestamp to seconds
                    $.each(planning, function (i, episodes) {

                        if (episodes.date >= nowDate && isFavorite(episodes.url)) {
                            planningFavorites.push(episodes);
                        }
                    });

                    callback(planningFavorites);
                }
            }
        });
    };

    /**
     * Affichage du planning des 8 prochains jours
     *
     * @param planningShow
     */
    var showPlanning = function (planningShow) {
        var $tab = getTab(TAB_PLANNING);

        $tab.find('ul.plan-list li').remove();

        if (!planningShow || !$.isArray(planningShow) || planningShow.length < 1) {
            showTabMsg(TAB_PLANNING, 'Il n\'y a aucune série favorite pour le planning');
        } else {

            var planningTemplate = '<li>' +
                '<a href="#" rel="{{url}}">{{show}}</a>' +
                '<p class="date">{{formattedDate}}</p>' +
                '<p class="episode">{{number}} - {{title}}</p>' +
                '</li>';


            $.each(planningShow, function (i, plan) {

                // Convertion de la date au format standard
                plan.formattedDate = function () {
                    return new Date(this.date * 1000).toLocaleDateString();
                };

                // Render le template
                $tab.find('ul.plan-list').append(Mustache.render(planningTemplate, plan))
            });

            $tab.find('ul.plan-list li a').on('click', function (e) {
                e.preventDefault();
                showSerieDescription(getFavorite($(this).attr('rel')).serie);
            });
            showTabMain(TAB_PLANNING);
        }
    };

    /**
     * Load de routine
     */
    $(function () {

        // Setup des requêtes ajax
        $.ajaxSetup({
            // Doit être jsonp (json = crossdomain problèmes)
            dataType:'jsonp',
            // Global events are never fired for cross-domain script or JSONP requests
            // http://api.jquery.com/category/ajax/global-ajax-event-handlers/
            // Workaround : utiliser les fonction beforeSend et complete pour simuler les ajaxStart et ajaxStop
            beforeSend:function () {
                $('body').addClass('loading');
            },
            complete:function () {
                $('body').removeClass('loading');
            }
        });

        //Clique sur les tab-nav
        $('.tab-nav').on('click', function (e) {
            e.preventDefault();
            showTab($(e.target).attr('rel'));
        });

        // Affiche la .tab#search par défaut
        showTab(TAB_SEARCH);

        //Déclenchement event lors du clique de recherche
        getTab(TAB_SEARCH).find('form').on('submit', function (e) {
            e.preventDefault();
            searchSerie($(e.target).find('input[type=search]').val());
        });
        getTab(TAB_FAVORITES).on('beforeShow', function () { //Est utilisé lorsqu'on déclenche le switchTab
            showFavorites();
        });

        getTabNavs(TAB_PLANNING).on('click', function () {
            showTabMsg(TAB_PLANNING, 'Récupération du planning. Un instant SVP.');
            getPlanning(showPlanning);
        });

        getTabNavs(TAB_DESCRIPTION).on('click', function () {
            showTabMsg(TAB_DESCRIPTION, 'Aucune série sélectionnée pour afficher sa description. Sélectionnez une série de vos favoris ou faites une recherche');
        });

        //Event lors du clique pour favoris/enlever des favoris
        getTab(TAB_DESCRIPTION).find(' p.favorite a').on('click', function (e) {
            e.preventDefault();
            var rel = $(this).attr('rel');
            if (isFavorite(rel)) {
                removeFromFavorites(rel);
            } else {
                addToFavorites(rel);
            }
        });


    });


})
    (jQuery);