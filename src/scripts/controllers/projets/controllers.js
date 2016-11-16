/**
 * Created by PRJS12821 on 30/06/2015.
 */
"use strict";

ngAriane.controller("Projets", ["$scope", "DatasProjets", "$cookieStore", "PointageFactoryCSharp", "AjaxErrorManager", "DatasDJS", "$route", "$routeParams", "ProjetModalService", "DAL_DJS", "CheckModalDjs", "DatasAgents", "DAL_AGENT", "FichesFactory", "$timeout",function ($scope, DatasProjets, $cookieStore, PointageFactoryCSharp, AjaxErrorManager, DatasDJS, $route, $routeParams, ProjetModalService, DAL_DJS, CheckModalDjs, DatasAgents, DAL_AGENT, FichesFactory, $timeout) {
    /**
     * FONCTION ÉXÉCUTÉE QUAND ON SÉLÉCTIONNE UNE VALEUR DANS UN DATETIMEPICKER
     * CAR SINON L'INPUT GARDE LE FOCUS ET ON NE PEUT PAS CLIQUER SUR LE BOUTON
     * DE VALIDATION SANS RÉAFFICHER LE DERNIER DATETIMEPICKER UTILISÉ
     */
    $scope.blurInput = function () {
        this.$node.blur();
    };

    $scope.DatasProjets = DatasProjets;

    $scope.habilitation = $cookieStore.get("status");

    $scope.ProjetModalService = ProjetModalService;

    $scope.lesAgents = DatasAgents.liste;
    $scope.agentsDpx = [];

    $scope.projets = {
        datas: {
            liste: []
        },
        DatePointage: Date.setDateFR($routeParams.datePointage).getDateFR(),
        DatePointage2: "",
        isLoading: false
    };

    $scope.fiche = {};
;
       var peupleProjet = function () {
           ProjetModalService.list = DatasProjets.liste.filter(function (val) {
               return val.type === "projet" || val.type === "";
           });
       };

    peupleProjet();

    $scope.lesFiches = [];

    FichesFactory.GetAll()
        .success(function (datas) {
            if (datas.exit_code === 1) {

                $scope.lesFiches = datas.lesFiches;
                $scope.lesFiches.forEach(function (fiche) {
                    fiche.numero = fiche.numero.toString();
                });
            }
            else {
                AjaxErrorManager.Gerer("Erreur lors de la lecture des fiches. " + datas.err_msg);
            }
        })
        .error(function () {
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture des fiches.");
        });

    // Appel la liste des agents;
    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        $scope.lesAgents = listeAgents;
        $scope.projets.cp = $cookieStore.get("agent");

        if($cookieStore.get("status") !== "Agent")
        {
            $scope.lesAgents.forEach(function (val) {
                if((val.habilitation === "Agent" && val.secteur === $cookieStore.get("secteur")) || val.cp === $cookieStore.get("agent"))
                {
                    $scope.agentsDpx.push(val);
                }
            });

            $scope.projets.cp = $routeParams.idUser;
        }


    });

    $scope.projets.AddPointage = function () {
        if (_verifDatasPointage() !== 0)
            return;

        $scope.projets.isLoading = true;

        var dataPtg = _getDatasForPointage();

        PointageFactoryCSharp.add(dataPtg)
            .success(function (datas) {
                $scope.projets.isLoading = false;

                if (datas.exit_code === 1) {
                    DatasDJS.reload++;

                    if($scope.fiche.selected === undefined)
                        document.querySelector("#projectAutocompleteInput>div>input").value = "";

                    document.querySelector("#ficheAutocompleteInput>div>input").value = "";

                    CheckModalDjs.CheckGetModal(dataPtg);

                    $route.reload();
                }
                else {
                    AjaxErrorManager.Gerer("Erreur lors de la création du pointage. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.projets.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de création de pointage.");
            });
    };

    $scope.projets.getTempsRestant = function () {
        if ($scope.projets.DatePointage === undefined || $scope.projets.DatePointage === "")
            return;

        var l_now = Date.setDateFR($scope.projets.DatePointage),
            l_numSemaine = l_now.getWeekNumber();

        DAL_DJS.LireDJS({
                cp: $scope.projets.cp,
                annee: l_now.getFullYear(),
                semaine: l_numSemaine
            })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    for (var jour in datas.djs.lesJours) {
                        //RECHERCHE DU JOUR CORRESPONDANT
                        if (l_now.toLocaleFormat().indexOf(jour.toLowerCase()) === 0){
                            $scope.projets.DureeMinutes = datas.djs.lesJours[jour].minutesRestantes;
                            break;
                        }
                    }
                }
                else{
                    if (datas.err_msg === "La DJS n'existe pas.")
                        AjaxErrorManager.Gerer("Votre DJS n'est pas créée pour cette date.");
                }
            });
    };

    /*$scope.$watch("DatasProjets.liste", function (newVal, oldVal) {
        $scope.projets.datas.liste = DatasProjets.liste.filter(function (val) {
            return val.type === "projet" || val.type === "";
        });

        $scope.ProjetModalService.list = $scope.projets.datas.liste;
    });*/

    $scope.$watchCollection("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.projets.selectedProject = newVal;
    });

    $scope.$watch("fiche.selected", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.projets.selectedProject = {title : newVal.description.projet};
    });



    /**
     * VÉRIFIE LE POINTAGE À ENVOYER
     * @returns {number} - le nombre d'erreur
     * @private
     */
    var _verifDatasPointage = function () {
        var l_cptErr = 0;

        if ($scope.projets.selectedProject === "" || $scope.projets.selectedProject === undefined){
            $scope.projets.errProj = true;
            AjaxErrorManager.Gerer("Veuillez saisir un projet.");
            l_cptErr++;
        }else{
            $scope.projets.errProj = false;
        }

        if ($scope.projets.TravailRealise === undefined ||$scope.projets.TravailRealise.trim() === ""){
            $scope.projets.errDesc = true;
            AjaxErrorManager.Gerer("Veuillez saisir une description.");
            l_cptErr++;
        }else{
            $scope.projets.errDesc = false;
        }

        if($scope.projets.DureeMinutes === undefined || $scope.projets.DureeMinutes % 3 !== 0) {
            $scope.projets.errDuree = true;
            AjaxErrorManager.Gerer("Veuillez saisir un temps en minute qui est un multiple de 3.");
            l_cptErr++;
        }else{
            $scope.projets.errDuree = false;
        }

        if ($scope.projets.DatePointage.trim() === ""){
            $scope.projets.errDate = true;
            AjaxErrorManager.Gerer("Veuillez saisir une date.");
            l_cptErr++;
        }else{
            $scope.projets.errDate = false;
        }

        if ($scope.projets.DatePointage2.trim() !== "" && $scope.projets.DatePointage.trim() !== ""){
            var l_dateDeb = Date.setDateFR($scope.projets.DatePointage),
                l_dateFin = Date.setDateFR($scope.projets.DatePointage2);

            l_dateDeb.setHours(0,0,0,0);
            l_dateFin.setHours(0,0,0,0);

            var dateMax = angular.copy(l_dateDeb);
            dateMax.setDate(dateMax.getDate() + (5 - dateMax.getDay()));

            if (l_dateDeb.getTime() > l_dateFin.getTime()){
                $scope.projets.errDate2 = true;
                AjaxErrorManager.Gerer("La date de fin est antérieure à la date début");
                l_cptErr++;
            }
            else if(l_dateFin.getTime() > dateMax.getTime())
            {
                $scope.projets.errDate2 = true;
                AjaxErrorManager.Gerer("La date de fin doit etre dans la meme semaine que la date de début");
                l_cptErr++;
            }
            else{
                $scope.projets.errDate2 = false;
            }
        }
        else{
            $scope.projets.errDate2 = false;
        }

        return l_cptErr
    };

    /**
     * RETOURNE LES DONNÉES À ENVOYER À L'API
     * @returns {[{}]}
     * @private
     */
    var _getDatasForPointage = function () {
        var l_tab = [],
            l_date = Date.setDateFR($scope.projets.DatePointage),
            l_date2 = Date.setDateFR($scope.projets.DatePointage2);

        l_date.setHours(12,0,0,0);
        l_date2.setHours(12,0,0,0);

        if (l_date2.toString() === "Invalid Date" || l_date.getTime() === l_date2.getTime()){
            var obj = {
                nomPrenom: $scope.lesAgents.filter(function (val) {
                    return val.cp === $scope.projets.cp;
                })[0].nomPrenom,
                cp: $scope.projets.cp,
                commentaire: $scope.projets.TravailRealise.trim(),
                projet: $scope.projets.selectedProject.title,
                val_projet: DatasProjets.liste.filter(function (val) {
                    return val.intitule === $scope.projets.selectedProject.title;
                })[0].guid,
                duree: parseInt($scope.projets.DureeMinutes, 10),
                date: l_date,
                cpActeur : $cookieStore.get("agent")
            };

            if($scope.fiche.selected !== undefined)
            {
                obj.idFiche = $scope.fiche.selected.description._id;
                obj.numero = $scope.fiche.selected.description.numero;
                obj.anneeFiche = $scope.fiche.selected.description.annee;
            }
            l_tab.push (obj);
        }
        else{
            var l_dateFor = new Date(l_date),
                l_dayInter = (l_date2.getTime() - l_date.getTime())/1000/60/60/24;

            for (var i = 0; i <= l_dayInter; i++) {
                //ON N'ENVOIE PAS LES SAMEDI ET LES DIMANCHE
                if (l_dateFor.getDay() !== 6 && l_dateFor.getDay() !== 0){
                    var obj = {
                        nomPrenom: $scope.lesAgents.filter(function (val) {
                            return val.cp === $scope.projets.cp;
                        })[0].nomPrenom,
                        cp: $scope.projets.cp,
                        commentaire: $scope.projets.TravailRealise.trim(),
                        projet: $scope.projets.selectedProject.title,
                        val_projet: DatasProjets.liste.filter(function (val) {
                            return val.intitule === $scope.projets.selectedProject.title;
                        })[0].guid,
                        duree: parseInt($scope.projets.DureeMinutes, 10),
                        date: new Date(l_dateFor),
                        cpActeur : $cookieStore.get("agent")
                    };

                    if($scope.fiche.selected !== undefined)
                    {
                        obj.idFiche = $scope.fiche.selected.description._id;
                        obj.numero = $scope.fiche.selected.description.numero;
                        obj.anneeFiche = $scope.fiche.selected.description.annee;
                    }
                    l_tab.push (obj);
                }

                l_dateFor.setDate(l_dateFor.getDate() + 1);
            }
        }

        return l_tab;
    };
}]);

ngAriane.controller("ModalProjets", ["$scope", "ProjetModalService", function ($scope, ProjetModalService) {
    $scope.modalprojets = {
        modal: ProjetModalService
    };

    /**
     * ASSIGNE LA VALEUR CLIQUÉE AU SERVICE ET FERME LA MODALE
     * @param {Object} projet - le projet cliqué
     */
    $scope.clickProj = function (projet) {
        //FORMATAGE DE L'OBJET
        $scope.modalprojets.modal.model = projet;
        $('#ProjetsModal').modal('hide');
    };
}]);