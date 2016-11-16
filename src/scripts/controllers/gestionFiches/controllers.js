/**
 * Created by PRJS12821 on 19/09/2014.
 */
"use strict";

ngAriane.controller("GoToFiche", ["$scope", "$location", "AjaxErrorManager", "Region", "RegionService", function($scope, $location, AjaxErrorManager, Region, RegionService) {
    $scope.RegionService = RegionService;

    $scope.gotofiche = {
        models:{
            inputFiche: "",
            inputError: false
        },
        region: Region.toString(),
        annee: new Date().getFullYear(),
        maxYear: new Date().getFullYear()
    };

    /**
     * ENVOIE SUR LA FICHE DEMANDÉE
     */
    $scope.gotofiche.go = function () {
        var  numFiche = $scope.gotofiche.models.inputFiche.trim();

        if (numFiche === ""){
            $scope.gotofiche.models.inputError = true;
            AjaxErrorManager.Gerer("numéro de fiche absent");
            return;
        }

        $scope.gotofiche.models.inputError = false;

        $location.url("/fiche/" + $scope.gotofiche.annee + "/" + numFiche + "/" + $scope.gotofiche.region);
    };

    /**
     * SI ON APPUYE SUR LA TOUCHE ENTRÉE, ON VA À LA FICHE DEMANDÉE
     * @param e
     */
    $scope.gotofiche.event = function (e) {
        if (e.key === "Enter")
            $scope.gotofiche.go();
    }
}]);

ngAriane.controller("FastGoToFiche", ["$scope", "$location", "Region", function($scope, $location, Region){
    $scope.fastgotofiche = {
        numFiche: "",
        go: function (e) {
            if ($scope.fastgotofiche.numFiche.trim() === "")
                return;

            if (e.key === "Enter")
                $location.url("/fiche/" + new Date().getFullYear() + "/" + $scope.fastgotofiche.numFiche + "/" + Region.toString());
        }
    };
}]);

ngAriane.controller("Onglets", ["$scope", "$routeParams", "FichesAgent", "FichesToutes", "FichesDispatch", "FichesBO", "FichesAttente", "FichesRecherche", "FichesAffaire", "FichesPrioritaires", "cartoService", function ($scope, $routeParams, FichesAgent, FichesToutes, FichesDispatch, FichesBO, FichesAttente, FichesRecherche, FichesAffaire, FichesPrioritaires, cartoService) {
    $scope.onglets = {
        routeParams: $routeParams,
        NbFiches: FichesAgent,
        NbFichesToutes: FichesToutes,
        NbFichesDispatch: FichesDispatch,
        NbFichesBO: FichesBO,
        NbFichesPrioritaires: FichesPrioritaires,
        NbFichesAttente: FichesAttente,
        NbFichesRecherche: FichesRecherche,
        NbFichesAffaire: FichesAffaire,
        cartoService: cartoService
    };
}]);

ngAriane.controller("Fiches", ["$scope", "$cookieStore", "FichesAgent", "FichesToutes", "FichesDispatch", "FichesBO", "FichesAttente", "FichesRecherche", "DAL_FICHE", "AjaxErrorManager", "DIURLAPI", "$timeout", "DAL_AGENT", "$routeParams", "$location", "URLBuilder", "DatasProjets","AgentsADFactory", "PosteADFactory", "jQuery", "DatasEtats", "ProjetModalService", "SignalrRequest", "ProjetFilterService", "FicheFactoryCSharp", "Region", "PosteGeminiFactory", "WorkersFiches", "AffairesFactory", "FichesPrioritaires", "NOMSPARTIS", "agentsService", function ($scope, $cookieStore, FichesAgent, FichesToutes, FichesDispatch, FichesBO, FichesAttente, FichesRecherche, DAL_FICHE, AjaxErrorManager, DIURLAPI, $timeout, DAL_AGENT, $routeParams, $location, URLBuilder, DatasProjets, AgentsADFactory, PosteADFactory, jQuery, DatasEtats, ProjetModalService, SignalrRequest, ProjetFilterService, FicheFactoryCSharp, Region, PosteGeminiFactory, WorkersFiches, AffairesFactory, FichesPrioritaires, NOMSPARTIS, agentsService) {
    $scope.predicate = "";
    $scope.DIURLAPI = DIURLAPI;
    $scope.DatasProjets = DatasProjets;
    $scope.routeParams = $routeParams;
    $scope.ProjetModalService = ProjetModalService;
    $scope.ProjetFilterService = ProjetFilterService;
    $scope.cookieStore = $cookieStore;

    $scope.Fiches = {
        fiches: {
            Liste: []
        },
        titleIMG: {
            backoffice: "Back Office",
            hotline: "Hotline",
            presta: "Prestation"
        },
        regex: /\s|-/g,
        fichesToutes: {
            Liste: []
        },
        fichesPrioritaires: {
            Liste: []
        },
        fichesDispatch: {
            Liste: []
        },
        fichesBO: {
            Liste: []
        },
        fichesAttente: {
            Liste: []
        },
        mesfichesAttente : {
            Liste : []
        },
        fichesRecherche: [],
        Agents: []
    };

    $scope.EtatsList = DatasEtats;

    $scope.mesfiches = {
        isLoading: true
    };
    $scope.fichesToutes = {
        isLoading: true
    };
    $scope.fichesDispatch = {
        isLoading: true
    };
    $scope.fichesBO = {
        isLoading: true
    };
    $scope.fichesAttente = {
        isLoading: true
    };
    $scope.fichesPrioritaires = {
        isLoading: true
    };
    $scope.fichesRecherche = {
        isLoading: true,
        show: false,
        urlGet: "",
        datasSearch: {
            cpdemandeur: "",
            materiel: "",
            projet: "",
            etat: "",
            cpagent: "",
            isCloture: "undefined"
        },
        reset: function () {
            $scope.fichesRecherche.show = false;
            $cookieStore.remove("recherche");
            $scope.fichesRecherche.Reset();

            if ($routeParams.onglet === "recherche")
                $location.url("/gestionFiches");
        },
        Reset: function () {
            $scope.fichesRecherche.datasSearch = {
                cpdemandeur: "",
                materiel: "",
                projet: "",
                etat: "",
                cpagent: "",
                isCloture: "undefined"
            };

            document.querySelector("#agentAutocompleteInput0>div>input").value = "";
            document.querySelector("#posteAutocompleteInput0>div>input").value = "";
            document.querySelector("#projectAutocompleteInput0>div>input").value = "";
        },
        Search: function () {
            //VÉRIFICATION DES CHAMPS
            if ($scope.fichesRecherche.datasSearch.cpdemandeur === "" && document.querySelector("#agentAutocompleteInput0>div>input").value.trim() !== ""){
                AjaxErrorManager.Gerer("Veuillez saisir un demandeur valide.");
            }

            if ($scope.fichesRecherche.datasSearch.materiel === "" && document.querySelector("#posteAutocompleteInput0>div>input").value.trim() !== ""){
                AjaxErrorManager.Gerer("Veuillez saisir un poste valide.");
            }

            if ($scope.fichesRecherche.datasSearch.projet === "" && document.querySelector("#projectAutocompleteInput0>div>input").value.trim() !== ""){
                AjaxErrorManager.Gerer("Veuillez saisir un projet valide.");
            }

            if (($scope.fichesRecherche.datasSearch.dateDebut //CAS OÙ ON FAIT UNE RECHERCHE AVEC LES BONS PARAMÈTRES
                && $scope.fichesRecherche.datasSearch.dateDebut !== ""
                && $scope.fichesRecherche.datasSearch.dateFin
                && $scope.fichesRecherche.datasSearch.dateFin !== "")
            || ($scope.fichesRecherche.datasSearch.dateDebut === undefined //CAS OÙ ON FAIT UNE RECHERCHE SANS CES CHAMPS
                && $scope.fichesRecherche.datasSearch.dateFin === undefined)
            || ($scope.fichesRecherche.datasSearch.dateDebut === "" //CAS OÙ ON VIENT DE REMETTRE À VIDE LES CHAMPS
                && $scope.fichesRecherche.datasSearch.dateFin === "")) {
                //OK
            }
            else{
                AjaxErrorManager.Gerer("Veuillez saisir une date de début et une date de fin.");
            }

            //SI PAS D'ERREUR, ON FAIT LA RECHERCHE
            if (AjaxErrorManager.Infos === null){
                $location.url(URLBuilder.build("/gestionFiches/recherche", _filterDataToSend($scope.fichesRecherche.datasSearch)));
            }
        }
    };
    $scope.affaires = {
        liste: [],
        isLoading: true
    };

    $scope.mesFichesEnAttente = {
        isLoading: true
    };

    //VARIABLE POUR DIRE QUE C'EST POUR UNE FICHE SINON ÇA PART DANS LA RECHERCHE
    $scope.projetModif = false;
    //LIGNE À METTRE À JOUR
    $scope.lineToUpdate = {};
    //LISTE DES WATCHERS
    $scope.watchers = [];
    //VARIABLE POUR L'API DE RECHERCHE
    $scope.tabPoste = [];

    if ($routeParams.onglet === 'recherche'){
        $scope.fichesRecherche.open = true;
    }

    /**
     * FONCTION ÉXÉCUTÉE QUAND ON SÉLÉCTIONNE UNE VALEUR DANS UN DATETIMEPICKER
     * CAR SINON L'INPUT GARDE LE FOCUS ET ON NE PEUT PAS CLIQUER SUR LE BOUTON
     * DE VALIDATION SANS RÉAFFICHER LE DERNIER DATETIMEPICKER UTILISÉ
     */
    $scope.blurInput = function () {
        this.$node.blur();
    };

    /**
     * AU CLICK SUR LE BOUTON DE LISTE DES PROJET ON RÉCUPÈRE L'ONGLET OU SE TROUVE LA FICHE ET SON EMPLACEMENT DANS LE TABLEAU
     * @param {object} ligne
     */
    $scope.clickForModalProjet = function (ligne) {
        ProjetModalService.list = ligne.listeProjet;

        $scope.projetModif = true;

        $scope.lineToUpdate = ligne;

        //ÉVENEMENT INTERCEPTÉ QU'UNE SEULE FOIS
        $("#ProjetsModal").modal('show').one('hidden.bs.modal', function (e) {
            $scope.projetModif = false;
            $scope.lineToUpdate = {};
        });
    };

    var _getMesFiches = function (tabPoste, agents, callback) {
        $scope.mesfiches.isLoading = true;
        WorkersFiches.MesFiches.postMessage({
            url: DIURLAPI.URLapiNancy + "fiches",
            datas: {
                cpAgent: $cookieStore.get("agent")
            },
            tabPoste : tabPoste,
            agents: agents,
            projets: DatasProjets.liste
        });

        WorkersFiches.MesFiches.onmessage = function (e) {
            $timeout(function () {
                $scope.mesfiches.isLoading = false;

                if (e.data.exit_code === 1) {
                    $scope.Fiches.fiches.Liste = e.data.datas.map(function (val, ind) {
                        val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);
                        if ($routeParams.onglet === "mesfiches" || $routeParams.onglet === undefined){
                            $scope.watchers.push($scope.$watchCollection("Fiches.fiches.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                if (newValCollection === undefined || newValCollection === oldValCollection)
                                    return;

                                _updFiche($scope.Fiches.fiches.Liste[ind]);
                            }));
                        }
                        return val;
                    });
                    $scope.Fiches.mesfichesAttente.Liste = $scope.Fiches.fiches.Liste.filter(function (uneFiche) {
                        return uneFiche.etat.indexOf("En Attente") > -1
                    });
                    $scope.Fiches.fiches.Liste = $scope.Fiches.fiches.Liste.filter(function (uneFiche) {
                        return uneFiche.etat.indexOf("En Attente") === -1
                    });
                    FichesAgent.Nb = e.data.NbFiches;
                }
                else {
                    if (e.data.err_code === 200){
                        AjaxErrorManager.Gerer("Erreur lors de la récupération de vos fiches. "  + e.data.err_msg);
                    }
                    else{
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération de vos fiches.");
                    }
                }

                callback && callback();
            }, 0);
        };

        $scope.affaires.isLoading = true;
        AffairesFactory.getMiennes($cookieStore.get("agent"))
            .success(function (datas) {
                $scope.affaires.isLoading = false;

                if (datas.exit_code === 1){
                    $scope.affaires.liste = datas.lesAffaires;
                }
                else{
                    AjaxErrorManager.Gerer("Erreur lors de la récupération des affaires que vous suivez.");
                }
            })
            .error(function () {
                $scope.affaires.isLoading = false;
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération des affaires que vous suivez.");
            });
    };

    var _getToutes = function (tabPoste, agents, callback) {
        $scope.fichesToutes.isLoading = true;
        WorkersFiches.Toutes.postMessage({
            url: DIURLAPI.URLapiNancy + "fiches",
            datas: {},
            tabPoste : tabPoste,
            agents: agents,
            projets: DatasProjets.liste
        });

        WorkersFiches.Toutes.onmessage = function (e) {
            $timeout(function () {
                $scope.fichesToutes.isLoading = false;
                if (e.data.exit_code === 1) {
                    $scope.Fiches.fichesToutes.Liste = e.data.datas.map(function (val, ind) {
                        val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);
                        if ($routeParams.onglet === "toutes"){
                            $scope.watchers.push($scope.$watchCollection("Fiches.fichesToutes.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                if (newValCollection === undefined || newValCollection === oldValCollection)
                                    return;

                                _updFiche($scope.Fiches.fichesToutes.Liste[ind]);
                            }));
                        }
                        return val;
                    });
                    FichesToutes.Nb = e.data.NbFiches;
                }
                else {
                    if (e.data.err_code === 200){
                        AjaxErrorManager.Gerer("Erreur lors de la récupération de toutes les fiches. "  + e.data.err_msg);
                    }
                    else {
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération de toutes les fiches.");
                    }
                }

                callback && callback();
            }, 0);
        };
    };

    var _getPrioritaires = function () {
        $scope.fichesPrioritaires.isLoading = true;

        FicheFactoryCSharp.getPrio()
            .success(function (datas) {
                $scope.fichesPrioritaires.isLoading = false;

                if (datas.exit_code === 1) {

                    $scope.Fiches.fichesPrioritaires.Liste = datas.lesFiches.map(function(val) {
                        // Attribution du canal d'entrée
                        var canal_check = "./images/channel_" + (val.canal === undefined || val.canal === null ? "ariane" : val.canal) + ".svg";
                        // Verification de la variable Transfert pour nouvelle icone
                        if (val.isTransfert === true)
                            canal_check = "./images/channel_transfert.svg";

                        var l_nomPrenomAffectation = $scope.Fiches.Agents.filter(function (agent) {
                            return val.cpAgent === agent.cp;
                        })[0];

                        var l_poidsProjet = DatasProjets.liste.filter(function (projet) {
                            return val.projet === projet.intitule;
                        })[0];

                        return {
                            etat: val.etat,
                            nFiche: val.numero || val.numeroMongo,
                            numero: val.numero,
                            numeroMongo: val.numeroMongo,
                            demandeur: (val.nomPrenomDemandeur || "[Agent " + val.cpDemandeur + "]").split(" (")[0],
                            cpDemandeur: val.cpDemandeur,
                            poste: val.materiel,
                            date: new Date(val.dateDebut),
                            description: val.description,
                            affectation: val.cpAgent,
                            //SI UTILISATEUR INCONNU: FICHE --> NON AFFECTÉE
                            nomAffectation: (l_nomPrenomAffectation !== undefined ? l_nomPrenomAffectation.nomPrenom : "0"),
                            isCloture: val.isCloture,
                            isUrgent : val.isUrgent,
                            isPrioritaire : val.isPrioritaire,
                            canal: canal_check,
                            nomCanal: val.canal || "Ariane",
                            multiPoste : ($scope.posteMulti.indexOf(val.materiel) > -1),
                            pointages: (val.pointages !== undefined ? val.pointages : undefined),
                            projet: val.projet || undefined,
                            poidsProjet: (l_poidsProjet !== undefined ? l_poidsProjet.poids || "non calculé" : "pas de projet"),
                            region: val.region,
                            numeroAutreRegion: val.numeroAutreRegion,
                            _id: val._id,
                            affaire: val.affaire,
                            pointagesSysteme: val.pointagesSysteme,
                            pointagesTransfert: val.pointagesTransfert,
                            cpActeur: val.cpActeur,
                            nomPrenomActeur: val.nomPrenomActeur,
                            telDemandeur: val.telDemandeur,
                            mobileDemandeur: val.mobileDemandeur
                        };

                    });
                    $scope.Fiches.fichesPrioritaires.Liste = $scope.Fiches.fichesPrioritaires.Liste.map(function (val, ind) {
                        val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);
                        if ($routeParams.onglet === "prioritaires"){
                            $scope.watchers.push($scope.$watchCollection("Fiches.fichesPrioritaires.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                if (newValCollection === undefined || newValCollection === oldValCollection)
                                    return;

                                _updFiche($scope.Fiches.fichesPrioritaires.Liste[ind]);
                            }));
                        }
                        return val;
                    });
                    FichesPrioritaires.Nb = datas.nbFiches;
                }
                else {
                    AjaxErrorManager.Gerer("Erreur lors de la lecture de la liste des fiches prioritaires. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.fichesPrioritaires.isLoading = false;

                console.log(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de la liste des fiches prioritaires.")
            });
    };

    var _getDispatch = function (tabPoste, agents ,callback) {
        $scope.fichesDispatch.isLoading = true;
        WorkersFiches.Dispatch.postMessage({
            url: DIURLAPI.URLapiNancy + "fiches",
            datas: {
                etat: "A DISPATCHER"
            },
            tabPoste : tabPoste,
            agents: agents,
            projets: DatasProjets.liste
        });

        WorkersFiches.Dispatch.onmessage = function (e) {
            $timeout(function () {
                $scope.fichesDispatch.isLoading = false;

                if (e.data.exit_code === 1) {
                    $scope.Fiches.fichesDispatch.Liste = e.data.datas.map(function (val, ind) {
                        val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);

                        if ($routeParams.onglet === "dispatch"){
                            $scope.watchers.push($scope.$watchCollection("Fiches.fichesDispatch.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                if (newValCollection === undefined || newValCollection === oldValCollection)
                                    return;

                                _updFiche($scope.Fiches.fichesDispatch.Liste[ind]);
                            }));
                        }
                        return val;
                    });

                    FichesDispatch.fiches = $scope.Fiches.fichesDispatch.Liste;
                    FichesDispatch.Nb = e.data.NbFiches;
                }
                else {
                    if (e.data.err_code === 200){
                        AjaxErrorManager.Gerer("Erreur lors de la récupération des fiches à dispatcher. "  + e.data.err_msg);
                    }
                    else {
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération des fiches à dispatcher.");
                    }
                }

                callback && callback();
            }, 0);
        };
    };

    var _getBO = function (tabPoste, agents, callback) {
        $scope.fichesBO.isLoading = true;
        WorkersFiches.BO.postMessage({
            url: DIURLAPI.URLapiNancy + "fiches",
            datas: {
                etat: "Back Office"
            },
            tabPoste : tabPoste,
            agents: agents,
            projets: DatasProjets.liste
        });

        WorkersFiches.BO.onmessage = function (e) {
            $timeout(function () {
                $scope.fichesBO.isLoading = false;

                if (e.data.exit_code === 1) {
                    $scope.Fiches.fichesBO.Liste = e.data.datas.map(function (val, ind) {
                        val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);
                        if ($routeParams.onglet === "BO"){
                            $scope.watchers.push($scope.$watchCollection("Fiches.fichesBO.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                if (newValCollection === undefined || newValCollection === oldValCollection)
                                    return;

                                _updFiche($scope.Fiches.fichesBO.Liste[ind]);
                            }));
                        }

                        return val;
                    });
                    FichesBO.Nb = e.data.NbFiches;
                    
                }
                else {
                    if (e.data.err_code === 200){
                        AjaxErrorManager.Gerer("Erreur lors de la récupération des fiches en back office. "  + e.data.err_msg);
                    }
                    else {
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération des fiches en back office.");
                    }
                }

                callback && callback();
            }, 0);
        };
    };

    var _getAttente = function (tabPoste, agents, callback) {
        $scope.fichesAttente.isLoading = true;
        WorkersFiches.Attente.postMessage({
            url: DIURLAPI.URLapiNancy + "fiches",
            datas: {
                etat: "En Attente"
            },
            tabPoste : tabPoste,
            agents: agents,
            projets: DatasProjets.liste
        });

        WorkersFiches.Attente.onmessage = function (e) {
            $timeout(function () {
                $scope.fichesAttente.isLoading = false;

                if (e.data.exit_code === 1) {
                    $scope.Fiches.fichesAttente.Liste = e.data.datas.map(function (val, ind) {
                        val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);
                        if ($routeParams.onglet === "attente"){
                            $scope.watchers.push($scope.$watchCollection("Fiches.fichesAttente.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                if (newValCollection === undefined || newValCollection === oldValCollection)
                                    return;

                                _updFiche($scope.Fiches.fichesAttente.Liste[ind]);
                            }));
                        }
                        return val;
                    });
                    FichesAttente.Nb = e.data.NbFiches;
                }
                else {
                    if (e.data.err_code === 200){
                        AjaxErrorManager.Gerer("Erreur lors de la récupération des fiches en attente. "  + e.data.err_msg);
                    }
                    else {
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération des fiches en attente.");
                    }
                }

                callback && callback();
            }, 0);
        };
    };

    var _listeFctAppelOnglets = {
        mesfiches: _getMesFiches,
        dispatch: _getDispatch,
        BO: _getBO,
        attente: _getAttente,
        prioritaires: _getPrioritaires,
        toutes: _getToutes
    };

    /**
     * FILTRE DES DATAS À ENVOYER:
     * SI UN DES CHAMPS DE L'OBJET EST UN TABLEAU DONT LE PREMIER ÉLÉMENT EST UNE CHAINE VIDE
     * ON NE LE RETOURNE PAS
     * @param datas
     * @returns {*}
     */
    var _filterDataToSend = function (datas) {
        if (!angular.isObject(datas))
            return datas;

        var ret = {};
        for (var champ in datas) {
            if (datas[champ] !== undefined) {
                if ((datas[champ] === "" || datas[champ] === null ) || angular.isString(datas[champ]) && datas[champ] === "") {
                    ret[champ] = undefined;
                }
                else
                {
                    switch (champ){
                        case "materiel":
                            ret.materiel = datas.materiel.title !== undefined ? datas.materiel.title.split(" ")[0] : datas.materiel.calife.split(" ")[0];
                        break;

                        case "cpdemandeur":
                            ret.cpdemandeur = datas.cpdemandeur.title !== undefined ? datas.cpdemandeur.description : datas.cpdemandeur.cp;
                        break;

                        case "projet":
                            ret.projet = datas.projet.title !== undefined ? datas.projet.title : datas.projet.intitule;
                        break;

                        case "isCloture":
                            ret.isCloture = datas.isCloture === "undefined" ? undefined : datas.isCloture;
                        break;

                        default:
                            ret[champ] = datas[champ];
                        break;
                    }
                }
            }
            else {
                ret[champ] = datas[champ];
            }
        }
        return ret;
    };

    var _getDataPoste = function (numPoste) {
        return PosteGeminiFactory.getPoste(numPoste)
            .success(function (datas) {
                $scope.fichesRecherche.datasSearch.materiel = datas.L_Resultats[0];
            });
    };

    var _getDataAgent = function (cpAgent) {
        return AgentsADFactory.getAgentAll(cpAgent)
            .success(function (datas) {
                $scope.fichesRecherche.datasSearch.cpdemandeur = datas.L_Resultats[0];
            });
    };

    /**
     *
     * @param {object} datasObj - un objet literal contenant les infos relatives à la recherche
     * @returns {*}
     * @private
     */
    var _getDatasFromCookieOrUrl = function (datasObj) {
        $scope.fichesRecherche.datasSearch = {
            cpdemandeur: "",
            materiel: "",
            etat: datasObj.etat,
            projet: "",
            cpagent: datasObj.cpagent || "",
            dateDebut: datasObj.dateDebut,
            dateFin: datasObj.dateFin,
            isCloture: datasObj.isCloture === "true" ? true : (datasObj.isCloture === "false" ? false : undefined),
            type: datasObj.type,
            description: datasObj.description
        };
        
        var cpAgent = datasObj.cpdemandeur,
            poste = datasObj.materiel,
            projet = datasObj.projet;

        if (projet !== ""){
            $scope.fichesRecherche.datasSearch.projet = $scope.DatasProjets.liste.filter(function (val) {
                return val.intitule === projet;
            })[0];
        }

        if (cpAgent !== "" && poste !== ""){
            return _getDataAgent(cpAgent)
                .then(function () {
                    return _getDataPoste(poste);
                });
        }

        if (cpAgent !== ""){
            return _getDataAgent(cpAgent);
        }

        if (poste !== ""){
            return _getDataPoste(poste);
        }

        return {
            then: function (fct) {
                fct && fct();
            }
        }
    };

    var _refreshOngletEncours = function () {
        /**
         * SUPPRESSION DES WATCHERS DE L'ONGLET EN COURS
         * SINON À CHAQUE REFRESH DE LA PAGE ILS S'ADDITIONNENT
         */
        $scope.watchers.forEach(function (val) {
            val();
        });

        $scope.watchers = [];

        if ($routeParams.onglet in _listeFctAppelOnglets){
            _listeFctAppelOnglets[$routeParams.onglet]($scope.posteMulti, $scope.Fiches.Agents);
        }
        else{
            _listeFctAppelOnglets.mesfiches($scope.posteMulti, $scope.Fiches.Agents)
        }
    };

    var _getDatasFicheForUpdate = agentsService.getDatasFicheForUpdate;

    /**
     * MET À JOUR LE PROJET D'UNE FICHE
     * @param {object} fiche - la fiche modifiée
     * @private
     */
    var _updFiche = function (fiche) {
        //SI LE PROJET N'EST PAS AU FORMAT angucomplete-alt (ÉVITE LE DOUBLE ENVOIE)
        if (fiche.projet.originalObject === undefined)
            return;

        var l_poidsProjet = DatasProjets.liste.filter(function (projet) {
            return fiche.projet.description.intitule === projet.intitule;
        })[0];

        fiche.poidsProjet = (l_poidsProjet !== undefined ? l_poidsProjet.poids || "non calculé" : "pas de projet");

        FicheFactoryCSharp.upd(_getDatasFicheForUpdate(fiche))
            .success(function (datas) {
                if (datas.exit_code !== 1){
                    AjaxErrorManager.Gerer("Erreur lors de la mise à jour du projet. " + datas.err_msg);
                    _refreshOngletEncours();
                }
            })
            .error(function () {
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de projet.");
                _refreshOngletEncours();
            });
    };

    /**
     * AFFICHE L'ÉCRAN DE CHARGEMENT SUR LES ONGLETS
     * @param bool
     */
    var chargement = function (bool) {
        $scope.mesfiches.isLoading = bool;
        $scope.fichesToutes.isLoading = bool;
        $scope.fichesDispatch.isLoading = bool;
        $scope.fichesBO.isLoading = bool;
        $scope.fichesAttente.isLoading = bool;
    };

    // RÉCUPÉRATION DES AGENTS
    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        $scope.Fiches.Agents = listeAgents.filter(function(val){
            //ON N'AFFICHE PAS LES "PARTIS"
            return  NOMSPARTIS.every(function (nom) {
                return val.nomPrenom.indexOf(nom) === -1
            });
        });

        $scope.Fiches.AgentsAgent = listeAgents.filter(function(val){
            return (val.cp === '0' || val.cp === $cookieStore.get('agent'))
                //ON N'AFFICHE PAS LES "PARTIS"
                && NOMSPARTIS.every(function (nom) {
                    return val.nomPrenom.indexOf(nom) === -1
                });
        });

        DAL_FICHE.LireFichesPosteMulti()
            .success(function(datas){
                if (datas.exit_code === 1) {
                    $scope.posteMulti = datas.postes;
                    var onglet = $routeParams.onglet;

                    $scope.tabPoste = datas.postes;

                    //SI ON EST SUR L'ONGLET DE RECHERCHE
                    if (onglet === "recherche") {
                        jQuery("#formRecherche").collapse('show');

                        var searchURL = $location.search();

                        if (JSON.stringify(searchURL) !== "{}") {
                            //AJOUT DANS LE COOKIE
                            $cookieStore.put("recherche", searchURL);
                        }
                        else{
                            //SI AUCUN PARAMÈTRE, SUPPRESSION DU COOKIE
                            $cookieStore.remove("recherche");
                            //ON REDIRIGE
                            $location.url("/gestionFiches");
                            return;
                        }
                    }

                    var searchCookie = $cookieStore.get("recherche");

                    //SI IL Y A UNE/DES RECHERCHE(S) DANS LE COOKIE
                    if (JSON.stringify(searchCookie) !== undefined){
                        $scope.fichesRecherche.show = true;
                        $scope.fichesRecherche.urlGet = URLBuilder.build("#/gestionFiches/recherche", searchCookie);

                        _listeFctAppelOnglets.recherche = function (tabPoste, agents, callback) {
                            _getDatasFromCookieOrUrl($cookieStore.get("recherche"))
                                .then(function () {
                                    var datasPost = _filterDataToSend($scope.fichesRecherche.datasSearch);

                                    if (IsDate(datasPost.dateDebut) === true){
                                        var l_dateDeb = Date.setDateFR(datasPost.dateDebut);
                                        l_dateDeb.setHours(0,0,0,0);
                                        datasPost.dateDebut = l_dateDeb;
                                    }

                                    if (IsDate(datasPost.dateFin) === true){
                                        var l_dateFin = Date.setDateFR(datasPost.dateFin);
                                        l_dateFin.setHours(23,59,59,999);
                                        datasPost.dateFin = l_dateFin;
                                    }

                                    WorkersFiches.Recherche.postMessage({
                                        url: DIURLAPI.URLapiNancy + "fiches/recherche",
                                        datas: datasPost,
                                        tabPoste: tabPoste,
                                        agents: agents,
                                        projets: DatasProjets.liste
                                    });

                                    WorkersFiches.Recherche.onmessage = function (e) {
                                        $timeout(function () {
                                            $scope.fichesRecherche.isLoading = false;

                                            if (e.data.exit_code === 1) {
                                                $scope.Fiches.fichesRecherche.Liste = e.data.datas.map(function (val, ind) {
                                                    val.listeProjet = ProjetFilterService.ForFiche(val.materiel, val.etablissementDemandeur, DatasProjets.liste);
                                                    if ($routeParams.onglet === "recherche"){
                                                        $scope.watchers.push($scope.$watchCollection("Fiches.fichesRecherche.Liste[" + ind + "].projet", function (newValCollection, oldValCollection) {
                                                            if (newValCollection === undefined || newValCollection === oldValCollection)
                                                                return;

                                                            _updFiche($scope.Fiches.fichesRecherche.Liste[ind]);
                                                        }));
                                                    }
                                                    return val;
                                                });

                                                FichesRecherche.Nb = e.data.NbFiches;

                                                //@HACK: LE SELECT NE RECONNAIT QUE LES CHAINES DE CARACTÈRES ÉTANT DONNÉ QU'IL EST CODÉ EN DUR
                                                $scope.fichesRecherche.datasSearch.isCloture !== undefined && ($scope.fichesRecherche.datasSearch.isCloture = $scope.fichesRecherche.datasSearch.isCloture.toString())
                                            }
                                            else {
                                                if (e.data.err_code === 200){
                                                    AjaxErrorManager.Gerer("Erreur lors de la récupération des fiches recherchées. "  + e.data.err_msg);
                                                }
                                                else {
                                                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération des fiches recherchées.");
                                                }
                                            }

                                            callback && callback();
                                        }, 0);
                                    };
                                });
                        };
                    }

                    if (onglet in _listeFctAppelOnglets)
                    {
                        _listeFctAppelOnglets[onglet]($scope.posteMulti, $scope.Fiches.Agents, function () {
                            for (var fct in _listeFctAppelOnglets) {
                                if (fct !== onglet)
                                    _listeFctAppelOnglets[fct]($scope.posteMulti, $scope.Fiches.Agents);
                            }
                        });
                    }
                    else
                    {
                        /**
                         * APPEL PAR DÉFAULT
                         * ON REQUÊTE D'ABORD L'ONGLET MES FICHES POUR QU'IL S'AFFICHE EN PREMIER
                         */
                        _getMesFiches($scope.posteMulti, $scope.Fiches.Agents ,function () {
                            /**
                             * PUIS ON REQUÊTE LES AUTRES ONGLETS
                             * UTILISATION D'UN WORKER POUR LES APPELS AJAX DES ONGLETS
                             * "OVERKILL" TU DIS? MOI JE TE RÉPONDS "TROP LA CLASSE!!!"
                             * EN PLUS ÇA PERMET DE NE MAPPER LES DATAS Q'UNE SEULE FOIS
                             */
                            _getToutes($scope.posteMulti, $scope.Fiches.Agents);
                            _getDispatch($scope.posteMulti, $scope.Fiches.Agents);
                            _getBO($scope.posteMulti, $scope.Fiches.Agents);
                            _getAttente($scope.posteMulti, $scope.Fiches.Agents);
                            _getPrioritaires();
                            _listeFctAppelOnglets.recherche && _listeFctAppelOnglets.recherche($scope.posteMulti, $scope.Fiches.Agents);
                        });
                    }
                }
                else {
                    AjaxErrorManager.Gerer("Erreur lors de la recherchez des postes concernés par plusieurs fiches. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.mesfiches.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la lecture des postes concernés par plusieurs fiches ouvertes.");
            });
    });

    $scope.Affectation = function (ligne) {
        chargement(true);
        var l_postDatas = _getDatasFicheForUpdate(ligne);
        //SI ON AFFECTE UNE FICHE DEPUIS LE DISPATCH, SON ÉTAT DEVIENT BACK OFFICE
        if ($routeParams.onglet === "dispatch" && ligne.etat !== "Back Office")
            l_postDatas.etat = "Back Office";

        FicheFactoryCSharp.upd(l_postDatas)
            .success(function (datas) {
                if (datas.exit_code === 1){
                    //ENVOYER UNE NOTIFICATION À L'UTILISATEUR CONCERNÉ

                    SignalrRequest.AffectationFiche(ligne.affectation, ligne.nFiche.toString(), ligne.date.getFullYear());

                    _getMesFiches($scope.tabPoste, $scope.Fiches.Agents);
                    _getToutes($scope.tabPoste, $scope.Fiches.Agents);
                    _getDispatch($scope.tabPoste, $scope.Fiches.Agents);
                    _getBO($scope.tabPoste, $scope.Fiches.Agents);
                    _getAttente($scope.tabPoste, $scope.Fiches.Agents);
                    _getPrioritaires();
                    _listeFctAppelOnglets.recherche && _listeFctAppelOnglets.recherche($scope.tabPoste, $scope.Fiches.Agents);
                }
                else{
                    _refreshOngletEncours();
                    AjaxErrorManager.Gerer("Erreur lors du changement d'affectation de la fiche. " + datas.err_msg);
                }
            })
            .error(function () {
                console.warn(arguments);
                _refreshOngletEncours();
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de changement d'affectation de la fiche.");
        }).then(function () {
            chargement(false);
        });
    };

    $scope.ChangementEtat = function (ligne) {
        chargement(true);
        var l_postDatas = _getDatasFicheForUpdate(ligne);

        FicheFactoryCSharp.upd(l_postDatas)
            .success(function (datas) {
                if (datas.exit_code === 1){

                    _getMesFiches($scope.tabPoste, $scope.Fiches.Agents);
                    _getToutes($scope.tabPoste, $scope.Fiches.Agents);
                    _getDispatch($scope.tabPoste, $scope.Fiches.Agents);
                    _getBO($scope.tabPoste, $scope.Fiches.Agents);
                    _getAttente($scope.tabPoste, $scope.Fiches.Agents);
                    _getPrioritaires();
                    _listeFctAppelOnglets.recherche && _listeFctAppelOnglets.recherche($scope.tabPoste, $scope.Fiches.Agents);
                }
                else{
                    _refreshOngletEncours();
                    AjaxErrorManager.Gerer("Erreur lors du changement d'état de la fiche. " + datas.err_msg);
                }
            })
            .error(function () {
                console.warn(arguments);
                _refreshOngletEncours();
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de changement d'état de la fiche.");
            }).then(function () {
            chargement(false);
        });
    };

    $scope.$watch("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        //MODIFICATION DE PROJET SUR FICHE VIA LA MODAL
        if ($scope.projetModif === true)
            $scope.lineToUpdate.projet = newVal;
        else{
            //RECHERCHE DE PROJET PAR LA MODAL
            if (newVal.guid !== undefined)
                $scope.fichesRecherche.datasSearch.projet = newVal;
        }
    });

    $scope.$watchCollection("DatasProjets.liste", function (newVal, oldVal) {
        ProjetModalService.list = newVal;
    });
}]);

ngAriane.controller("mesfiches", ["$scope", function ($scope) {
    $scope.liste = "fiches";
}]);

ngAriane.controller("mesfichesAttente", ["$scope", function ($scope) {
    $scope.liste = "mesfichesAttente";
}]);

ngAriane.controller("dispatch", ["$scope", function ($scope) {
    $scope.liste = "fichesDispatch";
}]);

ngAriane.controller("BO", ["$scope", function ($scope) {
    $scope.liste = "fichesBO";
}]);

ngAriane.controller("attente", ["$scope", function ($scope) {
    $scope.liste = "fichesAttente";
}]);

ngAriane.controller("prioritaires", ["$scope", function ($scope) {
    $scope.liste = "fichesPrioritaires";
}]);

ngAriane.controller("toutes", ["$scope", function ($scope) {
    $scope.liste = "fichesToutes";
}]);

ngAriane.controller("recherche", ["$scope", function ($scope) {
    $scope.liste = "fichesRecherche";
}]);