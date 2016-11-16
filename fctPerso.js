"use strict";

const fs = require("fs");
const path = require("path");

/**
 * (SYNC) RECHERCHE LES FICHIERS QUI COMPORTENT UNE EXTENSION DONNÉE DANS UN DOSSIER ET TOUS SES SOUS-DOSSIERS
 * @param {string} chemin - réperetoire dans lequel on cherche les fichiers
 * @param {string} extension - extension des fichiers recherchés commençant par un point ex: '.js'
 * @param {function} callback - fonction appelée lorsque le traitement est terminé dont le paramètre est la liste des fichiers trouvés
 * @param {string[]} [pathArray] - tableau de chaines de caractères contenant la liste des fichiers
 */
function searchFilesByExtension (chemin, extension, callback, pathArray) {
    var _DEBUG = false;
    extension = extension.toLowerCase();

    if (pathArray === undefined)
        pathArray = [];

    //SUPPRESSION DES '/' EN DÉBUT ET FIN DE CHAINE
    chemin = trimFolderPath(chemin);

    //console.log(contenu);

    //ON NE CONSIDÈRE PAS LES RÉPERTOIRES (ET LEURS SOUS-DOSSIERS) CONTENANT UN FICHIER '.IGNORE'
    try{
        var truc = fs.accessSync(chemin + "/.ignore");
        _DEBUG && console.log(".ignore trouvé dans", chemin);
        _DEBUG && console.log("fichier(s) ignoré(s)", fs.readdirSync(chemin).filter(function (val) {
            return val !== ".ignore";
        }).join(", "));
        return;
    }
    catch(e){
        //TOUT VA BIEN
    }

    //D'ABORD LES FICHIERS DU RÉPERTOIRE EN COURS
    contenu.forEach(function (val, ind, arr) {
        var cheminFichierCourant = chemin + "/" + val;

        if (fs.statSync(cheminFichierCourant).isDirectory() === false && cheminFichierCourant.slice(cheminFichierCourant.length-extension.length, cheminFichierCourant.length).toLowerCase() === extension)
            pathArray.push(cheminFichierCourant);
    });

    //PUIS LES RÉPERTOIRES
    contenu.forEach(function (val, ind, arr) {
        var cheminDossierCourant = chemin + "/" + val;

        if (fs.statSync(cheminDossierCourant).isDirectory() === true) {
            /**
             * ON NE PASSE PAS LE CALLBACK SINON CE SERA L'ENFER ;-)
             * MAIS ON PASSE LE DERNIER PARAMÈTRE QUI SERA PASSÉ EN RÉFÉRENCE
             */
            searchFilesByExtension(cheminDossierCourant, extension, null, pathArray);
        }

        if (ind === arr.length-1)
            callback && callback(pathArray);
    });
}

/**
 * (SYNC) SUPPRIME UN RÉPERTOIRE MÊME SI IL Y A DES FICHIERS/DOSSIERS À L'INTÉRIEUR DE MANIÈRE RÉCURSIVE
 * @param path
 */
function deleteFuckingFolder (path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFuckingFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

/**
 * (SYNC) CRÉE UN FICHIER INDEX.HTML DANS LE RÉPERTOIRE PASSÉ EN PARAMÈTRE
 * @param {string} indexOrig - l'emplacement du fichier d'origine
 * @param {string} path - le répertoire de destination
 */
function createIndexHTMLFile (indexOrig, path){
    if(!fs.existsSync(path))
        fs.mkdirSync(path);

    if (!fs.existsSync(indexOrig))
        throw "fichier '" + indexOrig + "' introuvable";

    var indexOrigFile = fs.readFileSync(indexOrig, "utf8").replace(/>\s+</gi, "><").replace(/<!--CONCATIFICATION-->(<.*?>)<!--\/CONCATIFICATION-->/gmi, "");

    fs.writeFileSync(path + "/index.html",indexOrigFile);

    /* "<!DOCTYPE html>\n" +
        "<html lang='fr'>\n" +
        "\t<head>\n" +
        "\t\t<meta charset='UTF-8'>\n" +
        "\t\t<meta name='viewport' content='width=device-width, initial-scale=1'>\n" +
        "\t\t<title>index.html</title>\n" +
        "\t</head>\n" +
        "\t<body>\n" +
        "\t</body>\n" +
        "</html>", "utf8");*/
}

/**
 * (SYNC) AJOUTE UNE BALISE DE STYLE EN FIN DE HEAD
 * @param {string} path chemin du fichier index.html
 * @param {string} stylePath chemin du fichier de style
 */
function insertStyle (path, stylePath) {
    var html = fs.readFileSync(path, "utf8");

    var posHead = html.indexOf("</head>");

    if (posHead !== -1){
        html = html.replace("</head>",
            "\t<link rel='stylesheet' href='" + normalizePath(stylePath) + "' >\n" +
            "\t</head>");

        fs.writeFileSync(path, html, "utf8");
    }
    else{
        throw "balise head introuvable.";
    }
}

/**
 * (SYNC) AJOUTE UNE BALISE DE SCRIPT EN FIN DE BODY
 * @param {string} path chemin du fichier index.html
 * @param {string} scriptPath chemin du fichier de script
 */
function insertScript(path, scriptPath){
    var html = fs.readFileSync(path, "utf8");

    var posHead = html.indexOf("</body>");

    if (posHead !== -1){
        html = html.replace("</body>",
            "\t<script src='" + normalizePath(scriptPath) + "'></script>\n" +
            "\t</body>");

        fs.writeFileSync(path, html, "utf8");
    }
    else{
        throw "balise body introuvable.";
    }
}

/**
 * (SYNC) COPIE UN RÉPERTOIRE SON ARBORESCENCE ET SON CONTENU VERS UN AUTRE EMPLACEMENT
 * @param {string} origPath - chemin (relatif) de la source
 * @param {string} destPath - chemin de destination de l'arborescence
 */
function duplicateFolder(origPath, destPath) {
    origPath = path.normalize(origPath);
    destPath = path.normalize(destPath);

    origPath
        .replace("src\\", "")
        .split("\\")
        .filter(function (val) {
            return val !== "";
        })
        .forEach(function (val) {
            destPath += "\\" + val;

            if (!fs.existsSync(destPath))
                fs.mkdirSync(destPath);
    });

    fs.readdirSync(origPath)
        .forEach(function (val) {
            try {
                fs.linkSync(origPath + "\\" + val, destPath + "\\" + val);
            } catch (e) {
                if (e.code === "EEXIST"){
                    console.warn("le fichier " + destPath + "\\" + val + " existe déjà.");
                }
            }
        });

/*    if(isDuplicableFolder(origPath)){
        //PAS DE FICHIER .ignore
        if (!fs.existsSync(destPath))
            fs.mkdirSync(destPath);

        fs.linkSync(origPath, destPath);
    }
    else{
        //FICHIER .ignore TROUVÉ
    }*/
}

function moveToDist() {

}

/**
 * (SYNC) VÉRIFIE SI LE RÉPERTOIRE EST À PRENDRE EN COMPTE, C'EST À DIRE QU'IL NE DOIT PAS CONTENIR UN FICHIER .'ignore'
 * @param {string} path - répertoire à tester
 * @returns {boolean}
 */
function isDuplicableFolder(path){
    return !fs.existsSync(trimFolderPath(path) + "/.ignore");
}

/**
 * SUPPRIME LES '/' EN DÉBUT ET FIN DE CHAINE
 * @param {string} path
 * @returns {string}
 */
function trimFolderPath(path){
    //SUPPRESSION DES '/' EN DÉBUT ET FIN DE CHAINE
    if (path.slice(0, 1) === "/")
        path = path.slice(1);

    if (path.slice(path.length - 1, path.length) === "/")
        path = path.slice(0, path.length - 1);

    return path;
}

/**
 * RECHERCHE TOUTES LES BALISES CONCATIFICATION ET RETOURNE UNE LISTE DE LEURS CONTENUS
 * @param {string} path - le chemin du fichier
 * @returns {Array} tableau de chemins
 */
function innerConcatification(path){
    var html = fs.readFileSync(path, "utf8").replace(/>\s+</gi, "><");
    var concatArr = html.match(/<!--CONCATIFICATION-->(<.*?>)<!--\/CONCATIFICATION-->/gmi);

    if (concatArr !== null){
        var ret = [];

        concatArr.forEach(function (val, ind, arr) {
            val.split(/(<.*?>)/)
                .filter(function (v) {
                    return v !== "" && v !== "<!--CONCATIFICATION-->" && v !== "<!--/CONCATIFICATION-->" && v!== "</script>";
                })
                .forEach(function (val, ind, arr) {
                    ret.push(val);
                });
        });

        return ret;
    }
    else{
        return [];
    }
}

/**
 * RETOURNE LE CONTENU DE L'ATTRIBUT SRC D'UNE BALISE SCRIPT
 * @param {string} strTag - la balise sous forme de chaine de caractères
 * @returns {*}
 */
function extractScriptPath(strTag){
    var src = strTag.match(/src=["|'].*?["|']/);

    if (strTag.indexOf("<script") === 0 && src !== null) {
        var ret = src[0]
            .match(/["|'].*?["|']/)[0]
            .replace(/["|']/g, "");

        return normalizePath(ret)
    }
}

/**
 * RETOURNE LE CONTENU DE L'ATTRIBUT HREF D'UNE BALISE LINK
 * @param {string} strTag - la balise sous forme de chaine de caractères
 * @returns {*}
 */
function extractStylePath (strTag) {
    var href = strTag.match(/href=["|'].*?["|']/);

    if (strTag.indexOf("<link") === 0 && strTag.match(/rel=["|']stylesheet["|']/i) !== null && href !== null) {
        var ret = href[0]
            .match(/["|'].*?["|']/)[0]
            .replace(/["|']/g, "");

        return normalizePath(ret)
    }
}

/**
 * AJOUTE AU CHEMIN './' SI NÉCESSAIRE
 * @param {string} path - le chemin à normaliser
 * @returns {string}
 */
function normalizePath (path) {
    return (path.indexOf("/") === 0 ? ("." + path) : (path.indexOf(".") === 0 ? path : ("./" + path)));
}

/**
 * RETOURNE UN TABLEAU DE CHEMINS DES SCRIPTS
 * @param {Array} tagList - une liste de balises sous forme de chaine de caractères
 * @returns {Array}
 */
function getScriptsPath(tagList) {
    return tagList.filter(function (val, ind, arr) {
        return val.indexOf("<script") === 0
    }).map(extractScriptPath);
}

/**
 * RETOURNE UN TABLEAU DE CHEMINS DES STYLES
 * @param {Array} tagList - une liste de balises sous forme de chaine de caractères
 * @returns {Array}
 */
function getStylesPath(tagList) {
    return tagList.filter(function (val, ind, arr) {
        return val.indexOf("<link") === 0
    }).map(extractStylePath);
}

module.exports.deleteFuckingFolder = deleteFuckingFolder;
module.exports.createIndexHTMLFile = createIndexHTMLFile;
module.exports.insertStyle = insertStyle;
module.exports.insertScript = insertScript;
module.exports.innerConcatification = innerConcatification;
module.exports.getScriptsPath = getScriptsPath;
module.exports.getStylesPath = getStylesPath;
module.exports.duplicateFolder = duplicateFolder;