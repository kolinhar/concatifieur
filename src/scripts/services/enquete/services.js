/**
 * Created by PRJS12821 on 19/05/2016.
 */
"use strict";
ngAriane.service("enqueteService", function () {
    return {
        datas: {},
        fiche: {},
        forms: [],
        questions: []
    };
});

ngAriane.service("enqueteFormService", function () {
    return {
        datas: {},
        /**
         * CHECK LES INFOS DU FORMULAIRE
         * @param {object} enqueteform - le scope qui contient le questionnaire
         * @returns {boolean}
         */
        checkDatas: function (enqueteform) {
            var cpt = 0;

            enqueteform.Questions.forEach(function(val, ind, arr){
                if(val.Libelle.trim() === "") {
                    cpt++;
                    val.error = true;
                }
                else{
                    val.error = false;
                }
            });

            return cpt === 0;
        },
        getDatas: function (enqueteform) {
            var ret = {
                actif: enqueteform.check,
                Questions: enqueteform.Questions.map(function (val) {
                    return {
                        Libelle: val.Libelle
                    };
                })
            };

            if (enqueteform._id !== undefined)
                ret._id = enqueteform._id;

            return ret;
        },
        convertToEnquete: function (datas) {
            var ret = {
                actif: datas.check,
                Questions: enqueteform.Questions.map(function (val) {
                    return {
                        Libelle: val.Libelle
                    };
                })

            };

            if (enqueteform._id !== undefined)
                ret._id = enqueteform._id;

            return ret;
        }
    };
});