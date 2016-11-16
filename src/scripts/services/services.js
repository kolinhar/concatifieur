/**
 * Created by PRJS12821 on 24/03/2015.
 */
"use strict";

/**
 * URL DES API
 */
ngAriane.service("DIURLAPI", function () {
    return {
        URLMongo: "http://x18srhrgcb7:8069/",
        URLsignalR: "http://comet.ariane.st.sncf.fr/",
        URLapi: "http://x18srhrgcb7:8084/",
        URLapiRemote: "http://x18srhrgcb7:8096/",
        URLapiSanteParc: "http://x18srhrgcb7:8097/",
        URLapiFiche: "http://x18srhrgcb7:8098/",
        URLapiUpload: "http://x18srhrgcb7:8099/",
        URLapiNancy: (location.host.indexOf("test.") === 0 || location.host.indexOf("localhost") === 0) ? "http://test.upi.api.arianeinformatique.st.sncf.fr/" : "http://upi.api.arianeinformatique.st.sncf.fr/",
        URLapiAgadir: (location.host.indexOf("test.") === 0 || location.host.indexOf("localhost") === 0) ? "http://test.agadir.ariane.st.sncf.fr/api/" : "http://agadir.ariane.st.sncf.fr/api/",
        URLapiEnquete: "http://x18srhrgcb7:8071/",
        URLGemini: "http://gemini.ariane.st.sncf.fr/api/",
        URLapiAgadirDominator: "http://agadir.ariane.st.sncf.fr/api/", //DEV EN URGENCE UN VENDREDI APREM
        URLVip: "http://x18srhrgcb7:8095/",
        URLGeoLoc: location.host.indexOf("localhost") === 0 ? "http://localhost:57384/" : "http://x18srhrgcb7:8044/"
    }
});

//DONNÉES FILTRÉES
ngAriane.service("DIFilteredData", function () {
    return {
        datas: []
    }
});

ngAriane.service("AjaxErrorManager", function () {
    //@HACK MISÉRABLE POUR CORRIGER LE PROBLÈME DE LA PORTÉE DE "this"
    var that = this;

    that.Infos = null;

    that.Gerer = function (data, status, headers, config, msg) {
        if (that.Infos === null){
            that.Infos = {
                data: null,
                status: null,
                headers: null,
                config: null,
                msg: []
            }
        }

        if (arguments.length === 1)
        {
            that.Infos.msg.push(arguments[0]);
        }
        else
        {
            that.Infos = {
                data: data,
                status: status,
                headers: headers,
                config: config,
                msg: [msg]
            };
        }

        console.warn("Détails de l'erreur", arguments);
    };

    that.RAZ = function () {
        that.Infos = null;
    };
});

ngAriane.service("DatasDJS", function () {
    return {
        Semaine: {},
        reload: 0
    }
});

ngAriane.service("DatasProjets", function () {
    return {
        liste: []
    }
});

ngAriane.service("DatasEtats", function () {
    return {
        liste: []
    }
});

ngAriane.service("JoursName", function () {
    return {
        joursName: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    }
});

ngAriane.service("WorkersFiches", function () {
    var workerMesFiches = new Worker('scripts/workers/AJAXpostWorkerFiches.js');
    var workerToutes = new Worker('scripts/workers/AJAXpostWorkerFiches.js');
    var workerPrioritaires = new Worker('scripts/workers/AJAXpostWorkerFiches.js');
    var workerDispatch = new Worker('scripts/workers/AJAXpostWorkerFiches.js');
    var workerBO = new Worker('scripts/workers/AJAXpostWorkerFiches.js');
    var workerAttente = new Worker('scripts/workers/AJAXpostWorkerFiches.js');
    var workerRecherche = new Worker('scripts/workers/AJAXpostWorkerFiches.js');

    return {
        MesFiches: workerMesFiches,
        Toutes: workerToutes,
        Dispatch: workerDispatch,
        BO: workerBO,
        Attente: workerAttente,
        Recherche: workerRecherche
    }
});

ngAriane.service("DateService", function () {
    var l_date = new Date();
    l_date.setHours(0,0,0,0);

    return {
        today: {
            Date: l_date,
            dateFr : l_date.getDateFR().replace(new RegExp("/", 'g'), "-"),
            year: l_date.getFullYear(),
            weekNum: l_date.getWeekNumber()
        }
    }
});