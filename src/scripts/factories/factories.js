/**
 * Created by PRJS12821 on 20/04/2015.
 */
"use strict";

/**
 * INJECTION DE JQUERY DANS ANGULAR
 */
ngAriane.factory('jQuery', ["$window", function ($window) {
    return $window.jQuery;
}]);

/**
 * CONVERTI UN CP AGENT EN NOM PRÉNOM
 */
ngAriane.factory("CPtoNAME", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        GetFullName: function (cp, callback) {
            return $http({
                url: DIURLAPI.URLapi + "agent/search/" + cp,
                method: "GET"
            })
            .success(function (datas) {
                callback(datas[cp.toUpperCase()]);
            })
            .error(function () {
                    console.log("ERREUR lors de la récupération du nom de l'agent connecté", arguments);
            });
        }
    };
}]);
