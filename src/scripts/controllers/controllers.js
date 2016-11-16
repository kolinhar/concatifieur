/**
 * Created by PRJS12821 on 04/09/2014.
 */
"use strict";

ngAriane.controller("Auth", ["$location", "$routeParams", "$cookieStore", "CPtoNAME", "AjaxErrorManager", "$timeout", function ($location, $routeParams, $cookieStore, CPtoNAME, AjaxErrorManager, $timeout) {
    //@HACK POUR LAISSER LE TEMPS À ANGULAR DE VOIR QUE LA VALEUR DE $cookieStore.get("agent") OU $routeParams.cp N'EST PAS undefined
    //PAS L'INFO DANS LE COOKIE
    if ($cookieStore.get("agent") === undefined || $cookieStore.get("agent").trim() === "") {
        //PAS L'INFO DANS L'URL
        //@HACK: $routeParams N'EST PAS AFFECTÉ À TEMPS => JS natif
        var l_match_path = $location.path().match(/^\/auth\/\w{8,9}$/g);

        if (l_match_path === null){
            location.replace("http://x18srhrgcb7:8077");
        }
        else{
            var l_tabMatch = l_match_path[0].split("/");
            $cookieStore.put("agent", l_tabMatch[l_tabMatch.length - 1]);
            $location.path("/gestionFiches");
            CPtoNAME.GetFullName($cookieStore.get("agent"), function (name) {
                $cookieStore.put("nomAgent", name);
            })
        }
    }
    else {
        //TOUT VA BIEN

        CPtoNAME.GetFullName($cookieStore.get("agent"), function (name) {
            $cookieStore.put("nomAgent", name);
        });

        if ($location.path().match(/^\/auth\/\w{8,9}$/g) !== null){
            $location.path("/gestionFiches");
        }
        else{
            //SINON ON RESTE SUR LA PAGE EN COURS
        }

        if (location.host.indexOf("test.") === 0 && !($cookieStore.get("agent") in {"PRJS12821":0, "PAGT08882":0, "PVWS02941":0, "PMPH10701":0, "8502623G":0, "7109157V":0, "7508786Z":0, "7903642R":0, "8202876V" :0, "9404070R" : 0, "6304358N" : 0 , "7402165G" : 0, "8211629J" : 0})){
            $timeout(function () {
                AjaxErrorManager.Gerer("ATTENTION!!! Vous êtes actuellement sur le site de test d'Ariane Informatique. Ce site n'est pas synchronisé avec Agadir, et est sujet à de nombreux bugs et phases de déploiement. Vous allez être redirigé dans 10 secondes vers http://arianeinformatique.st.sncf.fr");
                
                $timeout(function () {
                    location.href = "http://arianeinformatique.st.sncf.fr";
                }, 10000)
            }, 2000);
        }
    }
}]);

ngAriane.controller("menuNav", ["$scope", "$route", "$routeParams", "$location", "$cookieStore", function ($scope, $route, $routeParams, $location, $cookieStore) {
    //@TODO: À REFACTORER AVEC LE SERVICE 'DateService'
    var l_date = new Date();
    l_date.setHours(0,0,0,0);
    
    $scope.menunav = {
        hide: true,
        route: $route,
        cookieStore: $cookieStore,
        routeParams: $routeParams,
        location: $location,
        today: {
            dateFr : l_date.getDateFR().replace(new RegExp("/", 'g'), "-"),
            year: l_date.getFullYear(),
            weekNum: l_date.getWeekNumber()
        }
    };
}]);

ngAriane.controller("ProjetsListe", ["DAL_PROJET", "DatasProjets", "AjaxErrorManager", function (DAL_PROJET, DatasProjets, AjaxErrorManager) {
    DAL_PROJET.Liste()
        .success(function (datas) {
            if (datas.exit_code === 1) {
                DatasProjets.liste = datas.LPrestations.map(function (val) {
                    return {
                        intitule: val.projet,
                        guid: val.val_projet,
                        type: val.type,
                        filtre_projet: val.filtre_projet,
                        poids: val.poids,
                        date_ouverture: new Date(val.date_ouverture),
                        date_cloture: new Date(val.date_cloture)
                    }
                });
            }
            else{
                AjaxErrorManager.Gerer("Erreur lors de la lecture des projets. " + datas[0].err_msg);
            }
        })
        .error(function () {
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture des projets.");
        });
}]);

ngAriane.controller("DJS", ["$scope", "$cookieStore", "DatasDJS", "$timeout", "DAL_DJS", "AjaxErrorManager", "$interval", function ($scope, $cookieStore, DatasDJS, $timeout, DAL_DJS, AjaxErrorManager, $interval) {
    $scope.datas = DatasDJS;

    $scope.agent = $cookieStore.get("agent");
    var l_date = new Date();
    l_date.setHours(0,0,0,0);

    $scope.djs = {
        anneeAujourdhui: l_date.getFullYear(),
        anneeEnCours: l_date.getFullYear(),
        numSemaineEnCours: l_date.getWeekNumber(),
        lesJours: {},
        tabJour : [],
        dateDeb: null,
        dateFin: null,
        next: function () {
            var l_date = Date.setWeekNumber($scope.djs.anneeEnCours, $scope.djs.numSemaineEnCours);
            l_date.setDate(l_date.getDate() + 7);

            $scope.djs.numSemaineEnCours = l_date.getWeekNumber();
            $scope.djs.anneeEnCours = l_date.getFullYear();

            $scope.djs.dateDeb = l_date;
            $scope.djs.dateFin = new Date(l_date);
            $scope.djs.dateFin.setDate(l_date.getDate() + 6);

            _getDjs();
        },
        prev: function () {
            if ($scope.djs.numSemaineEnCours === 1){
                var l_date = Date.setWeekNumber($scope.djs.anneeEnCours, $scope.djs.numSemaineEnCours);
                l_date.setDate(l_date.getDate() - 1);

                $scope.djs.numSemaineEnCours = l_date.getWeekNumber();
                $scope.djs.anneeEnCours--;
            }
            else{
                $scope.djs.numSemaineEnCours--;
            }

            $scope.djs.dateDeb = Date.setWeekNumber($scope.djs.anneeEnCours, $scope.djs.numSemaineEnCours);
            $scope.djs.dateFin = new Date($scope.djs.dateDeb);
            $scope.djs.dateFin.setDate($scope.djs.dateDeb.getDate() + 6);

            _getDjs();
        }
    };

    $scope.djs.dateDeb = Date.setWeekNumber($scope.djs.anneeEnCours, $scope.djs.numSemaineEnCours);
    $scope.djs.dateFin = new Date($scope.djs.dateDeb);
    $scope.djs.dateFin.setDate($scope.djs.dateDeb.getDate() + 6);


    /**
     * DONNE L'ORDRE DE RÉCUPÉRER LA DJS
     * @private
     */
    var _getDjs = function () {
        if ($cookieStore.get("agent") === undefined || $cookieStore.get("nomAgent") === undefined)
        {
            $scope.reboursSecu = $interval(function () {
                if ($cookieStore.get("agent") !== undefined && $cookieStore.get("nomAgent") !== undefined){
                    $interval.cancel($scope.reboursSecu);
                    _getDjs();
                }
            }, 200);
            return;
        }

        DAL_DJS.LireDJS({
            cp: $cookieStore.get("agent"),
            annee: $scope.djs.anneeEnCours,
            semaine: $scope.djs.numSemaineEnCours
        })
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    $scope.djs.lesJours = {};

                    $scope.realDjs = datas.djs;
                    var l_jour = Date.setWeekNumber($scope.djs.anneeEnCours, $scope.djs.numSemaineEnCours);

                    while (l_jour.getDay() !== 1){
                        l_jour.setDate(l_jour.getDate() - 1);
                    }

                    var l_nbr = 0;
                    for (var jour in datas.djs.lesJours) {
                        //$scope.djsmanager.DJS[jour].value = datas[0].djs.djsTotal[jour] / 60;
                        $scope.djs.tabJour[l_nbr] = jour;

                        var l_valueH = (datas.djs.lesJours[jour].minutesRestantes/60).toString();
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

                        $scope.djs.lesJours[jour] = {
                            minutesTotal : datas.djs.lesJours[jour].minutesTotal,
                            minutesRestantes: datas.djs.lesJours[jour].minutesRestantes,
                            minutesRestantesH: l_valueH,
                            dateLink: l_jour.getDateFR().replace(/\//g, "-"),
                            verrouiller : datas.djs.lesJours[jour].verrouiller,
                            cloturer : datas.djs.lesJours[jour].cloturer,
                            ordre : l_nbr
                        };

                        l_jour.setDate(l_jour.getDate() + 1);

                        l_nbr++;
                    }
                    DatasDJS.Semaine = $scope.djs;
                }
                else {
                    if (datas.err_msg === "La DJS n'existe pas.") {
                        $scope.djs.lesJours = {};
                    }
                    else {
                        AjaxErrorManager.Gerer("Erreur lors de la lecture de la djs. " + datas.err_msg);
                    }
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de lecture de DJS.");
            });

    };

    _getDjs();

    $scope.$watch("datas.reload", function (newVal, oldVal) {
        if (newVal === oldVal)
            return;

        _getDjs();
    });
}]);

ngAriane.controller("Agents", ["DAL_AGENT", "DatasAgents", "$cookieStore", "AgentsFactory", "NOMSPARTIS", "NOMSPRESTATAIRES", function (DAL_AGENT, DatasAgents, $cookieStore, AgentsFactory, NOMSPARTIS, NOMSPRESTATAIRES) {
    // RÉCUPÉRATION DES AGENTS
    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        DatasAgents.liste = listeAgents.filter(function (val) {
            //SI ON EST EN PROD, ON N'AFFICHE PAS LES PRESTATAIRES
            if (location.host.indexOf("arianeinformatique.st.sncf.fr") === 0)
                return NOMSPARTIS.every(function (nom) {
                        return val.nomPrenom.indexOf(nom) === -1
                    })
            //NI LES "PARTIS"
                    && NOMSPRESTATAIRES.every(function (nom) {
                        return val.nomPrenom.indexOf(nom) === -1
                    });
            else
                return true;
        });

        listeAgents.forEach(function (val) {
            if (val.cp === $cookieStore.get("agent")){
                $cookieStore.put("status", val.habilitation);
                $cookieStore.put("secteur", val.secteur);
                $cookieStore.put("changeLogVue", val.changeLogVue);
            }
        });
    });

    //ALIMENTATION DE LA LISTE DES DPX PRIORITAIRES
    AgentsFactory.getDpxPrioritaires();


}]);

ngAriane.controller("ErrorModal", ["$scope", "AjaxErrorManager", function ($scope, AjaxErrorManager) {
    $scope.errormodal = {
        DI: AjaxErrorManager
    };

    var l_modal = $("#ErrorModal");
    //ON VIDE LA MODAL QUAND ON LA FERME
    l_modal.on("hide.bs.modal", function (e) {
        AjaxErrorManager.RAZ();
    });

    //ON JOUE LE SON À L'AFFICHAGE DE LA MODAL
    l_modal.on("shown.bs.modal", function (e) {
        //SI C'EST UNE ERREUR, ON A UNE CHANCE SUR 10 DE JOUER LE SON
        /*if ($scope.errormodal.DI.Infos.title === undefined && Math.random() > 0.9){
            var l_audio = document.getElementById("bug1");
            l_audio.volume = 1;
            l_audio.play();
        }*/
    });

    $scope.$watchCollection("errormodal.DI.Infos", function (newVal, oldVal) {
        if (angular.equals(oldVal, newVal) || newVal === null)
            return;

        $scope.Action = function () {
            newVal.act && newVal.act();
        };

        //AFFICHAGE DE LA FENÊTRE MODALE
        $("#ErrorModal").modal();
    });
}]);

ngAriane.controller("ChangeLog", ["$scope", "AjaxErrorManager", "$cookieStore", "ChangeLogFactoryCSharp", "AgentFactoryCSharp", "DatasAgents", "$timeout",function ($scope, AjaxErrorManager, $cookieStore, ChangeLogFactoryCSharp, AgentFactoryCSharp, DatasAgents, $timeout) {


    $scope.changeLog = {};

    $timeout(function () {

        if(!$cookieStore.get("changeLogVue"))
        {

            $("#modal-changeLog").modal();

            ChangeLogFactoryCSharp.Lire()
                .success(function (datas) {
                    if (datas.exit_code === 1){

                        $scope.changeLog.description = datas.leChangeLog.description;
                        $scope.changeLog.date = new Date(datas.leChangeLog.date);

                        var agent = DatasAgents.liste.filter(function (val) {
                            return val.cp === $cookieStore.get("agent")
                        })[0];

                        agent.changeLogVue = !agent.changeLogVue;

                            AgentFactoryCSharp.upd(agent)
                            .success(function (datas) {
                                if (datas.exit_code === 1){
                                }
                                else{
                                    console.warn("Erreur lors de la maj de l'agent. " + datas.err_msg);
                                }
                            })
                            .error(function () {
                                console.warn(arguments);
                            });

                    }
                    else{
                        console.warn("Erreur lors de la recuperation du changeLog")
                    }
                })
                .error(function () {
                    console.warn(arguments);
                });
        }

    }, 2000);





}]);

ngAriane.controller("listeChangeLog", ["$scope", "AjaxErrorManager", "$cookieStore", "ChangeLogFactoryCSharp", "AgentFactoryCSharp", "DatasAgents", "$timeout","$route", function ($scope, AjaxErrorManager, $cookieStore, ChangeLogFactoryCSharp, AgentFactoryCSharp, DatasAgents, $timeout, $route) {


    $scope.changeLog = [];
    $scope.agent = $cookieStore.get('agent');

    ChangeLogFactoryCSharp.LireAll()
        .success(function (datas) {
            if (datas.exit_code === 1){

                $scope.changeLog = datas.lesChangeLogs;
            }
            else{
                AjaxErrorManager.Gerer("Erreur lors de la demande de la liste des changelog. " + datas.err_msg);
            }
        })
        .error(function () {
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture des changelog.");
        });

    $scope.Add = function (laDescription) {
        ChangeLogFactoryCSharp.add({description : laDescription, date : new Date()})
            .success(function (datas) {
                if (datas.exit_code === 1){

                    $route.reload();
                }
                else{
                    AjaxErrorManager.Gerer("Erreur lors de la demande d'ajout de changelog. " + datas.err_msg);
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande d'ajout de changelog.");
            });
    };





}]);

ngAriane.controller("EtatsListe", ["$scope", "Etats", "AjaxErrorManager", "DatasEtats", function ($scope, Etats, AjaxErrorManager, DatasEtats) {
    // RÉCUPÉRATION DES ÉTATS
    Etats.Lire()
        .success(function (datas) {
            if (datas[0].exit_code === 1){
                DatasEtats.liste = datas[0].LEtats.map(function (val) {
                    return val.libelle;
                });
            }
            else{
                AjaxErrorManager.Gerer("Erreur lors de la demande de la liste des états. " + datas[0].err_msg);
            }
        })
        .error(function () {
            console.warn(arguments);
            AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de lecture des états.");
        });
}]);

ngAriane.controller("SignalRBroadcaster", ["$scope", "DIURLAPI", "jQuery", "SignalrRouteur", function ($scope, DIURLAPI, jQuery, SignalrRouteur) {
    $scope.signalrbroadcaster = {

    };

    jQuery(function () {
        jQuery.connection.hub.url = DIURLAPI.URLsignalR + "signalr";

        var link = jQuery.connection.notificateur;

        link.client.notify = function (datas) {
            SignalrRouteur.TraiteDatas(datas);
        };

        jQuery.connection.hub.start({jsonp: true});
    });
}]);

ngAriane.controller("VerrouillageDjsModal", ["$scope", "CheckModalDjs", "DAL_DJS", "AjaxErrorManager", "JoursName","DatasDJS", "SignalrRequest", "$cookieStore", "FctValidationDpx", "$route", function ($scope, CheckModalDjs, DAL_DJS, AjaxErrorManager, JoursName, DatasDJS, SignalrRequest, $cookieStore, FctValidationDpx, $route) {

    $scope.verrouillageDjsModal = CheckModalDjs;


    $scope.verrouillerJournee = function(dateJour){

        $scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[dateJour.getDay()]].verrouiller = true;
        DAL_DJS.ModificationDJS([$scope.verrouillageDjsModal.djs])
            .success(function (datas) {
                if (datas.exit_code !== 1)
                {
                    $scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[dateJour.getDay()]].verrouiller = false;
                    AjaxErrorManager.Gerer("Erreur lors du verrouillage de la journée." + datas.err_msg);
                }
                else
                {
                    DatasDJS.reload++;
                    $route.reload();
                    FctValidationDpx.NotifierDpx($cookieStore.get("agent"), dateJour);

                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de verrouillage de la journée.");
            });

        SuprimerVerrouillage(dateJour);

    };

    $scope.verrouillerAllJournee = function(){

        $scope.verrouillageDjsModal.lesJoursAVerrouiller.forEach(function (jour) {
            $scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[jour.getDay()]].verrouiller = true;
        });

        DAL_DJS.ModificationDJS([$scope.verrouillageDjsModal.djs])
            .success(function (datas) {
                if (datas.exit_code !== 1)
                {
                    $scope.verrouillageDjsModal.djs.lesJours[JoursName.joursName[dateJour.getDay()]].verrouiller = false;
                    AjaxErrorManager.Gerer("Erreur lors du verrouillage de la journée." + datas.err_msg);
                }
                else
                {
                    DatasDJS.reload++;

                    $scope.verrouillageDjsModal.lesJoursAVerrouiller.forEach(function (jour) {
                        FctValidationDpx.NotifierDpx($cookieStore.get("agent"), jour);
                    });
                    $scope.verrouillageDjsModal.lesJoursAVerrouiller = [];
                    $("#modal-multiple-verrouillage-djs").modal("hide");
                    $route.reload();
                }
            })
            .error(function () {
                console.warn(arguments);
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de verrouillage de la journée.");
            });
    };

    $scope.nonVerrouillage = function(date){
        SuprimerVerrouillage(date);
    };

    $scope.nonVerrouillageAllJournee = function(){
        $scope.verrouillageDjsModal.lesJoursAVerrouiller = [];

            $("#modal-multiple-verrouillage-djs").modal("hide");
    };

    $scope.dateBeautify = function(date){
        return JoursName.joursName[date.getDay()] + " " + date.getDate();
    };

    var SuprimerVerrouillage = function(dateJour){
        $scope.verrouillageDjsModal.lesJoursAVerrouiller = $scope.verrouillageDjsModal.lesJoursAVerrouiller.filter(function(obj){
            if(obj !== dateJour)
                return true;
            else
                return false;
        });

        if($scope.verrouillageDjsModal.lesJoursAVerrouiller.length === 0)
            $("#modal-multiple-verrouillage-djs").modal("hide");
    };

}]);