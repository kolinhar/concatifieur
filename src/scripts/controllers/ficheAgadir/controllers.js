/**
 * Created by PRJS12821 on 12/02/2015.
 */
"use strict";

ngAriane.controller("ficheAgadir", ["$scope", "$route", "$timeout", "$routeParams", "$location", "$window", "$cookieStore", "DatasFicheAgadir", "DatasProjets", "DatasAgents", "DAL_FICHE", "DAL_POINTAGE", "CPtoNAME", "CreateThisFiche", "AgentsADFactory", "PosteGeminiFactory", "AjaxErrorManager", "DatasHistoPoste", "DatasSanteParc", "Region", "DatasDJS", "DIURLAPI", "Etats", "DAL_POSTE","SanteParcFactory", "DatasUrgence", "FileListFiche", "DatasEtats", "ProjetModalService", "RegionService", "Login", "ForceFactory", "FicheFactoryCSharp", "PointageFactoryCSharp", "SignalrRequest", "ModalAffaire", "ficheToClone", "DAL_AGENT", "CheckModalDjs", "EnqueteSatisfactionFactory", "enqueteService", "EnqueteFactory", "agentsService", "RetNumService", function ($scope, $route, $timeout, $routeParams, $location, $window, $cookieStore, DatasFicheAgadir, DatasProjets, DatasAgents, DAL_FICHE, DAL_POINTAGE, CPtoNAME, CreateThisFiche, AgentsADFactory, PosteGeminiFactory, AjaxErrorManager, DatasHistoPoste, DatasSanteParc, Region, DatasDJS, DIURLAPI, Etats, DAL_POSTE, SanteParcFactory, DatasUrgence, FileListFiche, DatasEtats, ProjetModalService, RegionService, Login, ForceFactory, FicheFactoryCSharp, PointageFactoryCSharp, SignalrRequest, ModalAffaire, ficheToClone, DAL_AGENT, CheckModalDjs, EnqueteSatisfactionFactory, enqueteService, EnqueteFactory, agentsService, RetNumService) {
    /**
     * AJOUTE LE MARQUEUR PRIORITAIRE SI L'AGENT EST DANS LA LISTE DES VIP
     * @param obj
     * @returns {obj}
     */
    $scope.FCTFORMATRESP = function (obj) {
        if (obj.exit_code !== 1)
            return obj;

        obj.L_Resultats.forEach(function (val, ind, arr) {
            agentsService.dpxPrioritaires.forEach(function (v, i, a) {
                if(val.cp === v.cp) {
                    arr[ind].isPrioritaire = true;
                    arr[ind].poste = v.poste;
                }
            });
        });

        return obj
    };

    $scope.RetNumService = RetNumService;

    $scope.ficheagadir = {
        isLoading: false,
        Projects: [],
        DatasProjets: DatasProjets,
        routeParams: $routeParams,
        TypesUrgence: DatasUrgence,
        FichiersJoints: FileListFiche,
        EtatsList: DatasEtats,
        AgentsList: DatasAgents,
        previousEtat: "",
        previousPoste: "",
        previousEtab: "",
        marqueurProjet: ""
    };

    $scope.modal = {
        isModal: false
    };

    $scope.ModalAffaire = ModalAffaire;

    $scope.routeParams = $routeParams;

    $scope.cookieStore = $cookieStore;

    $scope.ProjetModalService = ProjetModalService;

    $scope.datas = DatasFicheAgadir;

    DatasHistoPoste.liste = [];

    $scope.histoPoste = {
        datas: DatasHistoPoste,
        isLoading: false
    };

    $scope.santeParc = {
        datas: DatasSanteParc,
        isLoading:false,
        model : 0
    };

    $scope.oldFiche = {};

    $scope.modalTransfert = {
        isTransfert: false,
        isReady: false
    };

    $scope.RegionServiceTemp = RegionService;
    $scope.RegionService = {
        List: []
    };

    $scope.Region = Region;
    $scope.todayYear = new Date().getFullYear();

    $scope.agentsDpx = [];
    $scope.lesAgents = [];
    $scope.habilitation = $cookieStore.get("status");

    // Obligatoire pour faire fonctionner la recherche MS_AD
    $scope.DIURLAPI = DIURLAPI;

    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        $scope.ficheagadir.AgentsListAgent = {
            liste: listeAgents.filter(function(val){
                return val.cp === '0' || val.cp === $cookieStore.get('agent')
            })
        };

        $scope.lesAgents = listeAgents;
        $scope.datas.Pointage.cp = $cookieStore.get("agent");

        if($cookieStore.get("status") === "Encadrement")
        {
            $scope.lesAgents.forEach(function (val) {
                if((val.habilitation === "Agent" && val.secteur === $cookieStore.get("secteur")) || val.cp === $cookieStore.get("agent"))
                {
                    $scope.agentsDpx.push(val);
                }
            });
        }

    });

    /**
     * RÉCUPÈRE LA FICHE AGADIR CORRESPONDANTE
     * @param {string} annee - année de recherche
     * @param {string} numFiche - numéro de fiche agadir ou mongo
     * @param {string} [region] - région de la fiche
     * @constructor
     */
    $scope.ficheagadir.RecupFicheByNumber = function (annee, numFiche, region) {
        if (numFiche === undefined || annee === undefined)
            return;

        //SI LA RÉGION N'EST PAS PRÉCISÉE ON RECHERCHE SUR LA RÉGION PAR DÉFAUT
        region = region || $scope.Region;

        $scope.ficheagadir.razFiche();
        $scope.ficheagadir.isLoading = true;

        FicheFactoryCSharp.get(annee, numFiche, region)
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    if (numFiche != (datas.fiche.numero || datas.fiche.numeroMongo)){
                        //SI ON A UN NUMÉRO AGADIR, ON REDIRIGE SUR LA FICHE AVEC LE NUMÉRO AGADIR
                        $location.path("/fiche/" + annee + "/" + datas.fiche.numero);
                    }
                    else{
                        $scope.oldFiche = datas.fiche;

                        var canal_check = "./images/channel_" + (datas.fiche.canal === undefined || datas.fiche.canal === null ? "ariane" : datas.fiche.canal) + ".svg";
                        if (datas.fiche.isTransfert === true)
                            canal_check = "./images/channel_transfert.svg";

                        $scope.datas.fiche = {
                            materiel: datas.fiche.materiel,
                            demandeur: datas.fiche.cpDemandeur,
                            description: datas.fiche.description,
                            agent: datas.fiche.cpAgent,
                            etat: datas.fiche.etat,
                            isCloture: datas.fiche.isCloture,
                            isUrgent: datas.fiche.isUrgent,
                            isPrioritaire: datas.fiche.isPrioritaire,
                            numAffaire: datas.fiche.affaire,
                            canal: canal_check,
                            nomCanal: datas.fiche.canal || "Ariane",
                            dateDebut: datas.fiche.dateDebut,
                            numFiche: datas.fiche.numero || datas.fiche.numeroMongo,
                            numero: datas.fiche.numero || undefined,
                            numeroMongo: datas.fiche.numeroMongo,
                            region: datas.fiche.region.toString(),
                            nomRegion: RegionService.List.filter(function(val){
                                    return val.value === datas.fiche.region.toString()
                                })[0].label,
                            isTransferee: Region !== datas.fiche.region,
                            numeroAutreRegion: datas.fiche.numeroAutreRegion,
                            _id: datas.fiche._id,
                            nomPrenomDemandeur: datas.fiche.nomPrenomDemandeur,
                            pointagesSysteme: datas.fiche.pointagesSysteme,
                            pointagesTransfert: datas.fiche.pointagesTransfert,
                            cpActeur: datas.fiche.cpActeur,
                            nomPrenomActeur: datas.fiche.nomPrenomActeur,
                            errAgadir : datas.fiche.errAgadir
                        };

                        if (datas.fiche.projet === undefined || datas.fiche.projet.toString().trim() === ""){
                            $timeout(function(){
                                document.querySelector("#projectAutocompleteInputFiche>div>input").value = "Aucun projet";
                            }, 2000);
                        }
                        else {
                            var l_projetFiche = DatasProjets.liste.filter(function (val) {
                                return val.intitule === datas.fiche.projet
                            });

                            if (l_projetFiche.length > 0){
                                $scope.datas.fiche.projet = l_projetFiche[0];
                            }
                            else{
                                $timeout(function(){
                                    document.querySelector("#projectAutocompleteInputFiche>div>input").value = "Aucun projet correspondant"
                                }, 2000);
                            }
                        }

                        AgentsADFactory.getAgentAll(datas.fiche.cpDemandeur.trim())
                            .success(function (datasDemandeur) {
                                if (datasDemandeur.exit_code === 1)
                                    if (datasDemandeur.L_Resultats.length > 0){
                                        var l_result = datasDemandeur.L_Resultats.filter(function (val) {
                                            return val.cp.indexOf("_adm") === -1;
                                        });

                                        if (l_result.length > 0){
                                            $scope.datas.fiche.demandeur = l_result[0];

                                            agentsService.dpxPrioritaires.forEach(function (val) {
                                                if ($scope.datas.fiche.demandeur.cp === val.cp)
                                                    $scope.datas.fiche.demandeur.isPrioritaire = true;
                                            });
                                        }
                                        else{
                                            document.querySelector("#agentAutocompleteInput>div>input").value = "Aucune correspondance pour le CP " + datas.fiche.cpDemandeur.trim();
                                        }
                                    }
                                    else{
                                        document.querySelector("#agentAutocompleteInput>div>input").value = "Aucune correspondance pour le CP " + datas.fiche.cpDemandeur.trim();
                                    }
                            });

                        PosteGeminiFactory.getPoste(datas.fiche.materiel.trim())
                            .success(function (datasMateriel) {
                                if (datasMateriel.exit_code===1)
                                    if (datasMateriel.L_Resultats.length > 0)
                                        $scope.datas.fiche.materiel = datasMateriel.L_Resultats[0];
                                    else
                                        document.querySelector("#posteAutocompleteInput>div>input").value = "Aucune correspondance pour le poste " + datas.fiche.materiel.trim();
                            });

                        $scope.ficheagadir.previousEtat = datas.fiche.etat;
                        $scope.ficheagadir.previousPoste = datas.fiche.materiel;
                        $scope.ficheagadir.previousEtab = datas.fiche.etablissementDemandeur;

                        $scope.datas.fiche[datas.fiche._id] = {};
                        $scope.datas.fiche[datas.fiche._id].isCloture = datas.fiche.isCloture;

                        if (datas.pointages === null)
                            datas.pointages = [];

                        $scope.datas.pointages = datas.pointages.map(function (val) {
                            var l_today = new Date();
                            l_today.setHours(0);
                            l_today.setMinutes(val.duree);
                            l_today.setSeconds(0);
                            l_today.setMilliseconds(0);

                            return {
                                agent: val.nomPrenom,
                                cp: val.cp,
                                nature: val.commentaire,
                                date: new Date(val.date),
                                dateDebut : new Date(val.dateDebut),
                                duree: l_today,
                                dureeMinute: val.duree,
                                projet: val.projet,
                                val_projet : val.projet,
                                nFiche: val.numero,
                                nMongo : val.numeroMongo,
                                _id : val._id,
                                idFiche : val.idFiche
                            };
                        });

						enqueteService.fiche = {
                            Note: null
                        };

                        EnqueteFactory.getNoteByFiche($routeParams.annee, $scope.datas.fiche._id);

                        $scope.ficheagadir.isLoading = false;
                    }
                }
                else {
                    $scope.ficheagadir.isLoading = false;

                    AjaxErrorManager.Gerer("Erreur lors de la lecture de la fiche." + datas.err_msg);
                }
            })
            .error(function () {
                $scope.ficheagadir.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de fiche");
            });
    };

    $scope.ficheagadir.razFiche = function () {
        $scope.datas.fiche = {
            etat: "Centre d'Appel" //VALEUR PAR DÉFAUT
        };
        $scope.ficheagadir.razPointage();

        if ($routeParams.numFiche === undefined) {
            $timeout(function () {
                //@HACK POURRI PARCE QUE ANGULAR NE FAIT PAS TOUJOURS LA MISE À JOUR DE LA VUE
                $scope.datas.fiche.isUrgent = false;
                $scope.datas.fiche.agent = $cookieStore.get("agent");
            }, 1000);
        }
        else {
            $scope.datas.Pointage.DatePointage = new Date().getDateFR();
        }
    };

    $scope.ficheagadir.razPointage = function () {
        $scope.datas.Pointage = {};
    };

    $scope.ficheagadir.sendMail = function() {
        var description = $scope.datas.fiche.description.replace(/(?:\r\n|\r|\n)/g, '%0A');
        var href = "mailto:" + $scope.datas.fiche.demandeur.originalObject.mail + "?subject=Concernant la fiche informatique n° " + $scope.ficheagadir.routeParams.numFiche + "&body=" + description;
        $window.location = href;
    };

    $scope.ficheagadir.Create = function () {
        var postDatasBot = angular.copy($scope.datas.fiche),
            l_err = _verifDatasFiche();

        postDatasBot.projet = $scope.datas.fiche.projet.title;

        if(postDatasBot.etat === undefined){
            AjaxErrorManager.Gerer("Veuillez saisir un état.");
            l_err++;
        }

        if(l_err !== 0) {
            $scope.ficheagadir.isLoading = false;
            return;
        }

        $scope.ficheagadir.isLoading = true;

        var postDatasMongo = angular.copy($scope.datas.fiche),
            anneeFiche = new Date().getFullYear();

        var ficheMongo = {};

        var l_dateDebut = new Date();
        l_dateDebut.setHours(12,0,0,0);

        ficheMongo.cpDemandeur = postDatasMongo.demandeur.description;
        ficheMongo.nomPrenomDemandeur = postDatasMongo.demandeur.title.split(" (")[0];
        ficheMongo.cpAgent = postDatasMongo.agent;
        ficheMongo.dateDebut = l_dateDebut;
        ficheMongo.isCloture = false;
        ficheMongo.isUrgent = postDatasMongo.isUrgent;
        ficheMongo.isPrioritaire = postDatasMongo.isPrioritaire;
        ficheMongo.description = postDatasMongo.description;
        ficheMongo.materiel = _getPoste(postDatasMongo.materiel);
        ficheMongo.etat = postDatasMongo.etat;
        ficheMongo.region = Region;
        ficheMongo.projet = postDatasMongo.projet.title;
        ficheMongo.val_projet = postDatasMongo.projet.description.guid;
        ficheMongo.cpActeur = $cookieStore.get("agent");
        ficheMongo.nomPrenomActeur = $cookieStore.get("nomAgent");
        ficheMongo.telDemandeur = $scope.datas.fiche.demandeur.originalObject.tel;
        ficheMongo.mobileDemandeur = $scope.datas.fiche.demandeur.originalObject.mobile;

        FicheFactoryCSharp.add(ficheMongo)
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    RetNumService.isWorking.push(datas.nmongo);
                    SignalrRequest.AffectationFiche(ficheMongo.cpAgent, datas.nmongo, anneeFiche);

                    //RAZ DU SERVICE
                    ficheToClone.fiche = {};

                    var numLink = datas.nagadir === 0 ? datas.nmongo : datas.nagadir;

                    $location.path("/fiche/" + anneeFiche + "/" + numLink);
                }
                else {
                    $scope.ficheagadir.isLoading = false;

                    AjaxErrorManager.Gerer("Erreur lors de la création de la fiche. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.ficheagadir.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création de fiche.");
            });
    };

    $scope.ficheagadir.Update = function () {
           if (_verifDatasFiche() === 0) {
            $scope.ficheagadir.isLoading = true;
            _updFiche();
        }
    };

    $scope.ficheagadir.Cloturer = function () {
        if (_verifDatasFiche() !== 0)
            return;
        else
            AjaxErrorManager.Infos = {
                title: "Confirmation",
                msg: ["Êtes-vous sûr de vouloir " + ($scope.datas.fiche.isCloture === true ? "dé" : "") + "clôturer cette fiche ?"],
                Confirm: function () {
                    $scope.ficheagadir.isLoading = true;

                    _getDatasForUpdate(_getCPDemandeur($scope.datas.fiche.demandeur), $scope.datas.fiche.agent, function (datasUpdate) {
                        datasUpdate.isCloture = !$scope.datas.fiche.isCloture;

                        FicheFactoryCSharp.upd(datasUpdate)
                            .success(function (datas) {
                                $scope.ficheagadir.isLoading = false;
                                if (datas.exit_code === 1) {
									if (!$scope.datas.fiche.isCloture === true) {
                                        var numeroFicheEnquete = datasUpdate.numero === 0 ? datasUpdate.numeroMongo : datasUpdate.numero;
                                        var dateClotureFiche = new Date();
                                        EnqueteFactory.add({CpAgent : datasUpdate.cpAgent, CpDemandeur : datasUpdate.cpDemandeur, NumeroFiche : numeroFicheEnquete, AnneeFiche : datasUpdate.annee, Projet : datasUpdate.projet, DateReponse : datasUpdate.dateDebut, DateCloture : dateClotureFiche,  _id : datasUpdate._id, IsPrioritaire : datasUpdate.isPrioritaire});
                                        }
                                    $route.reload();
                                }
                                else {
                                    AjaxErrorManager.Gerer("Erreur lors de la clôture de la fiche." + datas.err_msg);
                                }
                            })
                            .error(function () {
                                $scope.ficheagadir.isLoading = false;
                                console.warn(arguments);
                                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de clôture de fiche.");
                            });
                    });
                }
            };
    };

    $scope.ficheagadir.AddPointage = function () {
        if (_verifDatasPointageFiche() !== 0)
            return;

        var postDatas = _getDatasForPointageFiche();

        $scope.ficheagadir.isLoading = true;

        $timeout(function () {
            PointageFactoryCSharp.add(postDatas)
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        DatasDJS.reload++;
                        CheckModalDjs.CheckGetModal(postDatas);
                        $route.reload();
                    }
                    else {
                        $scope.ficheagadir.isLoading = false;
                        AjaxErrorManager.Gerer("Erreur lors de la création du pointage. " + datas.err_msg);
                    }
                })
                .error(function () {
                    $scope.ficheagadir.isLoading = false;
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création de pointage.");
                });
        }, 500);
    };

    $scope.ficheagadir.AddPointageAndCloture = function () {
        if (_verifDatasPointageFiche() !== 0 || _verifDatasFiche() !== 0)
            return;

        AjaxErrorManager.Infos = {
            title: "Confirmation",
            msg: ["Êtes-vous sûr de vouloir pointer puis clôturer cette fiche ?"],
            Confirm: function () {
                var postDatas = _getDatasForPointageFiche();

                $scope.ficheagadir.isLoading = true;

                PointageFactoryCSharp.add(postDatas)
                    .success(function (datas) {
                        if (datas.exit_code === 1) {
                            //console.log("CreationPointage", datas);
                            DatasDJS.reload++;
                            CheckModalDjs.CheckGetModal(postDatas);

                            _getDatasForUpdate(_getCPDemandeur($scope.datas.fiche.demandeur), $scope.datas.fiche.agent, function (datasUpdate) {
                                datasUpdate.isCloture = !$scope.datas.fiche.isCloture;

                                FicheFactoryCSharp.upd(datasUpdate)
                                    .success(function (datas) {
                                        $scope.ficheagadir.isLoading = false;
                                        if (datas.exit_code === 1) {
                                            $route.reload();
                                        }
                                        else
                                        {
                                            $scope.ficheagadir.isLoading = false;
                                            AjaxErrorManager.Gerer("Erreur lors de la clôture de la fiche. " + datas.err_msg);
                                        }
                                    })
                                    .error(function () {
                                        $scope.ficheagadir.isLoading = false;
                                        console.warn(arguments);
                                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre de demande de clôture de fiche.");
                                    });
                            });
                        }
                        else {
                            $scope.ficheagadir.isLoading = false;
                            AjaxErrorManager.Gerer("Erreur lors de la création du pointage. " + datas.err_msg);
                        }
                    })
                    .error(function () {
                        $scope.ficheagadir.isLoading = false;
                        console.warn(arguments);
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création de pointage.");
                    });
            }
        };


    };

    $scope.ficheagadir.UpdPointage = function () {
        if (_verifDatasUpdPointageFiche() !== 0)
            return;

        $scope.ficheagadir.isLoading = true;

        _sendUpd(_getDataForUpdPointageFiche());
    };

    $scope.ficheagadir.showModPtg = function (ptg) {
        $scope.ficheagadir.marqueurProjet = "modif";

        $scope.modal = {
            isModal: true,
            nature: ptg.nature,
            date: ptg.date.getDateFR(),
            dureeMinute: ptg.dureeMinute,
            projet: ptg.projet,
            fiche: true,
            _id: ptg._id
        };
    };

    $scope.ficheagadir.DelPointage = function (ptg) {
        AjaxErrorManager.Infos = {
            title: "Confirmation",
            msg: ["Êtes-vous sûr de vouloir supprimer ce pointage ?"],
            Confirm: function () {
                $scope.ficheagadir.isLoading = true;

                $timeout(function () {
                    PointageFactoryCSharp.del({_id: ptg._id, cp: $cookieStore.get("agent")})
                        .success(function (datas) {
                            $scope.ficheagadir.isLoading = false;

                            if (datas.exit_code === 1) {
                                DatasDJS.reload++;
                                $route.reload();
                            }
                            else {
                                AjaxErrorManager.Gerer("Erreur lors de la suppression du pointage. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.ficheagadir.isLoading = false;

                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la suppression du pointage.");
                        })
                }, 500);
            }
        };
    };

    $scope.ficheagadir.Transferer = function () {
        if ($scope.datas.fiche.region === undefined || $scope.datas.fiche.region === Region.toString()) {
            AjaxErrorManager.Gerer("Veuillez choisir une région de destination");
            return
        }

        //CONFIRMATION DU TRANSFERT
        $scope.modalTransfert.isTransfert = true;

        $("#modalTransfert").modal("hide");
        $scope.ficheagadir.isLoading = true;

        $timeout(function () {
            _getDatasForUpdate($scope.datas.fiche.demandeur.description, $cookieStore.get("agent"), function (datasUpdate) {
                if (_verifDatasFiche() !== 0){
                    $scope.ficheagadir.isLoading = false;
                    return;
                }

                FicheFactoryCSharp.upd(datasUpdate)
                    .success(function (datas) {
                        if (datas.exit_code === 1) {
                            RetNumService.isWorking.push("R" + $scope.datas.fiche.numeroMongo.toString() + $scope.datas.fiche.numeroAutreRegion.toString());
                            $route.reload();
                        }
                        else {
                            $scope.ficheagadir.isLoading = false;
                            AjaxErrorManager.Gerer("Erreur lors du transfert de la fiche. " + datas.err_msg);
                        }
                    })
                    .error(function () {
                        $scope.ficheagadir.isLoading = false;
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre de transfert de fiche");
                    });
            });
        }, 200);
    };

    $scope.ficheagadir.Cloner = function () {
        if(_verifDatasFiche() > 0)
            return;

        ficheToClone.fiche = angular.copy(DatasFicheAgadir.fiche);

        $location.path("/fiche");
    };

    /**
     * CRÉÉ MANUELLEMENT LA FICHE DANS AGADIR
     */
    $scope.ficheagadir.ForcerCreation = function () {
        if (_verifDatasFiche() !== 0)
            return;

        $scope.ficheagadir.isLoading = true;

        $timeout(function () {
            _getDatasForUpdate($scope.datas.fiche.demandeur.description, $scope.datas.fiche.agent, function (objUpd) {
                ForceFactory.CreateFiche(objUpd)
                    .success(function (datas) {
                        $scope.ficheagadir.isLoading = false;
                        if (datas.exit_code === 1) {
                            //REDIRECTION VERS LA 'NOUVELLE' FICHE
                            $location.path("/fiche/" + $routeParams.annee + "/" + datas.nagadir);
                        }
                        else {
                            AjaxErrorManager.Gerer("Erreur lors de la création de la fiche dans AGADIR. " + datas.err_msg)
                        }
                    })
                    .error(function () {
                        $scope.ficheagadir.isLoading = false;
                        console.warn(arguments);
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création de la fiche dans AGADIR.");
                    });
            });
        }, 200);
    };

    /**
     * ON RÉCUPÈRE L'HISTORIQUE DU POSTE EN ARRIÈRE PLAN DÈS QU'ON A UNE VALEUR POUR UN POSTE
     */
    $scope.$watch("datas.fiche.materiel", function (newVal, oldVal) {
        var l_poste = _getPoste(newVal);

        $scope.santeParc.datas = {
            liste: [],
            listeAgent: []
        };

        if (l_poste === undefined || angular.equals(newVal, oldVal))
            return;

        //FILTRAGE DES PROJETS
        _filterProjects();
        _verifSelectedProjet("fiche");

        if ($routeParams.annee !== undefined){
            _verifSelectedProjet("pointage");
        }

/*        //ON NE LE LANCE QUE LORSQUE L'OBJET EST 'STABILISÉ'
        if (newVal.originalObject !== undefined) {*/
            _getHistoPoste(l_poste);
            _getSanteParcPoste(_getSanteParcDemandeur);
/*
        }
*/

        //SUGGESTION DU DERNIER UTILISATEUR
        if ($scope.datas.fiche.demandeur === undefined) {
            Login.getUserByPoste(l_poste)
                .success(function (cpUser) {
                    if (cpUser !== "null") {
                        AgentsADFactory.getAgent(cpUser)
                            .success(function (datas) {
                                if (datas.exit_code === 1)
                                    if (datas.L_Resultats.length > 0)
                                        $scope.datas.fiche.demandeur = datas.L_Resultats[0];
                            });
                    }
                });
        }
    });

    /**
     * ON RÉCUPÈRE TOUTES LES INFOS DE L'AD SUR L'AGENT
     */
    $scope.$watch("datas.fiche.demandeur", function (newVal, oldVal) {
        var l_demandeur = _getCPDemandeur(newVal);

        if (l_demandeur === undefined || angular.equals(newVal, oldVal)) {
            if (l_demandeur === undefined)
                $scope.datas.fiche.isPrioritaire = null;
            return;
        }

        /**
         * NUMÉROS DE TEL
         * les numéros de téléphone sont modifiables par l'utilisateur,
         * ce sont ceux de la BDD qui priment sur l'AD quand il y en a un en BDD
         */
        if (l_demandeur === $scope.oldFiche.cpDemandeur && $scope.datas.fiche.demandeur.originalObject !== undefined){
            if ($scope.oldFiche.telDemandeur !== null && $scope.oldFiche.telDemandeur !== undefined)
                $scope.datas.fiche.demandeur.originalObject.tel = $scope.oldFiche.telDemandeur;

            if ($scope.oldFiche.mobileDemandeur !== null && $scope.oldFiche.mobileDemandeur !== undefined)
                $scope.datas.fiche.demandeur.originalObject.mobile = $scope.oldFiche.mobileDemandeur;
        }

        //SUGGESTION DU POSTE
        if ($scope.datas.fiche.materiel === undefined || $scope.datas.fiche.materiel === null){
            Login.getPosteByUser(l_demandeur)
                .success(function (poste) {
                    if (poste !== "null") {
                        PosteGeminiFactory.getPoste(poste).success(function (datas) {
                            if (datas.exit_code === 1 && datas.L_Resultats.length > 0){
                                $scope.datas.fiche.materiel = datas.L_Resultats[0];
                            }
                        });
                    }
                });
        }

        //FICHE PRIORITAIRE
        if (newVal.originalObject && newVal.originalObject.isPrioritaire === true) {
            $scope.datas.fiche.isUrgent = false;
            $scope.datas.fiche.isPrioritaire = true;
        }
        else
            $scope.datas.fiche.isPrioritaire = null;

        //FILTRAGE DES PROJETS
        _filterProjects();
        _verifSelectedProjet("fiche");

        if ($routeParams.annee !== undefined){
            _verifSelectedProjet("pointage");
        }
    });

    $scope.$watch("santeParc.model", function (newVal, oldVal) {
        if (angular.equals(newVal, oldVal))
            return;

        $timeout(function () {
            _getSanteParcDemandeur();
        }, 100);
    });

    $scope.$watch("datas.fiche.etat", function (newVal, oldVal) {

        if (newVal === undefined || angular.equals(newVal, oldVal))
            return;

        //FILTRAGE DES PROJETS
        _filterProjects();

    });

    /**
     * FILTRE POUR N'AFFICHER QUE LES PROJETS DE FICHE UNIQUEMENT
     */
    $scope.$watch("ficheagadir.DatasProjets.liste", function (newVal, oldVal) {
        $scope.ficheagadir.Projects.liste = newVal.filter(function (val) {
            return val.type === "fiche" || val.type === "";
        });

        ProjetModalService.list = $scope.ficheagadir.Projects.liste;
    });

    /**
     * SI ON CLIQUE SUR LA MODALE POUR CHOISIR LE PROJET
     */
    $scope.$watchCollection("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        switch ($scope.ficheagadir.marqueurProjet){
            case "fiche":
                $scope.datas.fiche.projet = newVal;
            break;

            case "modif":
                $scope.modal.projet = newVal;
            break;
        }
    });

    $scope.$watchCollection("RetNumService.list", function (newVal, oldVal) {
        if (newVal === undefined)
            return;


        newVal.forEach(function (val) {
            if(val.num_ariane == $scope.datas.fiche.numeroMongo && val.annee.toString() == $routeParams.annee && val.num_autre_region === null)
            {
                if(val.num_agadir !== null)
                {
                    $scope.datas.fiche.numero = val.num_agadir;
                    $scope.datas.fiche.numFiche = val.num_agadir;
                }
                else
                    $scope.datas.fiche.errAgadir = val.err_msg;

            }
            else {
                if ((val.num_agadir == $routeParams.numFiche || val.num_ariane == $routeParams.numFiche) && val.annee.toString() == $routeParams.annee && val.num_autre_region !== null) {
                    if (val.num_autre_region !== null) {
                        $scope.datas.fiche.numeroAutreRegion = val.num_autre_region;
                    }
                    else
                        $scope.datas.fiche.errAgadir = val.err_msg;

                }
            }

        });
    });

    $scope.$watchCollection("RegionServiceTemp.List", function (newVal) {
        if (newVal === undefined)
            return;

        $scope.RegionService.List = RegionService.List.filter(function (val) {
            return val.value !== Region.toString();
        });
    });

    /**
     * LORSQUE LA MODAL EST PRISE EN COMPTE DANS ANGULAR (ET DONC DANS LE DOM),
     * ON LUI AFFECTE L'ÉVENEMENT DE FERMETURE
     */
    $scope.$watch("modalTransfert.isReady", function (newVal) {
        if (newVal === true){
            $("#modalTransfert").on("hide.bs.modal", function (e) {
                //SI ON A JUSTE FERMÉ LA MODAL, ON REMET LA VALEUR PAR DÉFAUT DE LA RÉGION
                if ($scope.modalTransfert.isTransfert === false)
                    $scope.datas.fiche.region = Region.toString();

                $scope.modalTransfert.isTransfert = false;
            });
        }
    });
    
    $scope.$watchCollection("ModalAffaire.selectedAffaire", function (newCol, oldCol) {
        if (newCol === undefined || JSON.stringify(newCol) === "{}")
            return;

        //AFFECTATION DU NUMÉRO D'AFFAIRE
        $scope.datas.fiche.numAffaire = newCol.numero;
        //SUPPRESSION DE L'AFFAIRE DANS LE SERVICE
        ModalAffaire.selectedAffaire = {};
        //ENREGISTREMENT DE LA FICHE
        $scope.ficheagadir.Update();
    });

    /**
     * ORDRE DE METTRE À JOUR LA FICHE
     * @private
     */
    var _updFiche = function () {
        _getDatasForUpdate($scope.datas.fiche.demandeur.description, $scope.datas.fiche.agent, function (objFicheUpd) {
                FicheFactoryCSharp.upd(objFicheUpd)
                    .success(function (datas) {
                        $scope.ficheagadir.isLoading = false;

                        if (datas.exit_code === 1) {
                            if (objFicheUpd.cpAgent !== $scope.oldFiche.cpAgent)
                                SignalrRequest.AffectationFiche(objFicheUpd.cpAgent, $routeParams.numFiche, $routeParams.annee);

                            $scope.ficheagadir.isLoading = false;
                            //$route.reload();
                        }
                        else{
                            AjaxErrorManager.Gerer("Erreur lors de la mise à jour de la fiche." + datas.err_msg);
                        }
                    })
                    .error(function () {
                        $scope.ficheagadir.isLoading = false;

                        console.warn(arguments);

                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de fiche.");
                    });
        });
    };

    /**
     * ORDRE DE METTRE À JOUR UN POINTAGE
     * @param postDatas
     * @private
     */
    var _sendUpd = function (postDatas) {
        $scope.modal.isModal = false;

        $("#modal-pointage").modal("hide");
        $scope.ficheagadir.isLoading = true;
        //console.log("postDatas", postDatas);

        //@HACK: CONFLIT AVEC BOOTSTRAP AU NIVEAU DE L'UI POUR LA DISPARITION DE LA MODAL DE POINTAGE
        $timeout(function () {
            PointageFactoryCSharp.upd(postDatas)
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        $scope.ficheagadir.isLoading = false;

                        DatasDJS.reload++;
                        $route.reload();
                    }
                    else {
                        $scope.ficheagadir.isLoading = false;
                        AjaxErrorManager.Gerer("Erreur lors de la mise à jour du pointage. " + datas.err_msg);
                    }
                })
                .error(function () {
                    console.warn(arguments);
                    $scope.ficheagadir.isLoading = false;
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de pointage.");
                });
        }, 500);
    };

    /**
     * ORDRE DE RECHERCHER L'HISTORIQUE
     * @param {string} materiel - le nom du poste
     * @private
     */
    var _getHistoPoste = function (materiel) {
        if (materiel === undefined || materiel === "")
            return;

        $scope.histoPoste.datas.liste = [];
        $scope.histoPoste.isLoading = true;

        DAL_POSTE.Liste(materiel)
            .success(function (datas) {
                $scope.histoPoste.isLoading = false;

                if (datas.exit_code === 1){
                    $scope.histoPoste.datas.liste = datas.lesFiches.map(function (val) {
                        val.dateAppel = new Date(val.dateDebut);
                        val.link = "#/fiche/" + val.dateAppel.getFullYear() + "/" + val.numero || val.numeroMongo;

                        return val;
                    });
                }
                else{
                    AjaxErrorManager.Gerer("Erreur lors de la lecture de l'historique du poste. " + datas.err_msg);
                }

            })
            .error(function () {
                $scope.histoPoste.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture d'historique du poste.");
            });
    };

    var _getSanteParcPoste = function (callback) {
        var l_materiel = _getPoste($scope.datas.fiche.materiel);

        if (l_materiel === "")
            return;

        $scope.santeParc.isLoading = true;

        SanteParcFactory.getSanteParcHisto(l_materiel)
            .success(function (datas) {
                $scope.santeParc.isLoading = false;
                if(datas !== null) {
                    datas.forEach(function (val, index) {
                        val = JSON.parse(val);
                        $scope.santeParc.datas.listeAgent.push({
                            index: index,
                            display: (val.ConfigOrdinateur.UserNP || val.ConfigOrdinateur.UserCp) + " " + val.ConfigOrdinateur.DateConfig
                        });
                        $scope.santeParc.datas.liste.push(val);

                    });
                    callback && callback();
                }

            })
            .error(function () {
                $scope.histoPoste.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture de santé du parc.");
            });

        SanteParcFactory.getSanteParcLivePoste(l_materiel)
            .success(function (datas) {

                $scope.santeParc.isLoading = false;

                $scope.santeParc.datas.livePoste = datas
            })
            .error(function () {
                $scope.histoPoste.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture de santé du parc.");
            });
    };

    var _getSanteParcDemandeur = function () {

        $scope.santeParc.isLoading = true;

        if($scope.santeParc.datas.liste.length >0) {

            SanteParcFactory.getSanteParcLiveCompte($scope.santeParc.datas.liste[$scope.santeParc.model].ConfigOrdinateur.UserCp)
                .success(function (datas) {

                    $scope.santeParc.isLoading = false;


                    $scope.santeParc.datas.liveCompte = datas;

                })
                .error(function () {
                    $scope.histoPoste.isLoading = false;
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture de santé du parc.");
                });
        }

    };

    /**
     * FILTRE LES PROJETS DISPONIBLE EN FONCTION DU DEMANDEUR ET DU POSTE
     * @private
     */
    var _filterProjects = function () {
        var l_materiel = _getPoste($scope.datas.fiche.materiel),
            l_demandeurEtab = "",
            typeProjet = "",
            CATIregexp = new RegExp(/^PCI/g),
            SINAIregexp = new RegExp(/^PIV/g),
            EICregexp = new RegExp(/^EIC/g);

        //RÉCUPÉRATION DE L'ÉTABLISSEMENT DU DEMANDEUR
        if ($scope.datas.fiche.demandeur !== undefined && $scope.datas.fiche.demandeur !== null && angular.isObject($scope.datas.fiche.demandeur.originalObject))
            l_demandeurEtab = $scope.datas.fiche.demandeur.originalObject.etablissement;

        //FILTRAGE CATI
        if (CATIregexp.test(l_materiel) === true)
        {
            if($scope.datas.fiche.etat === "Centre d\'Appel")
            {
                typeProjet = "CANAIHL";
            }
            else
                typeProjet = "CATI";
        }


        //FILTRAGE SINAI
        if (SINAIregexp.test(l_materiel) === true && EICregexp.test(l_demandeurEtab) === true)
        {
            if($scope.datas.fiche.etat === "Centre d\'Appel")
            {
                typeProjet = "CANAIHL";
            }
            else
                typeProjet = "SINAI";
        }


        //FILTRER LES PROJETS EN FONCTION DU POSTE
        $scope.ficheagadir.Projects.liste = DatasProjets.liste.filter(function (val) {
            if (typeProjet === "")
                return val.type === "fiche" || val.type === "";
            else
                return val.type === "fiche" && val.filtre_projet === typeProjet;

        });

        ProjetModalService.list = $scope.ficheagadir.Projects.liste;
        ProjetModalService.model = $scope.datas.fiche.projet;

        if(typeProjet === "CANAIHL")
            $scope.datas.fiche.projet = ProjetModalService.list[0];

    };

    /**
     * VÉRIFIE SI LA VALEUR ENTRÉE DANS LE PROJET EST CORRECTE PAR RAPPORT À LA LISTE
     * SINON LA DÉFINIE À undefined
     * @private
     */
    var _verifSelectedProjet = function () {
        if ($scope.datas.fiche === undefined || $scope.datas.fiche.projet === undefined)
            return;

        var isString = angular.isString($scope.datas.fiche.projet);

        if ($scope.datas.fiche.projet.description !== undefined || isString === true) {
            var l_isIn = false;

            $scope.ficheagadir.Projects.liste.forEach(function (val) {
                if (isString === true) {
                    if (val.intitule === $scope.datas.fiche.projet.trim())
                        l_isIn = true;
                }
                else {
                    if (val.guid === $scope.datas.fiche.projet.description.guid)
                        l_isIn = true;
                }
            });

            if (l_isIn === false && $scope.ficheagadir.Projects.liste.length !== 0) {
                $scope.datas.fiche.projet = undefined;
            }
        }
    };

    /**
     * RÉCUPÈRE TOUTES LES INFOS (CONCERNANT LES AGENTS) NÉCESSAIRES À LA MODIFICATION D'UNE FICHE
     * @param {string} cpAgentDemandeur - le cp de l'agent demandeur
     * @param {string} cpAgentAffecte - le cp de l'agent affecté
     * @param {function(object)} callback - le callback qui récupère les infos fournies par '_getDatasForUpdate'
     * @private
     */
    var _getDatasForUpdate = function (cpAgentDemandeur, cpAgentAffecte, callback) {
/*
        AgentsADFactory.getAgentAll(cpAgentDemandeur)
            .success(function (resultDemandeur) {
*/
                var l_objRet = {};

/*
                resultDemandeur.L_Resultats = resultDemandeur.L_Resultats.filter(function (val) {
                    return val.cp.indexOf("_adm") === -1;
                });
*/

/*
                if (resultDemandeur.L_Resultats.length === 0){
                    $scope.ficheagadir.isLoading = false;
                    AjaxErrorManager.Gerer("Erreur aucun agent ne semble correspondre avec ce demandeur.");
                    return;
                }
*/

                /**
                    RÉCUPÉRATION DU CP ET NOMPRENOM DIRECTEMENT DANS LE SCOPE POUR TEST D'OPTIMISATION
                */
                l_objRet.cpDemandeur = $scope.datas.fiche.demandeur.description;
                l_objRet.nomPrenomDemandeur = $scope.datas.fiche.demandeur.title.split(" (")[0];

                var l_agentAffecte = $scope.ficheagadir.AgentsList.liste.filter(function (val) {
                    return val.cp === cpAgentAffecte;
                })[0];

                l_objRet.cpAgent = l_agentAffecte && l_agentAffecte.cp || "0";
                l_objRet.annee = $routeParams.annee;
                l_objRet.materiel = _getPoste($scope.datas.fiche.materiel);
                l_objRet.description = _getDescription($scope.datas.fiche.description);
                l_objRet.isUrgent = $scope.datas.fiche.isUrgent;
                l_objRet.isCloture = $scope.datas.fiche.isCloture;
                l_objRet.etat = $scope.datas.fiche.etat;
                l_objRet.region = $scope.datas.fiche.region;
                l_objRet.numeroAutreRegion = $scope.datas.fiche.numeroAutreRegion;
                l_objRet.numeroMongo = $scope.datas.fiche.numeroMongo;
                l_objRet.numero = $scope.datas.fiche.numero || 0;
                l_objRet._id = $scope.datas.fiche._id;
                l_objRet.dateDebut = $scope.datas.fiche.dateDebut;
                l_objRet.canal = $scope.datas.fiche.nomCanal;
                l_objRet.projet = $scope.datas.fiche.projet.title;
                l_objRet.val_projet = $scope.datas.fiche.projet.description.guid;
                l_objRet.affaire = $scope.datas.fiche.numAffaire;
                l_objRet.pointagesSysteme = $scope.datas.fiche.pointagesSysteme;
                l_objRet.pointagesTransfert = $scope.datas.fiche.pointagesTransfert;
                l_objRet.cpActeur = $cookieStore.get("agent");
                l_objRet.nomPrenomActeur = $cookieStore.get("nomAgent");
                l_objRet.telDemandeur = $scope.datas.fiche.demandeur.originalObject.tel;
                l_objRet.mobileDemandeur = $scope.datas.fiche.demandeur.originalObject.mobile;
                l_objRet.isPrioritaire = $scope.datas.fiche.isPrioritaire;

                callback(l_objRet);
            /*})
            .error(function () {
                $scope.ficheagadir.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu recuperer les infos du demandeur.");
            });*/
    };

    /**
     * RETOURNE LE NUMÉRO DE POSTE DEPUIS L'OBJET MATERIEL
     * @param {object} obj - l'objet bindé à angucomplete-alt
     * @returns {*} - le numéro de poste
     * @private
     */
    var _getPoste = function (obj) {
        if (obj === undefined || obj === null)
            return undefined;

        if (obj.calife !== undefined)
            return obj.calife.split(" ")[0];

        if (obj.title !== undefined)
            return obj.title.split(" ")[0];
    };

    /**
     * RETOURNE LE CP DE L'AGENT DEPUIS L'OBJET DEMANDEUR
     * @param {object} obj - l'objet bindé à angucomplete-alt
     * @returns {*} - le CP du demandeur
     * @private
     */
    var _getCPDemandeur = function (obj) {
        if (obj === undefined || obj === null)
            return undefined;

        if (obj.title !== undefined)
            return obj.description;

        if (obj.cp !== undefined)
            return obj.cp;
    };

    /**
     * RETOURNE LE NOM DU PROJET
     * @returns {string|undefined} - le nom du projet
     * @private
     */
    var _getProjet = function () {
        var l_objPrj = $scope.datas.fiche.projet;

        if (l_objPrj === undefined)
            return undefined;

        if (l_objPrj.title !== undefined)
            return l_objPrj.title;

        if (l_objPrj.intitule !== undefined)
            return l_objPrj.intitule;
    };

    /**
     * RETOURNE LA DESCRIPTION TRIMMER SINON UNE CHAINE VIDE
     * @param {string} description
     * @returns {string}
     * @private
     */
    var _getDescription = function (description) {
        var ret = "";
        if (description !== undefined && description.trim() !== "") {
            ret = description.trim();
        }

        return ret;
    };

    /**
     * VÉRIFIE LES INFOS DE LA FICHE : DEMANDEUR, POSTE, DESCRIPTION
     * ET LÈVE UNE MODALE EN CAS D'ERREUR(S)
     * @returns {number}
     * @private
     */
    var _verifDatasFiche = function () {
        var l_err = 0;

        //GESTION DU POSTE
        if (_getPoste($scope.datas.fiche.materiel) === undefined){
            AjaxErrorManager.Gerer("Veuillez saisir un poste existant.");
            l_err++;
        }

        //GESTION DU DEMANDEUR
        if (_getCPDemandeur($scope.datas.fiche.demandeur) === undefined) {
            AjaxErrorManager.Gerer("Veuillez saisir un agent existant.");
            l_err++;
        }

        //GESTION DE LA DESCRIPTION
        if (_getDescription($scope.datas.fiche.description) === ""){
            AjaxErrorManager.Gerer("Veuillez saisir une description.");
            l_err++;
        }

        //GESTION DU PROJET
        if (_getProjet() === undefined){
            AjaxErrorManager.Gerer("Veuillez saisir un projet.");
            l_err++;
        }

        return l_err;
    };

    var _verifDatasPointageFiche = function () {
        var l_err = 0;

        if ($scope.datas.Pointage.TravailRealise === undefined || $scope.datas.Pointage.TravailRealise.trim() === "") {
            $scope.datas.Pointage.errDesc = true;
            l_err++;
        } else {
            $scope.datas.Pointage.errDesc = false;
        }

        if ($scope.datas.Pointage.DureeMinutes === undefined || $scope.datas.Pointage.DureeMinutes % 3 !== 0) {
            $scope.datas.Pointage.errDuree = true;
            l_err++;
        } else {
            $scope.datas.Pointage.errDuree = false;
        }

        if ($scope.datas.Pointage.DatePointage === undefined || $scope.datas.Pointage.DatePointage.trim() === "") {
            $scope.datas.Pointage.errDate = true;
            l_err++;
        } else {
            $scope.datas.Pointage.errDate = false;
        }

        return l_err;
    };

    /**
     * RETOURNE TOUTES LES INFOS NÉCESSAIRES POUR UN POINTAGE SUR FICHE
     * @returns {Array}
     * @private
     */
    var _getDatasForPointageFiche = function () {
        var l_date = Date.setDateFR($scope.datas.Pointage.DatePointage);
        l_date.setHours(12,0,0,0);

        return [{
            idFiche: $scope.datas.fiche._id,
            numero: $scope.datas.fiche.numero,
            numeroMongo: $scope.datas.fiche.numeroMongo,
            anneeFiche: parseInt($routeParams.annee, 10),
            nomPrenom: $scope.lesAgents.filter(function (val) {
                return val.cp === $scope.datas.Pointage.cp;
            })[0].nomPrenom,
            cp: $scope.datas.Pointage.cp,
            commentaire: $scope.datas.Pointage.TravailRealise.trim(),
            projet: $scope.oldFiche.projet,
            val_projet: $scope.datas.fiche.projet.description.guid,
            duree: parseInt($scope.datas.Pointage.DureeMinutes, 10),
            date: l_date,
            cpActeur : $cookieStore.get("agent")
        }];
    };

    var _verifDatasUpdPointageFiche = function () {
        var l_err = 0;

        if ($scope.modal.nature === undefined || $scope.modal.nature.trim() === "") {
            $scope.modal.errDesc = true;
            l_err++;
        } else {
            $scope.modal.errDesc = false;
        }

        if ($scope.modal.dureeMinute === undefined || $scope.modal.dureeMinute % 3 !== 0) {
            $scope.modal.errDuree = true;
            l_err++;
        } else {
            $scope.modal.errDuree = false;
        }

        if ($scope.modal.date === undefined || $scope.modal.date.trim() === "") {
            $scope.modal.errDate = true;
            l_err++;
        } else {
            $scope.modal.errDate = false;
        }

        return l_err;
    };

    /**
     * RETOURNE TOUTES LES INFOS NÉCESSAIRES À LA MISE À JOUR D'UN POINTAGE SUR FICHE
     * @returns {{idFiche: string, numero: string, anneeFiche: Number, nomPrenom: string, cp: string, commentaire: string, projet: string, duree: Number, date: Date, _id: string}}
     * @private
     */
    var _getDataForUpdPointageFiche = function () {
        var l_date = Date.setDateFR($scope.modal.date);
        l_date.setHours(12,0,0,0);

        return {
            idFiche: $scope.datas.fiche._id,
            numero: $scope.datas.fiche.numero,
            numeroMongo: $scope.datas.fiche.numeroMongo,
            anneeFiche: parseInt($routeParams.annee, 10),
            nomPrenom: $cookieStore.get("nomAgent"),
            cp: $cookieStore.get("agent"),
            commentaire: $scope.modal.nature.trim(),
            projet: $scope.modal.projet.title || $scope.modal.projet,
            val_projet: $scope.datas.fiche.projet.description.guid,
            duree: parseInt($scope.modal.dureeMinute, 10),
            date: l_date,
            _id: $scope.modal._id
        };
    };

    /**
     * SI IL Y A UN NUMÉRO DE FICHE, ON LA RÉCUPÈRE
     */
    if ($routeParams.numFiche !== undefined && $routeParams.annee !== undefined) {
        $scope.ficheagadir.anneeInt = parseInt($routeParams.annee, 10);
        $scope.ficheagadir.RecupFicheByNumber($routeParams.annee, $routeParams.numFiche, $routeParams.region);
    }
    else {
        $scope.ficheagadir.razFiche();
        _filterProjects();

        if (ficheToClone.fiche._id !== undefined){
            DatasFicheAgadir.fiche = ficheToClone.fiche;
            //HISTO POSTE
            _getHistoPoste(ficheToClone.fiche.materiel.title.split(" (")[0]);
            //SANTÉ DU PARC
            _getSanteParcPoste();

            $timeout(function () {
                document.getElementById("posteAutocompleteInput").value = ficheToClone.fiche.materiel.title;
                document.getElementById("agentAutocompleteInput").value = ficheToClone.fiche.demandeur.title;
                ficheToClone.fiche = {};
            }, 1000);
        }
    }
}]);
