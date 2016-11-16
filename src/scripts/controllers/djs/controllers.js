/**
 * Created by PRJS12821 on 24/06/2015.
 */
ngAriane.controller("DjsManager", ["$scope", "$route", "$routeParams", "$cookieStore", "CPtoNAME", "DAL_DJS", "AjaxErrorManager", "DatasDJS", function ($scope, $route, $routeParams, $cookieStore, CPtoNAME, DAL_DJS, AjaxErrorManager, DatasDJS) {
    var l_date = new Date();
    l_date.setHours(0,0,0,0);

    $scope.djsmanager = {
        isLoading: true,
        user: {
            cp: "",
            nomAgent: ""
        },
        numSemaine: $routeParams.numSemaine || l_date.getWeekNumber(),
        annee: $routeParams.annee || l_date.getFullYear(),
        lesJours: {
            Lundi: {minutesRestantes: undefined, minutesTotal: undefined, err: false},
            Mardi: {minutesRestantes: undefined, minutesTotal: undefined, err: false},
            Mercredi: {minutesRestantes: undefined, minutesTotal: undefined, err: false},
            Jeudi: {minutesRestantes: undefined, minutesTotal: undefined, err: false},
            Vendredi: {minutesRestantes: undefined, minutesTotal: undefined, err: false},
            Samedi: {minutesRestantes: undefined, minutesTotal: undefined, err: false},
            Dimanche: {minutesRestantes: undefined, minutesTotal: undefined, err: false}
        },
        completed: false,
        processing: false,
        void: false
    };

    /**
     * RECUPERE LA DJS
     * @private
     */
    var _getDjs = function () {
        DAL_DJS.LireDJS({
            cp: $scope.djsmanager.user.cp,
            annee: new Date().getFullYear(),
            semaine: $scope.djsmanager.numSemaine
        })
            .success(function (datas) {
                $scope.djsmanager.isLoading = false;

                var l_ecart = 0;

                if (datas.exit_code === 1){
                    $scope.djsmanager._id = datas.djs._id;
                    $scope.djsmanager.valider = datas.djs.valider;

                    $scope.djsmanager.lesJours = datas.djs.lesJours

                    for (var jour in datas.djs.lesJours) {
                        $scope.djsmanager.lesJours[jour].minutesTotalH = $scope.djsmanager.lesJours[jour].minutesTotal / 60;

                        l_ecart += datas.djs.lesJours[jour].minutesRestantes;
                    }

                    if (l_ecart === 0){
                        $scope.djsmanager.completed = true;
                    }
                    else{
                        $scope.djsmanager.processing = true;
                    }
                }
                else
                {
                    AjaxErrorManager.Gerer("Erreur lors de la lecture de la djs. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.djsmanager.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de DJS.");
            });
    };


    $scope.djsmanager.enreg = function () {

        $scope.djsmanager.isLoading = true;

        DAL_DJS.LireDJS({
                cp: $scope.djsmanager.user.cp,
                annee: $scope.djsmanager.annee,
                semaine: $scope.djsmanager.numSemaine
            })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    datas.djs.cpActeur = $cookieStore.get("agent");
                    delete datas.djs.verrouiller;
                    delete datas.djs.cloturer;
                    delete datas.djs.valider;

                    for (var jour in datas.djs.lesJours) {
                        datas.djs.lesJours[jour].minutesTotal = $scope.djsmanager.lesJours[jour].minutesTotalH * 60;
                    }

                    DAL_DJS.ModificationDJS([datas.djs])
                        .success(function (datas) {
                            if (datas.exit_code !== 1)
                            {
                                AjaxErrorManager.Gerer("Erreur lors de la modification de la djs." + datas.err_msg);
                            }
                            else
                            {
                                DatasDJS.reload++;
                            }

                        })
                        .error(function () {
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de la djs.");
                        })
                        .then(function () {
                            $scope.djsmanager.isLoading = false
                        });
                }
                else {
                    console.log("N'a pas pu checker la djs");
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de modification de la djs.");
            });

       /* $("#DjsModal").modal('hide');*/
    };

    //SI PAS D'INFO DANS L'URL, ON UTILISE L'UTILISATEUR CONNECTÉ
    if ($routeParams.idUser === undefined) {
        if ($cookieStore.get("agent") === undefined || $cookieStore.get("nomAgent") === undefined)
            return;

        $scope.djsmanager.user.cp = $cookieStore.get("agent");
        $scope.djsmanager.user.nomAgent = $cookieStore.get("nomAgent");

        _getDjs();
    }
    else {
        $scope.djsmanager.user.cp = $routeParams.idUser;

        if ($scope.djsmanager.user.cp === undefined)
            return;

        CPtoNAME.GetFullName($scope.djsmanager.user.cp, function (name) {
            $scope.djsmanager.user.nomAgent = name;

            _getDjs();
        });
    }
}]);

ngAriane.controller("Djs3S", ["$scope", "DAL_DJS", "AjaxErrorManager", "$routeParams", "djsCounter", "$location", "WorkersDJSs", "DIURLAPI", "$timeout", "DatasAgents","$cookieStore","$route", "DatasDJS", "AgadirDominator", function ($scope, DAL_DJS, AjaxErrorManager, $routeParams, djsCounter, $location, WorkersDJSs, DIURLAPI, $timeout, DatasAgents, $cookieStore, $route, DatasDJS, AgadirDominator) {
    $scope.djs3s = {
        DatasAgents: DatasAgents,
        isLoading: true,
        djsTotal: {
            secteurs: {}
        },
        djsCounter: djsCounter,
        datesListe: [],
        agentsSecteur: {},
        agentsByName: {},
        lesDjsEnCour : {
            list: [],
            isLoading: true
        }
    };


    $scope.infoAgent = {
        cp : $cookieStore.get("agent"),
        status : $cookieStore.get("status"),
        secteur : $cookieStore.get("secteur")
    };

    $scope.djs3s.getValidationSecteur = function(secteur)
    {
        return secteur[Object.keys(secteur)[0]];
    };

    $scope.djs3s.isSecteurCloture = function(secteur)
    {
        var isAllCloture = true;
        for(var djsDunAgent in secteur)
        {
            if(secteur[djsDunAgent] === null || secteur[djsDunAgent].cloturer !== true)
            {

                isAllCloture = false;
                break;
            }
        }

        return isAllCloture;
    };

    $scope.djs3s.verrouillerCloturerDjs = function(action, djs){
        $scope.djs3s.lesDjsEnCour.isLoading = true;
        DAL_DJS.LireDJS({
                cp: djs.cp,
                annee: djs.annee,
                semaine: djs.semaine
            })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    datas.djs.cpActeur = $cookieStore.get("agent");
                    if(action === "verrouiller")
                    {
                        datas.djs.verrouiller = djs.verrouiller;
                        delete datas.djs.cloturer;
                        delete datas.djs.valider;

                        for (var jour in datas.djs.lesJours)
                        {
                            datas.djs.lesJours[jour].verrouiller = djs.verrouiller;
                        }
                    }
                    else
                    {
                        datas.djs.cloturer = djs.cloturer;
                        delete datas.djs.verrouiller;
                        delete datas.djs.valider;

                        for (var jour in datas.djs.lesJours)
                        {
                            datas.djs.lesJours[jour].cloturer = djs.cloturer;
                        }
                    }

                    DAL_DJS.ModificationDJS([datas.djs])
                        .success(function (datas) {
                            if (datas.exit_code !== 1)
                            {
                                //$scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[l_date.getDay()]].verrouiller = false;
                                AjaxErrorManager.Gerer("Erreur lors de la mise a jour de la DJS." + datas.err_msg);
                            }

                        })
                        .error(function () {
                            console.warn(arguments);
                            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise a jour de la DJS.");
                        })
                        .then(function () {
                            $scope.djs3s.lesDjsEnCour.isLoading = false;
                            $route.reload();
                            DatasDJS.reload++;
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

    $scope.djs3s.validerSecteur = function(sect){
        var lesDjsAValider = [];
        for(var lesDjsDunAgent in sect)
        {
            var lesDjs = JSON.parse(JSON.stringify(sect[lesDjsDunAgent]));
            if(lesDjs !== null)
                lesDjsAValider.push(lesDjs);
        }
        lesDjsAValider.forEach(function(djs){
            delete  djs.verrouiller;
            delete  djs.cloturer;
            delete  djs.lesJours;
            djs.valider = !djs.valider;
            djs.cpActeur = $scope.infoAgent.cp;
        });

        $scope.djs3s.isLoading = true;
        DAL_DJS.ModificationDJS(lesDjsAValider)
            .success(function (datas) {
                $scope.djs3s.isLoading = false;
                if (datas.exit_code === 1)
                {
                    for(var lesDjsDunAgent in sect)
                    {
                        sect[lesDjsDunAgent].valider = !sect[lesDjsDunAgent].valider;
                    }
                }
                else
                {
                    AjaxErrorManager.Gerer("Erreur lors de la mise à jour de la DJS. " + datas.err_msg);
                }
            })
            .error(function () {
                $scope.djs3s.isLoading = false;
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de DJS.");
            });
    };

    //ON UTILISE LES PARAMÈTRES DE L'URL
    djsCounter.setDate(Date.setWeekNumber($routeParams.annee, $routeParams.numSemaine));

    //CALCUL DES DIFFÉRENTES DATES
    var l_dateDeb = new Date(djsCounter.dateDeb);
    //l_dateDeb.setDate(l_dateDeb.getDate() - 7);
    $scope.djs3s.datesListe.push(l_dateDeb);

    for (var i = 1; i < 7; i++) {
        var l_datePlus = new Date(l_dateDeb);
        l_datePlus.setDate(l_dateDeb.getDate() + i);
        l_datePlus.setHours(0,0,0,0);

        if (l_datePlus.getDay() !== 6 && l_datePlus.getDay() !== 0)
            $scope.djs3s.datesListe.push(l_datePlus);/*
        if (l_datePlus.getDay() === 6)
            $scope.djs3s.datesListe.push("Verr.");
        if (l_datePlus.getDay() === 0)
            $scope.djs3s.datesListe.push("Clot.");*/
    }

    //ASSOCIATION CP/SECTEUR,NOMPRENOM
    $scope.$watchCollection("djs3s.DatasAgents.liste", function (newVal, oldVal) {
        if (DatasAgents.liste === undefined || DatasAgents.liste.length === 0)
            return;

        for (var i = 0; i < DatasAgents.liste.length; i++) {
            $scope.djs3s.agentsSecteur[DatasAgents.liste[i].cp] = {
                secteur: DatasAgents.liste[i].secteur,
                nomPrenom: DatasAgents.liste[i].nomPrenom
            };

            $scope.djs3s.agentsByName[DatasAgents.liste[i].nomPrenom] = {
                cp: DatasAgents.liste[i].cp
            };

            if(($scope.infoAgent.status === "Encadrement" && DatasAgents.liste[i].secteur === $scope.infoAgent.secteur) || $scope.infoAgent.status === "DU")
            {
                if($scope.djs3s.djsTotal.secteurs[DatasAgents.liste[i].secteur] === undefined && DatasAgents.liste[i].secteur !== null)
                    $scope.djs3s.djsTotal.secteurs[DatasAgents.liste[i].secteur] = {};
                if(DatasAgents.liste[i].secteur !== null)
                    $scope.djs3s.djsTotal.secteurs[DatasAgents.liste[i].secteur][DatasAgents.liste[i].nomPrenom] = null;
            }


        }

        //QUAND ON EST SÛR D'AVOIR LA LISTE DES AGENTS, ON LANCE L'APPEL AJAX
        //_getAjax();
        _GetLesDjs($routeParams.numSemaine, $routeParams.annee);

    });

    /**
     * FORMATE L'OBJET DU TABLEAU À AFFICHER
     * @param {Object} val - valeur courante
     * @param {number} ind - indice courant
     * @param {Array} arr - tableau courant
     * @param {number} position - position de la semaine dans le tableau
     * @private
     */
    var _mapObj = function (val, ind, arr, position) {

        if ($scope.djs3s.agentsSecteur[val.cp] !== undefined && $scope.djs3s.agentsSecteur[val.cp].secteur !== null){

            if(($scope.djs3s.agentsSecteur[val.cp].secteur === $scope.infoAgent.secteur && $scope.infoAgent.status === "Encadrement") || $scope.infoAgent.status === "DU")
            {
                $scope.djs3s.djsTotal.secteurs[$scope.djs3s.agentsSecteur[val.cp].secteur][$scope.djs3s.agentsSecteur[val.cp].nomPrenom] = {
                    lesJours: _reMapDjs(val.lesJours),
                    cp: val.cp,
                    annee : val.annee,
                    semaine : val.semaine,
                    verrouiller: val.verrouiller,
                    cloturer : val.cloturer,
                    valider : val.valider,
                    _id : val._id
                };
            }
        }
    };

    /**
     * FORMATE LA DJS PASSÉE EN PARAMÈTRE
     * @param {Object} djsR - une djs formatée en minutes
     * @returns {Object} - la djs formatée en heures
     * @private
     */
    var _reMapDjs = function (lesJours) {
        var l_lesJours = {};
        //COPIE D'OBJET
        for (var jourName in lesJours) {
            if (jourName !== "Samedi" && jourName !== "Dimanche")
                l_lesJours[jourName] = lesJours[jourName];
        }

        for (var jour in l_lesJours) {
            var l_valueH = (l_lesJours[jour].minutesRestantes/60).toString();
            var l_str = l_valueH.split(".");

            if (l_str.length === 2) {
                if (l_str[1].length<2)
                    l_str[1] += "0";
                else
                    l_str[1] = l_str[1].substring(0,2);

                l_valueH = l_str[0].toString() + "h" + _AffZero(Math.ceil((parseInt(l_str[1], 10) * 60) / 100));
            }
            else
                l_valueH += "h00";

            l_lesJours[jour].heuresRestantes = l_valueH;
        }

        return [l_lesJours.Lundi,
            l_lesJours.Mardi,
            l_lesJours.Mercredi,
            l_lesJours.Jeudi,
            l_lesJours.Vendredi
        ];
    };

    var _GetLesDjs = function (semaine, annee){
        DAL_DJS.LireLesDJS(semaine, annee)
            .success(function (datas) {
                $scope.djs3s.lesDjsEnCour.isLoading = false;
                if (datas.exit_code === 1)
                {
                    $scope.djs3s.lesDjsEnCour.list = datas.lesDjs;

                    $scope.djs3s.lesDjsEnCour.list.forEach(function (val, ind, arr) {
                        _mapObj(val, ind, arr, 1);
                    });
                }
                else
                {
                    AjaxErrorManager.Gerer("Erreur lors de la lecture des DJS. " + datas.err_msg);
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de DJS.");
            });

        if($route.current.$$route.originalPath.indexOf('check') !== -1)
        {
            AgadirDominator.LireLesDJS(semaine, annee)
                .success(function (datas) {
                    $scope.djs3s.lesDjsEnCour.isLoading = false;
                    if (datas.exit_code === 1)
                    {
                        for (var cp in datas.lesDjs) {
                            for (var sect in $scope.djs3s.djsTotal.secteurs) {
                                for (var agent in $scope.djs3s.djsTotal.secteurs[sect]) {
                                    if($scope.djs3s.djsTotal.secteurs[sect][agent].cp === cp)
                                    {
                                        $scope.djs3s.djsTotal.secteurs[sect][agent].lesJours.forEach(function (jour, ind) {
                                            if(jour.minutesRestantes === datas.lesDjs[cp][ind])
                                                jour.sameAgadir = true;
                                        })
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        AjaxErrorManager.Gerer("Erreur lors de la lecture des DJS. " + datas.err_msg);
                    }
                })
                .error(function () {
                    console.warn(arguments);
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de DJS.");
                });
        }

    }

}]);