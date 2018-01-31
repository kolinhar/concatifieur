const fctPerso = require('./fctPerso.js');
const config = require("./service").config;
const values = require("./values");

function _init(verbose) {
    fctPerso.generateIndexHTMLFile(verbose);
}

function _min(verbose) {
    fctPerso.deleteFuckingFolder(config.destination);
    verbose && console.log("Concaténation et minification des fichiers JS et CSS");

    fctPerso.createIndexHTMLFile();
    verbose && console.log("création du fichier index.html.");
    //MISE EN 'PROD'
    fctPerso.duplicateFolder(config.source, config.destination);
    verbose && console.log("copie des fichiers terminée");

    const TagsList = fctPerso.innerTag(values.REGEXPINNERCONCATTAG);
    verbose && console.log("liste des balises");

    verbose && console.log(TagsList.scriptsTab.length, `fichier${(TagsList.scriptsTab.length > 1 ? 's': '')} de JS à traiter`);
    verbose && console.log(TagsList.stylesTab.length, `fichier${(TagsList.stylesTab.length > 1 ? 's': '')} de CSS à traiter`);

    const LastTagslist = fctPerso.innerTag(values.REGEXPINNERLASTOCTAG);

    verbose && console.log(LastTagslist.scriptsTab.length, `fichier${(LastTagslist.scriptsTab.length > 1 ? 's': '')} de JS à traiter en dernier`);
    verbose && console.log(LastTagslist.stylesTab.length, `fichier${(LastTagslist.stylesTab.length > 1 ? 's': '')} de CSS à traiter en dernier`);

    const groupScripts1 = fctPerso.groupFiles(TagsList, "script");
    const groupStyles1 = fctPerso.groupFiles(TagsList, "style");

    verbose && console.log("scripts:", groupScripts1);
    verbose && console.log("styles:", groupStyles1);

    const groupScripts2 = fctPerso.groupFiles(LastTagslist, "script");
    const groupStyles2 = fctPerso.groupFiles(LastTagslist, "style");

    verbose && console.log("scripts 2:", groupScripts2);
    verbose && console.log("styles 2:", groupStyles2);

    const listeJS = fctPerso.concatiFicationJS(groupScripts1);
    const listeJSLast = fctPerso.concatiFicationJS(groupScripts2, "last");

    const listeCSS = fctPerso.concatiFicationCSS(groupStyles1);
    const listeCSSLast = fctPerso.concatiFicationCSS(groupStyles2, "last");

    verbose && console.log("liste des scripts:", listeJS);
    verbose && console.log("liste des scripts 'last':", listeJSLast);
    verbose && console.log("liste des styles:", listeCSS);
    verbose && console.log("liste des styles 'last':", listeCSSLast);

    listeCSS.forEach(function (val) {
        fctPerso.insertStyle(val, "head");
    });
    listeJS.forEach(function (val) {
        fctPerso.insertScript(val, "head");
    });

    listeCSSLast.forEach(function (val) {
        fctPerso.insertStyle(val, "body");
    });
    listeJSLast.forEach(function (val) {
        fctPerso.insertScript(val, "body");
    });

    verbose && console.log("fichier index.html terminé.");
}

module.exports.min = _min;
module.exports.init = _init;