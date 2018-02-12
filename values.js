/**
 * Created by PRJS12821 on 31/01/2018.
 */
const ERRORISINDIRECTORIES = "Les répertoires source et destination sont contenus l'un dans l'autre.";
const REGEXPINNERCONCATTAG = /<!--CONCATIFICATION-->(.|\r|\n)*?<!--\/CONCATIFICATION-->/g;
const REGEXPINNERLASTOCTAG = /<!--LASTOC-->(\r|\n|.)*?<!--\/LASTOC-->/g;
const REGEXPSTRINGINSTRING = /["|'].*?["|']/;

const REGEXPSPACEBETWEENTAGS = />\s+</gm;
const REGEXPNEWLINE = /[\r\n]*/gm;
const REGEXSCRIPTTAG = /<script(.|\r|\n)*?>(.|\r|\n)*?<\/script>/gi;
const REGEXSCRIPTINLINE = /<script(.|\r|\n)*?>(.|\r|\n)+<\/script>/gi;
const REGEXSTYLETAG = /(<link(.|\r|\n)*?rel=['"]stylesheet['"](.|\r|\n)*?(\/)*>)|(<style(.|\r|\n)*?>(.|\r|\n)*?<\/style>)/gi;
const REGEXSTYLEINLINE = /<style(.|\r|\n)*?>(.|\r|\n)+<\/style>/gi;
const REGEXPINNERCOMMENTTAG = /<!--\s*.*\s*-->/gm;
const REGEXPCOMMENTEDTAG = /<!--\s*<(script|style|link)(.|\s)*?\/?>(.|\s)*?(<\/(script|style)>)?\s*-->/gmi;
const PATHSEPARATOR = require("path").sep;
const INDEXFILENAME = "index.html";

module.exports.ERRORISINDIRECTORIES = ERRORISINDIRECTORIES;
module.exports.REGEXPINNERCONCATTAG = REGEXPINNERCONCATTAG;
module.exports.REGEXPINNERLASTOCTAG = REGEXPINNERLASTOCTAG;
module.exports.REGEXPSTRINGINSTRING = REGEXPSTRINGINSTRING;
module.exports.REGEXPSPACEBETWEENTAGS = REGEXPSPACEBETWEENTAGS;
module.exports.REGEXPNEWLINE = REGEXPNEWLINE;
module.exports.REGEXSCRIPTTAG = REGEXSCRIPTTAG;
module.exports.REGEXSCRIPTINLINE = REGEXSCRIPTINLINE;
module.exports.REGEXSTYLETAG = REGEXSTYLETAG;
module.exports.REGEXSTYLEINLINE = REGEXSTYLEINLINE;
module.exports.REGEXPINNERCOMMENTTAG = REGEXPINNERCOMMENTTAG;
module.exports.REGEXPCOMMENTEDTAG = REGEXPCOMMENTEDTAG;
module.exports.PATHSEPARATOR = PATHSEPARATOR;
module.exports.INDEXFILENAME = INDEXFILENAME;