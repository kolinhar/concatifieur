/**
 * Created by PRJS12821 on 03/09/2015.
 */
"use strict";

ngAriane.controller("pointagesJournee", ["$scope", "DatasPtgJour", "CPtoNAME", "$route", "$routeParams", "AjaxErrorManager", "$cookieStore", "DAL_POINTAGE", "AgentsADFactory", "DatasDJS", "DatasProjets", "$timeout", "VerifDatasNuitAstreinte", "ModalPointageNuitAstreinte", "ProjetModalService", "PointageFactoryCSharp", "DAL_DJS","JoursName", "FctValidationDpx", "SignalrRequest", "AgadirDominator", "dateFilter", function ($scope, DatasPtgJour, CPtoNAME, $route, $routeParams, AjaxErrorManager, $cookieStore, DAL_POINTAGE, AgentsADFactory, DatasDJS, DatasProjets, $timeout, VerifDatasNuitAstreinte, ModalPointageNuitAstreinte, ProjetModalService, PointageFactoryCSharp, DAL_DJS, JoursName, FctValidationDpx, SignalrRequest, AgadirDominator, dateFilter) {
    $scope.datas = {
        fiche: {}
    };
    $scope.cookieStore = $cookieStore;

    $scope.projets = ProjetModalService;

    $scope.ProjetModalService = ProjetModalService;
    $scope.habilitation = $cookieStore.get("status");

    $scope.pointagesjournee = {};
    $scope.URLButton = "views/nuitAstreinte/buttonModifier.html";

    $scope.routeParams = $routeParams;

    $scope.djs = {};

    $scope.jourSemaine = [];

    $scope.JoursName = JoursName;

    $scope.ptgjour = {
        datas: DatasPtgJour,
        agentName: "",
        isLoading: true
    };

    $scope.ptgjour.datePointage = Date.setDateFR($routeParams.datePointage);

    var GetJourSuivantPrecedent = function (apresOuAvent) {
        var l_date = Date.setDateFR($routeParams.datePointage);
        l_date.setDate(l_date.getDate() + apresOuAvent);
        l_date = l_date.getDateFR().replace(new RegExp("/", 'g'), "-");

        return l_date;
    };


    $scope.jourSuivant = GetJourSuivantPrecedent(+1);
    $scope.jourPrecedent = GetJourSuivantPrecedent(-1);

    $scope.filtreProjetAstreinte = function () {
            ProjetModalService.list = DatasProjets.liste;
            ProjetModalService.model = "";
        document.querySelector("#projectAutocompleteInput4>div>input").value = "";
    };

    $scope.filtreProjetGeneral = function () {
        ProjetModalService.list = DatasProjets.liste.filter(function (val) {
            return val.type === "projet" || val.type === "";
        });
        ProjetModalService.model = "";
        document.querySelector("#projectAutocompleteInput>div>input").value = "";
    };

    $scope.filtreProjetNuit = function () {

            ProjetModalService.list = ProjetModalService.list.filter(function (val) {
                return val.intitule === "Temps d'insuffisance de service (TI)";
            });
        ProjetModalService.model = "";
        document.querySelector("#projectAutocompleteInput5>div>input").value = "";
    };

    var GetJourSemaine = function () {
        var l_date = angular.copy($scope.ptgjour.datePointage);
        var day = l_date.getDay(),
            diff = l_date.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        l_date.setDate(diff);

        for(var i = 0; i<7;i++)
        {
            $scope.jourSemaine[i] = {date : "", dateFr : ""};
            $scope.jourSemaine[i].date = angular.copy(l_date);
            $scope.jourSemaine[i].dateFr = angular.copy(l_date).getDateFR().replace(new RegExp("/", 'g'), "-");
            l_date.setDate(l_date.getDate() + 1);
        }
    };

    GetJourSemaine();

    CPtoNAME.GetFullName($routeParams.idUser, function (name) {
        $scope.ptgjour.agentName = name;
    });

    var l_date = Date.setDateFR($routeParams.datePointage);
    l_date.setHours(12,0,0,0);

    $scope.verrouillerJournee = function(){

        DAL_DJS.LireDJS({
                cp: $routeParams.idUser,
                annee: l_date.getFullYear(),
                semaine: l_date.getWeekNumber()
            })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    datas.djs.cpActeur = $cookieStore.get("agent");
                    delete datas.djs.verrouiller;
                    delete datas.djs.cloturer;
                    delete datas.djs.valider;
                    $scope.djs = datas.djs;
                    $scope.isVerrouiller = $scope.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller;
                    datas.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = true;

                    DAL_DJS.ModificationDJS([datas.djs])
                        .success(function (datas) {
                            if (datas.exit_code !== 1)
                            {
                                //$scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = false;
                                AjaxErrorManager.Gerer("Erreur lors du verrouillage de la journée." + datas.err_msg);
                            }
                            else
                            {
                                DatasDJS.reload++;
                                $scope.isVerrouiller = !$scope.isVerrouiller;

                                FctValidationDpx.NotifierDpx($routeParams.idUser, l_date);

                            }

                        })
                        .error(function () {
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de verrouillage de la journée.");
                        });
                }
                else {
                    console.log("N'a pas pu checker la djs");
                }
            });
    };

    $scope.cloturerJournee = function(){

        $scope.ptgjour.isLoading = true;

        DAL_DJS.LireDJS({
                cp: $routeParams.idUser,
                annee: l_date.getFullYear(),
                semaine: l_date.getWeekNumber()
            })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    datas.djs.cpActeur = $cookieStore.get("agent");
                    delete datas.djs.verrouiller;
                    delete datas.djs.cloturer;
                    delete datas.djs.valider;
                    $scope.djs = datas.djs;
                    datas.djs.lesJours[JoursName.joursName[l_date.getDay()]].cloturer = !$scope.isCloturer;

                    DAL_DJS.ModificationDJS([datas.djs])
                        .success(function (datas) {
                            if (datas.exit_code !== 1)
                            {
                                //$scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = false;
                                AjaxErrorManager.Gerer("Erreur lors du cloture de la journée." + datas.err_msg);
                            }
                            else
                            {
                                DatasDJS.reload++;
                            }

                        })
                        .error(function () {
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de cloture de la journée.");
                        })
                        .then(function () {
                            $scope.ptgjour.isLoading = true;
                            $route.reload();
                        });
                }
                else {
                    console.log("N'a pas pu checker la djs");
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de cloture de la journée.");
            });


    };

    $scope.deVerrouillerJournee = function(callback){

        DAL_DJS.LireDJS({
                cp: $routeParams.idUser,
                annee: l_date.getFullYear(),
                semaine: l_date.getWeekNumber()
            })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    datas.djs.cpActeur = $cookieStore.get("agent");
                    delete datas.djs.verrouiller;
                    delete datas.djs.cloturer;
                    delete datas.djs.valider;
                    $scope.djs = datas.djs;
                    $scope.isVerrouiller = $scope.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller;
                    datas.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = false;

                    DAL_DJS.ModificationDJS([datas.djs])
                        .success(function (datas) {
                            if (datas.exit_code !== 1)
                            {
                                //$scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = false;
                                AjaxErrorManager.Gerer("Erreur lors du verrouillage de la journée." + datas.err_msg);
                            }
                            else
                            {
                                DatasDJS.reload++;
                                $scope.isVerrouiller = !$scope.isVerrouiller;

                                callback && callback();

                            }

                        })
                        .error(function () {
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de verrouillage de la journée.");
                        });
                }
                else {
                    console.log("N'a pas pu checker la djs");
                }
            });
    };

    $scope.showModSignalPtg = function (lePtg) {

        $scope.modalSignalPtg = lePtg;
        $scope.modalSignalPtg.commentaire = "";

        $("#modal-signal-pointage").modal();
    };

    $scope.signalPtg = function () {

        $scope.ptgjour.isLoading = true;

        $scope.deVerrouillerJournee(function () {
            $("#modal-signal-pointage").modal("hide");


            PointageFactoryCSharp.upd({
                    _id: $scope.modalSignalPtg._id,
                    idFiche: $scope.modalSignalPtg.idFiche,
                    nomPrenom: $cookieStore.get("nomAgent"),
                    cp: $cookieStore.get("agent"),
                    commentaire: $scope.modalSignalPtg.nature,
                    projet: $scope.modalSignalPtg.projet,
                    val_projet: $scope.modalSignalPtg.val_projet,
                    duree: parseInt($scope.modalSignalPtg.dureeMinute, 10),
                    date: l_date,
                    numero: $scope.modalSignalPtg.nFiche,
                    anneeFiche: $scope.modalSignalPtg.annee,
                    commentaireSignalement : $scope.modalSignalPtg.commentaire,
                    signaler : true
                })
                .success(function (datas) {
                    $scope.ptgjour.isLoading = false;

                    if (datas.exit_code === 1) {
                        DatasDJS.reload++;
                        $route.reload();
                        SignalrRequest.SignalementPtg($scope.modalSignalPtg.cp, $scope.modalSignalPtg.date);
                    }
                    else {
                        AjaxErrorManager.Gerer("Erreur lors de la modification du pointage. " + datas.err_msg);
                    }
                })
                .error(function () {
                    $scope.ptgjour.isLoading = false;
                    $("#modal-pointage").modal("hide");
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de pointage.");
                });
        });
    };

    $scope.cloturerPtg = function (ptg) {
        PointageFactoryCSharp.cloture([{
                _id: ptg._id,
                cpActeur: $cookieStore.get("agent"),
                cloturer : ptg.cloturer,
                cp : ptg.cp,
                date : ptg.date
            }])
            .success(function (datas) {
                $scope.ptgjour.isLoading = false;

                if (datas.exit_code === 1) {
                    DatasDJS.reload++;
                    var mustClotureJournee = true;
                    $scope.datas.pointages.forEach(function (ptg) {
                        if(ptg.cloturer == false)
                            mustClotureJournee = false;
                    });

                    DAL_DJS.LireDJS({
                            cp: $routeParams.idUser,
                            annee: l_date.getFullYear(),
                            semaine: l_date.getWeekNumber()
                        })
                        .success(function (datas) {
                            if (datas.exit_code === 1) {
                                datas.djs.cpActeur = $cookieStore.get("agent");
                                delete datas.djs.verrouiller;
                                delete datas.djs.cloturer;
                                delete datas.djs.valider;
                                $scope.djs = datas.djs;

                                if(datas.djs.lesJours[JoursName.joursName[l_date.getDay()]].cloturer !== mustClotureJournee)
                                {
                                    datas.djs.lesJours[JoursName.joursName[l_date.getDay()]].cloturer = mustClotureJournee;

                                    DAL_DJS.ModificationDJS([datas.djs])
                                        .success(function (datas) {
                                            if (datas.exit_code !== 1)
                                            {
                                                //$scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = false;
                                                AjaxErrorManager.Gerer("Erreur lors du verrouillage de la journée." + datas.err_msg);
                                            }
                                            else
                                            {
                                                DatasDJS.reload++;
                                                $scope.isCloturer = !$scope.isCloturer;
                                            }

                                        })
                                        .error(function () {
                                            console.warn(arguments);
                                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de verrouillage de la journée.");
                                        })
                                }
                            }
                            else {
                                console.log("N'a pas pu checker la djs");
                            }
                        });

                }
                else {
                    ptg.cloturer = !ptg.cloturer;
                    AjaxErrorManager.Gerer("Erreur lors de la modification du pointage. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.ptgjour.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de pointage.");
            });
    };

    $scope.AddPtgAgadir = function (ptg) {
        $scope.ptgjour.isLoading = true;
        AgadirDominator.CPtg({duree : ( ptg.duree.getHours() * 60 + ptg.duree.getMinutes()),
            cpAgent : ptg.cp,
            datePointage: ptg.date,
            numFiche: ptg.nFiche,
            val_projet : ptg.val_projet,
            libProjet : ptg.projet,
            description : ptg.nature,
            anneeFiche : ptg.annee,
            before : true,
            guid : ptg._id,
            idFiche : ptg.idFiche})
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    $route.reload();
                }
                else {
                    $scope.ptgjour.isLoading = false;
                    AjaxErrorManager.Gerer("Erreur lors de la creation du pointage." + datas.message);
                }
            }).error(function () {
            $scope.ptgjour.isLoading = false;
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de creation de pointage.");
        });

    };

    DAL_DJS.LireDJS({
            cp: $routeParams.idUser,
            annee: l_date.getFullYear(),
            semaine: l_date.getWeekNumber()
        })
        .success(function (datas) {
            if (datas.exit_code === 1) {
                $scope.djs = datas.djs;
                console.log($scope.djs);

                $scope.isVerrouiller = $scope.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller;
                $scope.isCloturer = $scope.djs.lesJours[JoursName.joursName[l_date.getDay()]].cloturer;
                console.log($scope.djs.lesJours[JoursName.joursName[l_date.getDay()]].cloturer);
                $scope.isJourneeCompleted = $scope.djs.lesJours[JoursName.joursName[l_date.getDay()]].minutesRestantes <= 0;
            }
            else {
                console.log("N'a pas pu checker la djs");
            }
        });

    PointageFactoryCSharp.read({
            cp: $routeParams.idUser,
            date: l_date
        })
        .success(function (datas) {

            if (datas.exit_code === 1) {

                $scope.datas.pointages = [];

                $scope.totalPtg = 0;

                    datas.lesPointages.filter(function (val) {
                    return val.isAstreinte === false;
                }).forEach(function (ptg) {
                    $scope.datas.pointages.push({
                        agent: ptg.nomPrenom,
                        cp: ptg.cp,
                        projet: ptg.projet,
                        val_projet : ptg.val_projet,
                        nFiche: (ptg.isNuit === false ? ptg.numero || undefined : undefined),
                        nMongo : ptg.numeroMongo,
                        idFiche: ptg.idFiche || undefined,
                        nature: ptg.commentaire,
                        date: ptg.date,
                        dureeMinute: ptg.duree,
                        duree: new Date(0,0,0,0,ptg.duree,0,0),
                        annee: (ptg.isNuit === false ? ptg.anneeFiche || undefined : undefined),
                        dateDebut: ptg.dateDebut,
                        dateFin: ptg.dateFin,
                        _id : ptg._id,
                        isNuit: ptg.isNuit,
                        signaler : ptg.signaler,
                        cloturer : ptg.cloturer
                    });

                    $scope.datas.pointages[$scope.datas.pointages.length - 1].nFiche !== undefined && ($scope.datas.fiche[ptg.idFiche] = {}, $scope.datas.fiche[ptg.idFiche].isCloture = ptg.isCloture || false);

                    $scope.totalPtg += ptg.duree;
                });

                $scope.totalPtg = new Date(0,0,0,0,$scope.totalPtg,0,0);

                if($route.current.$$route.originalPath.indexOf('check') !== -1)
                {
                    AgadirDominator.LirePtg(
                        $routeParams.idUser,
                        $routeParams.datePointage
                        )
                        .success(function (datas) {
                            $scope.ptgjour.isLoading = false;
                            if (datas.exit_code === 1) {

                                $scope.datas.pointagesAgadir = datas.lesPointages;

                                $scope.datas.pointagesAll = [];


                                if($scope.datas.pointagesAgadir.length >= $scope.datas.pointages.length)
                                {
                                    $scope.datas.pointagesAgadir.forEach(function (ptgAga) {
                                        var obj = {ptgAga : ptgAga, ptgAri : null};
                                        $scope.datas.pointages.forEach(function (ptgAri) {

                                            if(ptgAga._id !== undefined && ptgAri._id.trim() === ptgAga._id.trim())
                                            {
                                                if(ptgAga.projet.trim().indexOf(ptgAri.projet.trim()) !== -1 && dateFilter(ptgAri.duree, "HH'h'mm") === ptgAga.temps.trim() && IgnoreAccents(ptgAri.nature.trim()) === IgnoreAccents(ptgAga.nature.trim()))
                                                {
                                                    obj.isSame = true;

                                                    obj.ptgAri = ptgAri;
                                                }
                                                else
                                                {
                                                    obj.ptgAri = ptgAri;
                                                }
                                            }

                                        });
                                        $scope.datas.pointagesAll.push(obj)
                                    });
                                }
                                else
                                {
                                    $scope.datas.pointages.forEach(function (ptgAri) {
                                        var obj = {ptgAga : null, ptgAri : ptgAri};
                                        $scope.datas.pointagesAgadir.forEach(function (ptgAga) {

                                            if(ptgAga._id !== undefined && ptgAri._id.trim() === ptgAga._id.trim())
                                            {
                                                if(ptgAga.projet.trim().indexOf(ptgAri.projet.trim()) !== -1 && dateFilter(ptgAri.duree, "HH'h'mm") === ptgAga.temps.trim() && IgnoreAccents(ptgAri.nature.trim()) === IgnoreAccents(ptgAga.nature.trim()))
                                                {
                                                    obj.isSame = true;

                                                    obj.ptgAga = ptgAga;
                                                }
                                                else
                                                {
                                                    obj.ptgAga = ptgAga;
                                                }
                                            }


                                        });
                                        $scope.datas.pointagesAll.push(obj)
                                    });
                                }
                            }
                            else {
                                AjaxErrorManager.Gerer("Erreur lors de la lecture des pointages agadir. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.ptgjour.isLoading = false;
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture des pointages.");
                        });
                }
                else
                {
                    $scope.ptgjour.isLoading = false;
                }

            }
            else {
                $scope.ptgjour.isLoading = false;
                AjaxErrorManager.Gerer("Erreur lors de la lecture des pointages. " + datas.err_msg);
            }
        })
        .error(function () {
            $scope.ptgjour.isLoading = false;
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture des pointages.");
        });

    /**
     * UTILISATION DE NOM D'OBJET 'ficheagadir' POUR FAIRE FONCTIONNER CORRECTEMENT LA VUE DE LISTE DES POINTAGES
     */
    $scope.ficheagadir = {
        Projects: ProjetModalService,
        DelPointage: function (ptg) {
            AjaxErrorManager.Infos = {
                title: "Confirmation",
                msg: ["Êtes-vous sûr de vouloir supprimer ce pointage ?"],
                Confirm: function () {
                    $scope.ptgjour.isLoading = true;

                    PointageFactoryCSharp.del({_id: ptg._id, cp: $cookieStore.get("agent")})
                        .success(function (datas) {
                            $scope.ptgjour.isLoading = false;

                            if (datas.exit_code === 1) {
                                DatasDJS.reload++;
                                $route.reload();
                            }
                            else {
                                $scope.ptgjour.isLoading = false;
                                AjaxErrorManager.Gerer("Erreur lors de la suppression du pointage. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.ptgjour.isLoading = false;

                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la suppression du pointage.");
                        });
                }
            };
        },
        showModPtg: function (ptg) {
            //POINTAGE PROJET ET FICHE
            if (ptg.nFiche === undefined)
                ProjetModalService.list = DatasProjets.liste.filter(function (val) {
                    return val.type === "projet" || val.type === "";
                });
            else
                ProjetModalService.list = DatasProjets.liste.filter(function (val) {
                    return val.type === "fiche" || val.type === "";
                });

            $scope.modal = {
                nature: ptg.nature,
                date: new Date(ptg.date).getDateFR(),
                selectedProject: DatasProjets.liste.filter(function (val) {
                    return val.intitule === ptg.projet;
                })[0],
                dureeMinute: ptg.dureeMinute,
                projet: ptg.projet,
                nFiche: ptg.nFiche,
                annee: ptg.annee,
                idFiche: ptg.idFiche,
                fiche: (ptg.nFiche !== undefined),
                _id : ptg._id
            };
        },
        UpdPointage: function () {
            var l_err = 0;
            var postDatas = {};

            if ($scope.modal.nature === undefined || $scope.modal.nature.trim() === ""){
                $scope.modal.errDesc = true;
                l_err++;
            }
            else
                $scope.modal.errDesc = false;

            if ($scope.modal.dureeMinute === undefined || $scope.modal.dureeMinute % 3 !== 0){
                $scope.modal.errDuree = true;
                l_err++;
            }
            else
                $scope.modal.errDuree = false;

            if ($scope.modal.date === undefined || $scope.modal.date.trim() === "") {
                $scope.modal.errDate = true;
                l_err++;
            }
            else
                $scope.modal.errDate = false;

            if ($scope.modal.selectedProject === undefined){
                $scope.modal.errProj = true;
                l_err++;
            }
            else
                $scope.modal.errProj = false;

            if (l_err !== 0)
                return;

            //@HACK: CONFLIT AVEC BOOTSTRAP AU NIVEAU DE L'UI POUR LA DISPARITION DE LA MODAL DE POINTAGE
            $("#modal-pointage").modal('hide');

            $scope.ptgjour.isLoading = true;

            if ($scope.modal.nFiche === undefined){
                //POINTAGE PROJET
                $timeout(function () {
                    var l_date = Date.setDateFR($scope.modal.date);
                    l_date.setHours(12,0,0,0);

                    PointageFactoryCSharp.upd({
                            _id: $scope.modal._id,
                            nomPrenom: $cookieStore.get("nomAgent"),
                            cp: $cookieStore.get("agent"),
                            commentaire: $scope.modal.nature,
                            projet: $scope.modal.selectedProject.title,
                            val_projet: DatasProjets.liste.filter(function (val) {
                                return val.intitule === $scope.modal.selectedProject.title;
                            })[0].guid,
                            duree: parseInt($scope.modal.dureeMinute, 10),
                            date: l_date
                        })
                        .success(function (datas) {
                            $scope.ptgjour.isLoading = false;

                            if (datas.exit_code === 1) {
                                DatasDJS.reload++;
                                $route.reload();
                            }
                            else {
                                AjaxErrorManager.Gerer("Erreur lors de la modification du pointage. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.ptgjour.isLoading = false;
                            $("#modal-pointage").modal("hide");
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de pointage.");
                        });
                }, 200);
            }
            else {
                //POINTAGE SUR FICHE
                $timeout(function () {
                    var l_date = Date.setDateFR($scope.modal.date);
                    l_date.setHours(12,0,0,0);

                    PointageFactoryCSharp.upd({
                            _id: $scope.modal._id,
                            idFiche: $scope.modal.idFiche,
                            nomPrenom: $cookieStore.get("nomAgent"),
                            cp: $cookieStore.get("agent"),
                            commentaire: $scope.modal.nature,
                            projet: $scope.modal.selectedProject.intitule,
                            val_projet: $scope.modal.selectedProject.guid,
                            duree: parseInt($scope.modal.dureeMinute, 10),
                            date: l_date,
                            numero: $scope.modal.nFiche,
                            anneeFiche: $scope.modal.annee
                        })
                        .success(function (datas) {
                            if (datas.exit_code === 1) {

                                //console.log("ModificationPointage", datas);
                                $scope.ptgjour.isLoading = false;

                                DatasDJS.reload++;
                                $route.reload();
                            }
                            else {
                                $scope.ptgjour.isLoading = false;
                                AjaxErrorManager.Gerer("Erreur lors de la mise à jour du pointage. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            console.warn(arguments);
                            $scope.ptgjour.isLoading = false;
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de pointage.");
                        });
                }, 200);
            }
        }
    };

    /**
     * FONCTION ÉXÉCUTÉE QUAND ON SÉLÉCTIONNE UNE VALEUR DANS UN DATETIMEPICKER
     * CAR SINON L'INPUT GARDE LE FOCUS ET ON NE PEUT PAS CLIQUER SUR LE BOUTON
     * DE VALIDATION SANS RÉAFFICHER LE DERNIER DATETIMEPICKER UTILISÉ
     */
    $scope.blurInput = function () {
        this.$node.blur();
    };

    $scope.pointagesjournee.showModPtg = function (ptg) {
        //POINTAGE NUIT
        ProjetModalService.list = DatasProjets.liste.filter(function (val) {
            return val.intitule === "Temps d'insuffisance de service (TI)";
        });

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
            TravailRealise: ptg.nature,
            dateDebut: l_dateDeb.getDateFR(),
            dateFin: l_dateFin.getDateFR(),
            heureDebut: l_heureDeb,
            heureFin: l_heureFin,
            _id : ptg._id
        };

        ModalPointageNuitAstreinte.pointage = $scope.pointage;

        ModalPointageNuitAstreinte.UpdPointage = function (){
            if (VerifDatasNuitAstreinte.FromForm($scope.pointage) === true && VerifDatasNuitAstreinte.DateTime($scope.pointage) === true){
                var l_datedeb = Date.setDateFR($scope.pointage.dateDebut),
                    l_datefin = Date.setDateFR($scope.pointage.dateFin),
                    l_heuredeb = new Date($scope.pointage.heureDebut),
                    l_heurefin = new Date($scope.pointage.heureFin);

                l_datedeb.setHours(l_heuredeb.getHours(), l_heuredeb.getMinutes(), 0, 0);
                l_datefin.setHours(l_heurefin.getHours(), l_heurefin.getMinutes(), 0, 0);

                $("#modal-pointage-nuit-astreinte").modal('hide');

                $scope.ptgjour.isLoading = true;

                //POINTAGE NUIT
                $timeout(function () {
                    var l_dateRef = new Date(l_datedeb);
                    l_dateRef.setHours(12,0,0,0);

                    PointageFactoryCSharp.upd({
                            _id: $scope.pointage._id,
                            nomPrenom: $cookieStore.get("nomAgent"),
                            cp: $cookieStore.get("agent"),
                            commentaire: $scope.pointage.TravailRealise.trim(),
                            projet: $scope.pointage.selectedProject.title,
                            val_projet: DatasProjets.liste.filter(function (val) {
                                return val.intitule === $scope.pointage.selectedProject.title;
                            })[0].guid,
                            duree: parseInt((l_datefin.getTime() - l_datedeb.getTime()) / 60000, 10),
                            date: l_dateRef,
                            dateDebut: l_datedeb,
                            dateFin: l_datefin,
                            isAstreinte: false,
                            isNuit: true
                        })
                        .success(function (datas) {
                            $scope.ptgjour.isLoading = false;
                            if (datas.exit_code === 1){
                                DatasDJS.reload++;
                                $route.reload();
                            }
                            else{
                                AjaxErrorManager.Gerer("Erreur lors de la modification de votre pointage de nuit. " + datas.err_msg);
                            }
                        })
                        .error(function () {
                            $scope.ptgjour.isLoading = false;
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification d'un pointage de nuit.");
                        });
                }, 500);
            }
        };

        //@HACK: SINON LA VUE N'A PAS LE TEMPS DE SE METTRE À JOUR
        $timeout(function () {
            //@HACK:  SUPPRESSION DE ":00.000" DANS L'AFFICHAGE DE L'HEURE PARCE QUE ÇA A ÉTÉ CODÉ À L'ARRACH'
            document.getElementById("timepicker2").value = document.getElementById("timepicker2").value.split(":00.000")[0];
            document.getElementById("timepicker1").value = document.getElementById("timepicker1").value.split(":00.000")[0];
        }, 100);
    };

    $scope.$watch("ProjetModalService.model", function (newVal, oldVal) {
        if (newVal === undefined)
            return;

        $scope.modal && ($scope.modal.selectedProject = newVal);
    })
}]);
