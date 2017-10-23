"use strict";

const fs = require("fs");
const path = require("path");
const pump = require('pump');
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify_es = require('uglify-es');
const gulp_uglify_js = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');

// DOSSIER DE TRAVAIL
const SOURCE = path.resolve('./src');
// DOSSIER À LIVRER
const DESTINATION = path.resolve('./dist');

const IGNORENAME = ".ignore";
const REGEXPSPACEBETWEENTAGS = />\s+</gm;
const REGEXPNEWLINE = /[\r\n]*/gm;
const REGEXSCRIPTTAG = /<script(.|\r|\n)*?>(.|\r|\n)*?<\/script>/gi;
const REGEXSCRIPTINLINE = /<script(.|\r|\n)*?>(.|\r|\n)+<\/script>/gi;
const REGEXSTYLETAG = /(<link(.|\r|\n)*?rel=['"]stylesheet['"](.|\r|\n)*?(\/)*>)|(<style(.|\r|\n)*?>(.|\r|\n)*?<\/style>)/gi;
const REGEXSTYLEINLINE = /<style(.|\r|\n)*?>(.|\r|\n)+<\/style>/gi;
const REGEXPINNERCOMMENTTAG = /<!--\s*.*\s*-->/gm;
const REGEXPSTRINGINSTRING = /["|'].*?["|']/;
const REGEXPCOMMENTMULTIPLELINE = /\/\*.*\*\//g;
const PATHSEPARATOR = path.sep;
const INDEXFILENAME = "index.html";

/**
 * (SYNC) SUPPRIME UN RÉPERTOIRE MÊME SI IL Y A DES FICHIERS/DOSSIERS À L'INTÉRIEUR DE MANIÈRE RÉCURSIVE
 * @param {string} folder - le chemin vers le répertoire à supprimer
 */
function deleteFuckingFolder (folder) {
    folder = path.resolve(folder);

    if( fs.existsSync(folder) ) {
        fs.readdirSync(folder).forEach(function(file){
            const curPath = path.resolve(folder, file);

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
function generateIndexHTMLFile() {

    if (fs.existsSync(path.resolve(SOURCE, "index.html"))){
        console.log("Un fichier 'index.html' existe déjà dans le dossier " + SOURCE);
    }
    else{
        if (!fs.existsSync(path.resolve(SOURCE)))
            fs.mkdirSync(path.resolve(SOURCE));

        fs.writeFileSync(path.resolve(SOURCE, "index.html"), `<!DOCTYPE html> 
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

    let html = fs.readFileSync(filePath, "utf8");
    const posHead = html.indexOf("</head>");

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
 * @param {string} scriptObj chemin du fichier de script
 * @param {string} dest balise de destination
 * @param {string} [filePath] chemin du fichier index.html
 */
function insertScript(scriptObj, dest, filePath){
    filePath = filePath || path.resolve(DESTINATION, "index.html");
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
    return !fs.existsSync(path.resolve(folderPath, ".ignore"));
}

/**
 * (SYNC) RECHERCHE TOUTES LES BALISES PASSÉES EN PARAMÈTRE ET RETOURNE UNE LISTE DE LEURS CONTENUS
 * @param {RegExp} regex - la regexp permettant de mettre à jour le contenu de la balise recherchée
 * @param {string} [filePath] - le chemin du fichier
 * @returns {Object} Objet contenant 2 tableaux pour les scripts et pour les styles
 */
function innerTag(regex, filePath){
    filePath = path.resolve(filePath || path.resolve(SOURCE, "index.html"));
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
                l_scripts.forEach(function (v) {
                    let l_path = extractScriptPath(v) || null,
                        l_content = v.match(REGEXSCRIPTINLINE);

                    l_scriptTab.push({
                        chemin: l_path,
                        content: l_content && l_content[0].replace(/^<script(.|\r|\n)*?>/gi, "").replace(/<\/script>$/gi, ""),
                        isMovable: isMovable(l_path),
                        props: getOtherProps(v)
                    });
                });
            }

            if (l_styles !== null){
                l_styles.forEach(function (v) {
                    let l_path = extractStylePath(v) || null,
                        l_content = v.match(REGEXSTYLEINLINE);

                    l_styleTab.push({
                        chemin: l_path,
                        content: l_content && l_content[0].replace(/^<style(.|\r|\n)*?>/gi, "").replace(/<\/style>$/gi, ""),
                        isMovable: isMovable(l_path),
                        props: getOtherProps(v)
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
 * (SYNC) RECHERCHE TOUTES LES BALISES LASTOC ET RETOURNE UNE LISTE DE LEURS CONTENUS
 * @param {string} [filePath] - le chemin du fichier
 * @returns {Object} Objet contenant 2 tableaux pour les scripts et pour les styles
 */
function innerLaSToC(filePath) {
    filePath = path.resolve(filePath || path.resolve(SOURCE, "index.html"));

    const ret = {};
    const html = fs.readFileSync(filePath, "utf8");

    //RECHERCHE DE TOUTES LES BALISES LASTOC
    const concatArr = html.match(REGEXPINNERLASTOCTAG);

    //LISTER LES SCRIPTS ET LES STYLES
    if (concatArr !== null){
        const l_scriptTab = [],
            l_styleTab = [];

        concatArr.forEach(function (val, ind, arr) {
            const l_scripts = val.match(REGEXSCRIPTTAG),
                l_styles = val.match(REGEXSTYLETAG);

            if (l_scripts !== null){
                l_scripts.forEach(function (v) {
                    let l_path = extractScriptPath(v) || null,
                        l_content = v.match(REGEXSCRIPTINLINE);

                    l_scriptTab.push({
                        chemin: l_path,
                        content: l_content && l_content[0].replace(/^<script(.|\r|\n)*?>/gi, "").replace(/<\/script>$/gi, ""),
                        isMovable: isMovable(l_path),
                        props: getOtherProps(v)
                    });
                });
            }

            if (l_styles !== null){
                l_styles.forEach(function (v) {
                    let l_path = extractStylePath(v) || null,
                        l_content = v.match(REGEXSTYLEINLINE);

                    l_styleTab.push({
                        chemin: l_path,
                        content: l_content && l_content[0].replace(/^<style(.|\r|\n)*?>/gi, "").replace(/<\/style>$/gi, ""),
                        isMovable: isMovable(l_path),
                        props: getOtherProps(v)
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

    let html = fs.readFileSync(path.resolve(DESTINATION, "index.html"), "utf8");

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
    return !!src && src.trim() !== "" && src.match(/^http|https|ftp|ftps/i) === null;
}

/**
 * RETOURNE LE CONTENU DE L'ATTRIBUT SRC D'UNE BALISE SCRIPT
 * @param {string} strTag - la balise sous forme de chaine de caractères
 * @returns {string}
 */
function extractScriptPath(strTag){
    const src = strTag.match(/src=["'].*["']/i);

    if (!!src && strTag.indexOf("<script") === 0) {
        return src[0]
            .match(REGEXPSTRINGINSTRING)[0]
            .replace(/["']/g, "");
    }
    return "";
}

/**
 * RETOURNE LE CONTENU DE L'ATTRIBUT HREF D'UNE BALISE LINK
 * @param {string} strTag - la balise sous forme de chaine de caractères
 * @returns {string}
 */
function extractStylePath (strTag) {
    const href = strTag.match(/href=["'].*["']/i);

    if (!!href && strTag.indexOf("<link") === 0 && strTag.match(/rel=["']stylesheet["']/i) !== null) {
        return href[0]
            .match(REGEXPSTRINGINSTRING)[0]
            .replace(/["']/g, "");
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
        //SUPPRESSION DES BALISES CONCATIFICATION
        thisStr = thisStr.replace(val, "");
    });

    return thisStr;
}

/**
 * RETOURNE LA LISTE LES PROPRIÉTÉS AUTRES QUE SRC, HREF ET REL DE LA BALISE PASSÉE EN PARAMÈTRE
 * @param {string} tag
 * @returns {Object} liste les propriétés autres que src, href et rel
 */
function getOtherProps(tag) {
    //REMPLACEMENT DE TOUS LES SAUTS DE LIGNE POUR MIEUX TRAITER LA CHAINE DE CARACTÈRES AVEC LES REGEXP
    tag = tag.replace(/\n/g, " ");

    const regexProps = /\w+-*\w+=["'].+['"]/g;
    const result = tag.match(regexProps);
    let ret = {};


    if (result !== null){
        result.forEach(function (v) {
        v.split(/["']\s+/g).forEach(function (val) {
                const l_prop = val.split("=");

                if (["rel", "src", "href"].indexOf(l_prop[0].trim()) === -1){
                    ret[l_prop[0].trim()] = l_prop[1].replace(/^["']/, "").replace(/["']$/, "").trim();
                }
            })
        })
    }

    return ret;
}

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

    return filesGroup/*.filter(function (val) {
        return val.length > 0;
    })*/;
}

/**
 * LA FABULEUSE CONCATIFICATION JS !!!
 * @param {Array} arr le tableau d'objets à traiter
 * @param {String} [suffix] le suffix éventuel à ajouter au fichier concatifié
 * @returns {Array} la liste des scripts à inclure dans le head
 */
function concatiFicationJS(arr, suffix) {
    const final_JS_in_DOM = [];

    arr.forEach(function (val, ind) {
        const JSfileName = `${new Date().getTime().toString()}-${ind+1}${suffix !== undefined ? `-${suffix.toString()}` : ""}-dist.js`;

        //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET N'A PAS DE CONTENU: C'EST UN SCRIPT SEUL À INCLURE TEL QU'IL EST EN AJOUTANT SES ÉVENTUELLES PROPRIÉTÉS
        if (!val[0].isMovable && !val[0].content){
            console.log(`déplacement du fichier JS ${val[0].chemin}`);
            final_JS_in_DOM.push(val[0]);
        }
        else{
            //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET A UN CONTENU: C'EST UN SCRIPT SEUL À MINIFIER EN AJOUTANT SES ÉVENTUELLES PROPRIÉTÉS
            if (!val[0].isMovable && val[0].content){
                val[0].content = uglify_es.minify(
                    { file: val[0].content },
                    { ie8: true }
                ).code;

                final_JS_in_DOM.push(val[0]);

                console.log(`fin de traitement du script inline`);
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
                            return path.resolve(SOURCE, v.chemin)
                        })),
                        concat(JSfileName),
                        gulp_uglify_js(),
                        gulp.dest(DESTINATION + "/JS")
                    ],
                    function (err) {
                        if (err){
                            console.error(err);
                        }

                        console.log(`fin de traitement du script ${JSfileName}`);
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
 */
function concatiFicationCSS(arr, suffix) {
    arr.forEach(function (val, ind) {
        const CSSfileName = `${new Date().getTime().toString()}-${ind+1}${suffix !== undefined ? `-${suffix.toString()}` : ""}-dist.css`;

        //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET N'A PAS DE CONTENU: C'EST UN SCRIPT SEUL À INCLURE TEL QU'IL EST
        if (!val[0].isMovable && !val.content){
            console.log(`déplacement du fichier CSS ${val[0].chemin ? val[0].chemin : "inline"}`);
        }
        else{
            //SI LE FICHIER N'EST PAS DÉPLAÇABLE ET A UN CONTENU: C'EST UN SCRIPT SEUL À MINIFIER
            if (!val[0].isMovable && val.content){
                pump([
                        gulp.src(path.resolve(SOURCE, val[0].chemin)),
                        concat(CSSfileName),
                        cleanCSS({
                            keepSpecialComments: 0
                        }),
                        gulp.dest(DESTINATION + "/CSS")
                    ],
                    function (err) {
                        if (err){
                            console.error(err);
                        }

                        console.log(`fin de traitement du style ${CSSfileName}`);
                    });
            }
            else{
                //SI LE FICHIER EST DÉPLAÇABLE: IL EST À MINIFIER ET À CONCATÉNER AVEC SES SUIVANTS
                pump([
                        gulp.src(val.map(function (v) {
                            return path.resolve(SOURCE, v.chemin)
                        })),
                        concat(CSSfileName),
                        cleanCSS({
                            keepSpecialComments: 0
                        }),
                        gulp.dest(DESTINATION + "/CSS")
                    ],
                    function (err) {
                        if (err){
                            console.error(err);
                        }

                        console.log(`fin de traitement du style ${CSSfileName}`);
                    });
            }
        }
    });
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
module.exports.innerLaSToC = innerLaSToC;
module.exports.getExtScript = getExtScript;
module.exports.groupFiles = groupFiles;
module.exports.concatiFicationJS = concatiFicationJS;
module.exports.concatiFicationCSS = concatiFicationCSS;

//POUR LES TESTS
module.exports.isMovable = isMovable;
module.exports.extractScriptPath = extractScriptPath;
module.exports.extractStylePath = extractStylePath;
module.exports.getOtherProps = getOtherProps;