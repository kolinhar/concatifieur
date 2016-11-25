"use strict";

const fs = require("fs");
const path = require("path");

// DOSSIER DE TRAVAIL
const SOURCE = path.resolve('./src');
// DOSSIER À LIVRER
const DESTINATION = path.resolve('./dist');

const IGNORENAME = ".ignore";
const REGEXPSPACEBETWEENTAGS = />\s+</gm;
const REGEXPNEWLINE = /\r*\n*/gm;
const REGEXPINNERCONCATTAG = /<!--CONCATIFICATION-->(<.*?>)*<!--\/CONCATIFICATION-->/gmi;
const REGEXPINNERLASTOCTAG = /<!--LASTOC-->(\r|\n|.)*<!--\/LASTOC-->/gmi;
const REGEXPINNERCOMMENTTAG = /<!--\s*.*\s*-->/gm;
const REGEXPSTRINGINSTRING = /["|'].*?["|']/;
const REGEXPCOMMENTMULTIPLELINE = /\/\*.*\*\//g;
var INDEXFILENAME = "index.html";
var SRCFOLDERNAME = path.parse(SOURCE).base;

/**
 * (SYNC) SUPPRIME UN RÉPERTOIRE MÊME SI IL Y A DES FICHIERS/DOSSIERS À L'INTÉRIEUR DE MANIÈRE RÉCURSIVE
 * @param {string} folder - le chemin vers le répertoire à supprimer
 */
function deleteFuckingFolder (folder) {
    folder = path.resolve(folder);

    if( fs.existsSync(folder) ) {
        fs.readdirSync(folder).forEach(function(file){
            var curPath = path.resolve(folder, file);

            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFuckingFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(folder);
    }
}

/**
 * (SYNC) CRÉE UN FICHIER INDEX.HTML DANS LE RÉPERTOIRE PASSÉ EN PARAMÈTRE
 * @param {string} [indexOrig] - l'emplacement du fichier d'origine
 * @param {string} [pathDest] - le répertoire de destination
 */
function createIndexHTMLFile (indexOrig, pathDest){
    indexOrig = indexOrig || path.resolve(SOURCE, "index.html");
    pathDest = pathDest || DESTINATION;

    //console.log(indexOrig, pathDest);

    if(!fs.existsSync(pathDest))
        fs.mkdirSync(pathDest);

    if (!fs.existsSync(indexOrig))
        throw "fichier '" + indexOrig + "' introuvable";

    var indexOrigFile = fs.readFileSync(indexOrig, "utf8");

    //SUPPRESSION DES ESPACES INUTILES ENTRE LES BALISES
    indexOrigFile = indexOrigFile.replace(REGEXPSPACEBETWEENTAGS, "><");

    //SUPPRESSION DES SAUTS DE LIGNE ET DES RETOUR CHARIOT
    indexOrigFile = indexOrigFile.replace(REGEXPNEWLINE, "");

    //SUPRESSION DES BALISES CONCATIFICATION
    indexOrigFile = deleteCommentTag(indexOrigFile, "CONCATIFICATION");

    //SUPRESSION DES BALISES LASTOC
    indexOrigFile = deleteCommentTag(indexOrigFile, "LASTOC");

    //SUPPRESSION DES BALISES DE COMMENTAIRE
    indexOrigFile = indexOrigFile.replace(REGEXPINNERCOMMENTTAG, "");

    fs.writeFileSync(pathDest + "/index.html", indexOrigFile);
}

/**
 * (SYNC) CRÉÉ UN FICHIER 'index.html' DANS LE RÉPERTOIRE DE TRAVAIL
 */
function generateIndexHTMLFile() {

    if (fs.existsSync(path.resolve(SOURCE, "index.html"))){
        console.log("Un fichier 'index.html' existe déjà dans le dossier " + SOURCE);
    }
    else{
        if (!fs.existsSync(path.resolve(SOURCE)))
            fs.mkdirSync(path.resolve(SOURCE));

        fs.writeFileSync(path.resolve(SOURCE, "index.html"), "<!DOCTYPE html>\n" +
            "<html lang='fr'>\n" +
            "\t<head>\n" +
            "\t\t<meta charset='UTF-8'>\n" +
            "\t\t<meta name='viewport' content='width=device-width, initial-scale=1'>\n" +
            "\t\t<title>index.html</title>\n" +
            "\t\t<!--CONCATIFICATION-->\n" +
            "\t\t<!--/CONCATIFICATION-->\n" +
            "\t</head>\n" +
            "\t<body>\n" +
            "\t\t<!--CONCATIFICATION-->\n" +
            "\t\t<!--/CONCATIFICATION-->\n" +
            "\t\t<!--LASTOC-->\n" +
            "\t\t<!--/LASTOC-->\n" +
            "\t</body>\n" +
            "</html>", "utf8");

        console.log("fichier 'index.html' créé dans le dossier " + SOURCE);
    }
}

/**
 * (SYNC) AJOUTE UNE BALISE DE STYLE EN FIN DE HEAD
 * @param {string} stylePath chemin du fichier de style
 * @param {string} [filePath] chemin du fichier index.html
 */
function insertStyle (stylePath, filePath) {
    filePath = filePath || path.resolve(DESTINATION, "index.html");

    var html = fs.readFileSync(filePath, "utf8");
    var posHead = html.indexOf("</head>");

    if (posHead !== -1){
        html = html.replace("</head>",
            "<link rel='stylesheet' href='" + normalizePath(stylePath) + "' >" +
            "</head>");

        fs.writeFileSync(filePath, html, "utf8");
    }
    else{
        throw "balise head introuvable.";
    }
}

/**
 * (SYNC) AJOUTE UNE BALISE DE SCRIPT EN FIN DE BODY
 * @param {string} scriptPath chemin du fichier de script
 * @param {string} [filePath] chemin du fichier index.html
 */
function insertScript(scriptPath, filePath){
    filePath = filePath || path.resolve(DESTINATION, "index.html");

    var html = fs.readFileSync(filePath, "utf8");
    var posHead = html.indexOf("</body>");

    if (posHead !== -1){
        html = html.replace("</body>",
            "<script src='" + normalizePath(scriptPath) + "'></script>" +
            "</body>");

        fs.writeFileSync(filePath, html, "utf8");
    }
    else{
        throw "balise body introuvable.";
    }
}

/**
 * (SYNC) INSÈRE EN FIN DE BODY UN SCRIPT À APPELLER EN DERNIER
 * @param {string} scriptTag - la balise complète à insèrer
 * @param {string} [fileIndexPath] - chemin vers le fichier index.html de distribution
 */
function insertLaSToC(scriptTag, fileIndexPath){
    fileIndexPath = fileIndexPath || path.resolve(DESTINATION, "index.html");

    var html = fs.readFileSync(fileIndexPath, "utf8");

    var posHead = html.indexOf("</body>");
    if (posHead !== -1){
        html = html.replace("</body>", scriptTag + "</body>");

        fs.writeFileSync(fileIndexPath, html, "utf8");
    }
    else{
        throw "balise body introuvable.";
    }
}

/**
 * (SYNC) COPIE UN RÉPERTOIRE SON ARBORESCENCE ET SON CONTENU VERS UN AUTRE EMPLACEMENT
 * @param {string} origPath - chemin de la source
 * @param {string} destPath - chemin de destination de l'arborescence
 */
function duplicateFolder(origPath, destPath) {
    origPath = path.resolve(origPath);
    destPath = path.resolve(destPath);
    var destPathOrig = path.resolve(destPath);

    //console.log(origPath, destPath);

    //console.log(path.relative(destPath, origPath));

    path.relative(destPath, origPath)
        .replace("..\\src", "")
        .split("\\")
        .filter(function (val) {
            return val !== "";
        })
        .forEach(function (val) {
            destPath = path.resolve (destPath, val);

            //CRÉATION DE L'ORBORESCENCE
            if (!fs.existsSync(destPath))
                fs.mkdirSync(destPath);
    });

    if (isDuplicableFolder(origPath)){
        fs.readdirSync(origPath)
            .forEach(function (val) {
                var newPathOrig = origPath + "\\" + val;

                if (fs.statSync(newPathOrig).isFile()){
                    try {
                        if (val !== INDEXFILENAME && val !== IGNORENAME){
                            //COPIE DES FICHIERS
                            fs.linkSync(newPathOrig, destPath + "\\" + val);
                        }
                    } catch (e) {
                        if (e.code === "EEXIST")
                            console.warn("le fichier " + destPath + "\\" + val + " existe déjà.");
                        else
                            console.warn("Erreur", e);
                    }
                }
                else{
                    isDuplicableFolder(newPathOrig) && duplicateFolder(newPathOrig, destPathOrig);
                }
            });
    }
}

/**
 * (SYNC) VÉRIFIE SI LE RÉPERTOIRE EST À PRENDRE EN COMPTE, C'EST À DIRE QU'IL NE DOIT PAS CONTENIR UN FICHIER .'ignore'
 * @param {string} folderPath - répertoire à tester
 * @returns {boolean}
 */
function isDuplicableFolder(folderPath){
    return !fs.existsSync(path.resolve(folderPath, ".ignore"));
}

/**
 * (SYNC) RECHERCHE TOUTES LES BALISES CONCATIFICATION ET RETOURNE UNE LISTE DE LEURS CONTENUS
 * @param {string} [filePath] - le chemin du fichier
 * @returns {Array} tableau de chemins
 */
function innerConcatification(filePath){
    filePath = path.resolve(filePath || path.resolve(SOURCE, "index.html"));
    var ret = [];
    var html = fs.readFileSync(filePath, "utf8")
        .replace(REGEXPSPACEBETWEENTAGS, "><")
        .replace(REGEXPNEWLINE, "");

    var concatArr = html.match(REGEXPINNERCONCATTAG);

    if (concatArr !== null){
        concatArr.forEach(function (val, ind, arr) {
            val.split(/(<.*?>)/)
                .filter(function (v) {
                    //SUPPRESSION DES CHAINES VIDES, DES BALISES DE COMMENTAIRES ET DES BALISES FERMANTES
                    return v !== "" && v.match(/<!--|<\//gim) === null;
                })
                .forEach(function (val, ind, arr) {
                    ret.push(val);
                });
        });
    }

    return ret;
}

/**
 * (SYNC) RECHERCHE TOUTES LES BALISES LASTOC ET RETOURNE UNE LISTE DE LEURS CONTENUS
 * @param {string} [filePath] - le chemin du fichier
 * @returns {Array} tableau de chemins
 */
function innerLaSToC(filePath) {
    filePath = path.resolve(filePath || path.resolve(SOURCE, "index.html"));

    var ret = [];
    var html = fs.readFileSync(filePath, "utf8");

    //RECHERCHE DE TOUTES LES BALISES LASTOC
    var concatArr = html.match(REGEXPINNERLASTOCTAG);

    if (concatArr !== null){
        concatArr.forEach(function (val, ind, arr) {
            val.replace(/<!--LASTOC-->|<!--\/LASTOC-->/gi, "")
                .split(/<\/script>/gi)
                .filter(function (v) {
                    //SUPPRESSION DES CHAINES VIDES, DES BALISES DE COMMENTAIRES
                    return v.trim() !== "" && v.trim().match(/<!--/gim) === null;
                })
                .forEach(function (val, ind, arr) {
                    ret.push(val
                        .replace(/<script>/gi, "")//SUPPRESSION DES BALISES DE DÉBUT DE SCRIPTS INLINE
                        .trim());
                });
        });
    }

    return ret;
}

/**
 * (SYNC) GÈRE LES BALISES DE SCRIPT À APPELER EN DERNIER
 * @param {string} scripTag - balise script
 */
function gestExtScript(scripTag){
    if (scripTag.indexOf("<link") === 0)
        return;

    var html = fs.readFileSync(path.resolve(DESTINATION, "index.html"), "utf8");

    if (isMovable(extractScriptPath(scripTag))){
        //COPIE DU FICHIER DANS LE RÉPEROIRE DE DISTRIBUTION
        fs.linkSync(path.resolve(SOURCE, extractScriptPath(scripTag)), path.resolve(DESTINATION, "JS/" + path.parse(extractScriptPath(scripTag)).base));

        //MODIFICATION DU LIEN
        scripTag = scripTag.replace(/src=["|'].*?["|']/, "src='JS/" + path.parse(extractScriptPath(scripTag)).base + "'");

        //AJOUT DE LA BALISE EN FIN DE BODY
        insertScript("JS/" + path.parse(extractScriptPath(scripTag)).base);
    }
    else{
        //AJOUT DE LA BALISE TELLE QU'ELLE EST
        if(html.indexOf("</body>") !== -1){
            //ON RAJOUTE LA BALISE FERMANTE QUI A SERVIE À SPLITER
            scripTag += "</script>";

            //ON RAJOUTE LA BALISE OUVRANTE SI C'EST UN SCRIPT INLINE
            if (scripTag.indexOf("<script") === -1)
                scripTag = "<script>" + scripTag;

            html = html.replace("</body>", scripTag + "</body>");

            fs.writeFileSync(path.resolve(DESTINATION, "index.html"), html, "utf8");
        }
        else{
            throw "balise body introuvable.";
        }
    }
}

/**
 * RETURN TRUE SI LE CHEMIN N'EST PAS UN LIEN VERS LE WEB
 * @param {string} src - chemin relatif ou absolue
 * @returns {boolean}
 */
function isMovable(src) {
    return src.match(/^http|https|ftp|ftps/) === null && src.trim() !== "";
}

/**
 * RETOURNE LE CONTENU DE L'ATTRIBUT SRC D'UNE BALISE SCRIPT
 * @param {string} strTag - la balise sous forme de chaine de caractères
 * @returns {string}
 */
function extractScriptPath(strTag){
    var src = strTag.match(/src=["|'].*["|']/);

    if (strTag.indexOf("<script") === 0 && src !== null) {
        return src[0]
            .match(REGEXPSTRINGINSTRING)[0]
            .replace(/["|']/g, "");
    }
    return "";
}

/**
 * RETOURNE LE CONTENU DE L'ATTRIBUT HREF D'UNE BALISE LINK
 * @param {string} strTag - la balise sous forme de chaine de caractères
 * @returns {string}
 */
function extractStylePath (strTag) {
    var href = strTag.match(/href=["|'].*["|']/);

    if (strTag.indexOf("<link") === 0 && strTag.match(/rel=["|']stylesheet["|']/i) !== null && href !== null) {
        return href[0]
            .match(REGEXPSTRINGINSTRING)[0]
            .replace(/["|']/g, "");
    }
    return "";
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
    return tagList.filter(function (val) {
        return val.indexOf("<script") === 0
    }).map(extractScriptPath);
}

/**
 * RETOURNE UN TABLEAU DE CHEMINS DES STYLES
 * @param {Array} tagList - une liste de balises sous forme de chaine de caractères
 * @returns {Array}
 */
function getStylesPath(tagList) {
    return tagList.filter(function (val) {
        return val.indexOf("<link") === 0
    }).map(extractStylePath);
}

/**
 *
 * @param {string} thisStr
 * @param {string} tagName
 * @returns {string}
 */
function deleteCommentTag(thisStr, tagName) {
    var lastIndex = 0,
        tabStr = [];

    thisStr.match(new RegExp("<!--" + tagName + "-->", "gmi"))
        .forEach(function (val) {
            var posDeb = thisStr.indexOf("<!--" + tagName + "-->", lastIndex);
            var posFin = thisStr.indexOf("<!--/" + tagName + "-->", lastIndex);
            var strToDel = thisStr.slice(posDeb, posFin + ("<!--/" + tagName + "-->").length);
            //ON ENREGISTRE LA CHAINE À SUPPRIMER
            tabStr.push(strToDel);

            lastIndex = posFin + ("<!--/" + tagName + "-->").length;
        });

    tabStr.forEach(function (val) {
        //SUPPRESSION DES BALISES CONCATIFICATION
        thisStr = thisStr.replace(val, "");
    });

    return thisStr;
}

//@DEPRECATED METHODS
/**
 * @deprecated INTIALISE LE NOM DU DOSSIER DES SOURCES
 * @param {string} srcPath
 */
function setSrcFolderName(srcPath){
    SRCFOLDERNAME = path.parse(path.normalize(srcPath.trim())).name;
}

/**
 * @deprecated (SYNC) RECHERCHE LES FICHIERS QUI COMPORTENT UNE EXTENSION DONNÉE DANS UN DOSSIER ET TOUS SES SOUS-DOSSIERS
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
 * @deprecated SUPPRIME LES '/' EN DÉBUT ET FIN DE CHAINE
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

module.exports.deleteFuckingFolder = deleteFuckingFolder;
module.exports.createIndexHTMLFile = createIndexHTMLFile;
module.exports.insertStyle = insertStyle;
module.exports.insertScript = insertScript;
module.exports.innerConcatification = innerConcatification;
module.exports.getScriptsPath = getScriptsPath;
module.exports.getStylesPath = getStylesPath;
module.exports.duplicateFolder = duplicateFolder;
module.exports.generateIndexHTMLFile = generateIndexHTMLFile;
module.exports.insertLaSToC = insertLaSToC;
module.exports.innerLaSToC = innerLaSToC;
module.exports.gestExtScript = gestExtScript;