/**
 * Created by PRJS12821 on 02/10/2015.
 */
"use strict";

ngAriane.factory("AgadirDominator", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        LireLesDJS: function(semaine, annee){
            return $http({
                url: DIURLAPI.URLapiAgadir + "pointage/lecture/djs/" + semaine + "/" + annee,
                method: "GET",
                responseType: "json"
            });
        },
        LirePtg: function(cp, date){
            return $http({
                url: DIURLAPI.URLapiAgadir + "pointage/lecture/" + cp + "/" + date,
                method: "GET",
                responseType: "json"
            });
        },
        CPtg: function (datas) {
            return $http({
                url: DIURLAPI.URLapiAgadir + "pointage/creation",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        }
    }
}]);