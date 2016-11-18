/**
 * Created by PRJS12821 on 04/09/2014.
 */
"use strict";

var ngAriane = angular.module("ngAriane", [
    "ngRoute",
    "ngTouch",
    "ngLocale",
    "ngCookies",
    "angular-datepicker",//https://github.com/alongubkin/angular-datepicker (longer maintained)
    "angucomplete-alt", /**
 ATTENTION!!! LE DEV QUI A CHIÉ CE PLUG-IN A SÛREMENT HARD-CODÉ CERTAINES INSTRUCTIONS, CE QUI REND DIFFICILE SON UTILISATION,
 POUR AIDER EN DÉBUG, UTILISER LA VALEUR DE 'result'. EX: LA VALEUR DE 'result.title' EST DANS CERTAINS CAS === '',
 MAIS C'EST LA VALEUR RECHERCHÉE QUI EST AFFICHÉE AU LIEU DE RIEN.
 C'EST D'AILLEURS UN MIRACLE D'ARRIVER À EN FAIRE FONCTIONNER PLUSIEURS SUR LA MÊME PAGE SANS QU'IL Y AIE UN CONFLIT!
 */ "ngMaterial",
    "ngSanitize",
    'hc.marked',
    "leaflet-directive"
]).config(["$mdThemingProvider", "$sceDelegateProvider", function($mdThemingProvider, $sceDelegateProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .warnPalette('red');

    $sceDelegateProvider.resourceUrlWhitelist([
        "self",
        "http://x18srhrgcb7:*/**",
        "http://test.ariane.st.sncf.fr/**",
        "http://ariane.st.sncf.fr/**",
        "http://test.upi.api.arianeinformatique.st.sncf.fr/**",
        "http://upi.api.arianeinformatique.st.sncf.fr/**",
        "http://test.agadir.ariane.st.sncf.fr/api/**",
        "http://agadir.ariane.st.sncf.fr/api/**"
    ]);
}]);

ngAriane.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
    .when('/auth/:cp', {
        templateUrl: 'views/acceuil.html',
        controller: "Auth"
    })
/*
    .when('/', {
        templateUrl: 'views/acceuil.html'
    })
    .when('/pointages/:idUser', {
        templateUrl: 'views/listeFiches.html'
    })
   .when('/pointages/:idUser/:annee/:numSemaine', {
        templateUrl: 'views/listeFiches.html'
    })
   .when('/aide', {
        templateUrl: 'views/aide.html'
    })
*/
    .when('/gestionFiches', {
        templateUrl: 'views/gestionFiches.html',
        controller: "Fiches"
    })
    .when('/gestionFiches/:onglet', {
        templateUrl: 'views/gestionFiches.html',
        controller: "Fiches"
    })
    .when('/fiche', {
        templateUrl: 'views/fiche.html',
        controller: 'ficheAgadir'
    })
    .when('/fiche/:annee/:numFiche', {
        templateUrl: 'views/fiche.html',
        controller: 'ficheAgadir'
    })
    .when('/fiche/:annee/:numFiche/:region', {
        templateUrl: 'views/fiche.html',
        controller: 'ficheAgadir'
    })
    .when('/notifications/:cp', {
        templateUrl: 'views/notification/notifs.html',
        controller: 'listeNotifs'
    })
    .when('/changelog', {
        templateUrl: 'views/changeLog.html',
        controller: 'listeChangeLog'
    })
    .when('/djs/:idUser/:annee/:numSemaine', {
        templateUrl: 'views/djs/vueDjs.html',
        controller: 'DjsManager'
    })
    .when('/djs/:annee/:numSemaine', {
        templateUrl: 'views/djs/djs3s.html',
        controller: 'Djs3S'
    })
    .when('/check/djs/:annee/:numSemaine', {
        templateUrl: 'views/djs/checkDjs.html',
        controller: 'Djs3S'
    })
    .when('/pointages/:idUser/:datePointage', {
        templateUrl: 'views/ficheAgadir/listePointages.html',
        controller: 'pointagesJournee'
    })
    .when('/pointages/check/:idUser/:datePointage', {
        templateUrl: 'views/djs/checkPointages.html',
        controller: 'pointagesJournee'
    })
    /*.when('/pointage', {
        templateUrl: 'views/gestionPointages.html',
        controller: 'Onglets'
    })
    .when('/pointage/:onglet', {
        templateUrl: 'views/gestionPointages.html',
        controller: 'Onglets'
    })*/
    .when('/affaire/lire/:annee/:numAffaire', {
        templateUrl: 'views/affaire/ficheAffaire.html',
        controller: 'AffaireNum'
    })
    .when('/affaire/creation', {
        templateUrl: 'views/affaire/ficheAffaireCreation.html',
        controller: 'AffaireCreation'
    })
	.when('/enquete/:annee', {
        templateUrl: 'views/enquete/index.html',
        controller: 'EnqueteCtrl'
    })
    .when('/enqueteform/:annee', {
        templateUrl: 'views/enquete/formulaires.html',
        controller: 'FormsCtrl'
    })
    .when('/ewala', {
        //templateUrl: 'views/carto/sousReseaux.html',
        templateUrl: 'http://x18srhrgcb7:8044/static/reseau',
        controller: 'ReseauxIP'
    })
    .when('/projets', {
        templateUrl: 'views/gestionProjets.html',
        controller: 'GestionProjets'
    })
    /*
    .when('/dragndrop', {
        templateUrl: 'views/dragndrop/zone.html',
        controller: 'DropZone'
    })
    */
    .otherwise({
        redirectTo: '/gestionFiches'
    });
}]);

//VISUALISATIONS
window.Highcharts && Highcharts.setOptions({
    lang: {
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        shortMonths: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',  'Juil', 'Aoû', 'Sept', 'Oct', 'Nov', 'Déc'],
        weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        loading: "Chargement ...",
        printChart: "Imprimer le graphique",
        downloadJPEG: "Télécharger l'image au format JPEG",
        downloadPDF: "Télécharger l'image au format PDF",
        downloadPNG: "Télécharger l'image au format PNG",
        downloadSVG: "Télécharger l'image au format SVG",
        thousandsSep: " "
    },
    colors:  ['#90ed7d', '#7cb5ec', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
    xAxis: {
        labels: {
            style:{
                color: "#000"
            }
        }
    },
    yAxis: {
        labels: {
            style:{
                color: "#000"
            }
        }
    },
    credits: {
        enabled: false
    }
});
