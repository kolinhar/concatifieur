/**
 * Created by PRJS12821 on 12/02/2015.
 */
"use strict";

ngAriane.controller("GestionProjets", ["$scope", "$route", "$cookieStore", "ProjetFactoryCSharp","AjaxErrorManager", function ($scope, $route, $cookieStore, ProjetFactoryCSharp, AjaxErrorManager) {

    $scope.GestionProjets = {
        Liste : [],
        ShowSelect : [],
        HideBtn : []
    };

    ProjetFactoryCSharp.Lire()
        .success(function (datas) {
            if (datas.exit_code === 1) {
                $scope.GestionProjets.Liste = datas.LPrestations;
                $scope.GestionProjets.Liste.forEach(function (projet) {
                    if(projet.different_agadir)
                        $scope.GestionProjets.theIsDifferent = true;
                });
            }
            else {
                //$scope.ficheagadir.isLoading = false;

                AjaxErrorManager.Gerer("Erreur lors de la lecture de la fiche." + datas.err_msg);
            }
        })
        .error(function () {
            //$scope.ficheagadir.isLoading = false;
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de fiche");
        });

    ProjetFactoryCSharp.NomencsLire()
        .success(function (datas) {
            if (datas.exit_code === 1) {
                $scope.GestionProjets.NomencsListe = datas.LNomenclatures;
            }
            else {
                //$scope.ficheagadir.isLoading = false;

                AjaxErrorManager.Gerer("Erreur lors de la lecture de la fiche." + datas.err_msg);
            }
        })
        .error(function () {
            //$scope.ficheagadir.isLoading = false;
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de fiche");
        });

    $scope.GestionProjets.Show = function(index)
    {
        $scope.GestionProjets.ShowSelect[index] = true;
    };

    $scope.GestionProjets.Update = function(projet)
    {
        $scope.GestionProjets.NomencsListe.forEach(function (nomenc) {
            if(nomenc.val_nomenclature === projet.val_nomenclature)
            {
                projet.nomenclature = nomenc.nomenclature;
                projet.prestation = nomenc.prestation;
                projet.val_prestation = nomenc.val_prestation;
            }
        });

        ProjetFactoryCSharp.Update(projet)
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    $.notify("Modification effectuée !", "success");
                }
                else {
                    AjaxErrorManager.Gerer("Erreur lors de la modification du projet." + datas.err_msg);
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification du projet.");
            });
    };

    $scope.GestionProjets.UpdateType = function(projet, oldType)
    {

        console.log(projet.nomenclature);
        if((oldType !== "projet" && projet.type === "projet") || (projet.nomenclature !== "" && projet.nomenclature !== null && projet.nomenclature !== undefined))
        {
            ProjetFactoryCSharp.Update(projet)
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        $.notify("Modification effectuée !", "success");
                    }
                    else {
                        AjaxErrorManager.Gerer("Erreur lors de la modification du projet." + datas.err_msg);
                    }
                })
                .error(function () {
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification du projet.");
                });
        }
    };

    $scope.GestionProjets.UpdateVue = function(projet)
    {
        projet.different_agadir = false;
        ProjetFactoryCSharp.Update(projet)
            .success(function (datas) {
                if (datas.exit_code === 0) {
                    projet.different_agadir = true;
                    AjaxErrorManager.Gerer("Erreur lors de la modification du projet." + datas.err_msg);
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification du projet.");
            });
    };
}]);
