/**
 * Created by PRJS12821 on 19/05/2016.
 */
"use strict";

ngAriane.factory("EnqueteFactory", ["$http", "enqueteService", "enqueteFormService", "AjaxErrorManager", "DIURLAPI", function ($http, enqueteService, enqueteFormService, AjaxErrorManager, DIURLAPI) {
    return {
        add: function (datas) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "create",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: datas
            });
        },
        getEnqueteByYear: function (annee) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "enquete/" + annee,
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1 || datas.colNumber === 0)
                        enqueteService.datas = datas;
                    else
                        AjaxErrorManager.Gerer("Erreur lors de la récupération de l'enquête satisfaction. " + datas.err_msg);
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR, le serveur n'a pas pu traiter votre demande de récupération de l'enquête satisfaction.");
                });
        },
        getNoteByFiche: function (annee, numFiche) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "ariane/" + annee + "/" + numFiche,
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1){
                        enqueteService.fiche = {
                            EnqueteSatisfaction: datas.EnqueteSatisfaction,
                            QuestionsTitle: "Note: " + datas.Note + "/5\nDétails:\n" + datas.EnqueteSatisfaction.Questions.map(function (val) {
                                return val.Note + "/5 : " + val.Libelle;
                            }).join('\n'),
                            Note: datas.Note,
                            Commentaire: datas.EnqueteSatisfaction.Commentaire.trim() !== '' ? 'Commentaire:\n' + datas.EnqueteSatisfaction.Commentaire : undefined,
                            Libelle: "L'utilisateur n'a pas souhaité remplir l'enquête."
                        };
                    }
                    else{
                        if (datas.err_msg.indexOf("Aucune note") !== 0){
                            AjaxErrorManager.Gerer("Erreur lors de la récupération de la note de la fiche. " + datas.err_msg);
                        }
                        else{
                            enqueteService.fiche = {
                                EnqueteSatisfaction: null,
                                Note: null
                            };
                        }
                    }
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de récupération de note de la fiche.");
                })
        },
        getQuestionEnquete: function () {
            return $http({
                url: DIURLAPI.URLapiEnquete + "enquete/questions",
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1){
                        enqueteService.questions = {
                            Questions: datas.questions
                        };
                    }
                    else{
                        if (datas.err_msg.indexOf("Aucune note") !== 0){
                            AjaxErrorManager.Gerer("Erreur lors de la récupération des questions de l'enquête. " + datas.err_msg);
                        }
                        else{
                            enqueteService.questions = {
                                Questions: null,
                            };
                        }
                    }
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de récupération de commentaire d'enquête.");
                })
        },
        getCommentaireEnquete: function (annee) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "enquete/" + annee + "/" + "commentaire",
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1){
                        enqueteService.fiche = {
                            Commentaires: datas.commentaires,
                            CommentaireTitle: "Libelle: \n" + datas.commentaires.map(function (val) {
                                return val.libelle + "/5 : " + val.nombre;
                            }).join('\n'),
                            NombreRepondu: datas.nbRepondu,
                            NombreAttenteReponse: datas.nbEnAttenteReponse,
                            NombreTotal: datas.nbTotal,
                            NombreNonRenseigne: datas.nbNonRenseigne,
                            NombreInferieurMoyenne: datas.nbInferieurMoyenne
                        };
                    }
                    else{
                        if (datas.err_msg.indexOf("Aucune note") !== 0){
                            AjaxErrorManager.Gerer("Erreur lors de la récupération des commentaires de l'enquête. " + datas.err_msg);
                        }
                        else{
                            enqueteService.fiche = {
                                EnqueteSatisfaction: null,
                                Note: null
                            };
                        }
                    }
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de récupération de commentaire d'enquête.");
                })
        },
        getFormByYear: function (annee) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "questionnaire/" + annee,
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1)
                        enqueteFormService.datas = datas;
                    else
                        AjaxErrorManager.Gerer("Erreur lors de la récupération du questionnaire. " + datas.err_msg);
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR, le serveur n'a pas pu traiter vorte demande de récupération du questionnaire.");
                });
        },
        createQuestionnaire: function (dataForm, indix) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "questionnaire/create",
                data: dataForm,
                method:"post",
                headers:{
                    'Content-Type': 'application/json'
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        datas.questionnaire.show = true;
                        datas.questionnaire.check = datas.questionnaire.actif;

                        if (datas.questionnaire.actif === true)
                            enqueteService.forms.forEach(function (val) {
                                val.actif = false;
                            });

                        enqueteService.forms[indix] = datas.questionnaire;
                    }
                    else
                        AjaxErrorManager.Gerer("Erreur lors de la création du questionnaire. " + datas.err_msg);
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR, le serveur n'a pas pu traiter vorte demande de création du questionnaire.");
                });
        },
        updateQuestionnaire: function (dataForm) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "questionnaire/update",
                data: dataForm,
                method:"post",
                headers:{
                    'Content-Type': 'application/json'
                },
                responseType: "json"
            })
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        datas.questionnaire.show = true;
                        datas.questionnaire.check = datas.questionnaire.actif;

                        if (datas.questionnaire.actif === true)
                            enqueteService.forms.forEach(function (val) {
                                val.actif = false;
                            });

                        enqueteService.forms.forEach(function (val, ind, arr) {
                            if (val._id === datas.questionnaire._id) {
                                arr[ind] = datas.questionnaire;
                            }
                        });
                    }
                    else
                        AjaxErrorManager.Gerer("Erreur lors de la création du questionnaire. " + datas.err_msg);
                })
                .error(function () {
                    AjaxErrorManager.Gerer("ERREUR, le serveur n'a pas pu traiter vorte demande de création du questionnaire.");
                });

        },
        getForms: function (annee) {
            return $http({
                url: DIURLAPI.URLapiEnquete + "questionnaire/" + annee,
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "json"
            }).success(function (datas) {
                if (datas.exit_code === 1) {
                    enqueteService.forms = datas.questionnaires.map(function (val, ind, arr) {
                        val.show = val.actif;
                        val.check = val.actif;
                        return val;
                    });
                }
                else
                    AjaxErrorManager.Gerer("Erreur lors de la récupération des formulaires. " + datas.err_msg);
            }).error(function () {
                AjaxErrorManager.Gerer("ERREUR, le serveur n'a pas pu traiter votre demande de récupération des formulaires.");
            })
        }
    };
}]);