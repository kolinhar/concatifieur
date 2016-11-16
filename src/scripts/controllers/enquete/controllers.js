/**
 * Created by PRJS12821 on 18/05/2016.
 */
"use strict";
ngAriane.controller("EnqueteCtrl", ["$scope", "$routeParams", "enqueteService", "EnqueteFactory", function ($scope, $routeParams, enqueteService, EnqueteFactory) {
    $scope.routeParams = $routeParams;

    $scope.enquetectrl = {
        table: enqueteService
    };

    enqueteService.datas = {};
    EnqueteFactory.getEnqueteByYear($routeParams.annee);
    EnqueteFactory.getCommentaireEnquete($routeParams.annee);
    EnqueteFactory.getQuestionEnquete();
}]);

ngAriane.controller("NoteFiche", ["$scope","$routeParams", "EnqueteFactory", "enqueteService", function ($scope, $routeParams, EnqueteFactory, enqueteService) {
    $scope.notefiche = {
        datas: enqueteService
    };
}]);

ngAriane.controller("EnqueteCommentaire", ["$scope","$routeParams", "EnqueteFactory", "enqueteService", function ($scope, $routeParams, EnqueteFactory, enqueteService) {
    $scope.enquetecommentaire = {
        datas: enqueteService
    };
}]);

ngAriane.controller("EnqueteQuestions", ["$scope","$routeParams", "EnqueteFactory", "enqueteService", function ($scope, $routeParams, EnqueteFactory, enqueteService) {
    $scope.questionenquete = {
        datas: enqueteService
    };
}]);

ngAriane.controller("EnqueteForm", ["$scope", "$routeParams", "enqueteFormService", "EnqueteFactory", "AjaxErrorManager", function ($scope, $routeParams, enqueteFormService, EnqueteFactory, AjaxErrorManager) {
    $scope.routeParams = $routeParams;

    $scope.enqueteform = {
        form: enqueteFormService,
        addQuestion: function(){
            enqueteFormService.datas.questionnaires[enqueteFormService.datas.questionnaires.length-1].Questions.push({
                Titre:"",
                Note:0
            });
        },
        removeQuestion: function(index) {
            AjaxErrorManager.Infos = {
                title: "Confirmation",
                msg: ["Êtes-vous sûr de vouloir supprimer cette question ?"],
                Confirm: function () {
                    enqueteFormService.datas.questionnaires[enqueteFormService.datas.questionnaires.length-1].Questions.splice(index,1);
                }
            };
        },
        createQuestionnaire: function() {
            // Check toutes les entrées
            // puis Appel à la factory
            if (enqueteFormService.check(enqueteFormService.datas.questionnaires[enqueteFormService.datas.questionnaires.length-1].Questions))
                EnqueteFactory.createQuestionnaire(enqueteFormService.getDatas(enqueteFormService.datas.questionnaires[enqueteFormService.datas.questionnaires.length-1].Questions));
            else {
                AjaxErrorManager.Gerer("Veuillez saisir correctement les questions.");
            }
        }
    };

    enqueteFormService.datas = {};
    EnqueteFactory.getFormByYear($routeParams.annee);
}]);

ngAriane.controller("FormsCtrl", ["$scope", "$routeParams", "enqueteService", "enqueteFormService", "EnqueteFactory", "AjaxErrorManager", "$cookieStore", function ($scope, $routeParams, enqueteService, enqueteFormService, EnqueteFactory, AjaxErrorManager, $cookieStore){
    if ($cookieStore.get("status") !== "DU")
        return;

    $scope.enqueteService = enqueteService;
    $scope.routeParams = $routeParams;

    $scope.formsctrl = {
        Year: new Date().getFullYear().toString()
    };

    enqueteService.forms = [];
    EnqueteFactory.getForms($routeParams.annee);

    $scope.formsctrl.AddForm = function () {
        enqueteService.forms.forEach(function (val) {
            val.show = false;
        });

        enqueteService.forms.push({
            Questions: [{
                Libelle: ""
            }],
            actif: false,
            show: true,
            check: false,
            dateCreate: new Date(),
            dateUpdate: null,
            isNewForm: true
        });
    };

    /**
     * AJOUTE UNE QUESTION AU FORMULAIRE EN MODE CRÉATION
     */
    $scope.formsctrl.AddQuestion = function () {
        $scope.enqueteService.forms[$scope.enqueteService.forms.length - 1].Questions.push({Libelle: ""});
    };

    /**
     * SUPPRIME UNE QUESTION AU FORMULAIRE EN MODE CRÉATION
     * @param {number} indix - l'index où se situe la question
     * @constructor
     */
    $scope.formsctrl.RemoveQuestion = function (indix) {
        $scope.enqueteService.forms[$scope.enqueteService.forms.length - 1].Questions.splice(indix, 1);
    };

    /**
     * CRÉÉ UN NOUVEAU FORMULAIRE
     * @param {number} indix - l'index où se situe le formulaire
     * @constructor
     */
    $scope.formsctrl.CreateForm = function (indix) {
        if (enqueteFormService.checkDatas($scope.enqueteService.forms[indix]) === true)
            EnqueteFactory.createQuestionnaire(enqueteFormService.getDatas($scope.enqueteService.forms[indix]), indix);
    };

    $scope.formsctrl.UpdateForm = function (indix) {
        if (enqueteFormService.checkDatas($scope.enqueteService.forms[indix]) === true)
            EnqueteFactory.updateQuestionnaire(enqueteFormService.getDatas($scope.enqueteService.forms[indix]));
    };
}]);