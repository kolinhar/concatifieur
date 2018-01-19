/**
 * Created by PRJS12821 on 03/11/2017.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const filePathConfig = path.resolve(".", "config-concatifieur.json");
const fctPerso = require("../fctPerso");


/**
 * RETOURNE LA VERSION DU PACKAGE EN LISANT LE FICHIER PACKAGE.JSON
 * @returns {String} la version du logiciel
 */
function _getVersion() {
    const packageFile = fs.readFileSync("./package.json");
    const parsedPackage = JSON.parse(packageFile);

    return parsedPackage.version || "undefined";
}

function _setSRC(src) {
    _setConfig({
        source: src.toString()
    });
}

function _getSRC() {
    return _readConfig().source;
}

function _setDIST(dist) {
    _setConfig({
        destination: dist.toString()
    });
}

function _getDIST() {
    return _readConfig().destination;
}

function _readConfig() {
    _createConfigFile();

    return JSON.parse(fs.readFileSync(filePathConfig));
}

function _setConfig(obj) {
    const Fconfig = _readConfig();

    if (obj){
        for (let prop in obj) {
            Fconfig[prop] = obj[prop];
        }
    }

    fs.writeFileSync(filePathConfig, JSON.stringify(Fconfig));
}

function _createConfigFile() {
    //SI LE FICHIER EXISTE DÉJÀ ON NE LE CRÉÉ PAS
    if(!fs.existsSync(filePathConfig)){
        fs.writeFileSync(filePathConfig, "{}");
    }
}

function _checkConfig() {
    const cfg = _readConfig();
    let err = 0;

    const resSrc = _checkDirectory(cfg.source, "source");
    const resDest = _checkDirectory(cfg.destination, "destination");

    if (!resSrc) {
        err++;
    }

    if (!resDest){
        err++;
    }

    if (resSrc && resDest){
        if(fctPerso.isIn(cfg.source, cfg.destination)){
            console.log("Les répertoires source et destination sont contenus l'un dans l'autre.");
            err++;
        }
    }
    
    return err === 0;
}

function _checkDirectory(chemin, type) {
    if (!cfg.source) {
        console.log(`Veuillez configurer un répertoire ${type}.`);
        err++;
    }
    else {
        if (!fs.existsSync(cfg.source)) {
            console.log(`Le répertoire configuré pour la ${type} n'existe pas`);
            err++;
        } else {
            if (!fs.statSync(cfg.source).isDirectory()) {
                console.log(`Le répertoire configuré pour la ${type} n'est pas un répertoire.`);
                err++;
            }
        }
    }

    return err === 0;
}

module.exports.getVersion = _getVersion;
module.exports.setSRC = _setSRC;
module.exports.getSRC = _getSRC;
module.exports.setDIST = _setDIST;
module.exports.getDIST = _getDIST;
module.exports.checkConfig = _checkConfig;

//POUR LES TESTS
module.exports._readConfig = _readConfig;
module.exports._setConfig = _setConfig;
module.exports._createConfigFile = _createConfigFile;
