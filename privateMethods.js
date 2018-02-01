/**
 * Created by PRJS12821 on 13/11/2017.
 */
"use strict";
const values = require("./values");

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
            .match(values.REGEXPSTRINGINSTRING)[0]
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
            .match(values.REGEXPSTRINGINSTRING)[0]
            .replace(/["']/g, "");
    }
    return "";
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

module.exports.isMovable = isMovable;
module.exports.extractScriptPath = extractScriptPath;
module.exports.extractStylePath = extractStylePath;
module.exports.getOtherProps = getOtherProps;