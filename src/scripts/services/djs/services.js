/**
 * Created by PRJS12821 on 13/01/2016.
 */
"use strict";

ngAriane.service("djsCounter", function () {
    var objRet = {
        dateDeb: null,
        dateFin: null,

        numSemaineEncoreAvant: 0,
        numSemaineAvant: 0,
        numSemaineEnCours: 0,
        numSemaineApres: 0,
        numSemaineEncoreApres: 0,

        anneeEncoreAvant: 0,
        anneeAvant: 0,
        anneeEnCours: 0,
        anneeApres: 0,
        anneeEncoreApres: 0
    };

    /**
     * À PARTIR DE LA DATE PASSÉE EN PARAMÈTRE (OU CELLE DU JOUR), RETOURNE LA DATE DU LUNDI MINUIT DE LA SEMAINE EN COURS
     * @param {Date} [oDate] - la date de référence
     * @returns {Date}
     * @private
     */
    var _initDateLundi = function (oDate) {
        var l_date = null;

        if (angular.isDate(oDate))
            l_date = new Date(oDate);
        else
            l_date = new Date();

        var l_jour = l_date.getDay();

        if (l_jour === 0)
            l_date.setDate(l_date.getDate() - 6);
        else
            l_date.setDate(l_date.getDate() - l_jour + 1);

        l_date.setHours(0,0,0,0);

        return l_date;
    };

    /**
     * INITIALISE LA DATE
     * @param {Date} [oDate] - date de référence
     */
    objRet.setDate = function (oDate) {
        if (angular.isDate(oDate) === false)
            oDate = new Date();

        oDate = _initDateLundi(oDate);

        var l_date = new Date(oDate);
        l_date.setHours(0,0,0,0);

        var l_dateEncoreAvant = new Date(l_date),
            l_dateAvant = new Date(l_date),
            l_dateApres = new Date(l_date),
            l_dateEncoreApres = new Date(l_date);

        l_dateEncoreAvant.setDate(l_date.getDate() - 14);
        l_dateAvant.setDate(l_date.getDate() - 7);
        l_dateApres.setDate(l_date.getDate() + 7);
        l_dateEncoreApres.setDate(l_date.getDate() + 14);

        objRet.anneeEncoreAvant = l_dateEncoreAvant.getFullYear();
        objRet.numSemaineEncoreAvant = l_dateEncoreAvant.getWeekNumber();

        objRet.anneeAvant = l_dateAvant.getFullYear();
        objRet.numSemaineAvant = l_dateAvant.getWeekNumber();

        objRet.anneeEnCours = l_date.getFullYear();
        objRet.numSemaineEnCours = l_date.getWeekNumber();

        objRet.anneeApres = l_dateApres.getFullYear();
        objRet.numSemaineApres = l_dateApres.getWeekNumber();

        objRet.anneeEncoreApres = l_dateEncoreApres.getFullYear();
        objRet.numSemaineEncoreApres = l_dateEncoreApres.getWeekNumber();

        objRet.dateDeb = l_date;
        objRet.dateFin = new Date(l_date);
        objRet.dateFin.setDate(l_date.getDate() + 6);
    };

    /**
     * AJOUTE UNE SEMAINE
     * @param {Date} [oDate] - date de référence
     */
    objRet.nextWeek = function (oDate) {
        var l_date,
            l_dateAvant,
            l_dateApres;

        if (angular.isDate(oDate) === true)
            l_date = _initDateLundi(oDate);
        else
            l_date = _initDateLundi(objRet.dateDeb);


        l_dateAvant = new Date(l_date);
        objRet.numSemaineAvant = l_dateAvant.getWeekNumber();
        objRet.anneeAvant = l_dateAvant.getFullYear();

        l_date.setDate(l_date.getDate() + 7);
        objRet.numSemaineEnCours = l_date.getWeekNumber();
        objRet.anneeEnCours = l_date.getFullYear();

        l_dateApres = new Date(l_date);
        l_dateApres.setDate(l_date.getDate() + 7);
        objRet.numSemaineApres = l_dateApres.getWeekNumber();
        objRet.anneeApres = l_dateApres.getFullYear();

        objRet.dateDeb = l_date;
        objRet.dateFin = new Date(l_date);
        objRet.dateFin.setDate(l_date.getDate() + 6);
    };

    /**
     * RETIRE UNE SEMAINE
     * @param {Date} [oDate] - date de référence
     */
    objRet.prevWeek = function (oDate) {
        var l_date,
            l_dateAvant,
            l_dateApres;

        if (angular.isDate(oDate) === true)
            l_date = _initDateLundi(oDate);
        else
            l_date = _initDateLundi(objRet.dateDeb);

        l_dateApres = new Date(l_date);
        objRet.numSemaineApres = l_dateApres.getWeekNumber();
        objRet.anneeApres = l_dateApres.getFullYear();

        l_date.setDate(l_date.getDate() - 7);
        objRet.numSemaineEnCours = l_date.getWeekNumber();
        objRet.anneeEnCours = l_date.getFullYear();

        l_dateAvant = new Date(l_date);
        l_dateAvant.setDate(l_date.getDate() - 7);
        objRet.numSemaineAvant = l_dateAvant.getWeekNumber();
        objRet.anneeAvant = l_dateAvant.getFullYear();

        objRet.dateDeb = l_date;
        objRet.dateFin = new Date(l_date);
        objRet.dateFin.setDate(l_date.getDate() + 6);
    };

    return objRet;
});

ngAriane.service("WorkersDJSs", function () {
    var workerEnCours = new Worker('scripts/workers/AJAXgetWorkerDJSs.js'),
        workerAvant = new Worker('scripts/workers/AJAXgetWorkerDJSs.js'),
        workerApres = new Worker('scripts/workers/AJAXgetWorkerDJSs.js');

    return {
        EnCours: workerEnCours,
        Avant: workerAvant,
        Apres: workerApres
    };
});

ngAriane.service("DjsCommune", function () {
    return {
        djs: {}
    }



});