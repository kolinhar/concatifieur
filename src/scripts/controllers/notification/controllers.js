/**
 * Created by PRJS12821 on 30/09/2015.
 */
"use strict";

ngAriane.controller("Notifications", ["$scope", "NotifierService", "$timeout", "AjaxErrorManager", "$cookieStore", "DateService", function ($scope, NotifierService, $timeout, AjaxErrorManager, $cookieStore, DateService) {
    $scope.NotifierService = NotifierService;
    $scope.cookieStore = $cookieStore;

    $scope.DateService = DateService;

    $scope.notifications = {
        cp: $cookieStore.get("agent"),
        annee: new Date().getFullYear()
    };

    if (!("Notification" in window)) {
        AjaxErrorManager.Gerer("Votre navigateur ne gère pas les notifications.");
        NotifierService.isOk = false;
    }
    else{
        if (Notification.permission === "granted"){
            NotifierService.isOk = true;
        }
        else{
            if (Notification.permission !== "denied"){
                Notification.requestPermission(function (permission) {
                    if (permission === "granted")
                        NotifierService.isOk = true;
                });
            }
            else{
                NotifierService.isOk = false;
            }
        }
    }
}]);

ngAriane.controller("listeNotifs", ["$scope", "$timeout", "NotifierService", "NotificationFactory", "AjaxErrorManager", "$cookieStore", "$routeParams", "CPtoNAME", "DatasAgents", function ($scope, $timeout, NotifierService, NotificationFactory, AjaxErrorManager, $cookieStore, $routeParams, CPtoNAME, DatasAgents) {
    $scope.NotifListe = [];
    $scope.NotifierService = NotifierService;
    $scope.routeParams = $routeParams;
    $scope.dicoAgents = {};

    /**
     * RÉCUPÈRE LES NOTIFICATIONS DU L'UTILISATEUR
     * @private
     */
    var _getNotifs = function () {
        $scope.isLoading = true;

        $timeout(function () {
            //RÉSOLUTION DE CP SI LE CP EN ROUTE NE CORRESPOND PAS À CELUI DU COOKIE
            if ($routeParams.cp !== $cookieStore.get("agent"))
                CPtoNAME.GetFullName($routeParams.cp, function (nom) {
                    $scope.nomAgent = nom;
                });
            else
                $scope.nomAgent = undefined;

            NotificationFactory.List($routeParams.cp)
                .success(function (datas) {
                    $scope.isLoading = false;

                    if (datas.exit_code === 1) {
                        //SUPPRESSION DES NOTIFICATIONS DANS LA TOP BARRE
                        NotifierService.list = [];

                        if (datas.agent.notification !== undefined) {

                            DatasAgents.liste.forEach(function (val) {
                                $scope.dicoAgents[val.cp] = val;
                            });

                            $scope.NotifListe = datas.agent.notification.reverse().map(function (val) {
                                var ret = {};

                                switch (val.Event) {
                                    case "creation":
                                        ret.header = "Création de fiche";
                                        ret.body = "La fiche N°" + val.numFiche + " a été créée.";
                                        ret.link = "#/fiche/" + val.annee + "/" + val.numFiche;
                                    break;
                                    case "affectation":
                                        ret.header = "Affectation de fiche";
                                        ret.body = "La fiche N°" + val.numFiche + " vous a été affectée le ";
                                        ret.link = "#/fiche/" + val.annee + "/" + val.numFiche;
                                        ret.date = val.dateAffectation;
                                    break;
                                    case "verrouillage":
                                        ret.header = "Verrouillage de journée";
                                        ret.body = "La journée du " + new Date(val.dateJourneeVerrouiller).getDateFR() + " de l'agent " + $scope.dicoAgents[val.cpAgentVerrouiller].nomPrenom + " a été verrouillé le ";
                                        ret.link = "#/pointages/" + val.cpAgentVerrouiller + "/" + new Date(val.dateJourneeVerrouiller).getDateFR().replace(new RegExp("/", 'g'), "-");
                                        ret.date = val.dateAffectation;
                                    break;
                                    case "signalagePtg":
                                        ret.header = "Pointage invalide";
                                        ret.body = "Un pointage du " + new Date(val.dateJourneeVerrouiller).getDateFR() + " a été signalé comme invalide le ";
                                        ret.link = "#/pointages/" + val.cpAgentVerrouiller + "/" + new Date(val.dateJourneeVerrouiller).getDateFR().replace(new RegExp("/", 'g'), "-");
                                        ret.date = val.dateAffectation;
                                    break;
                                    case "cloture":
                                        ret.header = "Cloture de fiche";
                                        ret.body = "La fiche N°" + val.numFiche + " a été clôturée.";
                                        ret.link = "#/fiche/" + val.annee + "/" + val.numFiche;
                                    break;
									case "enquete":
                                        ret.header = "Enquête satisfaction";
                                        ret.body = "La fiche N°" + val.numFiche + " a reçu une note de " + val.moyenne + "/5.";
                                        ret.link = "#/fiche/" + val.annee + "/" + val.numFiche;
                                }

                                return ret;
                            }).slice(0, 20);
                        }
                    }
                    else {
                        AjaxErrorManager.Gerer("Erreur lors de la lecture d'historique de notification. " + datas.err_msg);
                    }
                })
                .error(function () {
                    $scope.isLoading = false;
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande d'historique de notification.");
                });
        }, 200);
    };

    _getNotifs();

    //MISE À JOUR DU TABLEAU EN CAS DE NOUVELLE NOTIFICATION
    $scope.$watchCollection("NotifierService.list", function(newCollection, oldCollection){
        if (newCollection === undefined || newCollection.length === 0)
            return;

        //ON NE MET À JOUR QUE S'IL S'AGIT DE NOTIFICATION QUE LE VUE LISTE: LES AFFECTATIONS
        if (newCollection[newCollection.length -1].header.indexOf("Affectation") !== -1)
            _getNotifs();
    });
}]);