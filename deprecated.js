/**
 * Created by PRJS12821 on 17/10/2017.
 */
"use strict";
//@NOTE: DEPRECATED METHODS

let SRCFOLDERNAME = path.parse(SOURCE).base;

/**
 * @deprecated (SYNC) INSÈRE EN FIN DE BODY UN SCRIPT À APPELLER EN DERNIER
 * @param {string} scriptTag - la balise complète à insèrer
 * @param {string} [fileIndexPath] - chemin vers le fichier index.html de distribution
 */
function insertLaSToC(scriptTag, fileIndexPath){
    fileIndexPath = fileIndexPath || path.resolve(DESTINATION, "index.html");

    let html = fs.readFileSync(fileIndexPath, "utf8");

    const posHead = html.indexOf("</body>");
    if (posHead !== -1){
        html = html.replace("</body>", scriptTag + "</body>");

        fs.writeFileSync(fileIndexPath, html, "utf8");
    }
    else{
        throw "balise body introuvable.";
    }
}

/**
 * @deprecated (SYNC) RECHERCHE TOUTES LES BALISES LASTOC ET RETOURNE UNE LISTE DE LEURS CONTENUS
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
