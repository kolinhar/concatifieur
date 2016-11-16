/**
 * Created by PRJS12821 on 03/09/2015.
 */
"use strict";

ngAriane.controller("Astreinte", ["$scope", "DatasProjets", "DAL_POINTAGE", "$cookieStore", "AjaxErrorManager", "$timeout", "VerifDatasNuitAstreinte", "ProjetModalService", "PointageFactoryCSharp", "DAL_AGENT", "$routeParams", "$route", function ($scope, DatasProjets, DAL_POINTAGE, $cookieStore, AjaxErrorManager, $timeout, VerifDatasNuitAstreinte, ProjetModalService, PointageFactoryCSharp, DAL_AGENT, $routeParams, $route) {
    $scope.isLoading = false;

    $scope.ProjetModalService = ProjetModalService;

    $scope.projets = DatasProjets;

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

    $scope.lesAgents = [];
    $scope.agentsDpx = [];
    $scope.habilitation = $cookieStore.get("status");

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
                PointageFactoryCSharp.add([{
                    nomPrenom: $scope.lesAgents.filter(function (val) {
                        return val.cp === $scope.pointage.cp;
                    })[0].nomPrenom,
                    cp: $scope.pointage.cp,
                    commentaire: $scope.pointage.TravailRealise.trim(),
                    projet: $scope.pointage.selectedProject.title,
                    val_projet: $scope.pointage.selectedProject.description.guid,
                    duree: parseInt((l_datefin.getTime() - l_datedeb.getTime()) / 60000),
                    date: l_dateRef,
                    dateDebut: l_datedeb,
                    dateFin: l_datefin,
                    isAstreinte: true,
                    isNuit: false,
                    cpActeur : $cookieStore.get("agent")
                }])
                    .success(function (datas) {
                        $scope.isLoading= false;
                        if (datas.exit_code === 1){
                            //LES POINTAGES D'ASTREINTE N'APPARAISSENT PAS DANS LA DJS DANS PAS DE RELOAD DE LA DJS
                            $scope.pointage = {};
                            //@HACK: PAS DE DATA-BINDING AVEC angucomplete-alt DANS CE CAS
                            document.querySelector("#projectAutocompleteInput4>div>input").value = "";

                            $route.reload();
                        }
                        else{
                            AjaxErrorManager.Gerer("Erreur lors de la création de votre pointage d'astreinte. " + datas.err_msg);
                        }
                    })
                    .error(function () {
                        $scope.isLoading= false;
                        console.warn(arguments);
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création d'un pointage d'astreinte.");
                    });
            }, 500);
        }
    };

    $scope.$watchCollection("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.pointage.selectedProject = newVal;
    });

    /*$scope.$watchCollection("projets.liste", function (newVal, oldVal) {
        $scope.ProjetModalService.lis = newVal;
    });*/
}]);

ngAriane.controller("AstreinteListe", ["$scope", "DatasProjets", "$cookieStore", "$routeParams", "AjaxErrorManager", "$timeout", "DAL_POINTAGE", "CPtoNAME", "ModalPointageNuitAstreinte", "VerifDatasNuitAstreinte", "$route", "ProjetModalService", "PointageFactoryCSharp", function ($scope, DatasProjets, $cookieStore, $routeParams, AjaxErrorManager, $timeout, DAL_POINTAGE, CPtoNAME, ModalPointageNuitAstreinte, VerifDatasNuitAstreinte, $route, ProjetModalService, PointageFactoryCSharp){
    $scope.astreinteliste = {
        isLoading: true,
        datas: []
    };

    $scope.ProjetModalService = ProjetModalService;

    var l_date = Date.setDateFR($routeParams.datePointage);
    l_date.setHours(12,0,0,0);

    PointageFactoryCSharp.read({
        cp: $routeParams.idUser,
        date: l_date
    })
        .success(function (datas) {
            if (datas.exit_code === 1){
                datas.lesPointages
                    .filter(function (val) {
                    return val.isAstreinte === true;
                })
                    .forEach(function (ptg) {
                    $scope.astreinteliste.datas.push({
                        _id: ptg._id,
                        projet: ptg.projet,
                        commentaire: ptg.commentaire,
                        duree: new Date(0,0,0,0,ptg.duree,0,0),
                        dateDebut: ptg.dateDebut,
                        dateFin: ptg.dateFin,
                        cp: ptg.cp,
                        nomPrenom: ptg.nomPrenom,
                        dureeMinute: ptg.duree
                    });
                });
            }
            else{
                AjaxErrorManager.Gerer("Erreur lors de la lecture des pointages d'astreinte. " + datas.err_msg);
            }

            $scope.astreinteliste.isLoading = false;
        })
        .error(function () {
            $scope.astreinteliste.isLoading = false;
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture des pointages d'astreinte.");
        });

    $scope.astreinteliste.showModPtg = function (ptg) {
        //POINTAGE ASTREINTE
        ProjetModalService.list = DatasProjets.liste;

        var l_dateDeb = new Date(ptg.dateDebut),
            l_heureDeb = new Date(ptg.dateDebut),
            l_dateFin = new Date(ptg.dateFin),
            l_heureFin = new Date(ptg.dateFin);

        l_dateDeb.setHours(0,0,0,0);
        l_dateFin.setHours(0,0,0,0);
        l_heureDeb.setFullYear(1970,0,1);
        l_heureFin.setFullYear(1970,0,1);

        $scope.pointage = {
            projet: ptg.projet,
            selectedProject: DatasProjets.liste.filter(function (val) {
                return val.intitule === ptg.projet;
            })[0],
            TravailRealise: ptg.commentaire,
            dateDebut: l_dateDeb.getDateFR(),
            dateFin: l_dateFin.getDateFR(),
            heureDebut: l_heureDeb,
            heureFin: l_heureFin,
            _id : ptg._id
        };

        //ENVOIE DES DONNÉES AU SERVICE DE MODAL NUIT/ASTREINTE
        ModalPointageNuitAstreinte.pointage = $scope.pointage;

        //@HACK: SINON LA VUE N'A PAS LE TEMPS DE SE METTRE À JOUR PAR RAPPORT AU MODEL
        $timeout(function () {
            //@HACK:  SUPPRESSION DE ":00.000" DANS L'AFFICHAGE DE L'HEURE PARCE QUE ÇA A ÉTÉ CODÉ À L'ARRACH'
            document.getElementById("timepicker2").value = document.getElementById("timepicker2").value.split(":00.000")[0];
            document.getElementById("timepicker1").value = document.getElementById("timepicker1").value.split(":00.000")[0];
        }, 100);

        ModalPointageNuitAstreinte.UpdPointage = function () {
            if (VerifDatasNuitAstreinte.FromForm($scope.pointage) === true && VerifDatasNuitAstreinte.DateTime($scope.pointage) === true){
                var l_datedeb = Date.setDateFR($scope.pointage.dateDebut),
                    l_datefin = Date.setDateFR($scope.pointage.dateFin),
                    l_heuredeb = new Date($scope.pointage.heureDebut),
                    l_heurefin = new Date($scope.pointage.heureFin);

                l_datedeb.setHours(l_heuredeb.getHours(), l_heuredeb.getMinutes(), 0, 0);
                l_datefin.setHours(l_heurefin.getHours(), l_heurefin.getMinutes(), 0, 0);

                $("#modal-pointage-nuit-astreinte").modal('hide');

                $scope.astreinteliste.isLoading = true;

                //ASTREINTE
                $timeout(function () {
                    var l_dateRef = new Date(l_datedeb);
                    l_dateRef.setHours(12,0,0,0);

                    PointageFactoryCSharp.upd({
                            _id: $scope.pointage._id,
                            nomPrenom: $cookieStore.get("nomAgent"),
                            cp: $cookieStore.get("agent"),
                            commentaire: $scope.pointage.TravailRealise.trim(),
                            projet: $scope.pointage.selectedProject.title,
                            val_projet: $scope.pointage.selectedProject.description.guid,
                            duree: parseInt((l_datefin.getTime() - l_datedeb.getTime()) / 60000, 10),
                            date: l_dateRef,
                            dateDebut: l_datedeb,
                            dateFin: l_datefin,
                            isAstreinte: true,
                            isNuit: false
                    })
                        .success(function (datas) {
                            $scope.astreinteliste.isLoading = false;
                            if (datas.exit_code === 1){
                                $route.reload();
                            }
                            else{
                                AjaxErrorManager.Gerer("Erreur lors de la modification de votre pointage d'astreinte. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.astreinteliste.isLoading = false;
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification d'un pointage d'astreinte.");
                        });
                }, 500);
            }
        };
    };

    $scope.astreinteliste.DelAstreinte = function (ptg) {
        AjaxErrorManager.Infos = {
            title: "Confirmation",
            msg: ["Êtes-vous sûr de vouloir supprimer ce pointage ?"],
            Confirm: function () {
                $scope.astreinteliste.isLoading = true;

                $timeout(function () {
                    PointageFactoryCSharp.del({_id: ptg._id, cp: $cookieStore.get("agent")})
                        .success(function (datas) {
                            $scope.astreinteliste.isLoading = false;

                            if (datas.exit_code === 1){
                                $route.reload();
                            }
                            else{
                                AjaxErrorManager.Gerer("Erreur lors de la suppression du pointage. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.astreinteliste.isLoading = false;
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de suppression de pointage.");
                        });
                }, 500);
            }
        };
    };

    $scope.$watch("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.pointage && ($scope.pointage.selectedProject = newVal);
    });
}]);

ngAriane.controller("pointageNuitAstreinteModal", ["$scope", "ModalPointageNuitAstreinte", function ($scope, ModalPointageNuitAstreinte) {

    $scope.pointagenuitastreintemodal = {
        DI: ModalPointageNuitAstreinte
    };

    $scope.pointage = {};

    $("#modal-pointage-nuit-astreinte").on("hide.bs.modal", function (e) {
        ModalPointageNuitAstreinte.RAZ();
    });

    $scope.$watchCollection("pointagenuitastreintemodal.DI.pointage", function (newVal, oldVal) {
        if (angular.equals(oldVal, newVal) || newVal === null)
            return;

        //AFFECTATION DES DONNÉES À LA VUE
        $scope.pointage = ModalPointageNuitAstreinte.pointage;

        /**
         * ACTION DU CLICK SUR LE BOUTON MODIFIER
         * @type {Function|*}
         */
        $scope.UpdPointage = function () {
            ModalPointageNuitAstreinte.UpdPointage && ModalPointageNuitAstreinte.UpdPointage();
        }

    });

}]);