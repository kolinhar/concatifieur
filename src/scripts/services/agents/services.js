/**
 * Created by PRJS12821 on 05/07/2016.
 */
"use strict";

ngAriane.service("agentsService", ["DatasProjets", "$cookieStore", function (DatasProjets, $cookieStore) {
   return {
       dpxPrioritaires: [],
       /**
        * RETOURNE UN OBJET DIRECTEMENT UTILISABLE PAR LA FACTORY
        * @param fiche
        * @returns {
        * {cpDemandeur: string,
        * dateDebut: Date,
        * isCloture: boolean,
        * isUrgent: boolean,
        * isPrioritaire: (boolean|null),
        * description: string,
        * materiel: string,
        * region: string,
        * etat: string,
        * cpAgent: string,
        * canal: string,
        * projet: string,
        * val_projet: string,
        * numero: (number|string),
        * numeroMongo: string,
        * annee: number,
        * numeroAutreRegion: (number|string),
        * nomPrenomDemandeur: string,
        * _id: string,
        * affaire: string,
        * pointagesSysteme: Array,
        * pointagesTransfert: Array,
        * cpActeur: string,
        * nomPrenomActeur: string,
        * telDemandeur: string,
        * mobileDemandeur: string}
        * }
        */
       getDatasFicheForUpdate: function (fiche) {
           var l_projetNom = fiche.projet.title || fiche.projet;

           return {
               cpDemandeur: fiche.cpDemandeur.trim(),
               dateDebut: fiche.date,
               isCloture: fiche.isCloture,
               isUrgent: fiche.isUrgent,
               isPrioritaire: fiche.isPrioritaire,
               description: fiche.description,
               materiel: fiche.poste.trim(),
               region: fiche.region || Region,
               etat: fiche.etat,
               cpAgent: fiche.affectation,
               canal: fiche.canal.split("_")[1].split(".")[0],
               projet: l_projetNom,
               val_projet: DatasProjets.liste.filter(function (val) {
                   return val.intitule === l_projetNom
               })[0].guid,
               numero: fiche.numero,
               numeroMongo: fiche.numeroMongo,
               annee: new Date(fiche.date).getFullYear(),
               numeroAutreRegion: fiche.numeroAutreRegion,
               nomPrenomDemandeur: fiche.demandeur,
               _id: fiche._id,
               affaire: fiche.affaire,
               pointagesSysteme: fiche.pointagesSysteme,
               pointagesTransfert: fiche.pointagesTransfert,
               cpActeur: $cookieStore.get("agent"),
               nomPrenomActeur: fiche.nomPrenomActeur,
               telDemandeur: fiche.telDemandeur,
               mobileDemandeur: fiche.mobileDemandeur
           }
       }
   }
}]);