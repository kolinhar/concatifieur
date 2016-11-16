/**
 * Created by PRJS12821 on 20/08/2015.
 */
ngAriane.controller("Affaires", ["$scope", "AffairesFactory", "AjaxErrorManager", "FichesAffaire", "ModalAffaire", function ($scope, AffairesFactory, AjaxErrorManager, FichesAffaire, ModalAffaire) {
    $scope.affaires = {
        liste: [],
        isLoading: true
    };

    $scope.ModalAffaire = ModalAffaire;

    var _getAffaires = function (isModal) {
        AffairesFactory.getAll()
            .success(function (datas) {
                $scope.affaires.isLoading = false;

                if (datas.exit_code === 1) {
                    if(isModal)
                    {
                        $scope.affaires.liste = datas.lesAffaires.filter(function (val) {
                            val.percentTime = Arrondi(((val.minutesConsomme * 100) / val.minutesTotal), 2);
                            return val.isCloture === false;
                        });
                    }
                    else
                    {
                        $scope.affaires.liste = datas.lesAffaires.map(function (val) {
                            val.percentTime = Arrondi(((val.minutesConsomme * 100) / val.minutesTotal), 2);
                            return val;
                        });
                    }

                    FichesAffaire.Nb = datas.nbAffaires;
                }
                else {
                    AjaxErrorManager.Gerer("Erreur lors de la lecture de la liste des affaires. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.affaires.isLoading = false;

                console.log(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de la liste des affaires.")
            });
    };

    _getAffaires(false);

    $scope.affaires.selectAffaire = function (ligne) {
        ModalAffaire.selectedAffaire = ligne;
        ModalAffaire.isModal = false;

        $('#AffairesModal').modal('hide');
    };

    $('#AffairesModal').on("hide.bs.modal", function (e) {
        ModalAffaire.isModal = false;
    });

    $scope.$watch("ModalAffaire.reload", function (newVal, oldVal) {
        if (newVal === undefined || newVal === 0)
            return;

        _getAffaires(true);
    });
}]);

ngAriane.controller("AffaireNum", ["$scope", "$routeParams","AffairesFactory", "AjaxErrorManager", "ProjectAffaire", "CPtoNAME", "DAL_AGENT", "$route", function ($scope, $routeParams, AffairesFactory, AjaxErrorManager, ProjectAffaire, CPtoNAME, DAL_AGENT, $route){
    $scope.affairenum = {
        quotaOverflow: false,
        nbFicheTot: 0,
        nbFicheCloturee: 0,
        nbFicheClotureePercent: 0,
        isLoading: true
    };


    $scope.affairenum.Update = function (cloture) {
        //VÉRIFS
        var l_err = 0;

        if ($scope.affairenum.datas.titre.trim() === ""){
            AjaxErrorManager.Gerer("Veuillez saisir un titre pour l'affaire.");
            l_err++;
        }

        if ($scope.affairenum.datas.heuresTotal === null || isNaN($scope.affairenum.datas.heuresTotal) === true || parseInt($scope.affairenum.datas.heuresTotal, 10).toString() !== $scope.affairenum.datas.heuresTotal.toString()){
            AjaxErrorManager.Gerer("Veuillez saisir un nombre entier positif d'heure.");
            l_err++;
        }

        if ($scope.affairenum.datas.suiviPar === null){
            AjaxErrorManager.Gerer("Veuillez saisir un agent.");
            l_err++;
        }

        if (l_err > 0)
            return;

        if(cloture === undefined)
            cloture = $scope.affairenum.datas.isCloture;

        $scope.affairenum.isLoading = true;

        //ENVOI DES INFOS
        AffairesFactory.update({
            _id : $scope.affairenum.datas._id,
            titre: $scope.affairenum.datas.titre.trim(),
            minutesTotal : parseInt($scope.affairenum.datas.heuresTotal, 10) * 60,
            cpAgentSuiveur: $scope.affairenum.datas.suiviPar,
            isCloture : cloture
        })
            .success(function (datas) {

                $scope.affairenum.isLoading = false;

                if(datas.exit_code === 1)
                {
                    $route.reload();
                }
                else
                {
                    AjaxErrorManager.Gerer("Erreur lors de la modification de l'affaire. " + datas.err_msg);
                    _getAffaire();
                }
            })
            .error(function () {
                $scope.affairenum.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de l'affaire.");
            });
    };

    var _getAffaire = function () {
        AffairesFactory.get({
                numAffaire : $routeParams.numAffaire,
                annee : $routeParams.annee
            })
            .success(function (datas) {
                $scope.affairenum.isLoading = false;

                if (datas.exit_code === 1){
                    ProjectAffaire.projet = datas.affaire.projet;

                    var l_pointages = [],
                        l_tempsRestant = 0,
                        l_datasGraphTemp = {},
                        l_dataGraph = [],
                        l_cptFicheCloturee = 0;

                    //CALCUL DES POINTAGES PAR AGENT POUR LE GRAPH
                    datas.lesFiches.forEach(function (fiche) {
                        var l_fiche = fiche.fiche,
                            l_dateFin = new Date(l_fiche.dateDebut);

                        l_dateFin.setDate(l_dateFin.getDate() + 1);

                        if (l_fiche.isCloture === true)
                            l_cptFicheCloturee++;

                        fiche.pointages.forEach(function (ptg) {
                            ptg.numFiche = ptg.numero || ptg.numeroMongo;
                            ptg.annee = new Date(l_fiche.dateDebut).getFullYear();
                            ptg.dateFin = l_dateFin;
                            ptg.dureeMinute = ptg.duree;
                            ptg.duree = new Date(0,0,0,0,ptg.duree,0,0);

                            l_pointages.push(ptg);

                            if (!l_datasGraphTemp[ptg.cp + "|" + ptg.nomPrenom]){
                                l_datasGraphTemp[ptg.cp + "|" + ptg.nomPrenom] = 0;
                            }

                            l_datasGraphTemp[ptg.cp + "|" + ptg.nomPrenom] += ptg.dureeMinute/60;
                        });
                    });

                    for (var id in l_datasGraphTemp) {
                        l_dataGraph.push({
                            name: id.split("|")[1],
                            y: l_datasGraphTemp[id]
                        });
                    }

                    $scope.affairenum.nbFicheTot = datas.lesFiches.length;
                    $scope.affairenum.nbFicheCloturee = l_cptFicheCloturee;
                    $scope.affairenum.nbFicheClotureePercent = Arrondi(($scope.affairenum.nbFicheCloturee * 100 / $scope.affairenum.nbFicheTot), 2);

                    //CALCUL DU TEMPS RESTANT POUR LE GRAPH
                    if (datas.affaire.minutesTotal > datas.affaire.minutesConsomme){
                        l_tempsRestant = (datas.affaire.minutesTotal - datas.affaire.minutesConsomme) / 60
                    }

                    $scope.affairenum.datas = {
                        _id: datas.affaire._id,
                        titre : datas.affaire.titre,
                        heuresTotal: parseInt(datas.affaire.minutesTotal / 60, 10),
                        minutesTotalRestante: _AffZero(datas.affaire.minutesTotal % 60),
                        minutesTotal: datas.affaire.minutesTotal,
                        minutesConsomme: datas.affaire.minutesConsomme,
                        description: datas.affaire.description,
                        projet: datas.affaire.projet,
                        demandeur: datas.affaire.nomPrenomDemandeur,
                        agent: datas.affaire.nomPrenomAgent,
                        suiviPar: datas.affaire.cpAgentSuiveur,
                        postes: datas.lesFiches,
                        pointages: l_pointages,
                        isCloture: datas.affaire.isCloture
                    };

                    CPtoNAME.GetFullName(datas.affaire.cpAgent, function (nom) {
                        $scope.affairenum.datas.agent = nom;
                    });

                    $('#graphConso').highcharts({
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie'
                        },
                        title: {
                            text: 'Répartition'
                        },
                        tooltip: {
                            enabled: false
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.y}h'
                                }
                            }
                        },
                        series: [{
                            name: "Durée",
                            colorByPoint: true,
                            data: l_dataGraph.concat({
                                name: "Temps restant",
                                y: l_tempsRestant
                            })
                        }]
                    });
                }
                else{
                    AjaxErrorManager.Gerer("Erreur lors de la lecture de l'affaire " + $routeParams.numAffaire + ". " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.affairenum.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de l'affaire " + $routeParams.numAffaire);
            });
    };

    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        $scope.affairenum.AgentsListSuivi = listeAgents.filter(function (val) {
            return val.cp !== "0";
        });

        _getAffaire();
    });
}]);

ngAriane.controller("AffaireCreation", ["$scope", "AffairesFactory", "AjaxErrorManager", "$location", "DAL_AGENT", "DIURLAPI", "DatasProjets", "Region", "PosteGeminiFactory", "$interval", "$timeout", "ProjetModalService", function ($scope, AffairesFactory, AjaxErrorManager, $location, DAL_AGENT, DIURLAPI, DatasProjets, Region, PosteGeminiFactory, $interval, $timeout, ProjetModalService){
    $scope.DIURLAPI = DIURLAPI;

    $scope.ProjetModalService = ProjetModalService;

    $scope.affairecreation = {
        isLoading: false,
        AgentsList: [],
        Projects: DatasProjets,
        regexpPostes: /^\w{1,11}(\W{1,})?/mg,
        regexpPostesSeparator: /\W{1,}/mg,
        form: {
            titre: "",
            heure: null,
            postes: "",
            projet: "",
            demandeur: "",
            agent: "",
            suiviPar: "",
            description: ""
        },
        error:{
            titre: false,
            heure: false,
            postes: false,
            projet: false,
            demandeur: false,
            agent: false,
            description: false
        }
    };

    // RÉCUPÉRATION DES AGENTS
    DAL_AGENT.ListeAgentsOrderedAndFiltered(function (listeAgents) {
        $scope.affairecreation.AgentsList = listeAgents;
        $scope.affairecreation.AgentsListSuivi = listeAgents.filter(function (val) {
            return val.cp !== "0";
        });
    });

    $scope.affairecreation.Create = function () {
        if (_verifDatasFromForm()){
            $scope.affairecreation.isLoading = true;
            //SI LES DONNÉES SEMBLENT BONNES ON VÉRIFIE LES POSTES
            $timeout(function () {
                _verifPostesAjax(function (isOk) {
                    if (isOk === true) {
                        var l_postDatas = {
                            titre: $scope.affairecreation.form.titre.trim(),
                            minutesTotal: parseInt($scope.affairecreation.form.heure, 10) * 60,
                            dateDebut: new Date(),
                            projet: $scope.affairecreation.form.projet.title,
                            val_projet: $scope.affairecreation.form.projet.description.guid,
                            description: $scope.affairecreation.form.description.trim(),
                            isCloture: false,
                            isUrgent: false,
                            cpDemandeur: $scope.affairecreation.form.demandeur.originalObject.cp,
                            nomPrenomDemandeur: $scope.affairecreation.form.demandeur.originalObject.display.split(" (")[0],
                            cpAgent: $scope.affairecreation.form.agent,
                            nomPrenomAgent: $scope.affairecreation.AgentsList.filter(function (val) {
                                return val.cp === $scope.affairecreation.form.agent;
                            })[0].nomPrenom,
                            cpAgentSuiveur: $scope.affairecreation.form.suiviPar,
                            materiel: $scope.affairecreation.form.postes.trim().toUpperCase().split($scope.affairecreation.regexpPostesSeparator).filter(function (val) {
                                return val !== ""
                            }),
                            region: Region,
                            canal: "ariane"
                        };

                        AffairesFactory.create(l_postDatas)
                            .success(function (datas) {
                                $scope.datas = datas;
                                if (datas.exit_code === 1) {
                                    var l_err = 0;
                                    datas.infoCreationFiches.forEach(function (val) {
                                        if (val.exit_code !== 1) {
                                            l_err++;
                                        }
                                    });

                                    if (l_err > 0) {
                                        AjaxErrorManager.Gerer("Erreur lors de la création des fiches, " + l_err + " fiche"
                                        + (l_err > 1 ? "s sur " + postDatas.materiel + " n'ont pas pu être créées." : " sur " + postDatas.materiel + " n'a pas pu être créée."));
                                    }
                                    else {
                                        $location.url("/affaire/lire/" + new Date().getFullYear() + "/" + datas.numero);
                                    }
                                }
                                else {
                                    AjaxErrorManager.Gerer("Erreur lors de la création de l'affaire." + datas.err_msg);
                                }
                            })
                            .error(function () {
                                console.log(arguments);
                                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création d'affaire.");
                            })
                            .then(function () {
                                $scope.affairecreation.isLoading = false;
                            });
                    }
                    else{
                        $scope.affairecreation.isLoading = false;
                    }
                });
            }, 50);
        }
    };

    /**
     * VÉRIFIE LES INFORMATIONS DU FORMULAIRES
     * @returns {boolean}
     * @private
     */
    var _verifDatasFromForm = function () {
        var l_errCpt = 0;

        //TITRE
        if ($scope.affairecreation.form.titre.trim() === "")
        {
            $scope.affairecreation.error.titre = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.titre = false;
        }

        //HEURE
        if ($scope.affairecreation.form.heure === undefined
            || $scope.affairecreation.form.heure === null
            || parseInt($scope.affairecreation.form.heure, 10) !== $scope.affairecreation.form.heure)
        {
            $scope.affairecreation.error.heure = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.heure = false;
        }

        //PROJET
        if ($scope.affairecreation.form.projet === undefined
            || $scope.affairecreation.form.projet === "")
        {
            $scope.affairecreation.error.projet = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.projet = false;
        }

        //DEMANDEUR
        if ($scope.affairecreation.form.demandeur === undefined
            || $scope.affairecreation.form.demandeur === "")
        {
            $scope.affairecreation.error.demandeur = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.demandeur = false;
        }

        //AGENT
        if ($scope.affairecreation.form.agent === "" || $scope.affairecreation.form.agent === "0")
        {
            $scope.affairecreation.error.agent = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.agent = false;
        }

        //AGENT SUIVI PAR
        if ($scope.affairecreation.form.suiviPar === "")
        {
            $scope.affairecreation.error.suiviPar = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.suiviPar = false;
        }

        //POSTES
        if ($scope.affairecreation.form.postes.trim() === ""
            || $scope.affairecreation.regexpPostes.test($scope.affairecreation.form.postes.trim()) === false){
            $scope.affairecreation.error.postes = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.postes = false;
        }

        //DESCRIPTION
        if ($scope.affairecreation.form.description.trim() === ""){
            $scope.affairecreation.error.description = true;
            l_errCpt++;
        }
        else{
            $scope.affairecreation.error.description = false;
        }

        return l_errCpt === 0;
    };

    /**
     * VÉRIFIE SI LES POSTES DE LA LISTE EXISTENT DANS L'AD
     * @param callback
     * @private
     */
    var _verifPostesAjax = function (callback) {
        var l_listePostesRaw = $scope.affairecreation.form.postes.trim().toUpperCase().split($scope.affairecreation.regexpPostesSeparator),
            l_listePostesClean,
            l_listePosteObj = {},
            l_cptAjaxCpt = 0,
            l_cptAjaxDone = 0,
            l_isAllCheckOK = true;

        if (l_listePostesRaw.length === 0 || (l_listePostesRaw.length === 1 && l_listePostesRaw[0] === "")){
            //ERREUR
            AjaxErrorManager.Gerer("Erreur la liste des postes est vide.");
            return;
        }

        l_listePostesClean = l_listePostesRaw.filter(function (val) {
            return val !== ""
        });

        //OBJET CONTENANT LES POSTES SANS DOUBLONS
        l_listePostesClean.forEach(function (val) {
            if (!(val in l_listePosteObj)){
                l_listePosteObj[val] = 0;
            }

            l_listePosteObj[val]++;
        });

        for (var poste in l_listePosteObj) {
            l_cptAjaxCpt++;

            //@HACK: PERMET DE CONSERVER LA VALEUR DE 'POSTE' DANS LE SCOPE DE L'APPEL AJAX (PB DE BOUCLE ASYNCHRONE)
            (function (posteRecherche) {
                PosteGeminiFactory.getPoste(posteRecherche)
                    .success(function (datas) {
                        l_cptAjaxDone++;
                        if (datas.exit_code === 1) {
                            if (datas.L_Resultats.length > 0) {
                                var l_poste_s = datas.L_Resultats.filter(function (ligne) {
                                    return ligne.calife.split(" ")[0].trim() === posteRecherche;
                                });

                                if (l_poste_s.length === 1) {
                                    //YOUHOU IL EXISTE!
                                    if (l_poste_s[0].description === "SUPPRIME"){
                                        l_isAllCheckOK = false;
                                        AjaxErrorManager.Gerer("Erreur le poste '" + posteRecherche + "' n'est plus disponible.");
                                    }
                                }
                                else {
                                    l_isAllCheckOK = false;
                                    AjaxErrorManager.Gerer("Erreur le nom de poste '" + posteRecherche + "' semble imcomplet, veuillez le completer.");
                                }
                            }
                            else {
                                l_isAllCheckOK = false;
                                AjaxErrorManager.Gerer("Erreur le poste '" + posteRecherche + "' est introuvable.");
                            }
                        }
                        else {
                            l_isAllCheckOK = false;
                            AjaxErrorManager.Gerer("Erreur lors de la vérification du poste '" + posteRecherche + "'. " + datas.err_msg);
                        }
                    })
                    .error(function () {
                        l_cptAjaxDone++;
                        l_isAllCheckOK = false;
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de vérification du poste '" + posteRecherche + "'.");
                    });
            })(poste);
        }

        /**
         * VÉRIFICATION DE LA FIN DE TOUS LES APPELS AJAX
         * PEUT-ÊTRE QU'UNE AUTRE MÉTHODE ANGULAR EXISTE POUR FAIRE UNE PROMISE À PARTIR DE PLUSIEURS PROMISES
         * CE QUI SERAIT PLUS "PROPRE", MAIS PAS LE TEMPS DE VÉRIFIER
         */
        var l_IntervalPromise = $interval(function () {
            if (l_cptAjaxDone === l_cptAjaxCpt){
                $interval.cancel(l_IntervalPromise);

                callback && callback(l_isAllCheckOK);
            }
        }, 30);
    };

    $scope.$watchCollection("affairecreation.Projects.liste", function (newVal, oldVal) {
       if (newVal === undefined)
           return;

        ProjetModalService.list = newVal;
    });

    $scope.$watchCollection("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.affairecreation.form.projet = newVal;
    });
}]);

ngAriane.controller("AffairePointage", ["$scope", "AffairesFactory", "DatasDJS", "$route", "$routeParams", "AjaxErrorManager", "ProjectAffaire", "$cookieStore", "DatasProjets", function ($scope, AffairesFactory, DatasDJS, $route, $routeParams, AjaxErrorManager, ProjectAffaire, $cookieStore, DatasProjets) {
    $scope.affairepointage = {
        isLoading: false,
        Pointage: {
            errDesc: false,
            errDuree: false,
            errDate: false
        }
    };

    $scope.affairepointage.AddPointage = function () {
        var postDatas = {};
        var l_cptErr = 0;

        if ($scope.affairepointage.Pointage.TravailRealise === undefined ||$scope.affairepointage.Pointage.TravailRealise.trim() === ""){
            $scope.affairepointage.Pointage.errDesc = true;
            l_cptErr++;
        }else{
            $scope.affairepointage.Pointage.errDesc = false;
        }

        if($scope.affairepointage.Pointage.DureeMinutes === undefined || $scope.affairepointage.Pointage.DureeMinutes % 3 !== 0) {
            $scope.affairepointage.Pointage.errDuree = true;
            l_cptErr++;
        }else{
            $scope.affairepointage.Pointage.errDuree = false;
        }

        if ($scope.affairepointage.Pointage.DatePointage === undefined || $scope.affairepointage.Pointage.DatePointage.trim() === ""){
            $scope.affairepointage.Pointage.errDate = true;
            l_cptErr++;
        }else{
            $scope.affairepointage.Pointage.errDate = false;
        }

        if (l_cptErr !== 0)
            return;

        $scope.affairepointage.isLoading = true;

        var l_date = Date.setDateFR($scope.affairepointage.Pointage.DatePointage);
        l_date.setHours(12,0,0,0);

        postDatas = [{
            numAffaire: $routeParams.numAffaire,
            anneeFiche: $routeParams.annee,
            nomPrenom: $cookieStore.get("nomAgent"),
            cp: $cookieStore.get("agent"),
            commentaire: $scope.affairepointage.Pointage.TravailRealise.trim(),
            duree: $scope.affairepointage.Pointage.DureeMinutes,
            date: l_date,
            projet: ProjectAffaire.projet,
            val_projet: DatasProjets.liste.filter(function (val) {
                return ProjectAffaire.projet === val.intitule;
            })[0].guid
        }];

        AffairesFactory.addPointage(postDatas)
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    DatasDJS.reload++;
                    $route.reload();
                }
                else {
                    $scope.affairepointage.isLoading = false;
                    AjaxErrorManager.Gerer("Erreur lors de la création du pointage sur l'affaire " + $routeParams.numAffaire + ".  Une ou plusieurs fiche n'a/ont pas pu être imputée(s). " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.affairepointage.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création de pointage.");
            });
    };
}]);