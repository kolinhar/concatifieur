/**
 * Created by PRJS12821 on 09/08/2016.
 */
"use strict";
ngAriane.factory("cartoFactory", ["$http", "cartoService", "reseauService", "DIURLAPI", "AjaxErrorManager", function ($http, cartoService, reseauService, DIURLAPI, AjaxErrorManager) {
    return {
        getPosteLoc: function (postes) {
            cartoService.datas = [];

            return $http({
                url: "http://x18srhrgcb7:8044/geo/ordinateur",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: postes
            })
                .success(function (datas) {
                    if (angular.isArray(datas) === true) {
                        var ret = {};
                        datas.forEach(function (val) {
                            ret[val.ordinateur] = {
                                group: "alsace",
                                lng: parseFloat(val.lng),
                                lat: parseFloat(val.lat),
                                focus: false,
                                draggable: false,
                                perimetre: val.perimetre,
                                location: val.location,
                                poste: val.ordinateur,
                                label: {
                                    message: "",
                                    options: {
                                        noHide: true,
                                        direction: "auto",
                                        clickable: true
                                    }
                                }
                            }
                        });

                        cartoService.datas = ret;
                        cartoService.nb = datas.length;
                    }
                    else
                        AjaxErrorManager.Gerer("Erreur lors de la localisation des postes. " + datas.message);
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de localisation des postes");
                });
        },
        getReseauLoc: function () {
            return $http({
                url: "http://x18srhrgcb7:8044/reseaux",
                method: "get",
                responseType: "json"
            })
                .success(function (datas) {
                    if (angular.isArray(datas) === true)
                        reseauService.datas = datas;
                    else
                        AjaxErrorManager.Gerer("Erreur lors de la localisation des sous-réseaux IP. " + datas.message);
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de localisation des sous-réseaux IP.");
                });
        },
        updateReseauLoc: function (obj) {
            return $http({
                url: "http://x18srhrgcb7:8044/reseau/update",
                //url: "http://localhost:57384/reseau/update",
                method: "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: obj
            })
                .success(function () {
                    //NE RETOURNE RIEN, SINON BASCULE DIRECTEMENT DANS LE 'error'
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour du sous-réseaux IP.");
                });
        }
    }
}]);