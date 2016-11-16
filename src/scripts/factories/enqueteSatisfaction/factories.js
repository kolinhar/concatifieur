/**
 * Created by PRJS12821 on 18/03/2015.
 */
"use strict";

ngAriane.factory("EnqueteSatisfactionFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return {
       /* add: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "changelog/add",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        upd: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "changelog/update",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        del: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "changelog/delete",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },*/
        Lire: function (annee, nFiche) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "ariane/" + annee + "/" + nFiche,
                params: {
                    format: "json"
                },
                method: "GET"
            });
        }
        //LireAll: function () {
        //    return $http({
        //        url: DIURLAPI.URLapiNancy + "changelog",
        //        params: {
        //            format: "json"
        //        },
        //        method: "GET"
        //    });
        //}
    };
}]);
