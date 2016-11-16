/**
 * Created by PRJS12821 on 05/07/2016.
 */
"use strict";

ngAriane.factory("AgentsFactory", ["agentsService", "$http", "DIURLAPI", "AjaxErrorManager", function (agentsService, $http, DIURLAPI, AjaxErrorManager) {
    return {
        getDpxPrioritaires: function () {
            return $http({
                url: DIURLAPI.URLVip + "vip",
                method: "get",
                responseType: "json"
            })
                .success(function (datas) {
                    agentsService.dpxPrioritaires = datas;
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de récupération des DPX infra.");
                });
        }
    }
}]);