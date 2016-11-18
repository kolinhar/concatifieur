var gulp = require('gulp');
var pump = require('pump');
var fctPerso = require('./fctPerso.js');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');

// Variables de chemins
var source = './src'; // dossier de travail
fctPerso.setSrcFolderName(source);
var destination = './dist'; // dossier à livrer

gulp.task('default', function() {
    // place code for your default task here
    console.log("Hello World!");
});

gulp.task('concatification', function(){
    fctPerso.deleteFuckingFolder(destination);
    console.log("Concaténation et minification des fichiers JS et CSS");

    fctPerso.createIndexHTMLFile(source + "/index.html", destination);
    console.log("création du fichier index.html terminée.");
    //MISE EN 'PROD'
    fctPerso.duplicateFolder(source, destination);
    console.log("copie des fichiers terminée");

    var TagsList = fctPerso.innerConcatification(source + "/index.html");

    //console.log("TagsList", TagsList);

    var scriptsPathList = fctPerso.getScriptsPath(TagsList).map(function (v) {
        return v.replace("./", source + "/")
    });
    var stylesPathList = fctPerso.getStylesPath(TagsList).map(function (v) {
        return v.replace("./", source + "/")
    });

    //console.log(scriptsPathList, stylesPathList);

    console.log("JS:", scriptsPathList.length, " fichier(s)");
    console.log("CSS:", stylesPathList.length, " fichier(s)");

    var JSfileName = new Date().getTime().toString() + '-dist.js';
    pump([
            gulp.src(scriptsPathList),
            concat(JSfileName),
            uglify({
                preserveComments: false
            }),
            gulp.dest(destination + "/JS")
        ],
        function (err) {
            if (err != null){
                console.error(err);
            }
            else{
                console.log("concatification JS terminée.");
                fctPerso.insertScript(destination + "/index.html", "/JS/" + JSfileName);
                console.log("ajout du script à la page terminé.");
            }
        }
    );

    var CSSfileName = new Date().getTime().toString() + '-dist.css';
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
                fctPerso.insertStyle(destination + "/index.html", "/CSS/" + CSSfileName);
                console.log("ajout du style à la page terminé.");
            }
        }
    );
});

gulp.task('testFct', function () {
    //path = require("path");
    //console.log(path.parse(path.normalize(source)).name);
    //console.log(path.parse(path.normalize(source + "/images")));
});