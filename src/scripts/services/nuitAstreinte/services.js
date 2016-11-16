/**
 * Created by PRJS12821 on 04/09/2015.
 */
"use strict";

ngAriane.service("VerifDatasNuitAstreinte", function () {
    return {
        /**
         * VÉRIFIE LA PRÉSENCE DES DONNÉES SUR LE FORMULAIRE NUIT/ASTREINTE
         * @returns {boolean}
         */
        FromForm: function (pointage) {
            var l_cptErr = 0;

            //PROJET
            if (pointage.selectedProject === undefined) {
                l_cptErr++;
                pointage.errProj = true;
            }
            else {
                pointage.errProj = false;
            }

            //DESCRIPTION
            if (pointage.TravailRealise === undefined || pointage.TravailRealise.trim() === "") {
                l_cptErr++;
                pointage.errDesc = true;
            }
            else {
                pointage.errDesc = false;
            }

            //DATE DE DÉBUT (EXISTANCE)
            if (pointage.dateDebut === undefined || pointage.dateDebut === "") {
                l_cptErr++;
                pointage.errDateDeb = true;
            }
            else {
                pointage.errDateDeb = false;
            }

            //DATE DE FIN (EXISTANCE)
            if (pointage.dateFin === undefined || pointage.dateFin === "") {
                l_cptErr++;
                pointage.errDateFin = true;
            }
            else {
                pointage.errDateFin = false;
            }

            //HEURE DE DÉBUT (EXISTANCE)
            if (pointage.heureDebut === undefined || pointage.heureDebut === null) {
                l_cptErr++;
                pointage.errHeureDeb = true;
            }
            else {
                pointage.errHeureDeb = false;
            }

            //HEURE DE FIN (EXISTANCE)
            if (pointage.heureFin === undefined || pointage.heureFin === null) {
                l_cptErr++;
                pointage.errHeureFin = true;
            }
            else {
                pointage.errHeureFin = false;
            }

            return l_cptErr === 0;
        },
        /**
         * VÉRIFIE LA COHÉRENCE DES DATES DU FORMULAIRE NUIT/ASTREINTE
         * @returns {boolean}
         */
        DateTime: function (pointage) {
            var l_cptErr = 0,
                l_dateErr = false,
                l_dateDebut,
                l_dateFin,
                l_heureDebut = pointage.heureDebut,
                l_heureFin = pointage.heureFin,
                regEx = /^(?:0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

            //DATE DÉBUT
            if (!IsDate(pointage.dateDebut)) {
                l_cptErr++;
                pointage.errDateDeb = true;
            }
            else {
                pointage.errDateDeb = false;
                l_dateDebut = Date.setDateFR(pointage.dateDebut);
                l_dateDebut.setHours(0, 0, 0, 0);
            }

            //DATE FIN
            if (!IsDate(pointage.dateFin)) {
                l_cptErr++;
                pointage.errDateFin = true;
            }
            else {
                pointage.errDateFin = false;
                l_dateFin = Date.setDateFR(pointage.dateFin);
                l_dateFin.setHours(0, 0, 0, 0);
            }

            //HEURE DEBUT
            if (!regEx.test(pointage.heureDebut)) {
                l_cptErr++;
                pointage.errHeureDeb = true;
            }

            //HEURE FIN
            if (!regEx.test(pointage.heureFin)) {
                l_cptErr++;
                pointage.errHeureFin = true;
            }
            else
            {
                //COHÉRENCE DES DATES
                if (l_dateDebut.getTime() > l_dateFin.getTime()) {
                    l_cptErr++;
                    l_dateErr = true;
                    pointage.errDateDeb = true;
                    pointage.errDateFin = true;
                }
                else {
                    l_dateErr = false;
                }

                var tabHeureDebut = l_heureDebut.split(":");
                var tabHeureFin = l_heureFin.split(":");

                l_dateDebut.setHours(tabHeureDebut[0], tabHeureDebut[1], 0, 0);
                l_dateFin.setHours(tabHeureFin[0], tabHeureFin[1], 0, 0);

                if(tabHeureDebut[1] % 3 !== 0)
                {
                    l_cptErr++;
                    pointage.errHeureDeb = true;
                }
                else
                {
                    if(tabHeureFin[1] % 3 !== 0)
                    {
                        l_cptErr++;
                        pointage.errHeureFin = true;
                    }
                    else
                    {
                        //COHÉRENCE DES HEURES
                        if (l_dateErr === false && l_dateDebut.getTime() >= l_dateFin.getTime()) {
                            l_cptErr++;
                            pointage.errHeureDeb = true;
                            pointage.errHeureFin = true;
                        }
                        else {
                            pointage.errHeureDeb = false;
                            pointage.errHeureFin = false;
                        }
                    }
                }
            }

            return l_cptErr === 0;
        }
    }
});

/**
 * SERVICE DE GESTION DE LA FENÊTRE MODAL DE MODIFICATION DE POINATGE DE NUIT ET D'ASTREINTE
 */
ngAriane.service("ModalPointageNuitAstreinte", function () {
    var That = this;

    That.pointage = {};

    That.RAZ = function () {
        this.pointage = {};
    };
});