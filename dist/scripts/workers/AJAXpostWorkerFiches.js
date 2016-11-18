/**
 * Created by PRJS12821 on 10/07/2015.
 */
"use strict";

onmessage = function(e) {
  var req = http();

  req.open('POST', e.data.url, true);
  req.setRequestHeader("Content-Type", "application/json");

  req.onreadystatechange = function(aEvt) {
    if (req.readyState === 4) {
      if (req.status === 200) {
        var ret = JSON.parse(req.response);

        if (ret.exit_code === 1) {
          var reponse = new ajaxResponse(1, null, null);

          reponse.NbFiches = ret.nbFiches;

          reponse.datas = ret.lesFiches.map(function(val) {
            // Attribution du canal d'entrée
            var canal_check = "./images/channel_" + (val.canal === undefined || val.canal === null ? "ariane" : val.canal) + ".svg";
            // Verification de la variable Transfert pour nouvelle icone
            if (val.isTransfert === true)
              canal_check = "./images/channel_transfert.svg";

            var l_nomPrenomAffectation = e.data.agents.filter(function (agent) {
              return val.cpAgent === agent.cp;
            })[0];

            var l_poidsProjet = e.data.projets.filter(function (projet) {
              return val.projet === projet.intitule;
            })[0];

            return {
              etat: val.etat,
              nFiche: val.numero || val.numeroMongo,
              numero: val.numero,
              numeroMongo: val.numeroMongo,
              demandeur: (val.nomPrenomDemandeur || "[Agent " + val.cpDemandeur + "]").split(" (")[0],
              cpDemandeur: val.cpDemandeur,
              poste: val.materiel,
              date: new Date(val.dateDebut),
              description: val.description,
              affectation: val.cpAgent,
              //SI UTILISATEUR INCONNU: FICHE --> NON AFFECTÉE
              nomAffectation: (l_nomPrenomAffectation !== undefined ? l_nomPrenomAffectation.nomPrenom : "0"),
              isCloture: val.isCloture,
              isUrgent : val.isUrgent,
              isPrioritaire : val.isPrioritaire,
              canal: canal_check,
              nomCanal: val.canal || "Ariane",
              multiPoste : (e.data.tabPoste.indexOf(val.materiel) > -1),
              pointages: (val.pointages !== undefined ? val.pointages : undefined),
              projet: val.projet || undefined,
              poidsProjet: (l_poidsProjet !== undefined ? l_poidsProjet.poids || "non calculé" : "pas de projet"),
              region: val.region,
              numeroAutreRegion: val.numeroAutreRegion,
              _id: val._id,
              affaire: val.affaire,
              pointagesSysteme: val.pointagesSysteme,
              pointagesTransfert: val.pointagesTransfert,
              cpActeur: val.cpActeur,
              nomPrenomActeur: val.nomPrenomActeur,
              telDemandeur: val.telDemandeur,
              mobileDemandeur: val.mobileDemandeur
            };

          });

          postMessage(reponse);
        } else {
          postMessage(new ajaxResponse(0, ret.exit_code, ret.err_msg));
        }
      } else {
        postMessage(new ajaxResponse(0, req.status, req.statusText));
      }
    }
  };

  req.onerror = function(e) {
    postMessage(new ajaxResponse(null, null, "ERREUR"));
  };

  req.send(JSON.stringify(e.data.datas));
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
