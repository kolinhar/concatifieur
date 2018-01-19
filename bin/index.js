#! /usr/bin/env node
"use strict";

const concatifieur = require("../main");
const args = process.argv;
const path = require("path");
const fs = require("fs");
const fctSystem = require("../fonctionSystem");
const fctPerso = require("../fctPerso");

// console.log("on est là:", path.resolve(".", args[2] && args[2].toString() || ""));

/*service.source = "./autre";
console.log("affectation", service);*/

// console.log("args:", args);


//@TODO: AVANT TOUT ON VÉRIFIE LA CONFIGURATION


const regSrc = /^--src=/g;
const regDest = /^--dest=/g;


const verboseMODE = args.indexOf("--verbose") !== -1;
const versionMODE = args.indexOf("-v") !== -1 || args.indexOf("--version") !== -1;
const helpMODE = args.indexOf("-h") !== -1 || args.indexOf("--help") !== -1;
const min = args.indexOf("min") !== -1 || args.length <= 2 || (args.length === 3 && verboseMODE);
const posConfig = args.indexOf("config");

let src = "";
let dest = "";

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


    if (isSrc && isDest){
        //VÉRIFIER QUE LES RÉPERTOIRES NE SE CONTIENNENT PAS L'UN L'AUTRE
        if(fctPerso.isIn(tempSrc, tempDest)){
            console.error("Les répertoires source et destination sont contenus l'un dans l'autre.");
            return;
        }
    }

    if (isSrc){
        src = path.resolve(tempSrc);
        verboseMODE && console.log("source:", src);

        if (fs.statSync(src).isDirectory()){
            //CONFIGURER LA SOURCE
            fctSystem.setSRC(src)
        }
        else{
            console.log("pas bien");
        }

    } else {
        if (tempSrc) {
            console.error(`le répertoire source '${tempSrc}' n'existe pas`);
        }
    }

    if (isDest) {
        dest = path.resolve(tempDest);
        verboseMODE && console.log("destination:", dest);

        //CONFIGURER LA DESTINATION
        fctSystem.setDIST(dest);
    } else {
        if (tempDest) {
            console.error(`le répertoire de destination '${tempDest}' n'existe pas`);
        }
    }
/*    console.log(fs.existsSync("."));
    console.log(path.resolve("."));

    console.log(fs.existsSync("./src"));
    console.log(path.resolve("./src"));

    console.log(fs.existsSync("C:/Users/PRJS12821/Documents/Projets Node/config-GULP/src"));
    console.log(path.resolve("C:/Users/PRJS12821/Documents/Projets Node/config-GULP/src"));

    console.log(fs.existsSync("dist"));
    console.log(fs.existsSync("/dist"));
    console.log(fs.existsSync("./dist"));
    console.log(fs.existsSync("./dist2"));

    console.log(fs.existsSync("../config-GULP"));
    console.log(path.resolve("../config-GULP"));*/
}

//cmd concatifieur [min] [--verbose] [source] [destination]
if (min){
    if (fctSystem.checkConfig()){
        concatifieur.min(verboseMODE, src, dest);
        return;
    }
}

//cmd concatifieur init [--verbose]
if (init){
    concatifieur.init(verboseMODE);
    return;
}

//cmd concatifieur -h/--help
if (helpMODE){
    console.log(`Usage: concatifieur ${"<commande>"} [argument]
       concatifieur min [arguments]

Commandes:
 init                     initialise le répertoire en cours en créant un fichier index.html avec les balises nécessaires
 min                      concatène et minifie les fichiers JS et CSS dans le répertoire de destination et les inclus dans un fichier index.html
 config                   création/mise à jour du fichier de configuration avec les arguments --src=--src=${"<source>"} et --dist=${"<destiantion>"}

Arguments:
 -h, --help               affiche cette aide
 --verbose                exécute la commande en mode verbeux
 -v, --version            affiche la version en cours du concatifieur
 --src=${"<source>"}           défini l'emplacement du répertoire contenant les fichiers source
 --dest=${"<destiantion>"}     défini l'emplacement du répertoire de destination des fichiers concatifiés
 `);
}

//cmd concatifieur -v/--version
if (versionMODE){
    console.log("v" + fctSystem.getVersion());
}
