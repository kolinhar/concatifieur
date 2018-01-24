/**
 * Created by PRJS12821 on 03/11/2017.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const filePathConfig = path.resolve(".", "config-concatifieur.json");
const fctPerso = require("./fctPerso");
const config = require("./service").config;


/**
 * RETOURNE LA VERSION DU PACKAGE EN LISANT LE FICHIER PACKAGE.JSON
 * @returns {String} la version du logiciel
 */
function _getVersion() {
    const packageFile = fs.readFileSync("./package.json");
    const parsedPackage = JSON.parse(packageFile);

    return parsedPackage.version || "undefined";
}

/**
 * AJOUTE DANS LA CONFIGURATION LE RÉPERTOIRE SOURCE
 * @param {string} src
 * @returns {string}
 * @private
 */
function _setSRC(src) {
    _setConfig({
        source: src
    });

    return src;
}

/**
 * RETOURNE LE RÉPERTOIRE SOURCE
 * @returns {string}
 * @private
 */
function _getSRC() {
    return _readConfig().source;
}

/**
 * AJOUTE DANS LA CONFIGURATION LE RÉPERTOIRE DE DESTIANTION
 * @param {string} dist
 * @returns {string}
 * @private
 */
function _setDIST(dist) {
    _setConfig({
        destination: dist
    });

    return dist;
}

/**
 * RETOURNE LE RÉPERTOIRE DE DESTINATION
 * @returns {string}
 * @private
 */
function _getDIST() {
    return _readConfig().destination;
}

/**
 * AJOUTE DANS LA CONFIGURATION UN RÉPERTOIRE À IGNORER
 * @param {string} chemin
 * @returns {array}
 * @private
 */
function _addFolder(chemin) {
    const configFile = _readConfig();
    const tempPath = path.resolve(chemin);

    if (!fs.existsSync(tempPath)){
        console.warn(`Le répertoire ${tempPath} n'existe pas`);
        return;
    }

    if (!configFile.ignoredFolders){
        configFile.ignoredFolders = [];
    }

    //AU CAS OÙ QQUN L'A REMPLI MANUELLEMENT
    configFile.ignoredFolders = configFile.ignoredFolders
        .map(x => path.resolve(x));

    if (configFile.ignoredFolders.indexOf(tempPath) === -1){
        configFile.ignoredFolders.push(tempPath);
    } else{
        console.log("Ce répertoire est déjà ignoré.");
    }

    _setConfig(configFile);

    return configFile.ignoredFolders;
}

/**
 * SUPPRIME DANS LA CONFIGURATION UN RÉPERTOIRE À IGNORER
 * @param chemin
 * @returns {array}
 * @private
 */
function _removeFolder(chemin) {
    const configFile = _readConfig();
    const tempPath = path.resolve(chemin);

    if (!configFile.ignoredFolders){
        configFile.ignoredFolders = [];
    }

    //AU CAS OÙ QQUN L'A REMPLI MANUELLEMENT
    configFile.ignoredFolders = configFile.ignoredFolders
        .map(x => path.resolve(x))
        .filter(x => x !== tempPath);

    _setConfig(configFile);

    return configFile.ignoredFolders;
}

/**
 * RETOURNE L'ÉTAT DE LA CONFIGURATION
 * @returns {object}
 * @private
 */
function _readConfig() {
    _createConfigFile();

    const configFile = JSON.parse(fs.readFileSync(filePathConfig));

    for (let prop in configFile) {
        config[prop] = configFile[prop];
    }

    return configFile;
}

/**
 * DÉFINIT LA CONFIGURATION
 * @param {object} obj
 * @private
 */
function _setConfig(obj) {
    const Fconfig = _readConfig();

    if (obj){
        for (let prop in obj) {
            Fconfig[prop] = obj[prop];
        }

        fs.writeFileSync(filePathConfig, JSON.stringify(Fconfig));
    }
}

/**
 * CRÉÉ LE FICHIER DE CONFIGURATION SI IL N'EXISTE PAS
 * @private
 */
function _createConfigFile() {
    //SI LE FICHIER EXISTE DÉJÀ ON NE LE CRÉÉ PAS
    if(!fs.existsSync(filePathConfig)){
        fs.writeFileSync(filePathConfig, "{}");
    }
}

/**
 * VÉRIFIE LA CONFIGURATION DEPUIS LE FICHIER DE CONFIGURATION, SINON DEPUIS LE PARAMÈTRE REÇU
 * @param {object} [cfg]
 * @returns {boolean}
 * @private
 */
function _checkConfig(cfg) {
    cfg = cfg || _readConfig();
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

/**
 * VÉRIFIE LA VALIDITÉ D'UN RÉPERTOIRE POUR LA CONFIGRATION EN SOURCE OU EN DESTINATION
 * @param {string} chemin - le répertoire à contrôler
 * @param {string} type - "destination" ou "source"
 * @returns {boolean}
 * @private
 */
function _checkDirectory(chemin, type) {
    let err = 0;

    if (!chemin) {
        console.log(`Veuillez configurer un répertoire ${type}.`);
        err++;
    }
    else {
        if (!fs.existsSync(chemin)) {
            console.log(`Le répertoire configuré pour la ${type} n'existe pas`);
            err++;
        } else {
            if (!fs.statSync(chemin).isDirectory()) {
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
module.exports.addFolder = _addFolder;
module.exports.removeFolder = _removeFolder;
module.exports.checkConfig = _checkConfig;

//POUR LES TESTS
module.exports._readConfig = _readConfig;
module.exports._setConfig = _setConfig;
module.exports._createConfigFile = _createConfigFile;
