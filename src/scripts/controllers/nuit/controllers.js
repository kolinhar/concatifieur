/**
 * Created by PRJS12821 on 01/09/2015.
 */
"use strict";

ngAriane.controller("Nuit", ["$scope", "DatasProjets", "DAL_POINTAGE", "$cookieStore", "AjaxErrorManager", "$timeout", "VerifDatasNuitAstreinte", "DatasDJS", "ProjetModalService", "PointageFactoryCSharp", "CheckModalDjs", "DatasAgents", "DAL_AGENT", "$routeParams", "$route", function ($scope, DatasProjets, DAL_POINTAGE, $cookieStore, AjaxErrorManager, $timeout, VerifDatasNuitAstreinte, DatasDJS, ProjetModalService, PointageFactoryCSharp, CheckModalDjs, DatasAgents, DAL_AGENT, $routeParams, $route) {
    $scope.isLoading = false;

    $scope.DatasProjets = DatasProjets;

    $scope.projets = {
        liste: []
    };

    $scope.lesAgents = DatasAgents.liste;
    $scope.agentsDpx = [];

    $scope.habilitation = $cookieStore.get("status");

    $scope.ProjetModalService = ProjetModalService;

    $scope.URLButton = "views/nuitAstreinte/buttonValider.html";

    /**
     * FONCTION ÉXÉCUTÉE QUAND ON SÉLÉCTIONNE UNE VALEUR DANS UN DATETIMEPICKER
     * CAR SINON L'INPUT GARDE LE FOCUS ET ON NE PEUT PAS CLIQUER SUR LE BOUTON
     * DE VALIDATION SANS RÉAFFICHER LE DERNIER DATETIMEPICKER UTILISÉ
     */
    $scope.blurInput = function () {
        this.$node.blur();
    };

    $scope.pointage = {dateDebut : Date.setDateFR($routeParams.datePointage).getDateFR()};

    // Appel la liste des agents;
    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        $scope.lesAgents = listeAgents;
        $scope.pointage.cp = $cookieStore.get("agent");

        if($cookieStore.get("status") === "Encadrement")
        {
            $scope.lesAgents.forEach(function (val) {
                if((val.habilitation === "Agent" && val.secteur === $cookieStore.get("secteur")) || val.cp === $cookieStore.get("agent"))
                {
                    $scope.agentsDpx.push(val);
                }
            });

            $scope.pointage.cp = $routeParams.idUser;
        }


    });

    $scope.AddPointage = function () {
        if (VerifDatasNuitAstreinte.FromForm($scope.pointage) === true && VerifDatasNuitAstreinte.DateTime($scope.pointage) === true){
            var l_datedeb = Date.setDateFR($scope.pointage.dateDebut),
                l_datefin = Date.setDateFR($scope.pointage.dateFin),
                l_heuredeb = $scope.pointage.heureDebut,
                l_heurefin = $scope.pointage.heureFin;

            var tabHeureDebut = l_heuredeb.split(":");
            var tabHeureFin = l_heurefin.split(":");

            l_datedeb.setHours(tabHeureDebut[0], tabHeureDebut[1], 0, 0);
            l_datefin.setHours(tabHeureFin[0], tabHeureFin[1], 0, 0);

            var l_dateRef = new Date(l_datedeb);
            l_dateRef.setHours(12,0,0,0);

            $scope.isLoading = true;

            $timeout(function () {

                var objPtg = [{
                    nomPrenom: $scope.lesAgents.filter(function (val) {
                        return val.cp === $scope.pointage.cp;
                    })[0].nomPrenom,
                    cp: $scope.pointage.cp,
                    commentaire: $scope.pointage.TravailRealise.trim(),
                    projet: $scope.pointage.selectedProject.title,
                    val_projet: $scope.pointage.selectedProject.description.guid,
                    duree: parseInt((l_datefin.getTime() - l_datedeb.getTime()) / 60000, 10),
                    date: l_dateRef,
                    dateDebut: l_datedeb,
                    dateFin: l_datefin,
                    isAstreinte: false,
                    isNuit: true,
                    cpActeur : $cookieStore.get("agent")
                }];

                PointageFactoryCSharp.add(objPtg)
                    .success(function (datas) {
                        $scope.isLoading = false;
                        if (datas.exit_code === 1){
                            //LES POINTAGES DE NUIT APPARAISSENT DANS LA DJS DONC RELOAD DE LA DJS
                            DatasDJS.reload++;
                            $scope.pointage = {};
                            //@HACK: PAS DE DOUBLE DATA-BINDING AVEC angucomplete-alt DANS CE CAS
                            document.querySelector("#projectAutocompleteInput5>div>input").value = "";
                            CheckModalDjs.CheckGetModal(objPtg);

                            $route.reload();
                        }
                        else{
                            AjaxErrorManager.Gerer("Erreur lors de la création de votre pointage de nuit. " + datas.err_msg);
                        }
                    })
                    .error(function () {
                        $scope.isLoading = false;
                        console.warn(arguments);
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création d'un pointage de nuit.");
                    });
            }, 500);
        }
    };

    $scope.$watchCollection("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.pointage.selectedProject = newVal;
    });

    /*$scope.$watchCollection("DatasProjets.liste", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.projets.liste = newVal.filter(function (val) {
            return val.intitule === "Temps d'insuffisance de service (TI)";
        });

        ProjetModalService.list = $scope.projets.liste;
    });*/
}]);