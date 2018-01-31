/**
 * Created by PRJS12821 on 31/01/2018.
 */
const ERRORISINDIRECTORIES = "Les répertoires source et destination sont contenus l'un dans l'autre.";
const REGEXPINNERCONCATTAG = /<!--CONCATIFICATION-->(.|\r|\n)*?<!--\/CONCATIFICATION-->/g;
const REGEXPINNERLASTOCTAG = /<!--LASTOC-->(\r|\n|.)*?<!--\/LASTOC-->/g;

module.exports.ERRORISINDIRECTORIES = ERRORISINDIRECTORIES;
module.exports.REGEXPINNERCONCATTAG = REGEXPINNERCONCATTAG;
module.exports.REGEXPINNERLASTOCTAG = REGEXPINNERLASTOCTAG;