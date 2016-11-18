(function ()
{
    "use strict";

    //Propre à Webstorm
    document.cookie = "ariane=hash=ULSAMDQWBNABTBIOOFVTGGVTVSORPQHFVZWTEPBJYPEMJGTJLC&agent=PRJS12821&unite=INFORMATIQUE&secteur=Secteur2&isTELCO=0&accessLevel=3&isFirstCnx=0&lastCnx=05/08/2014 14:39:26";
    /**
     * Vas Te Faire Authentifier
     */

    function VTFA() { location.href = "login.aspx"; }

    //TEST SI NAVIGATEUR PAS CHROME NI FF
    if (navigator.userAgent.match(/Firefox|Chrome/) === null || navigator.userAgent.match(/Opera|OPR/) !== null)//
        {
            //STOP LE CHARGEMENT DE LA PAGE
            document.execCommand("Stop");
            document.write(
                "<html style='display: block !important;'>\
                <head>\
                    <style>\
                        *{display: none;}\
                    </style>\
                </head>\
                <body style='display: block !important;'>\
                    <h1 style='text-align: center; margin-bottom: 2em; display: block !important;'>Votre navigateur n'est pas supportée par cette application.</h1>\
                    <p style='font-weight: bold; font-size: 1.5em; padding: 2em; display: inline !important;'>Veuillez contacter l'ASTI via <em style='text-decoration: underline; display: inline !important;'>Assistance Informatique</em> ou la <em>hotline au 91 13 choix 2</em> afin de le mettre à jour ou bien d'installer Mozilla Firefox version ESR.</p>\
                </body>\
            </html>");

            return;
        }

    //VERIF AUTH
    if (document.cookie)
        if (document.cookie.match(/ariane=hash=\w{50}&agent=(\w{8,10}|\w{8,10}_ADM)&unite=(\w|\W){2,}$/))
            console.log("Auth ok");
        else
            VTFA();
    else
        VTFA();
})();
