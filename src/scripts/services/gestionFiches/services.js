/**
 * Created by PRJS12821 on 24/03/2015.
 */
"use strict";

ngAriane.service("DINotif", function () {
    return {
            message: ""
    }
});

ngAriane.service("DIOnglets", function () {
    return {
            liens: []
    }
});

ngAriane.service("DIOnglet", function () {
    return {
            etat: ""
    }
});

ngAriane.service("DISumFiche", function () {
    return {
            sum: 0
    }
});

ngAriane.service("FichesAgent", function () {
    return {
        Nb: 0
    };
});

ngAriane.service("FichesToutes", function () {
    return {
        Nb: 0
    };
});

ngAriane.service("FichesDispatch", function () {
    return {
        Nb: 0,
        fiches: []
    };
});

ngAriane.service("FichesBO", function () {
    return {
        Nb: 0
    };
});

ngAriane.service("FichesAttente", function () {
    return {
        Nb: 0
    };
});

ngAriane.service("FichesPrioritaires", function () {
    return {
        Nb: 0
    };
});

ngAriane.service("FichesRecherche", function () {
    return {
        Nb: 0
    };
});

ngAriane.service("FichesAffaire", function () {
    return {
        Nb: 0
    };
});