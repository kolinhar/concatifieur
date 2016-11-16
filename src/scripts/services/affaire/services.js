/**
 * Created by PRJS12821 on 27/08/2015.
 */
"use strict";

ngAriane.service("ProjectAffaire", function () {
    return {
        projet: ""
    }
});

ngAriane.service("ModalAffaire", function () {
    return {
        isModal: false,
        reload: 0,
        selectedAffaire: {}
    }
});
