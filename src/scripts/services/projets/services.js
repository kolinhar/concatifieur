/**
 * Created by PRJS12821 on 21/09/2015.
 */
"use strict";

ngAriane.service("ProjetModalService", function () {
    return {
        list: [],
        model: ""
    };
});

ngAriane.service("ProjetFilterService", function () {
    /**
     * RETOURNE TRUE SI LA DATE DE LA FICHE EST COMPRISE DANS LES DATES DU PROJET
     * @param {string|Date} dateFiche - la date de création de la fiche
     * @param {Date} dateDeb - la date d'ouverture du projet
     * @param {Date} dateFin - la date de clôture du projet
     * @returns {boolean}
     * @private
     */
    var _dateFilter = function (dateFiche, dateDeb, dateFin) {
        var l_dateDebutProjet = new Date(dateDeb).getTime(),
            l_dateFinProjet = new Date(dateFin).getTime(),
            l_finalDateFiche;

        if (angular.isString(dateFiche) === true && dateFiche.length === 4) {
            l_finalDateFiche = new Date(dateFiche, 0, 1, 0, 0, 0, 0).getTime();
        }
        else {
            if (angular.isDate(dateFiche) === true) {
                l_finalDateFiche = dateFiche.getTime();
            }
            else {
                //ON PREND LA DATE DU JOUR
                var l_date = new Date();
                l_date.setHours(0, 0, 0, 0);
                l_finalDateFiche = l_date.getTime();
            }
        }

        return l_finalDateFiche >= l_dateDebutProjet && l_finalDateFiche <= l_dateFinProjet;
    };

    return {
        /**
         * FILTRE LES PROJETS DISPONIBLE POUR UNE FICHE EN FONCTION DU DEMANDEUR ET DU POSTE
         * @param {string} materiel - le poste
         * @param {string} etablissementDemandeur - l'établissement d'appartenance de l'agent demandeur
         * @param {Array} projectList - la liste non-filtrée des projets
         * @returns {Array} - la liste filtrée des projets
         * @constructor
         */
        ForFiche: function (materiel, etablissementDemandeur, projectList) {
            var typeProjet = "",
                CATIregexp = new RegExp(/^PCI/g),
                SINAIregexp = new RegExp(/^PIV/g),
                EICregexp = new RegExp(/^EIC/g);

            //FILTRAGE CATI
            if (CATIregexp.test(materiel) === true)
                typeProjet = "CATI";

            //FILTRAGE SINAI
            if (SINAIregexp.test(materiel) === true && EICregexp.test(etablissementDemandeur) === true)
                typeProjet = "SINAI";

            //FILTRER LES PROJETS EN FONCTION DU POSTE
            return projectList.filter(function (val) {
                if (typeProjet === "")
                    return val.type === "fiche";
                else
                    return val.type === "fiche" && val.filtre_projet === typeProjet;
            });
        }
    }
});