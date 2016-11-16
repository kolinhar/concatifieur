/**
 * Created by PRJS12821 on 15/09/2014.
 */
"use strict";

ngAriane.filter("sum", function () {
    return function (array) {
        return array.reduce(function (previousValue, currentValue, ind, arr) {
            if (previousValue.duree !== undefined)
                return previousValue.duree + currentValue.duree;
            else
                return previousValue + currentValue;
        });
    };
});

/**
 * FILTRE À CHOIX MULTIPLE
 * ET INCLUSIF
 */
ngAriane.filter("MultiFiltre", ["$filter", "DIFilteredData", function ($filter, DIFilteredData) {
    return function (items, keyObj) {
        if (items.length === 0)
            return;

//        console.info("entrée filtre:", arguments);

        //OBJET DE TRAVAIL POUR LE FILTRE
        var filterObj = {
            data:items,
            filteredData:[],
            applyFilters : function(keyObj){
//                console.log("applyFilter objet:", keyObj);

                //POUR CHAQUE ÉLÉMENTS DE LA LISTE
                this.filteredData = items.filter(function (data, ind, arr) {

                    var isOk = true;
                    //ON APPLIQUE TOUS LES FILTRES
                    for (var filtre in keyObj) {
                        /**
                         * FILTRE 'SIMPLE'
                         */
                        if (angular.isString(keyObj[filtre]) || angular.isNumber(keyObj[filtre])){
                            if (isOk) {//CONDITION D'OPTIMISATION POUR ÉVITER DES BOUCLES INUTILES
                                //SI LE CHAMPS EXISTE
                                if (data[filtre] !== undefined) {
                                    if (data[filtre] !== keyObj[filtre]) {
                                        isOk = false;
//                                    console.info(data[filtre], "!==", keyObj[filtre]);
                                    }
                                }
                                else {
                                    console.warn("field", filtre, " does not exist");
                                }
                            }
                        }
                        /**
                         * FILTRE À CHOIX MULTIPLE
                         */
                        else if(angular.isArray(keyObj[filtre])){
                            if (isOk) {//CONDITION D'OPTIMISATION POUR ÉVITER DES BOUCLES INUTILES
                                var l_cptCdt = 0,
                                    l_cptKo = 0;

                                keyObj[filtre].forEach(function (valFltr, ind, arr) {
                                    /**
                                     * SI C'EST UN TABLEAU D'OBJETS JSON DE LA FORME:
                                     * [{
                                     *   libelle: "Valeur", //la valeur à recherhcer
                                     *   value: true/false //true si on doit en tenir compte, sinon on passe au filtre suivant
                                     * }
                                     * , ...]
                                     */
                                    if (Object.prototype.toString.call(valFltr) === "[object Object]"){
                                        if (valFltr.value === true) {
                                            l_cptCdt++;

                                            if (data[filtre] !== valFltr.libelle) {
                                                l_cptKo++;
                                                //console.log(data[filtre] ,"!==", valFltr.libelle);
                                            }
                                        }
                                    }
                                    else
                                    /**
                                     * SI C'EST UN TABLEAU DE VALEURS CLASSIQUE:
                                     * [
                                     *  "valeur",
                                     *  125,
                                     *  new Date(),
                                     *  ...
                                     * ]
                                     * ON PREND EN COMPTE CHAQUE VALEUR PRÉSENTE
                                     */
                                    {
                                        l_cptCdt++;

                                        if (data[filtre] !== valFltr) {
                                            l_cptKo++;
                                            //console.log(data[filtre] ,"!==", valFltr);
                                        }
                                    }


                                });

                                if (l_cptKo === l_cptCdt)
                                    isOk = false;
                            }
                        }
                        else/** ERREUR SUR LE TYPE DE FILTRE */
                        {
                            //console.warn("filter", filtre, " is wrong");
                        }
                    }

//                    console.log("ligne", ind, isOk);

                    if (isOk)
                        return data;
                });
//                console.log("this.filteredData=", this.filteredData);
            }
        };

        //APPLICATION DU FILTRE POUR TOUS LES PARAMÈTRES
        if(keyObj)
            filterObj.applyFilters(keyObj);

        //COMMUNICATION DES NOUVELLES DONNÉES
        DIFilteredData.datas = filterObj.filteredData;
        return filterObj.filteredData;
    }
}]);
