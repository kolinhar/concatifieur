/**
 * Created by pvws02941 on 21/04/2015.
 */
"use strict";

ngAriane.factory("DAL_FICHE", ["$http", "DIURLAPI", function($http, DIURLAPI){
    return {
        LireUneFiche: function(lesDonnees){

            return $http({
                url: DIURLAPI.URLMongo+"fiche",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        LireFicheAll: function(lesDonnees){

            return $http({
                url: DIURLAPI.URLMongo+"fiches",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        LireFichesPosteMulti: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "fiches/poste",
                method: "GET",
                responseType: "JSON",
                params: {
                    format: 'json'
                }
            });
        },
        LireFichesAgent: function(lesDonnees){

            return $http({
                url: DIURLAPI.URLMongo+"fichesAgent",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        CreationFiche: function(lesDonnees){

            return $http({
                url: DIURLAPI.URLMongo+"ficheAdd",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees).replace(/&/g, "%26")
                });
        },
        ModificationFiche: function(lesDonnees){

            return $http({
                url: DIURLAPI.URLMongo+"ficheUpdate",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees).replace(/&/g, "%26")
            });
        },
        ClotureFiche: function(lesDonnees){

            return $http({
                url: DIURLAPI.URLMongo+"ficheCloture",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees).replace(/&/g, "%26")
            });
        },
        Affectefiche: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo+"ficheAffecte",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        Transfertfiche: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo + "ficheTransferer",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        }
    };
}]);

ngAriane.factory("DAL_POINTAGE", ["$http", "DIURLAPI", function($http, DIURLAPI){
    return {
        LirePointage: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo + "pointagesAgent",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        LirePointageAstreinte: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo + "pointagesAgentAstreinte",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        CreationPointage: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo+"pointagesAdd",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        CreationPointageProjet: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo+"pointagesAddProjet",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        ModificationPointage: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo+"pointagesUpdate",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        ModificationPointageProjet: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo+"pointagesUpdateProjet",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        SuppressionPointage: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo + "pointagesDelete",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        SuppressionPointageProjet: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLMongo + "pointagesDeleteProjet",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify(lesDonnees)
            });
        },
        CreationPointageNuit: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo +"pointagesAddMonteNuit/",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify([lesDonnees])
            });
        },
        ModificationPointageNuit: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo + "pointagesUpdateMonteNuit/",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify([lesDonnees])
            });
        },
        CreationPointageAstreinte: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo + "pointagesAddAstreinte",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify([lesDonnees])
            });
        },
        ModificationPointageAstreinte: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo + "pointagesUpdateAstreinte",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify([lesDonnees])
            });
        },
        SuppressionPointageAstreinte: function (lesDonnees) {
            return $http({
                url: DIURLAPI.URLMongo + "pointagesDeleteAstreinte",
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                responseType: "json",
                data: "datas=" + JSON.stringify([lesDonnees])
            });
        }
    };
}]);

ngAriane.factory("DAL_DJS", ["$http", "DIURLAPI", function($http, DIURLAPI){
    return {
        LireDJS: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLapiNancy + "djs/" + lesDonnees.cp + "/" + lesDonnees.semaine + "/" + lesDonnees.annee,
                method: "GET",
                responseType: "json"
            });
        },
        LireLesDJS: function(semaine, annee){
            return $http({
                url: DIURLAPI.URLapiNancy + "djs/" + semaine + "/" + annee,
                method: "GET",
                responseType: "json"
            });
        },
        CreationDJS: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLapiNancy + "djs/add",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: lesDonnees
            });
        },
        ModificationDJS: function(lesDonnees){
            return $http({
                url: DIURLAPI.URLapiNancy + "djs/update",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: lesDonnees
            });
        }
    };
}]);

ngAriane.factory("DAL_PROJET", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        Liste: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "projets",
                method: "GET",
                responseType: "JSON",
                params: {
                    format: "JSON"
                }
            });
        }
    }
}]);

ngAriane.factory("DAL_POSTE", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        Liste: function (poste) {
            return $http({
                url: DIURLAPI.URLapiNancy + "fiches/poste/" + poste,
                method: "GET",
                responseType: "JSON"
            });
        }
    }
}]);

ngAriane.factory("DAL_AGENT", ["$http", "DIURLAPI", "AjaxErrorManager", "NOMSPARTIS", function ($http, DIURLAPI, AjaxErrorManager, NOMSPARTIS) {
    var ret = {},
        ListeAgents = function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "agents",
                method: "GET",
                responseType: "JSON",
                params: {
                    format: 'json'
                }
            });
        };

    ret.ListeAgentsOrdered = function (callback) {
            ListeAgents()
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        //LE TABLEAU EST DÉJÀ ORDONNÉ
                        var l_listAgents = datas.LAgents,
                            l_nonAffecte = {};

                        //ON ENLÈVE LE NON-AFFECTÉ
                        l_listAgents = l_listAgents.filter(function (val) {
                            if (val.cp === "0")
                                l_nonAffecte = val;

                            return val.cp !== "0";
                        });

                        //ON LE REMET AU DÉBUT
                        l_listAgents.unshift(l_nonAffecte);

                        callback(l_listAgents);
                    }
                    else {
                        AjaxErrorManager.Gerer("Erreur lors de la récupération des agents. " + datas.err_msg);
                    }
                })
                .error(function () {
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture des agents.");
                });
    };

    ret.ListeAgentsOrderedAndFiltered = function (callback) {
        ret.ListeAgentsOrdered(function (listeAgents) {
            callback(listeAgents.filter(function (val) {
                //ON N'AFFICHE PAS LES "PARTIS"
                return NOMSPARTIS.every(function (nom) {
                    return val.nomPrenom.indexOf(nom) === -1
                });
            }));
        })
    };

    return ret;
}]);