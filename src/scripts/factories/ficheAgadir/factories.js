/**
 * Created by PRJS12821 on 18/03/2015.
 */
"use strict";

/**
 * RETOURNE LA LISTE DES AGENTS
 */
ngAriane.factory("AgentsListFactory", ["$http", "DIURLAPI", "AjaxErrorManager", function ($http, DIURLAPI, AjaxErrorManager) {
    return {
        getAgents: function (callback) {
            return $http({
                url: DIURLAPI.URLapi + "agent",
                method: "GET",
                params: {
                    format: "json"
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de la récupération de la liste des agents.");
            });
        }
    };
}]);

/**
 * RETOURNE UNE GESTION DE FICHE
 */
ngAriane.factory("FicheFactory", ["$http", "DIURLAPI", "Region", "AjaxErrorManager", function ($http, DIURLAPI, Region, AjaxErrorManager) {
    return {
        LireFiche: function (annee, numFiche, callback) {


            return $http({
                url: DIURLAPI.URLapiFiche + "fiches/lecture/" + Region + "/" + annee + "/" + numFiche,
                method: "GET",
                params: {
                    format: "json"
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                    AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de la récupération de la fiche " + numFiche + ".");
            });
        },
        CreerFiche: function (datas, callback) {
            var postDatas = datas;

            postDatas.Fiche.DemandeurCP = datas.Fiche.DemandeurCP.originalObject.cp;
            postDatas.Fiche.Poste = datas.Fiche.Poste.description.value;
            postDatas.Fiche.Projet = datas.Fiche.Projet.description.guid;

            //console.log(postDatas);

            return $http({
                url: DIURLAPI.URLapiFiche + "fiches/ajout/",
                data: postDatas,
                method:"POST",
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de création de la fiche.");
            });
        },
        UpdFiche: function (annee, numFiche, datas, callback) {
            var postDatas = datas;

            postDatas.NFiche = numFiche;
            postDatas.Annee = annee;
            postDatas.Region = Region;

            postDatas.Fiche.DemandeurCP = (
                datas.Fiche.DemandeurCP.originalObject !== undefined ?
                    datas.Fiche.DemandeurCP.originalObject.cp
                    : datas.Fiche.DemandeurCP
            );

            postDatas.Fiche.Poste = (
                datas.Fiche.Poste.description !== undefined ?
                    datas.Fiche.Poste.description.value
                    : datas.Fiche.Poste
            );

            postDatas.Fiche.Projet = (
                datas.Fiche.Projet.description !== undefined ?
                    datas.Fiche.Projet.description.guid
                    : datas.Fiche.Projet
            );

            return $http({
                url: DIURLAPI.URLapiFiche + "fiches/modification/",
                data: postDatas,
                method:"POST",
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                    AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de la modification de la fiche ");
            });
        },
        ClotureFiche: function (annee, numFiche, callback) {
            var postDatas = {
                NFiche: numFiche,
                Annee: annee,
                Region: Region
            };

            return $http({
                url: DIURLAPI.URLapiFiche + "fiches/cloturer/",
                data: postDatas,
                method:"POST",
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de la clôturation de la fiche.");
            });
        }
    };
}]);

/**
 * RETOURNE LA LISTE DES POINTAGES D'UNE FICHE
 */
ngAriane.factory("PointagesFactory", ["$http", "DIURLAPI", "Region", "AjaxErrorManager", function ($http, DIURLAPI, Region, AjaxErrorManager){
    return {
        LirePointage: function (annee, numFiche, callback) {
            return $http({
                url: DIURLAPI.URLapiFiche + "pointages/lecture/" + Region + "/" + annee + "/" + numFiche,
                method: "GET",
                params: {
                    format: "json"
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de la récupération de la liste des pointages de la fiche " + numFiche + ".");
            });
        },
        AjouterPointage: function (annee, numFiche, datas, callback) {
            var postDatas = {
                NFiche: numFiche,
                Annee: annee,
                Region: Region,
                Pointage: datas
            };

            return $http({
                url: DIURLAPI.URLapiFiche + "pointages/ajout/",
                data: postDatas,
                method:"POST",
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .success(callback)
            .error(function (data, status, headers, config) {
                AjaxErrorManager.Gerer(data, status, headers, config, "La communication avec le serveur a échoué lors de la création du pointage de la fiche " + numFiche + ".");
            });
        }
    }
}]);

ngAriane.factory("Etats", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        Lire: function () {
            return $http({
                url: DIURLAPI.URLMongo + "etat/lecture",
                params: {
                    format: "json"
                },
                method: "GET"
            });
        }
    }
}]);

ngAriane.factory("AgentsADFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        getAgent: function (request) {
            return $http({
                url: DIURLAPI.URLapiRemote + "agent/recherche/all/" + request,
                params: {
                    format: 'json'
                },
                method: "GET",
                responseType: "JSON"
            });
        },
        getAgentAll: function (request) {
            return $http({
                url: DIURLAPI.URLapiRemote + "agent/recherche/all/" + request,
                params: {
                    format: 'json'
                },
                method: "GET",
                responseType: "JSON"
            });
        }
    };
}]);

ngAriane.factory("PosteADFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        getPoste: function (request) {
            return $http({
                url: DIURLAPI.URLapiRemote + "ordinateur/recherche/" + request,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        }
    };
}]);

ngAriane.factory("PosteGeminiFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        getPoste: function (request) {
            return $http({
                url: DIURLAPI.URLGemini + "materiel/" + request,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        }
    };
}]);

ngAriane.factory("SanteParcFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        getSanteParcHisto: function (poste) {
            return $http({
                url: DIURLAPI.URLapiSanteParc + "config/" + poste,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        },
        getSanteParcLiveCompte: function (cp) {
            return $http({
                url: DIURLAPI.URLapiSanteParc + "infos/user/" + cp,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        },
        getSanteParcLivePoste: function (poste) {
            return $http({
                url: DIURLAPI.URLapiSanteParc + "infos/computer/" + poste,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        }
    };
}]);

ngAriane.factory("Login", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        getUserByPoste: function (poste) {
            return $http({
                url: DIURLAPI.URLapiSanteParc + "login/poste/" + poste,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        },
        getPosteByUser: function (cpUser) {
            return $http({
                url: DIURLAPI.URLapiSanteParc + "login/user/" + cpUser,
                params: {
                    format: "json"
                },
                method: "GET",
                responseType: "JSON"
            });
        }
    }
}]);

ngAriane.factory("ForceFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return  {
        CreateFiche: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "agadir/register",
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

ngAriane.factory("FicheFactoryCSharp", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return {
        add: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "fiche/add",
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
                url: DIURLAPI.URLapiNancy + "fiche/update",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        get: function (annee, numFiche, region) {
            return $http({
                url: DIURLAPI.URLapiNancy + "fiche/" + region + "/" + annee + "/" + numFiche,
                method: "GET",
                params: {
                    format: 'json'
                },
                responseType: "json"
            });
        },
        getPrio: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "fiches/prioritaire",
                method: "GET",
                params: {
                    format: 'json'
                },
                responseType: "json"
            });
        }
    };
}]);

ngAriane.factory("PointageFactoryCSharp", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return {
        add: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "pointage/add",
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
                url: DIURLAPI.URLapiNancy + "pointage/update",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        cloture: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "pointage/cloture",
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
                url: DIURLAPI.URLapiNancy + "pointage/delete",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        read: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "pointage/",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        }
    };
}]);

ngAriane.factory("ProjetFactoryCSharp", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return {
        add: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "pointage/add",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        Update: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "projets/update",
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
                url: DIURLAPI.URLapiNancy + "pointage/delete",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        Lire: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "projets",
                params: {
                    format: "json"
                },
                method: "GET"
            });
        },
        NomencsLire: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "nomenclatures",
                params: {
                    format: "json"
                },
                method: "GET"
            });
        }
    };
}]);

ngAriane.factory("ChangeLogFactoryCSharp", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return {
        add: function (datas) {
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
        },
        Lire: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "changelog/last",
                params: {
                    format: "json"
                },
                method: "GET"
            });
        },
        LireAll: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "changelog",
                params: {
                    format: "json"
                },
                method: "GET"
            });
        }
    };
}]);

ngAriane.factory("AgentFactoryCSharp", ["$http", "DIURLAPI", function ($http, DIURLAPI){
    return {
        upd: function (datas) {
            return $http({
                url: DIURLAPI.URLapiNancy + "agents/update",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        }
    };
}]);