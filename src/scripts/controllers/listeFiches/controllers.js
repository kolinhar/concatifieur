"use strict";

ngAriane.controller("cyclesPirge", ["DIURLAPI", "$scope", "$http", "DISemaine", "DIDateref", "DISemaines", "$location", "$routeParams", "$route", function (DIURLAPI, $scope, $http, DISemaine, DIDateref, DISemaines, $location, $routeParams, $route) {
    /**DATE DU JOUR (RÉFÉRENCE)*/
    var date = new Date();

    $scope.cyclesPirge = {
        Cycles: [],
        dates: {},
        date: DIDateref,
        dateRef: date,
        anneeRef: parseInt($routeParams.annee, 10) || new Date().getFullYear(),
        cyclesSemaines: {},
        modelParams : $routeParams,

        //@TODO : À REMPLACER PAR DES LIENS POUR FAIRE DU FULL DEEP LINK
        CyclePrec: "",
        CycleSuiv: "",

        l_data: {},
        dataCycles: {},
        idCycleEnCours: 0,
        iduser: ariane.cookie.agent,
        numSemaine: DISemaine,
        semaineToCycle: {}
    };

    $scope.cyclesPirge.numSemaine.numSemaine = parseInt($routeParams.numSemaine, 10) || 0;

    /**
     * TRAITE LES DONNÉES DES CYCLES RÉCEPTIONNÉES POUR LES DÉTAILLER EN JOURS DE LA SEMAINE
     * @param ajaxDatas {Array}
     * @returns {Object}
     * @private
     */
    var _traitementCycle = function (ajaxDatas) {
        var ret = {};
        $scope.cyclesPirge.dates = {};

        ajaxDatas.forEach(function (val, ind, arr) {
            var l_datedeb = ParseDate(val.date_debut),
                l_dateTrav = ParseDate(val.date_debut),
                l_datefin = ParseDate(val.date_fin);

            $scope.cyclesPirge.dates[val.n_semaine] = {
                dateDeb: l_datedeb,
                dateFin: l_datefin
            };

            ret[val.n_semaine] = [];

            while (l_dateTrav.getTime() <= l_datefin.getTime()){
                ret[val.n_semaine].push(new Date(l_dateTrav));

                l_dateTrav.setDate(l_dateTrav.getDate()+1);
            }
        });

        return ret;
    };

    /**
     * RÉCUPÈRE LE CYCLE PIRGE EN FONCTION D'UNE DATE
     * @param datePath {String} : date au format "jj-mm-aaaa"
     * @private
     */
    var _getCyclePirge = function (datePath) {
        if (!datePath)
            return;

        $http({url: DIURLAPI.URLapi + "pirge/cycle/" + datePath.getDateFR().replace(/\//g, "-"), method: "GET", responseType: "json", params: { format: "json" }})
            .success(function (data) {
                $scope.cyclesPirge.Cycles = data;
            })
            .error(function () {
                alert("ERREUR lors de la récupération des cycles PIRGE");
                console.log(arguments);
            })
            .then(function () {
                $scope.cyclesPirge.cyclesSemaines = _traitementCycle($scope.cyclesPirge.Cycles);
                DISemaines.cyclesSemaines = $scope.cyclesPirge.cyclesSemaines;

                /**
                 * SI PAS DE NUMÉRO DE SEMAINE EN PARAMÈTRE ON DÉTERMINE SUR QUELLE SEMAINE ON SE SITUE
                 * EN FONCTION DE LA DATE DU JOUR
                 */
                if (!$routeParams.numSemaine)
                    for (var cycle in $scope.cyclesPirge.dates)
                        if ($scope.cyclesPirge.date.date.getTime() >= $scope.cyclesPirge.dates[cycle].dateDeb.getTime() && $scope.cyclesPirge.date.date.getTime() <= $scope.cyclesPirge.dates[cycle].dateFin.getTime()) {
                            $scope.cyclesPirge.numSemaine.numSemaine = +cycle;
                            return;
                        }

                /**
                 * DÉTERMINATION DES LIENS 'SUIVANT' ET 'PRÉCÉDENT' DES CYCLES PIRGE
                 * RECHERCHER LA DERNIÈRE SEMAINE DU CYCLE PRÉCÉDENT
                 * ET
                 * RECHERCHER LA PREMIÈRE SEMAINE DU CYCLE SUIVANT
                 */
                var _semaineSuiv = 0,
                    _semainePrec = 0,
                    _anneeSuiv = $scope.cyclesPirge.date.date.getFullYear(),
                    _anneePrec = $scope.cyclesPirge.date.date.getFullYear();
                for (var ind in $scope.cyclesPirge.cyclesSemaines) {
                    if (_semainePrec === 0)
                        _semainePrec = +ind;

                    _semaineSuiv = +ind;
                }

                if(_semainePrec === 1){
                    _semainePrec = 53;
                    _anneePrec--;
                }else{
                    _semainePrec--;
                }

                if(_semaineSuiv === 53){
                    _semaineSuiv = 1;
                    _anneeSuiv++;
                }else{
                    _semaineSuiv++;
                }

                $scope.cyclesPirge.CycleSuiv = "#/pointages/PRJS12821/" + _anneeSuiv + "/" + _semaineSuiv;
                $scope.cyclesPirge.CyclePrec = "#/pointages/PRJS12821/" + _anneePrec + "/" + _semainePrec;
            });
    };

    /**
     * RÉCUPÈRE LES ID DES SEMAINES DE L'ANNÉE SÉLECTIONNÉE,
     * PUIS RÉCUPÈRE LES CYCLES PIRGE DES SEMAINES CORRESPONDANTES
     * @param annee {String} : année
     * @param semaine {String} : numéro de semaine
     * @private
     */
    var _getCyclesPirgeByYear = function (annee, semaine) {
        var dataCyclesAnneeObj = {};
        semaine = parseInt(semaine, 10);

        $http({url: DIURLAPI.URLapi + "pirge/cycles/" + annee, method: "GET", responseType: "json", params: {format: "json"}})
            .success(function (data) {
                if (data.exit_code === 1)
                    dataCyclesAnneeObj = data.D_cycles;
                else
                    alert("Erreur lors de la récupération des cycles PIRGE\n" + data.error_msg);
            })
            .error(function () {
                alert("ERREUR lors de la récupération des cycles PIRGE");
                console.log(arguments);
            })
            .then(function () {
                for (var idCycle in dataCyclesAnneeObj)
                    _getCycleByIdWeek(idCycle, semaine);
            });
    };

    /**
     * RÉCUPÈRE LE CYCLE PIRGE DE LA SEMAINE CORRESPONDANTE
     * @param idCycle {Number}
     * @param semaine {Number}
     * @private
     */
    var _getCycleByIdWeek = function (idCycle, semaine) {
        $http({ url: DIURLAPI.URLapi + "pirge/cycles/semaine/" + idCycle, method: "GET", responseType: "json", params: { format: "json" }})
            .success(function (data) {
                if (data.exit_code === 1)
                    $scope.cyclesPirge.l_data[idCycle] = data.L_Semaine;
                else
                    alert("Erreur lors de la récupération du cycles PIRGE " + idCycle + "\n" + data.error_msg)
            })
            .error(function () {
                alert("ERREUR lors de la récupération du cycle PIRGE " + idCycle);
                console.log(arguments);
            })
            .then(function () {
                $scope.cyclesPirge.dataCycles[idCycle] = $scope.cyclesPirge.l_data[idCycle].map(function (val, ind, arr) {
                    var l_obj = {};
                    l_obj.date_debut = ParseDate(val.date_debut);
                    l_obj.date_fin = ParseDate(val.date_fin);
                    l_obj.numSemaine = val.numero_semaine;
                    l_obj.idSemaine = val.idSemaine;

                    /**CORRESPONDANCE ENTRE LE NUMÉRO DE SEMAINE ET LE NUMÉRO DE CYCLE*/
                    $scope.cyclesPirge.semaineToCycle[val.numero_semaine] = idCycle;

                    return l_obj;
                });

                /**SUPRESSION DU CONTENU DE L'OBJET POUR 'AÉRER' LE SCOPE*/
                delete $scope.cyclesPirge.l_data[idCycle];


            });
    };

    if ($routeParams.numSemaine && $routeParams.annee)
    {
        /** SI LES PARAMÈTRES DE LA ROUTE SONT MAUVAIS, ON REROUTE LA PAGE SUR L'UTILISATEUR CONNECTÉ UNIQUEMENT */
        if (isNaN($routeParams.numSemaine) || parseInt($routeParams.numSemaine) > 54 || parseInt($routeParams.numSemaine) < 1 || isNaN($routeParams.annee) || parseInt($routeParams.annee, 10) < 2013)
            $location.path($route.current.$$route.originalPath.split(":")[0] + ariane.cookie.agent);
        else {
            _getCyclesPirgeByYear($routeParams.annee, $routeParams.numSemaine);
        }
    }
    else
        $scope.cyclesPirge.date.date = date;

    _getCyclePirge($scope.cyclesPirge.date.date);
}]);

//ngAriane.controller("DJSPointe", ["DIURLAPI", "$scope", "$http", "DISemaine", "DIDateref", "DISemaines", function (DIURLAPI, $scope, $http, DISemaine, DIDateref, DISemaines) {
//    $scope.djspointe = {
//        numSemaine: DISemaine,
//        DateRef: DIDateref,
//        semaines: DISemaines,
//        DJS: []
//    };
//
//    $scope.$watch("djspointe.DateRef.date", function (newVal, oldVal) {
//        if(newVal === oldVal)
//            return;
//
//        /**APPEL AJAX DE LA SEMAINE CORRESPONDANTE*/
//        $http({url: DIURLAPI.URLapi + "DJS/" + ariane.cookie.agent + "/" + $scope.djspointe.numSemaine.numSemaine + "/" + newVal.slice(-4), method: "GET", responseType: "json", params: { format: "json" }})
//            .success(function (data) {
//                $scope.djspointe.DJS = _ApiToNg(data, $scope.djspointe.semaines.cyclesSemaines[$scope.djspointe.numSemaine.numSemaine]);
//            })
//            .error(function (data, statusCode) {
//                if (statusCode === 400){
//                    console.warn("Djs pas crée pour la semaine ", DISemaine.numSemaine);
//                    /**
//                     * SI IL N'Y A PAS DE DJS POUR LA SEMAINE EN COURS, ON CONSIDÈRE QU'ELLE EST À 0
//                     */
//                    $scope.djspointe.DJS = $scope.djspointe.semaines.cyclesSemaines[$scope.djspointe.numSemaine.numSemaine].map(function () {
//                        return 0;
//                    });
//                }else
//                {
//                    alert("ERREUR lors de la récupération des DJS");
//                    console.log(arguments);
//                    console.log("date:", newVal.slice(-4));
//                    console.log("semaine:", $scope.djspointe.numSemaine.numSemaine);
//                }
//            });
//    });
//
//    /**
//     * CONVERTIT L'OBJECT RETOURNÉ PAR L'API DES DJS EN TABLEAU POUR ANGULARJS EN FONCTION DE LA SEMAINE SÉLECTIONNÉE
//     * @param objDJS (Object)
//     * @param semainesPirge {Array}
//     * @returns {Array}
//     * @private
//     */
//    var _ApiToNg = function (objDJS, semainesPirge) {
//        var l_daysObj = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 },
//            l_daysTab = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
//            ret = semainesPirge.map(function (val, ind, arr) {
//                return objDJS[l_daysTab[val.getDay()]];
//            });
//
//        return ret;
//    }
//}]);
