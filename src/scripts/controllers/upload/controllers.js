/**
 * Created by PRJS12821 on 08/09/2015.
 */
"use strict";

ngAriane.controller("FileUploader", ["$scope", "FileUploadService", "AjaxErrorManager", "$routeParams", "UploadFatcory", "$timeout", "FileListFiche", function ($scope, FileUploadService, AjaxErrorManager, $routeParams, UploadFatcory, $timeout, FileListFiche) {
    $scope.fileuploader = {
        isLoading: false,
        fileList: []
    };

    $scope.fileuploader.upload = function () {
        $scope.fileuploader.isLoading = true;

        var FileList = document.querySelector("#inputFile1").files;

        if (FileList.length === 0){
            AjaxErrorManager.Gerer("Aucun fichier séléctionné.");
            $scope.fileuploader.isLoading = false;
            return;
        }

        $timeout(function () {
            var filetab = [];

            for (var i = 0; i < FileList.length; i++) {
                filetab.push(FileList[i]);
            }

            $scope.fileuploader.UploadFiles(filetab, function () {
                document.querySelector("#inputFile1").value = "";
                $scope.fileuploader.isLoading = false;
                FileListFiche.Request++;
            });
        }, 500);
    };

    /**
     * FONTCION RÉCURSIVE D'UPLOAD DE FICHIERS POUR UNE FICHE
     * LES APPELS SONT DIFFÉRÉS D'UNE SECONDE SINON LE SERVEUR À DU MAL À SUIVRE
     * @param {Array} fileTab
     * @param {Function} callback
     */
    $scope.fileuploader.UploadFiles = function (fileTab, callback) {
        if (fileTab.length > 0){
            //TRAITEMENT NORMAL
            var l_file = fileTab.shift();

            UploadFatcory.UploadFileInfos({
                FileName: l_file.name,
                nFiche: $routeParams.numFiche,
                annee: parseInt($routeParams.annee, 10)
            })
                .success(function (datasInfos) {
                    if (datasInfos.exit_code === 1){
                        UploadFatcory.UploadFileDatas(datasInfos.idFile, l_file)
                            .success(function (datasFile) {
                                if (datasFile.exit_code === 1){
                                    //COOL!
                                }
                                else{
                                    AjaxErrorManager.Gerer("Erreur lors de l'envoie du fichier '" + l_file.name + "'. " + datasFile.err_msg);
                                }
                            })
                            .error(function () {
                                console.warn(arguments);
                                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de téléversement de fichier.");
                            });
                    }
                    else{
                        AjaxErrorManager.Gerer("Erreur lors de l'envoi des informations relative au fichier '" + l_file.name + "'. " + datasInfos.err_msg);
                    }

                    $timeout(function () {
                        $scope.fileuploader.UploadFiles(fileTab, callback);
                    }, 1000);
                })
                .error(function () {
                    $scope.fileuploader.isLoading = false;
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de téléversement de fichier.");
                    $timeout(function () {
                        $scope.fileuploader.UploadFiles(fileTab, callback);
                    }, 1000);
                });
        }
        else{
            //FIN
            callback && callback();
        }
    };
}]);

ngAriane.controller("FileLister", ["$scope", "FileUploadService", "AjaxErrorManager", "$routeParams", "UploadFatcory", "$timeout", "FileListFiche", function ($scope, FileUploadService, AjaxErrorManager, $routeParams, UploadFatcory, $timeout, FileListFiche) {
    $scope.filelister = {
        isLoading: true,
        FileListFiche: FileListFiche
    };

/*    $scope.filelister.GetFileList = function (annee, numFiche) {
        UploadFatcory.GetFileList({
            numFiche: numFiche,
            annee: annee
        })
            .success(function (datas) {
                $scope.filelister.isLoading = false;
                /!*
                 if (datas.exit_code === 1) {
                 *!/
                $scope.filelister.fileList = datas;
                FileListFiche.ListeFichiers = datas;
                /!*                    }
                 else {
                 AjaxErrorManager.Gerer("Erreur lors de la lecture des fichiers joints. " + datas.err_msg);
                 }*!/
            })
            .error(function () {
                $scope.filelister.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter vote demande de lecture des fichiers joints.");
            });
    };

    $timeout(function () {
        $scope.filelister.GetFileList($routeParams.annee, $routeParams.numFiche);
    }, 500);

    $scope.$watch("filelister.FileListFiche.Request", function (newVal, oldVal) {
        if (newVal === oldVal)
            return;

        $scope.filelister.GetFileList($routeParams.annee, $routeParams.numFiche);
    });*/
}]);