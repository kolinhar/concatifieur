/**
 * Created by PRJS12821 on 21/08/2015.
 */
"use strict";

ngAriane.factory("AffairesFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        getAll: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "affaires",
                method: "GET",
                responseType: "json"
            });
        },
        create: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "affaire/ajout",
                method: "POST",
                data: datas,
                headers:{
                    'Content-Type': 'application/json'
                }
            });
        },
        update: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "affaire/update",
                method: "POST",
                data: datas,
                headers:{
                    'Content-Type': 'application/json'
                }
            });
        },
        get: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "affaire/" + datas.annee + "/" + datas.numAffaire,
                method: "GET",
                responseType: "json"
            });
        },
        getMiennes: function (cp) {
            return $http({
                url: DIURLAPI.URLapiNancy + "affaires/" + cp,
                method: "GET",
                responseType: "json"
            });
        },
        addPointage: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "pointage/add",
                method: "POST",
                data: datas,
                headers:{
                    'Content-Type': 'application/json'
                }
            });
        }
    }
}]);

