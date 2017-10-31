const gulp = require('gulp');
const fctPerso = require('./fctPerso.js');

const REGEXPINNERCONCATTAG = /<!--CONCATIFICATION-->(.|\r|\n)*?<!--\/CONCATIFICATION-->/g;
const REGEXPINNERLASTOCTAG = /<!--LASTOC-->(\r|\n|.)*?<!--\/LASTOC-->/g;


// Variables de chemins
const source = './src'; // dossier de travail
const destination = './dist'; // dossier à livrer

gulp.task('default', function() {
    // place code for your default task here
    console.log("Hello World!");
});

gulp.task('min', function(){
    fctPerso.deleteFuckingFolder(destination);
    fctPerso.deleteFuckingFolder("TempJS");
    fctPerso.deleteFuckingFolder("TempJS-lastoc");
    fctPerso.deleteFuckingFolder("TempCSS");
    // console.log("Concaténation et minification des fichiers JS et CSS");

    fctPerso.createIndexHTMLFile();
    // console.log("création du fichier index.html terminée.");
    //MISE EN 'PROD'
    fctPerso.duplicateFolder(source, destination);
    // console.log("copie des fichiers terminée");

    // console.log("liste des balises");
    const TagsList = fctPerso.innerTag(REGEXPINNERCONCATTAG);
    // console.log(TagsList);
    console.log(TagsList.scriptsTab.length, `fichier${(TagsList.scriptsTab.length > 1 ? 's': '')} de JS à traiter`);
    console.log(TagsList.stylesTab.length, `fichier${(TagsList.stylesTab.length > 1 ? 's': '')} de CSS à traiter`);

    const LastTagslist = fctPerso.innerTag(REGEXPINNERLASTOCTAG);
    // console.log(LastTagslist);
    console.log(LastTagslist.scriptsTab.length, `fichier${(LastTagslist.scriptsTab.length > 1 ? 's': '')} de JS à traiter en dernier`);
    console.log(LastTagslist.stylesTab.length, `fichier${(LastTagslist.stylesTab.length > 1 ? 's': '')} de CSS à traiter en dernier`);

    const groupScripts1 = fctPerso.groupFiles(TagsList, "script");
    const groupStyles1 = fctPerso.groupFiles(TagsList, "style");
    // console.log("scripts:", groupScripts1);
    // console.log("styles:", groupStyles1);

    const groupScripts2 = fctPerso.groupFiles(LastTagslist, "script");
    const groupStyles2 = fctPerso.groupFiles(LastTagslist, "style");
    // console.log("scripts 2:", groupScripts2);
    // console.log("styles 2:", groupStyles2);

    const listeJS = fctPerso.concatiFicationJS(groupScripts1);
    const listeJSLast = fctPerso.concatiFicationJS(groupScripts2, "last");

    const listeCSS = fctPerso.concatiFicationCSS(groupStyles1);
    const listeCSSLast = fctPerso.concatiFicationCSS(groupStyles2, "last");

    // console.log("liste des scripts:", listeJS);
    // console.log("liste des scripts 'last':", listeJSLast);
    // console.log("liste des styles:", listeCSS);
    // console.log("liste des styles 'last':", listeCSSLast);

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

    console.log("fichier index.html terminé.");
});

gulp.task('init', function () {
    fctPerso.generateIndexHTMLFile();
});