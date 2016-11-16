/**
* AMÉLIORATION DES OBJETS JAVASCRIPT
*/
"use strict";

/**
 * RETOURNE UNE STRING DE LA DATE ACTUELLE AU FORMAT FRANÇAIS
* @returns {String} : JJ/MM/AAAA
*/
Date.prototype.getDateFR = function ()
{
    var now = this,
        jour = now.getDate(),
        mois = now.getMonth() + 1;

    jour = (jour < 10 ? "0" + jour : jour);
    mois = (mois < 10 ? "0" + mois : mois);

    return [jour, mois, now.getFullYear()].join('/');
};

/**
 * RETOURNE UNE STRING DE LA DATE ET L'HEURE ACTUELLE AU FORMAT FRANÇAIS
* @returns {String} : JJ/MM/AAAA HH:MM
*/
Date.prototype.getDateTimeFR = function ()
{
    var now = this;
    return this.getDateFR() + ' ' + [_AffZero(now.getHours()), _AffZero(now.getMinutes())].join(':');
};

/**
 * RETOURNE LE NUMÉRO DE SEMAINE DE LA DATE EN COURS
 * @returns {number}
 */
Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

/**
 * RETOURNE LE PREMIER JOUR DE LA SEMAINE DE L'ANNÉE DEMANDÉE
 * @param Year
 * @param Week
 * @returns {date}
 */
Date.setWeekNumber = function (Year, Week) {
    Year = parseInt(Year, 10);
    Week = parseInt(Week, 10);
    /**
     * SI LE NUMÉRO DE SEMAINE EST égale À 1 ON UTILISE COMME DATE DE RÉFÉRENCE LE 29 DÉCEMBRE DE L'ANNÉE PRÉCÉDENTE
     * CAR LE PREMIER JOUR DE LA SEMAINE 1 PEUT TOMBER LE 29 DÉCEMBRE (AU MAXIMUM) DE L'ANNÉE PRÉCÉDENTE
     */
    var l_date = (Week === 1 ? new Date(Year - 1, 11, 29, 0, 0, 0, 0) : new Date(Year, 0, 1, 0, 0, 0, 0));

    while (l_date.getWeekNumber() !== Week){
        l_date.setDate(l_date.getDate() + 1);

        if (l_date.getFullYear() > Year)
            return new Date("Invalid Date");
    }

    return l_date;
};

/**
 * RETOURNE UNE DATE AU FORMAT MM/DD/YYYY QUE SIGNALR INTEPRETE CORRECTEMENT
 * @returns {string}
 */
Date.prototype.toSignalR = function () {
    return (this.getMonth() + 1) + "/" + this.getDate() + "/" + this.getFullYear();
};

/**
 * RETOURNE UNE DATE À PARTIR D'UNE CHAINE DE CARACTÈRE SOUS FORME DE DATE AU FORMAT FRANÇAIS
* @param dateStringFR {String} : date au format JJ/MM/AAAA
* @returns {Date}
*/
Date.setDateFR = function (dateStringFR)
{
    var tab = dateStringFR.split(/\D/);
    return new Date(parseInt(tab[2], 10), parseInt(tab[1], 10) - 1, parseInt(tab[0], 10));
};

/**RETOURNE UNE DATE ET UNE HEURE À PARTIR D'UNE CHAINE DE CARACTÈRE SOUS FORME DE DATE AU FORMAT FRANÇAIS
* @param dateTimeStringFR {String}: date au format JJ/MM/AAAA HH:MM ou JJ/MM/AAAA HH:MM:SS
* @returns {Date}
*/
Date.setDateTimeFR = function (dateTimeStringFR)
{
    var tab = dateTimeStringFR.split(/\D/);
    return new Date(parseInt(tab[2], 10), parseInt(tab[1], 10) - 1, parseInt(tab[0], 10),  parseInt(tab[3], 10), parseInt(tab[4], 10), (tab[5] ? parseInt(tab[5], 10) : 0));
};

/**VÉRIFIE SI LA DATE EST JUSTE
* @param {String} dateStringFR : date sous forme de string au format JJ/MM/AAAA
* @returns {bool}
*/
var IsDate = function (dateStringFR)
{
    if (dateStringFR === undefined || Object.prototype.toString.call(dateStringFR) !== "[object String]")
        return false;

    var r_date = new RegExp(/^\d{1,2}\D\d{1,2}\D\d{4}$/);
    var l_decoup = dateStringFR.split(/\D/);

    if (r_date.test(dateStringFR)) {
        var l_date = new Date(parseInt(l_decoup[2], 10), parseInt(l_decoup[1], 10)-1, parseInt(l_decoup[0], 10));

        if (l_date.toString() !== "Invalid Date"
            && l_date.getDate() === parseInt(l_decoup[0], 10)
            && l_date.getMonth() + 1 === parseInt(l_decoup[1], 10)
            && l_date.getFullYear() === parseInt(l_decoup[2], 10))
            return true;
    }
    return false
};

/**VÉRIFIE SI L'HEURE EST JUSTE
* @param {String} timeString : heure sous forme de string au format HH?MM
* @returns {bool}
*/
var IsTime = function (timeString)
{
    var r_time = new RegExp(/^[0-9]{1,2}\D[0-9]{1,2}$/);
    var l_decoup = timeString.split(/\D/);

    if (r_time.test(timeString)) {
        var l_heure = parseInt(l_decoup[0], 10),
            l_minute = parseInt(l_decoup[1], 10);
        //VÉRIFICATION DES HEURES ET MINUTES
        if ((l_heure >= 0 && l_heure <= 23)
            && (l_minute >= 0 && l_minute <= 59))
            return true;
    }
    return false;
};

/**AFFICHE UN ZÉRO SI LE NOMBRE PASSÉ EN PARAMÈTRE EST INFÉRIEUR À 10
* @param {Number} nombre
* @returns {String} chaine au format numérique
*/
var _AffZero = function (nombre)
{
    if (!isNaN(nombre)) {
        if (nombre < 10) {
            return "0" + nombre;
        }
        return "" + nombre;
    }
    return nombre;
};

/**TEST SI LA CHAINE PASSÉE EN PARAMÈTRE EST UN FLOTTANT
* @param {String} nombreChaine : un nombre sous forme de chaine de caractères
* @returns {bool}
*/
var IsFloat = function(nombreChaine)
{
    if (/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(nombreChaine))
        return true;
    return false;
};

/**TEST SI LA CHAINE PASSÉE EN PARAMÈTRE EST UN ENTIER POSITIF OU VIDE
* @param {String} : nombreChaine : un nombre sous forme de chaine de caractères
* @returns {bool}
*/
var IsPositiveIntOrNull = function (nombreChaine)
{
    nombreChaine = $.trim(nombreChaine);
    var IntVal = parseInt(nombreChaine, 10);

    if (nombreChaine !== "" && (isNaN(IntVal) || nombreChaine !== IntVal.toString() || IntVal < 0))
        return false;
    return true;
};

/**SYSTÈME DE PATRON
* @param {String} pattern : chaîne de caractère avec '{x}' comme repère
* @param {Object} data : les informations à lier au patron avec 'x' comme libellé JSON
*/
var PatternHTML = function(pattern, data)
{
    this.Pattern = pattern || "";
    this.Data = data || {};

    this.getString = function ()
    {
        if (this.Pattern === "")
            throw "Pattern is empty";
        else {
            var data = this.Data;
            var HTMLstr = this.Pattern;

            for (var nom in data) {
                HTMLstr = HTMLstr.replace(new RegExp("\{" + nom + "\}", "g"), data[nom]);
            }

            return HTMLstr;
        }
    }
};

/**ARRONDI UN NOMBRE À VIRGULE
* @param {(number|float|string)} nombre : nombre à arrondir
* @param {(number|string)} [nbraprvirg] : le nombre de chiffres après la virgule
* @returns {float}
*/
var Arrondi = function(nombre, nbraprvirg)
{
    //VÉRIFICATIONS DE BASE
    if (!IsFloat(nombre) || isNaN(parseFloat(nombre)))
        return nombre;

    //SI PB AVEC LE NOMBRE À VIRGULE, ON MET 15 CHIFFRES APRÈS LA VIRGULE
    nbraprvirg = Math.abs(parseInt(nbraprvirg, 10)) || 15;

    return parseFloat(parseFloat(nombre).toFixed(nbraprvirg));
};

/**CONVERTIE UNE DATE AU FORMAT "/Date(1382392800000-0000)/" EN DATE JAVASCRIPT
* @param {string} dateStr
* @returns {Date}
*/
var ParseDate = function (dateStr)
{
    var l_dateStr = /\d{13}[-|+]\d{4}/.exec(dateStr);

    if (l_dateStr.length === 1){
        var l_dateTab = l_dateStr[0].split(/[-|+]/);
        l_dateTab.map(function (val, ind, arr) {
            return parseInt(val, 10)
        });
        var l_signeTab = /[-|+]/.exec(l_dateStr[0]);
        var l_dateNbre = (l_signeTab[0] === "-" ? l_dateTab[0] - l_dateTab[1] : l_dateTab[0] + l_dateTab[1]);

        return new Date(l_dateNbre);
    }

    return new Date("Invalid Date");
};

/**VÉRIFIE SI LE PARAMÈTRE POURRAIT ÊTRE UN NUMÉRO ACTIM
* @param {String} str
* @returns {bool}
*/
var IsGIENS = function (str)
{
    return /^\w{1,}[.]\w{1,}$/.test(str);
};

/**SUPPRIME LES ACCENTS DU MOT PASSÉ EN PARAMÈTRE
* @param mot {String} : le mot avec des accents
* @returns {String} : le mot sans accent
*/
var IgnoreAccents = function (mot)
{
    var r = mot;
    //MINUSCULE
    r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
    r = r.replace(new RegExp("æ", 'g'), "ae");
    r = r.replace(new RegExp("ç", 'g'), "c");
    r = r.replace(new RegExp("[èéêë]", 'g'), "e");
    r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
    r = r.replace(new RegExp("ñ", 'g'), "n");
    r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
    r = r.replace(new RegExp("œ", 'g'), "oe");
    r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
    r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
    //MAJUSCULE
    r = r.replace(new RegExp("[ÀÁÂÃÄÅ]", 'g'), "A");
    r = r.replace(new RegExp("Æ", 'g'), "AE");
    r = r.replace(new RegExp("ç", 'g'), "C");
    r = r.replace(new RegExp("[ÈÉÊË]", 'g'), "E");
    r = r.replace(new RegExp("[ÌÍÎÏ]", 'g'), "I");
    r = r.replace(new RegExp("Ñ", 'g'), "N");
    r = r.replace(new RegExp("[ÒÓÔÕÖ]", 'g'), "O");
    r = r.replace(new RegExp("Œ", 'g'), "OE");
    r = r.replace(new RegExp("[ÙÚÛÜ]", 'g'), "U");
    r = r.replace(new RegExp("[ÝŸ]", 'g'), "Y");
    return r;
};
