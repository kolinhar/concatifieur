/**
 * Created by PRJS12821 on 08/09/2015.
 */
"use strict";

ngAriane.service("FileUploadService", function () {
    var that = this;

    that.file = {};
});

ngAriane.service("FileListFiche", function () {
    return {
        ListeFichiers: [],
        Request: 0
    }
});