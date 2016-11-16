/**
 * Created by PRJS12821 on 21/04/2015.
 */
"use strict";

ngAriane.service("DatasFicheAgadir", function () {
    return {
        fiche: {}
    }
});

ngAriane.service("DatasAgents", function () {
    return {
        liste: []
    }
});

ngAriane.service("DatasHistoPoste", function () {
    return {
        liste: []
    }
});

ngAriane.service("DatasSanteParc", function () {
    return {
        liste: []
    }
});

ngAriane.service("DatasPtgJour", function () {
    return {
        liste: []
    }
});

ngAriane.service("DatasUrgence", function () {
    return [
        {label: "Fiche normale", value: false},
        {label: "Fiche urgente", value: true}
    ]
});

ngAriane.service("RegionService", function () {
    return {
        List : [
            {value: "1", label: "ESTI IDF"},
            {value: "53", label: "REG BOURGOGNE FRANCHE-COMTE"},
            {value: "43", label: "REG POITOU-CHARENTES AQUITAINE"},
            {value: "58", label: "REG PROVENCE ALPES COTE D'AZUR"},
            {value: "57", label: "REGION ALPES"},
            {value: "18", label: "REGION ALSACE"},
            {value: "56", label: "REGION AUVERGNE"},
            {value: "36", label: "REGION BRETAGNE"},
            {value: "46", label: "REGION CENTRE"},
            {value: "14", label: "REGION CHAMPAGNE-ARDENNE"},
            {value: "59", label: "REGION LANGUEDOC-ROUSSILLON"},
            {value: "44", label: "REGION LIMOUSIN"},
            {value: "17", label: "REGION LORRAINE"},
            {value: "47", label: "REGION MIDI PYRENEES"},
            {value: "23", label: "REGION NORD PAS DE CALAIS"},
            {value: "33", label: "REGION NORMANDIE"},
            {value: "37", label: "REGION PAYS DE LA LOIRE"},
            {value: "24", label: "REGION PICARDIE"},
            {value: "54", label: "REGION RHONE-ALPES"}
        ]
    }
});

ngAriane.service("ficheToClone", function () {
    return {
        fiche: {}
    }
});
