const gulp = require('gulp');
const pump = require('pump');
const path = require('path');
const fctPerso = require('./fctPerso.js');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');

// Variables de chemins
const source = './src'; // dossier de travail
const destination = './dist'; // dossier à livrer

gulp.task('default', function() {
    // place code for your default task here
    console.log("Hello World!");
});

gulp.task('concatification', function(){
    fctPerso.deleteFuckingFolder(destination);
    console.log("Concaténation et minification des fichiers JS et CSS");

    fctPerso.createIndexHTMLFile();
    console.log("création du fichier index.html terminée.");
    //MISE EN 'PROD'
    fctPerso.duplicateFolder(source, destination);
    console.log("copie des fichiers terminée");

    const TagsList = fctPerso.innerConcatification();

    const scriptsPathList = fctPerso.getScriptsPath(TagsList).map(function (v) {
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
                        fctPerso.gestExtScript(val);
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

gulp.task('init', function () {
    fctPerso.generateIndexHTMLFile();
});