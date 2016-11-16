/**
 * Created by PRJS12821 on 24/03/2015.
 */
"use strict";

/**
 * NUMÉRO DE SEMAINE CLIQUÉ
 */
ngAriane.service("DISemaine", function () {
    return {
            numSemaine: 0
        }
});

/**
 * DATE DE RÉFÉRENCE POUR LES CYCLE PIRGE
 */
ngAriane.service("DIDateref", function () {
    return {
            date: new Date()
        }
});

/**
 * LES SEMAINES DU CYCLE PIRGE EN COURS
 */
ngAriane.service("DISemaines", function () {
    return {
            cyclesSemaines: {}
        }
});