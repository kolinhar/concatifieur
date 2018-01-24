#! /usr/bin/env node
"use strict";

const concatifieur = require("../main");
const args = process.argv;
const path = require("path");
const fs = require("fs");
const fctSystem = require("../fonctionSystem");
const fctPerso = require("../fctPerso");
const config = require("../service");

// console.log("on est là:", path.resolve(".", args[2] && args[2].toString() || ""));

/*service.source = "./autre";
console.log("affectation", service);*/

// console.log("args:", args);


const regSrc = /^--src=/g;
const regDest = /^--dest=/g;


const verboseMODE = args.indexOf("--verbose") !== -1;
const versionMODE = args.indexOf("-v") !== -1 || args.indexOf("--version") !== -1;
const helpMODE = args.indexOf("-h") !== -1 || args.indexOf("--help") !== -1;
const min = args.indexOf("min") !== -1 || (args.length === 3 && verboseMODE);
const posMin = args.indexOf("min");
const posConfig = args.indexOf("config");
const posIgnore = posConfig && args.indexOf("ignore");
const posRemove = posConfig && args.indexOf("disignore");
const noArgs = args.length === 2;
const init = args.indexOf("init") !== -1;

//cmd concatifieur [(...)] --verbose
if (verboseMODE){
    console.log("verbose mode:");
    console.log(args);
}

//cmd concatifieur config [--src=source] [--dest=destiantion]
if (posConfig !== -1){
    const resSrc = args.filter(x => regSrc.test(x));
    const resDest = args.filter(x => regDest.test(x));

    let tempSrc = "";
    let tempDest = "";

    let src = "";
    let dest = "";

    //--src=source
    if (resSrc.length > 0){
        tempSrc = resSrc[0].split(regSrc)[1];
    }

    //--dest=destiantion
    if (resDest.length > 0){
        tempDest = resDest[0].split(regDest)[1];
    }

    let isSrc = tempSrc && fs.existsSync(tempSrc);
    let isDest = tempDest && fs.existsSync(tempDest);

    //VÉRIFIER QUE LES RÉPERTOIRES NE SE CONTIENNENT PAS L'UN L'AUTRE
    if (isSrc && isDest){
        if(fctPerso.isIn(tempSrc, tempDest)){
            console.error("Les répertoires source et destination sont contenus l'un dans l'autre.");
            return;
        }
    }

    if (isSrc){
        src = path.resolve(tempSrc);
        verboseMODE && console.log("source:", src);

        if (fs.statSync(src).isDirectory()){
            const destConfig = fctSystem.getDIST();

            //SI LA DESTINATION EXISTE DANS LA CONFIG ET N'EST PAS EN PARAMÈTRE, LA COMPARER AVEC LA SOURCE
            if (destConfig && !isDest){
                if(fctPerso.isIn(src, destConfig)){
                    console.error("Les répertoires source et destination sont contenus l'un dans l'autre.");
                    return;
                }
            }

            //CONFIGURER LA SOURCE
            config.source = fctSystem.setSRC(src);
        } else {
            console.log("Le répertoire source n'est pas un dossier.");
        }
    } else {
        if (tempSrc) {
            console.error(`le répertoire source '${tempSrc}' n'existe pas`);
        }
    }

    if (isDest) {
        dest = path.resolve(tempDest);
        verboseMODE && console.log("destination:", dest);

        if (fs.statSync(dest).isDirectory()){
            const srcConfig = fctSystem.getSRC();

            //SI LA SOURCE EXISTE DANS LA CONFIG ET N'EST PAS EN PARAMÈTRE, LA COMPARER AVEC LA DESTINATION
            if (srcConfig && !isSrc){
                if(fctPerso.isIn(dest, srcConfig)){
                    console.error("Les répertoires source et destination sont contenus l'un dans l'autre.");
                    return;
                }
            }

            //CONFIGURER LA DESTINATION
            config.destination = fctSystem.setDIST(dest);
        } else {
            console.log("Le répertoire destination n'est pas un dossier.");
        }
    } else {
        if (tempDest) {
            console.error(`le répertoire de destination '${tempDest}' n'existe pas`);
        }
    }

    if (posIgnore !== -1 && args[posIgnore + 1]){
        config.ignoredFolders = fctSystem.addFolder(args[posIgnore + 1]);
        verboseMODE && console.log("Ajout de:", args[posIgnore + 1]);
    }

    if (posRemove !== -1 && args[posRemove + 1]){
        config.ignoredFolders = fctSystem.removeFolder(args[posRemove + 1]);
        verboseMODE && console.log("Suppression de:", args[posIgnore + 1]);
    }

    if (verboseMODE){
        console.log("Configuration:\n", fctSystem._readConfig());
    }
}

//cmd concatifieur [min] [--verbose] [source] [destination]
if (min){
    let src = "";
    let dest = "";

    //SI LA SOURCE ET LA DESTINATION SONT PASSÉES EN PARAMÈTRE
    if (args[posMin + 1] && args[posMin + 2]) {
        src = path.resolve(args[posMin + 1]);
        dest = path.resolve(args[posMin + 2]);

        if (!fctSystem.checkConfig({ source: src, destination: dest})){
            return;
        }
    } else {
        //SI IL N'Y A QU'UN OU AUCUN PARAMÈTRE
        //ON UTILISE LES PARAMÈTRES DE LA CONFIG
        src = fctSystem.getSRC();
        dest = fctSystem.getDIST();

        if (!fctSystem.checkConfig()){
            return;
        }
    }

    config.source = src;
    config.destination = dest;

    concatifieur.min(verboseMODE);
    return;
}

//cmd concatifieur init [--verbose]
if (init){
    concatifieur.init(verboseMODE);
    return;
}

//cmd concatifieur -v/--version
if (versionMODE || noArgs){
    console.log("v" + fctSystem.getVersion());
}

//cmd concatifieur -h/--help
if (helpMODE || noArgs){
    console.log(`Usage: concatifieur ${"<commande>"} [argument]
       concatifieur
       concatifieur init
       concatifieur min
       concatifieur min ./src ./dist
       concatifieur min config --src=./src --dest=./dist
       concatifieur min config ignore ./src/srcipt/controllers/upload
       concatifieur min config disignore ./src/srcipt/controllers/upload
       

Commandes:
 init             initialise le répertoire en cours en créant un fichier index.html avec les balises nécessaires au fonctionnement de cet outil
 
 min              concatène et minifie les fichiers JS et CSS dans le répertoire de destination et les inclus dans un fichier index.html
                    ${"<source>"} ${"<destination>"} défini les emplacements des répertoire contenant les fichiers source et de destination
                            
 config           création/mise à jour du fichier de configuration
                    --src=${"<source>"} défini l'emplacement du répertoire contenant les fichiers source
                    --dest=${"<destination>"} défini l'emplacement du répertoire de destination des fichiers concatifiés
                    ignore ${"<dossier>"} ajoute un répertoire à ignorer 
                    disignore ${"<dossier>"} retire un répertoire à ignorer

Arguments:
 -h, --help       affiche cette aide
 --verbose        exécute la commande en mode verbeux
 -v, --version    affiche la version en cours du concatifieur
 `);
}

if (noArgs){
    fctSystem.checkConfig();
}