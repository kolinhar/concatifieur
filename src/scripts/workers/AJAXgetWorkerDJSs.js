/**
 * Created by PRJS12821 on 14/01/2016.
 */
"use strict";

onmessage = function (e) {
    var req = http();

    req.open('GET', e.data.url, true);
    req.send(null);

    req.onreadystatechange = function (aEvt) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                var ret = JSON.parse(req.response);

                if (ret.exit_code === 1) {
                    var reponse = new ajaxResponse(1, null, null);

                    reponse.datas = ret.lesDjs;

                    postMessage(reponse);
                }
                else {
                    postMessage(new ajaxResponse(0, ret.exit_code, ret.err_msg));
                }
            }
            else {
                postMessage(new ajaxResponse(0, req.status, req.statusText));
            }
        }
    };

    req.onerror = function (e) {
        postMessage(new ajaxResponse(null, null, "ERREUR"));
    };
};

/**
 * OBJET DE RETOUR POUR LE WORKER
 * @param exit_code
 * @param err_code
 * @param err_msg
 * @returns {{exit_code: (*|number), err_code: (*|number), err_msg: (*|string)}}
 */
var ajaxResponse = function(exit_code, err_code, err_msg) {
    return {
        exit_code: exit_code || 0,
        err_code: err_code || 200,
        err_msg: err_msg || ""
    }
};

/**
 * CRÉER L'OBJET AJAX
 * @returns {*}
 */
var http = function getHTTPObject() {
    if (typeof XMLHttpRequest != 'undefined') {
        return new XMLHttpRequest();
    }

    try {
        return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            console.log("ajax impossible");
        }
    }
    return false;
};