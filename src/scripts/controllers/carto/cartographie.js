"use strict";

ngAriane.controller("cartographie", ["$scope", "$routeParams", "FichesDispatch", "$cookieStore", "DAL_AGENT", "cartoFactory", "cartoService", "NOMSPARTIS", "agentsService", "FicheFactoryCSharp", "AjaxErrorManager", "$interval", "FichesAgent", "$timeout", function ($scope, $routeParams, FichesDispatch, $cookieStore, DAL_AGENT, cartoFactory, cartoService, NOMSPARTIS, agentsService, FicheFactoryCSharp, AjaxErrorManager, $interval, FichesAgent, $timeout) {
    if ($routeParams.onglet !== "cartographie")
        return;

    $scope.routeParams = $routeParams;
    $scope.FichesDispatch = FichesDispatch;
    $scope.cartoService = cartoService;
    $scope.cookieStore = $cookieStore;
    $scope.isCalling = false;

    $scope.tabToShow = {};
    $scope.Affect = "0";

    angular.extend($scope, {
        center: {
            lat: 48.2018,
            lng: 7.4954,
            zoom: 8
        },
        layers: {
            baselayers: {
                mapbox_light: {
                    name: 'Mapbox Light',
                    url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    type: 'xyz',
                    layerOptions: {
                        apikey: 'pk.eyJ1IjoiY29kZnJhY3RhbCIsImEiOiJjaXBmazVzZGcwMDFzdWtuaG1kZjFwcnNoIn0.N-CDOaO1-GgjtVfEDnJjRw',
                        mapid: 'codfractal.0dej1j0n'
                    }
                },
                osm: {
                    name: 'OpenStreetMap',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                }
            }
        },
        markers: {}
    });

    $scope.cartographie = {
        isLoading: true
    };

    //@TODO: CODE QUI VA ÊTRE REVUE POUR LA MISE EN DIRECTIVE
    DAL_AGENT.ListeAgentsOrdered(function (listeAgents) {
        $scope.Fiches = {
            Agents: listeAgents.filter(function (val) {
                //ON N'AFFICHE PAS LES "PARTIS"
                return NOMSPARTIS.every(function (nom) {
                    return val.nomPrenom.indexOf(nom) === -1
                });
            }),
            AgentsAgent: listeAgents.filter(function (val) {
                return (val.cp === '0' || val.cp === $cookieStore.get('agent'))
                        //ON N'AFFICHE PAS LES "PARTIS"
                    && NOMSPARTIS.every(function (nom) {
                        return val.nomPrenom.indexOf(nom) === -1
                    });
            })
        };
    });

    $scope.$watchCollection("FichesDispatch.fiches", function (newCol, oldCol) {
        if (newCol === undefined || angular.isArray(newCol) === false)
            return;

        if (newCol.length > 0 && $scope.isCalling === false) {
            $scope.cartographie.isLoading = true;
            $scope.isCalling = true;

            cartoService.cpt++;

            if (cartoService.cpt !== 1)
                location.reload();

            $scope.interPoste = newCol.map(function (val) {
                return val.poste;
            });

            cartoFactory.getPosteLoc({
                ordinateurs: $scope.interPoste
            }).then(function succes(datas) {
                $scope.isCalling = false;
                //MISE EN PLACE DES MARKERS
                for (var location in cartoService.datas) {
                    cartoService.datas[location].label.message = newCol.filter(function (val) {
                        return val.poste === cartoService.datas[location].poste;
                    }).map(function (val) {
                        return val.nFiche.toString();
                    }).join("<br/>");
                }

                $scope.perimetre = {};
                $scope.perimetreAffect = [];
                $scope.localisation = {};
                $scope.localisationAffect = [];

                for (var marker in cartoService.datas) {
                    var obj = cartoService.datas[marker];

                    obj.label.message.split("<br/>").forEach(function (val) {
                        if (obj.perimetre !== "") {
                            if ($scope.perimetre[obj.perimetre] === undefined) {
                                $scope.perimetre[obj.perimetre] = [];
                                $scope.perimetreAffect.push("0");
                            }

                            $scope.perimetre[obj.perimetre].push(newCol.filter(function (inter) {
                                return inter.nFiche.toString() === val;
                            })[0]);
                        }
                        else {
                            if ($scope.localisation[obj.location] === undefined) {
                                $scope.localisation[obj.location] = [];
                                $scope.localisationAffect.push("0");
                            }

                            $scope.localisation[obj.location].push(newCol.filter(function (inter) {
                                return inter.nFiche.toString() === val;
                            })[0]);
                        }
                    });
                }

                $scope.resultat = cartoService.datas;
                $scope.markers = cartoService.datas;
                $scope.cartographie.isLoading = false;
            }, function erreur() {
                $scope.isCalling = false;
                $scope.cartographie.isLoading = false;
            });
        }
    });

    $scope.$on("leafletDirectiveMarker.click", function (ev, args) {
        _enLightement(args.model.label.message);
    });

    $scope.$on("leafletDirectiveLabel.click", function (ev, args) {
        _enLightement(args.leafletObject._content);
    });

    /**
     * AFFECTE UNE FICHE À UN AGENT
     * @param {object} fiche
     */
    $scope.Affectation = function (fiche) {
        $scope.cartographie.isLoading = true;

        var l_datasUpdate = {};

        try{
            l_datasUpdate = agentsService.getDatasFicheForUpdate(fiche);
        }catch (e){
            $scope.cartographie.isLoading = false;
            fiche.affectation = "0";
            AjaxErrorManager.Gerer("Erreur, le champ projet de la fiche " + fiche.nFiche + " n'est pas correctement renseigné.");
            return;
        }

        FicheFactoryCSharp.upd(l_datasUpdate)
            .success(function (datas) {
                if (datas.exit_code === 1) {
                    cartoService.nb--;
                    $scope.tabToShow = {};
                    $scope.Affect = "0";

                    if (fiche.affectation === $cookieStore.get("agent"))
                        FichesAgent.Nb++;

                    //FILTRE LA FICHE DES MARKERS
                    angular.extend($scope, {
                        markers: _removeFicheFromMap($scope.markers, fiche.nFiche)
                    });
                    //ET DES TABLEAUX
                    $scope.perimetre = _removeFicheFromListe($scope.perimetre, fiche.nFiche);

                    $scope.localisation = _removeFicheFromListe($scope.localisation, fiche.nFiche);
                }
                else
                    AjaxErrorManager.Gerer("Erreur lors de la mise à jour de l'affectation." + datas.err_msg);

                $scope.cartographie.isLoading = false;
            })
            .error(function () {
                AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de l'affectation.");
                $scope.cartographie.isLoading = false;
            });
    };

    /**
     * AFFECTE UN PÉRIMETRE/LOCALISATION DE FICHES À UN AGENT
     * @param {Array} inters
     * @param {string} agent
     */
    $scope.AffectationMultiple = function (inters, agent) {
        $scope.cartographie.isLoading = true;

        var cptAjax = 0;
        inters.forEach(function (val) {
            val.affectation = agent;

            try{
                FicheFactoryCSharp.upd(agentsService.getDatasFicheForUpdate(val))
                    .success(function (datas) {
                        cptAjax++;
                        if (datas.exit_code !== 1)
                            AjaxErrorManager.Gerer("Erreur lors de la mise à jour de l'affectation." + datas.err_msg);
                        else {
                            //FILTRE LES FICHES DES MARKERS ET DES TABLEAUX
                            cartoService.nb--;
                            if (val.affectation === $cookieStore.get("agent"))
                                FichesAgent.Nb++;

                            angular.extend($scope, {
                                markers: _removeFicheFromMap($scope.markers, val.nFiche)
                            });

                            $scope.perimetre = _removeFicheFromListe($scope.perimetre, val.nFiche);

                            $scope.localisation = _removeFicheFromListe($scope.localisation, val.nFiche);
                        }
                    })
                    .error(function () {
                        cptAjax++;
                        AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter votre demande de mise à jour de l'affectation.");
                        $scope.cartographie.isLoading = false;
                    });
            }catch (e){
                val.affectation = "0";
                cptAjax++;
                AjaxErrorManager.Gerer("Erreur, le champ projet de la fiche " + val.nFiche + " n'est pas correctement renseigné.");
            }
        });

        var stopInterval = $interval(function () {
            if (cptAjax === inters.length) {
                $interval.cancel(stopInterval);
                $scope.tabToShow = {};
                $scope.Affect = "0";

                $scope.localisationAffect.forEach(function (val, ind, arr) {
                    arr[ind] = "0";
                });
                $scope.perimetreAffect.forEach(function (val, ind, arr) {
                    arr[ind] = "0";
                });
                
                $scope.cartographie.isLoading = false;
            }
        }, 100);
    };

    /**
     * SUPPRIME UNE FICHE DE LA CARTE
     * @param {object} listeFiches - la liste des fiches
     * @param {number|string} numFiche - la fiche à supprimer
     * @returns listeFiches - la liste des fiches sans la fiche à supprimer
     * @private
     */
    var _removeFicheFromMap = function (listeFiches, numFiche) {
        var ret = {};
        for (var fiche in listeFiches) {
            if (listeFiches[fiche].label.message.toString() !== numFiche.toString())
                ret[fiche] = listeFiches[fiche];
        }
        return ret;
    };

    /**
     * SUPPRIME UNE FICHE DU TABLEAU
     * @param {object} listeFiches - la liste des fiches
     * @param {number|string} numFiche - la fiche à supprimer
     * @returns listeFiches - la liste des fiches sans la fiche à supprimer
     * @private
     */
    var _removeFicheFromListe = function (listeFiches, numFiche) {
        for (var nomEndroit in listeFiches) {
            listeFiches[nomEndroit] = listeFiches[nomEndroit].filter(function (val) {
                return val.nFiche.toString() !== numFiche.toString();
            });

            if (listeFiches[nomEndroit].length === 0)
                delete listeFiches[nomEndroit];
        }

        return listeFiches;
    };

    var _enLightement = function (truc) {
        $scope.tabToShow = _getListIntersByInterNum(truc);

        //TEMPO LE TEMPS QUE LE DOM SOIT À JOUR
        $timeout(function () {
            truc.split("<br/>").forEach(function (val) {
                var ligne = document.getElementById(val);
                ligne.scrollIntoView(false);

                ligne.classList.add($cookieStore.get("agent") === "PAGT08882" ? "raimbow" : "beating");
                $timeout(function () {
                    ligne.classList.remove($cookieStore.get("agent") === "PAGT08882" ? "raimbow" : "beating");
                }, 3000)
            });
        }, 500);
    };

    var _getListIntersByInterNum = function (numInter) {
        for (var lieu in $scope.perimetre) {
            var ici = $scope.perimetre[lieu].filter(function (val) {
                return numInter.toString() === val.nFiche.toString();
            });

            if (ici.length !== 0)
                return {
                    perimetre: lieu,
                    datas: $scope.perimetre[lieu].sort(function (a, b) {
                        if (a.nFiche.toString() === numInter.toString())
                            return -1;
                        else
                            return 1;
                    })
                };
        }

        for (var lieu in $scope.localisation) {
            var ici = $scope.localisation[lieu].filter(function (val) {
                return numInter.toString() === val.nFiche.toString();
            });

            if (ici.length !== 0)
                return {
                    localisation: lieu,
                    datas: $scope.localisation[lieu].sort(function (a, b) {
                        if (a.nFiche.toString() === numInter.toString())
                            return -1;
                        else
                            return 1;
                    })
                };
        }
    };
}]);

ngAriane.controller("ReseauxIP", ["$scope", "cartoFactory", "reseauService", function ($scope, cartoFactory, reseauService) {
    $scope.reseauip = {
        isLoading: true,
        MAJToDo: {}
    };

    $scope.reseauService = reseauService;

    cartoFactory.getReseauLoc()
        .then(
        function success(){
            $scope.reseauip.isLoading = false;
            $scope.reseauService.datas.forEach(function (val, ind, arr) {
                $scope.$watchCollection("reseauService.datas[" + ind + "]", function (newCol, oldCol) {
                    if (angular.equals(newCol, oldCol))
                        return;

                    $scope.reseauip.MAJToDo[newCol.idSite] = newCol;
                });
            });
        },
        function error(){
            $scope.reseauip.isLoading = false;
        }
    );

    $scope.majReseau = function () {
        if (JSON.stringify($scope.reseauip.MAJToDo) === "{}")
            return;

        for (var reseau in $scope.reseauip.MAJToDo) {
            cartoFactory.updateReseauLoc($scope.reseauip.MAJToDo[reseau]).then(
               function success() {
                   $.notify("Modification effectuée !", "success");
            }, function error () {
                   $.notify("Modification non effectuée !", "error");
            });
        }

        //VIDAGE DU 'CACHE'
        $scope.reseauip.MAJToDo = {};
    };
}]);
