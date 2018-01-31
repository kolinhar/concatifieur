"use strict";

const fs = require("fs");
const path = require("path");
const pump = require('pump');
const gulp = require('gulp');
const clean_css = require('clean-css');
const concat = require('gulp-concat');
const gulp_clean_css = require('gulp-clean-css');
const babel_core = require("babel-core");
const service = require("./service").config;
const privateMethods = require("./privateMethods");
const pathIsInside = require("path-is-inside");
const config = require("./service").config;

const IGNORENAME = ".ignore";
const REGEXPSPACEBETWEENTAGS = />\s+</gm;
const REGEXPNEWLINE = /[\r\n]*/gm;
const REGEXSCRIPTTAG = /<script(.|\r|\n)*?>(.|\r|\n)*?<\/script>/gi;
const REGEXSCRIPTINLINE = /<script(.|\r|\n)*?>(.|\r|\n)+<\/script>/gi;
const REGEXSTYLETAG = /(<link(.|\r|\n)*?rel=['"]stylesheet['"](.|\r|\n)*?(\/)*>)|(<style(.|\r|\n)*?>(.|\r|\n)*?<\/style>)/gi;
const REGEXSTYLEINLINE = /<style(.|\r|\n)*?>(.|\r|\n)+<\/style>/gi;
const REGEXPINNERCOMMENTTAG = /<!--\s*.*\s*-->/gm;
const PATHSEPARATOR = path.sep;
const INDEXFILENAME = "index.html";

/**
 * (SYNC) SUPPRIME UN RÉPERTOIRE MÊME SI IL Y A DES FICHIERS/DOSSIERS À L'INTÉRIEUR DE MANIÈRE RÉCURSIVE
 * @param {String} folder - le chemin vers le répertoire à supprimer
 * @returns {Boolean} - true si le répertoire a été supprimé, false si il n'existe pas
 */
function deleteFuckingFolder (folder) {
    //SI LE PARAMÈTRE folder EST VIDE, LA FONCTION CHERCHE À SUPPRIMER TOUT JUSQU'À LA RACINE DU DISQUE
    if (folder.trim() === "")
        throw {
            message: "Une chaine vide en paramètre supprime tout ...",
            name: "Empty String Exception"
        };

    folder = path.resolve(folder);

    if( fs.existsSync(folder) ) {
        fs.readdirSync(folder).forEach(function(file){
            const curPath = path.resolve(folder, file);

            if(fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFuckingFolder(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(folder);
        return true
    }

    return false;
}

/**
 * (SYNC) CRÉE UN FICHIER INDEX.HTML DANS LE RÉPERTOIRE PASSÉ EN PARAMÈTRE
 * @param {string} [indexOrig] - l'emplacement du fichier d'origine
 * @param {string} [pathDest] - le répertoire de destination
 */
function createIndexHTMLFile (indexOrig, pathDest){
    indexOrig = indexOrig || path.resolve(config.source, "index.html");
    pathDest = pathDest || config.destination;

    if(!fs.existsSync(pathDest))
        fs.mkdirSync(pathDest);

    if (!fs.existsSync(indexOrig))
        throw "fichier '" + indexOrig + "' introuvable";

    let indexOrigFile = fs.readFileSync(indexOrig, "utf8");

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
function generateIndexHTMLFile(verboseMode) {

    if (fs.existsSync(path.resolve(config.source, "index.html"))){
        verboseMode && console.warn(`Le fichier 'index.html' existe déjà dans le dossier ${config.source}`);
    }
    else{
        if (!fs.existsSync(path.resolve(config.source)))
            fs.mkdirSync(path.resolve(config.source));

        fs.writeFileSync(path.resolve(config.source, "index.html"),
`<!DOCTYPE html> 
<html lang='fr'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <title>TITRE</title>
        <!--CONCATIFICATION-->
        <!--/CONCATIFICATION-->
        </head>
    <body>
        <!--LASTOC-->
        <!--/LASTOC-->
    </body>
</html>`, "utf8");

        verboseMode && console.log(`Fichier 'index.html' créé dans le dossier ${config.source}`);
    }
}

/**
 * (SYNC) AJOUTE UNE BALISE DE STYLE EN FIN DE HEAD
 * @param {string} styleObj chemin du fichier de style
 * @param {string} [dest] balise de destination ('head' ou 'body')
 * @param {string} [filePath] chemin du fichier index.html
 */
function insertStyle (styleObj, dest, filePath) {
    filePath = filePath || path.resolve(config.destination, "index.html");
    const tagInsert = dest === "body" ? "body" : "head";

    let html = fs.readFileSync(filePath, "utf8");
    const posHeadBody = html.indexOf(`</${tagInsert}>`);

    let props = "";
    let l_path = "";
    let l_content = "";

    for (let prop in styleObj.props) {
        props += ` ${prop}="${styleObj.props[prop]}"`;
    }

    if (posHeadBody !== -1){
        if (styleObj.content !== null){
            html = html.replace(`</${tagInsert}>`,
                `<style${props}>${styleObj.content}</style></${tagInsert}>`);

            fs.writeFileSync(filePath, html, "utf8");

        }
        else{
            html = html.replace(`</${tagInsert}>`,
                `<link rel="stylesheet" href="${normalizePath(styleObj.chemin)}"${props} /></${tagInsert}>`);

            fs.writeFileSync(filePath, html, "utf8");
        }
    }
    else{
        throw `balise ${tagInsert} introuvable.`;
    }
}

/**
 * (SYNC) AJOUTE UNE BALISE DE SCRIPT EN FIN DE BALISE PASSÉ EN PARAMÈTRE
 * @param {string} scriptObj chemin du fichier de script
 * @param {string} [dest] balise de destination ('head' ou 'body')
 * @param {string} [filePath] chemin du fichier index.html
 */
function insertScript(scriptObj, dest, filePath){
    filePath = filePath || path.resolve(config.destination, "index.html");
    const tagInsert = dest === "body" ? "body" : "head";

    let html = fs.readFileSync(filePath, "utf8");
    const posHeadBody = html.indexOf(`</${tagInsert}>`);

    let props = "";
    let l_path = "";
    let l_content = "";

    for (let prop in scriptObj.props) {
        props += ` ${prop}="${scriptObj.props[prop]}"`;
    }

    if (scriptObj.chemin !== null){
        l_path = ` src="${normalizePath(scriptObj.chemin)}"`;
    }

    if (scriptObj.content !== null){
        l_content = scriptObj.content;
    }

    if (posHeadBody !== -1){
        html = html.replace(`</${tagInsert}>`,
            `<script${l_path}${props}>${l_content}</script></${tagInsert}>`);

        fs.writeFileSync(filePath, html, "utf8");
    }
    else{
        throw `balise ${tagInsert} introuvable.`;
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
    const destPathOrig = path.resolve(destPath);

    //console.log(origPath, destPath);

    //console.log(path.relative(destPath, origPath));

    path.relative(destPath, origPath)
        .replace(`..${PATHSEPARATOR}src`, "")
        .split(PATHSEPARATOR)
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
                const newPathOrig = origPath + PATHSEPARATOR + val;

                if (fs.statSync(newPathOrig).isFile()){
                    try {
                        if (val !== INDEXFILENAME && val !== IGNORENAME){
                            //COPIE DES FICHIERS
                            fs.linkSync(newPathOrig, destPath + PATHSEPARATOR + val);
                        }
                    } catch (e) {
                        if (e.code === "EEXIST")
                            console.warn("le fichier " + destPath + PATHSEPARATOR + val + " existe déjà.");
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
    return !fs.existsSync(path.resolve(folderPath, IGNORENAME));
}

/**
 * (SYNC) RECHERCHE TOUTES LES BALISES PASSÉES EN PARAMÈTRE ET RETOURNE UNE LISTE DE LEURS CONTENUS
 * @param {RegExp} regex - la regexp permettant de mettre à jour le contenu de la balise recherchée
 * @param {string} [filePath] - le chemin du fichier
 * @returns {Object} Objet contenant 2 tableaux 1 pour les scripts et 1 pour les styles
 */
function innerTag(regex, filePath){
    filePath = path.resolve(filePath || path.resolve(config.source, "index.html"));
    let ret = {};
    const html = fs.readFileSync(filePath, "utf8");

    //PARSER L'INTÉRIEUR DES BALISES CONCATIFICATION
    const concatArr = html.match(regex);

    //LISTER LES SCRIPTS ET LES STYLES
    if (concatArr !== null){
        const l_scriptTab = [],
            l_styleTab = [];

        concatArr.forEach(function (val, ind, arr) {
            const l_scripts = val.match(REGEXSCRIPTTAG),
                l_styles = val.match(REGEXSTYLETAG);

            if (l_scripts !== null){
                l_scripts.forEach(function (v, i) {
                    let l_path = privateMethods.extractScriptPath(v) || null,
                        l_content = v.match(REGEXSCRIPTINLINE);

                    /**
                    * SI IL Y A UN CONTENU INLINE, ON CRÉÉE UN FICHIER TEMPORAIRE DANS LEQUEL ON MET LE CODE
                    * AFIN QU'IL PUISSE ETRE CONCATÉNER ET MINIFIER AVEC LES AUTRES FICHIERS QUI LE
                    * PRÉCÈDENT ET/OU QUI LE SUIVENT
                    */
                    if (!privateMethods.isMovable(l_path) && l_content){
                        l_path = path.resolve(`TempJS${regex.toString().indexOf("LASTOC") !== -1 ? "-lastoc" : ""}`);

                        if(!fs.existsSync(l_path))
                            fs.mkdirSync(l_path);

                        l_path += `${PATHSEPARATOR}script${i}.js`;
                        fs.writeFileSync(l_path, l_content[0].replace(/^<script(.|\r|\n)*?>/gi, "").replace(/<\/script>$/gi, ""));
                    }

                    l_scriptTab.push({
                        chemin: l_path,
                        content: l_content && l_content[0].replace(/^<script(.|\r|\n)*?>/gi, "").replace(/<\/script>$/gi, ""),
                        isMovable: privateMethods.isMovable(l_path),
                        props: privateMethods.getOtherProps(v)
                    });
                });
            }

            if (l_styles !== null){
                l_styles.forEach(function (v, i) {
                    let l_path = privateMethods.extractStylePath(v) || null,
                        l_content = v.match(REGEXSTYLEINLINE);

                    /**
                     * SI IL Y A UN CONTENU INLINE, ON CRÉÉE UN FICHIER TEMPORAIRE DANS LEQUEL ON MET LE CODE
                     * AFIN QU'IL PUISSE ETRE CONCATÉNER ET MINIFIER AVEC LES AUTRES FICHIERS QUI LE
                     * PRÉCÈDENT ET/OU QUI LE SUIVENT
                     */
                    if (!privateMethods.isMovable(l_path) && l_content){
                        l_path = path.resolve("TempCSS");

                        if (!fs.existsSync(l_path)){
                            fs.mkdirSync(l_path);
                        }

                        l_path += `${PATHSEPARATOR}style${i}.css`;
                        fs.writeFileSync(l_path, l_content[0].replace(/^<style(.|\r|\n)*?>/gi, "").replace(/<\/style>$/gi, ""));
                    }

                    l_styleTab.push({
                        chemin: l_path,
                        content: l_content && l_content[0].replace(/^<style(.|\r|\n)*?>/gi, "").replace(/<\/style>$/gi, ""),
                        isMovable: privateMethods.isMovable(l_path),
                        props: privateMethods.getOtherProps(v)
                    });
                });
            }
        });

        ret.scriptsTab = l_scriptTab;
        ret.stylesTab = l_styleTab;
    }

    return ret;
}

/**
 * (SYNC) GÈRE LES BALISES DE SCRIPT À APPELER EN DERNIER
 * @param {string} scripTag - balise script
 */
function getExtScript(scripTag){
    if (scripTag.indexOf("<link") === 0)
        return;

    let html = fs.readFileSync(path.resolve(config.destination, "index.html"), "utf8");

    if (privateMethods.isMovable(privateMethods.extractScriptPath(scripTag))){
        //COPIE DU FICHIER DANS LE RÉPEROIRE DE DISTRIBUTION
        fs.linkSync(path.resolve(config.source, privateMethods.extractScriptPath(scripTag)), path.resolve(config.destination, "JS/" + path.parse(privateMethods.extractScriptPath(scripTag)).base));

        //MODIFICATION DU LIEN
        scripTag = scripTag.replace(/src=["|'].*?["|']/, "src='JS/" + path.parse(privateMethods.extractScriptPath(scripTag)).base + "'");

        //AJOUT DE LA BALISE EN FIN DE BODY
        insertScript("JS/" + path.parse(privateMethods.extractScriptPath(scripTag)).base);
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

            fs.writeFileSync(path.resolve(config.destination, "index.html"), html, "utf8");
        }
        else{
            throw "balise body introuvable.";
        }
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
    let lastIndex = 0;
    const tabStr = [];

    thisStr.match(new RegExp("<!--" + tagName + "-->", "gmi"))
        .forEach(function (val) {
            const posDeb = thisStr.indexOf("<!--" + tagName + "-->", lastIndex);
            const posFin = thisStr.indexOf("<!--/" + tagName + "-->", lastIndex);
            const strToDel = thisStr.slice(posDeb, posFin + ("<!--/" + tagName + "-->").length);
            //ON ENREGISTRE LA CHAINE À SUPPRIMER
            tabStr.push(strToDel);

            lastIndex = posFin + ("<!--/" + tagName + "-->").length;
        });

    tabStr.forEach(function (val) {
        //SUPPRESSION DES BALISES
        thisStr = thisStr.replace(val, "");
    });

    return thisStr;
}

/**
 *
 * @param {Array} arr
 * @param {String} type
 * @returns {Array}
 */
function groupFiles(arr, type) {
    const filesGroup = [[]];

    arr[(type === "script" ? "scriptsTab" : "stylesTab")]
        .forEach(function (val, ind, arr) {
            if (!val.isMovable) {
                if (ind === 0) {
                    filesGroup[filesGroup.length - 1].push(val);
                    ind < arr.length - 1 && arr[ind+1].isMovable && filesGroup.push([]);
                }
                else {
                    filesGroup.push([]);
                    filesGroup[filesGroup.length - 1].push(val);
                    ind < arr.length - 1 && arr[ind+1].isMovable && filesGroup.push([]);
                }
            }
            else {
                filesGroup[filesGroup.length - 1].push(val);
            }
        });

    return filesGroup.filter(function (val) {
        return val.length > 0;
    });
}

/**
 * LA FABULEUSE CONCATIFICATION JS !!!
 * @param {Array} arr le tableau d'objets à traiter
 * @param {String} [suffix] le suffix éventuel à ajouter au fichier concatifié
 * @returns {Array} la liste des scripts à inclure dans le head ou le body
 */
function concatiFicationJS(arr, suffix) {
    const final_JS_in_DOM = [];
    //CALCULE DE LA TAILLE DU TABLEAU, DÉCRÉMENTER À CHAQUE ITÉRATION ET QUAND ON ARRIVE À 0, ON SUPPRIME LE RÉPERTOIRE TEMPORAIRE CORRESPONDANT (TEMPJS OU TEMPJS-LASTOC) UNIQUEMENT SI IL A ÉTÉ CRÉÉ
    let cptArr = arr.length;

    arr.forEach(function (val, ind) {
        const JSfileName = `${new Date().getTime().toString()}-${ind+1}${suffix !== undefined ? `-${suffix.toString()}` : ""}-dist.js`;

        //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET N'A PAS DE CONTENU: C'EST UN SCRIPT SEUL À INCLURE TEL QU'IL EST EN AJOUTANT SES ÉVENTUELLES PROPRIÉTÉS
        if (!val[0].isMovable && !val[0].content){
            console.log(`déplacement du fichier JS ${val[0].chemin}`);
            final_JS_in_DOM.push(val[0]);
            cptArr--;
            deleteTemp(cptArr, `TempJS${(suffix ? "-lastoc":"")}`);
        }
        else{
            //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET A UN CONTENU: C'EST UN SCRIPT SEUL À MINIFIER EN AJOUTANT SES ÉVENTUELLES PROPRIÉTÉS
            if (!val[0].isMovable && val[0].content){
                val[0].content = babel_core.transform(val[0].content, {
                    presets: ["es2015"],
                    compact: true,
                    comments: false,
                    minified: true
                }).code;

                final_JS_in_DOM.push(val[0]);

                // console.log(`fin de traitement du script inline`);
                cptArr--;
                deleteTemp(cptArr, `TempJS${(suffix ? "-lastoc":"")}`);
            }
            else{
                //SI LE FICHIER EST DÉPLAÇABLE: IL EST À MINIFIER ET À CONCATÉNER AVEC SES SUIVANTS
                final_JS_in_DOM.push({
                    chemin: JSfileName,
                    isMovable: true,
                    content: null,
                    props: {}
                });

                pump([
                        gulp.src(val.map(function (v) {
                            return path.resolve(config.source, v.chemin)
                        })),
                        concat(JSfileName),
                        gulp.dest(`${config.destination}${PATHSEPARATOR}JS`)
                    ],
                    function (err) {
                        if (err){
                            console.error("erreur pump:", err);
                            return;
                        }

                        babel_core.transformFile(`${config.destination}${PATHSEPARATOR}JS${PATHSEPARATOR}${JSfileName}`, {
                            presets: ["es2015"],
                            compact: true,
                            comments: false,
                            minified: true
                        }, function (err, result) {
                            if (err) {
                                console.error("erreur babel_core.transformFile:", err);
                                return;
                            }

                            fs.writeFileSync(`${config.destination}${PATHSEPARATOR}JS${PATHSEPARATOR}${JSfileName}`, result.code);

                            console.log(`fin de traitement du script ${JSfileName}`);
                            cptArr--;
                            deleteTemp(cptArr, `TempJS${(suffix ? "-lastoc":"")}`);
                        });
                    });
            }
        }
    });

    return final_JS_in_DOM;
}

/**
 * LA FABULEUSE CONCATIFICATION CSS !!!
 * @param {Array} arr le tableau d'objets à traiter
 * @param {String} [suffix] le suffix éventuel à ajouter au fichier concatifié
 * @returns {Array} la liste des styles à inclure dans le head ou le body
 */
function concatiFicationCSS(arr, suffix) {
    const final_CSS_in_DOM = [];
    //CALCULE DE LA TAILLE DU TABLEAU, DÉCRÉMENTER À CHAQUE ITÉRATION ET QUAND ON ARRIVE À 0, ON SUPPRIME LE RÉPERTOIRE TEMPORAIRE CORRESPONDANT (TempCSS OU TempCSS-lastoc) UNIQUEMENT SI IL A ÉTÉ CRÉÉ
    let cptArr = arr.length;

    arr.forEach(function (val, ind) {
        const CSSfileName = `${new Date().getTime().toString()}-${ind+1}${suffix !== undefined ? `-${suffix.toString()}` : ""}-dist.css`;

        //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET N'A PAS DE CONTENU: C'EST UN STYLE SEUL À INCLURE TEL QU'IL EST EN AJOUTANT SES ÉVENTUELLES PROPRIÉTÉS
        if (!val[0].isMovable && !val[0].content){
            final_CSS_in_DOM.push(val[0]);
            console.log(`déplacement du fichier CSS ${val[0].chemin}`);
            cptArr--;
            deleteTemp(cptArr, `TempCSS${(suffix ? "-lastoc":"")}`);
        }
        else{
            //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET A UN CONTENU: C'EST UN STYLE SEUL À MINIFIER EN AJOUTANT SES ÉVENTUELLES PROPRIÉTÉS
                if (!val[0].isMovable && val[0].content){
                    val[0].content = new clean_css({compatibility: "ie8"}).minify(val[0].content).styles;

                    final_CSS_in_DOM.push(val[0]);
                    // console.log("fin de traitement du style inline");
                    cptArr--;
                    deleteTemp(cptArr, `TempCSS${(suffix ? "-lastoc":"")}`);

                }
            else{
                //SI LE FICHIER EST DÉPLAÇABLE: IL EST À MINIFIER ET À CONCATÉNER AVEC SES SUIVANTS
                    final_CSS_in_DOM.push({
                        chemin: CSSfileName,
                        isMovable: true,
                        content: null,
                        props: {}
                    });

                pump([
                        gulp.src(val.map(function (v) {
                            return path.resolve(config.source, v.chemin)
                        })),
                        concat(CSSfileName),
                        gulp_clean_css({
                            keepSpecialComments: 0
                        }),
                        gulp.dest(config.destination + "/CSS")
                    ],
                    function (err) {
                        if (err){
                            console.error("erreur pump:", err);
                            return;
                        }

                        console.log(`fin de traitement du style ${CSSfileName}`);
                        cptArr--;
                        deleteTemp(cptArr, `TempCSS${(suffix ? "-lastoc":"")}`);
                    });
            }
        }
    });

    return final_CSS_in_DOM;
}

/**
 * SUPPRIME LE RÉPERTOIRE dir ET SON CONTENU PASSÉ EN PARAMÈTRE QUAND len EST À 0
 * @param {Number} len
 * @param {String} dir le répertoire à supprimer
 * @returns {Boolean} true si le répertoire a été supprimé sinon false
 */
function deleteTemp(len, dir) {
    if (len === 0)
        return deleteFuckingFolder(dir);
    return false;
}

/**
 * VÉRIFIE QUE LES DOSSIERS NE SE CONTIENNENT PAS L'UN L'AUTRE
 * @param {string} path1
 * @param {string} path2
 * returns {Boolean}
 */
function isIn(path1, path2) {
    return path1 === path2 || pathIsInside(path1, path2) || pathIsInside(path2, path1);
}

module.exports.deleteFuckingFolder = deleteFuckingFolder;
module.exports.createIndexHTMLFile = createIndexHTMLFile;
module.exports.insertStyle = insertStyle;
module.exports.insertScript = insertScript;
module.exports.innerTag = innerTag;
module.exports.getScriptsPath = getScriptsPath;
module.exports.getStylesPath = getStylesPath;
module.exports.duplicateFolder = duplicateFolder;
module.exports.generateIndexHTMLFile = generateIndexHTMLFile;
module.exports.getExtScript = getExtScript;
module.exports.groupFiles = groupFiles;
module.exports.concatiFicationJS = concatiFicationJS;
module.exports.concatiFicationCSS = concatiFicationCSS;
module.exports.isIn = isIn;