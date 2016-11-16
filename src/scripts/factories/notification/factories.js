/**
 * Created by PRJS12821 on 05/10/2015.
 */
"use strict";

ngAriane.factory("SignalrRequest", ["jQuery", "DIURLAPI", function (jQuery, DIURLAPI) {
    jQuery.connection.hub.url = DIURLAPI.URLsignalR + "signalr";
    var hub = jQuery.connection.notificateur;

    return {
        AffectationFiche: function (CPagent, numFiche, annee) {
            return jQuery.connection.hub.start()
                .done(function () {
                    hub.server.affectationFiche(CPagent, numFiche, annee);
                });
        },
        SignalementPtg: function (CPagent, date) {
            return jQuery.connection.hub.start()
                .done(function () {
                    hub.server.notifSignalementPtg(CPagent, date);
                });
        },
        NotifDpxJournéeVerrouiller: function (lesCp, agent,cpAgent, date) {
            return jQuery.connection.hub.start()
                .done(function () {
                    hub.server.notifPersoJournee(lesCp, "dpxVerrouiller", agent,cpAgent, date);
                });
        },
        CreationFiche: function (numFiche, annee) {
            return jQuery.connection.hub.start()
                .done(function () {
                    hub.server.creationFiche(numFiche, annee);
                });
        },
        ClotureFiche: function (numFiche, annee) {
            return jQuery.connection.hub.start()
                .done(function () {
                    hub.server.cloturationFiche(numFiche, annee);
                });
        }
        /*
         RFicheAll: function (operateur) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rficheall({
         operateur: operateur
         });
         });
         },
         CFiche: function (operateur, datas) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.cfiche({
         operateur: operateur,
         fiche: datas
         });
         });
         },
         RFiche: function (operateur, annee, numFiche) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rfiche({
         operateur: operateur,
         nFiche: numFiche,
         annee: annee
         });
         });
         },
         RficheTransfert: function (operateur, annee, numFiche, transfertRegion) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rfichetransfert({
         operateur: operateur,
         nFiche: numFiche,
         annee: annee,
         transfertRegion: transfertRegion
         })
         });
         },
         UFiche: function (operateur, datas, annee, numFiche) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.ufiche({
         fiche: datas,
         operateur: operateur,
         nFiche: numFiche,
         annee: annee
         });
         });
         },
         DFiche: function (operateur, annee, numFiche) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.dfiche({
         operateur: operateur,
         nFiche: numFiche,
         annee: annee
         });
         });
         },
         RProjet: function (operateur) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rprojet({
         operateur: operateur
         });
         });
         },
         CPointage: function (operateur, datas, annee, numFiche) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.cpointage({
         operateur: operateur,
         pointage: datas,
         annee: annee,
         nFiche: numFiche
         });
         });
         },
         RPointagesCPDay: function (operateur, cp, date) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rpointage({
         operateur: operateur,
         cp: cp,
         date: date
         });
         });
         },
         DPointage: function (operateur, annee, numFiche, datePointage, naturePointage, dureePointage) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.dpointage({
         operateur: operateur,
         annee: annee,
         nFiche: numFiche,
         date: datePointage,
         old_nature: naturePointage,
         old_duree: dureePointage
         });
         });
         },
         RDJS: function (operateur, numSemaine, annee) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rdjs({
         operateur: operateur,
         //operateur: "PAGT08882",
         annee: annee,
         n_semaine: numSemaine
         });
         });
         },
         RHistoPoste: function (operateur, poste) {
         return jQuery.connection.hub.start()
         .done(function () {
         hub.server.rfichedescription({
         operateur: operateur,
         poste: poste
         });
         });
         }
         */
    };
}]);

ngAriane.factory("SignalrRouteur", ["$location", "AjaxErrorManager", "$cookieStore", "FichesAgent", "DISumFiche", "$timeout", "DatasFicheAgadir", "DatasProjets", "DatasAgents", "DatasDJS", "DatasHistoPoste", "DatasPtgJour", "$route", "CreateThisFiche", "graphService", "NotifierService", "RetNumService", function ($location, AjaxErrorManager, $cookieStore, FichesAgent, DISumFiche, $timeout, DatasFicheAgadir, DatasProjets, DatasAgents, DatasDJS, DatasHistoPoste, DatasPtgJour, $route, CreateThisFiche, graphService, NotifierService, RetNumService) {
    var _RouteDatas = function (operation, datas) {
        switch (operation) {
            /*
             case "rficheall_rep":
             //@HACK POUR FORCER LE REFRESH DU SCOPE
             $timeout(function () {
             FichesAgent.Liste = datas.LFiche;
             FichesAgent.Liste.forEach(function (val, ind, arr) {
             val.date = ParseDate(val.date);
             });
             DISumFiche.sum = datas.LFiche.length;
             }, 0);
             break;

             case "cfiche_rep":
             CreateThisFiche.value = true;
             console.log("fiche à créer, CreateThisFiche:", CreateThisFiche);
             $timeout(function () {
             //$location.path("/fiche/" + datas.annee + "/" + datas.nFiche);
             //console.log(datas);
             }, 0);
             break;

             case "rfiche_rep":
             $timeout(function () {
             DatasFicheAgadir.fiche = datas.fiche;

             DatasFicheAgadir.pointages = datas.LPointages;
             DatasFicheAgadir.pointages.forEach(function (val) {
             val.date = ParseDate(val.date);
             });

             var l_agentSelected = DatasAgents.liste.filter(function (val) {
             return val.nomPrenom === DatasFicheAgadir.fiche.agent;
             });

             if (l_agentSelected.length === 0)
             l_agentSelected = "0";
             else
             l_agentSelected = l_agentSelected[0].cp;

             DatasFicheAgadir.fiche.agent = l_agentSelected;
             }, 0);
             break;

             case "rfichetransfert_rep":
             $timeout(function () {
             if (datas.exit_code !== "1"){
             AjaxErrorManager.Infos = {
             msg: "La fiche n'a pas pu être transférée.",
             act: function () {
             $route.reload();
             }
             };
             }
             else{
             $route.reload();
             }
             }, 0);
             break;

             case "ufiche_rep":
             $timeout(function () {
             if (datas.exit_code !== "1"){
             console.warn("mise à jour de fiche:", datas.err_msg);
             AjaxErrorManager.Infos = {
             msg: "La fiche n'a pas pu être mise à jour.",
             act: function () {
             $route.reload();
             }
             };
             }
             else{
             $route.reload();
             }

             }, 0);
             break;

             case "dfiche_rep":
             $timeout(function () {
             if (datas.exit_code !== "1"){
             console.warn("clôture de fiche", datas.err_msg);
             AjaxErrorManager.Gerer("La fiche n'a pas pu être clôturée.");
             }else{
             $location.path("/gestionFiches");
             }

             }, 0);
             break;

             case "rprojet_rep":
             $timeout(function () {
             DatasProjets.liste = datas.LPrestations.map(function (val, ind) {
             return {
             intitule: val,
             guid: val
             }
             });
             //console.log(DatasProjets.liste);
             },0);
             break;

             case "cpointage_rep":
             $timeout(function () {
             $route.reload();
             DatasDJS.reload++;
             }, 0);
             break;

             case "rpointage_rep":
             $timeout(function () {
             DatasPtgJour.liste = datas.RPointageExtends;
             }, 0);
             break;

             case "dpointage_rep":
             $timeout(function () {
             $route.reload();
             DatasDJS.reload++;
             }, 0);
             break;

             case "rdjs_rep":
             $timeout(function () {
             DatasDJS.Semaine = datas.l_djs_semaine;
             }, 0);
             break;

             case "rfichedescription_rep":
             $timeout(function () {
             DatasHistoPoste.liste = datas.L_RFicheDescriptionAbr;
             }, 0);
             break;
             */

            case "creation":
                //UNE FICHE A ÉTÉ CRÉÉE
                $timeout(function () {
                    graphService.reload++;
                }, 0);
            break;

            case "cloturation":
                //UNE FICHE A ÉTÉ CLÔTURÉE
                $timeout(function () {
                    graphService.reload++;
                }, 0);
            break;

            case "affectation":
                //UNE FICHE A ÉTÉ AFFECTÉE
                var l_objNotif = {
                    header: "Affectation de fiche",
                    body: "La fiche N°" + datas.numFiche + " vous a été affectée.",
                    link: "fiche/" + datas.annee + "/" + datas.numFiche,
                    icon: "./images/channel_ariane.svg"
                };

                $timeout(function () {
                    graphService.reload++;
                    NotifierService.list.push(l_objNotif);
                }, 0);

                //NOTIFICATION HTML5
                var notifAffectation = new Notification(l_objNotif.header, {
                    body: l_objNotif.body,
                    icon: "./images/channel_ariane.svg"
                });

                notifAffectation.onclick = function (e) {
                    //AU CLICK SUR LA NOTIFICATION ON VA SUR LA FICHE
                    $timeout(function () {
                        $location.path(l_objNotif.link);
                    }, 0);
                };
            break;

            case "dpxVerrouiller":
                //UNE FICHE A ÉTÉ AFFECTÉE
                var dateFr = new Date(datas.date).getDateFR();
                var dateLink = dateFr.replace(new RegExp("/", 'g'), "-");

                console.log(dateLink);

                var l_objNotif = {
                    header: "Journée verrouillé",
                    body: "La journée du " + dateFr + " de l'agent " + datas.agent + " a été verrouillé.",
                    link: "pointages/" + datas.cpAgent + "/" + dateLink,
                    icon: "./images/channel_ariane.svg"
                };

                $timeout(function () {
                    NotifierService.list.push(l_objNotif);
                }, 0);

                //NOTIFICATION HTML5
                var notifAffectation = new Notification(l_objNotif.header, {
                    body: l_objNotif.body,
                    icon: "./images/channel_ariane.svg"
                });

                notifAffectation.onclick = function (e) {
                    //AU CLICK SUR LA NOTIFICATION ON VA SUR LA FICHE
                    $timeout(function () {
                        $location.path(l_objNotif.link);
                    }, 0);
                };
                break;

				case "enquete":
                //UNE FICHE A ÉTÉ MAL NOTÉ
                var dateFr = new Date(datas.date).getDateFR();

                var l_objNotif = {
                    header: "Enquête satisfaction",
                    body: "La fiche N°" + datas.numFiche + " de l'agent " + datas.agent + " a reçu une note de " + datas.moyenne + "/5.",
                    link: "fiche/" + datas.annee + "/" + datas.numFiche,
                    icon: "./images/channel_ariane.svg"
                };

                $timeout(function () {
                    NotifierService.list.push(l_objNotif);
                }, 0);

                //NOTIFICATION HTML5
                var notifAffectation = new Notification(l_objNotif.header, {
                    body: l_objNotif.body,
                    icon: "./images/channel_ariane.svg"
                });

                notifAffectation.onclick = function (e) {
                    //AU CLICK SUR LA NOTIFICATION ON VA SUR LA FICHE
                    $timeout(function () {
                        $location.path(l_objNotif.link);
                    }, 0);
                };
                break;
            case "Signalement":
                //UNE FICHE A ÉTÉ AFFECTÉE
                var dateFr = new Date(datas.date).getDateFR();
                var dateLink = dateFr.replace(new RegExp("/", 'g'), "-");

                console.log(dateLink);

                var l_objNotif = {
                    header: "Pointage invalide",
                    body: "Un pointage du " + dateFr + " a été signalé comme invalide.",
                    link: "pointages/" + datas.To + "/" + dateLink,
                    icon: "./images/channel_ariane.svg"
                };

                $timeout(function () {
                    NotifierService.list.push(l_objNotif);
                }, 0);

                //NOTIFICATION HTML5
                var notifAffectation = new Notification(l_objNotif.header, {
                    body: l_objNotif.body,
                    icon: "./images/channel_ariane.svg"
                });

                notifAffectation.onclick = function (e) {
                    //AU CLICK SUR LA NOTIFICATION ON VA SUR LA FICHE
                    $timeout(function () {
                        $location.path(l_objNotif.link);
                    }, 0);
                };
                break;

            case "retourNum":
                //Retour le num AGA d'une fiche
                $timeout(function () {
                    RetNumService.list.push(datas);
                }, 0);
                break;

            default :
                console.log("aucun traitement", arguments);
            break;
        }
    };

/*    $timeout(function () {
        console.log("YOLO!");
        NotifierService.list.push({
            link:"",
            body:"bla bla bla",
            header: "test"
        });
    }, 6000);*/

    return {
        TraiteDatas: function (datas) {
            datas = JSON.parse(datas);
            if (datas.To !== undefined && datas.Event !== undefined){
                console.log(datas);
                if (datas.To.indexOf($cookieStore.get("agent")) > -1 || datas.To === $cookieStore.get("agent") || datas.To === "*"){
                    _RouteDatas(datas.Event, datas);
                }
                else{
                    console.info("Opérateur tiers: ", datas.To, "!==", $cookieStore.get("agent"));
                }
            }
            else{
                console.warn("Données incomplètes: ", datas);
                AjaxErrorManager.Gerer("Erreur de communication avec le serveur. Votre requête ne peut aboutir.");
            }
        }
    }
}]);

ngAriane.factory("NotificationFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        List: function (cpAgent) {
            return $http({
                url: DIURLAPI.URLapiNancy + "agents/" + cpAgent,
                method: "get",
                params: {
                    format: "json"
                },
                responseType: "JSON"
            });
        }
    }
}]);