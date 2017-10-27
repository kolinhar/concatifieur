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

gulp.task('min', function(callback){
    fctPerso.deleteFuckingFolder(destination);
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

/*
gulp.task("concatification", function (arg) {
    fctPerso.deleteFuckingFolder(destination);
    console.log("Concaténation et minification des fichiers JS et CSS");

    fctPerso.createIndexHTMLFile();
    console.log("création du fichier index.html terminée.");
    //MISE EN 'PROD'
    fctPerso.duplicateFolder(source, destination);
    console.log("copie des fichiers terminée");

    const TagsList = fctPerso.innerConcatification();

    const scriptsPathList = fctPerso.getScriptsPath(TagsList).map(function (v) {
        console.log(v);
        return path.resolve(source, v);
    });

    const stylesPathList = fctPerso.getStylesPath(TagsList).map(function (v) {
        return path.resolve(source, v);
    });

    console.log("JS:", scriptsPathList.length, " fichier(s)");
    console.log("CSS:", stylesPathList.length, " fichier(s)");

    if (scriptsPathList.length > 0){
        const JSfileName = new Date().getTime().toString() + '-dist.js';
        pump([
                gulp.src(scriptsPathList),
                concat(JSfileName),
                uglify(),
                gulp.dest(destination + "/JS")
            ],
            function (err) {
                if (err != null){
                    console.error(err);
                }
                else{
                    console.log("concatification JS terminée.");
                    fctPerso.insertScript("/JS/" + JSfileName);
                    console.log("ajout du script à la page terminé.");

                    //TRAITEMENT DES SCRIPTS À METTRE EN DERNIER
                    console.log("traitement des scripts à appeler en dernier.");
                    fctPerso.innerLaSToC().forEach(function (val, ind, arr) {
                        fctPerso.getExtScript(val);
                    });
                }
            }
        );
    }

    if (stylesPathList.length > 0){
        const CSSfileName = new Date().getTime().toString() + '-dist.css';
        pump([
                gulp.src(stylesPathList),
                concat(CSSfileName),
                cleanCSS({
                    keepSpecialComments: 0
                }),
                gulp.dest(destination + "/CSS")
            ],
            function (err) {
                if (err != null){
                    console.error(err);
                }
                else{
                    console.log("concatification CSS terminée.");
                    fctPerso.insertStyle("/CSS/" + CSSfileName);
                    console.log("ajout du style à la page terminé.");
                }
            }
        );
    }

});
*/

gulp.task('init', function () {
    fctPerso.generateIndexHTMLFile();
});