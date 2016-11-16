/**
 * Created by PRJS12821 on 19/08/2015.
 */
ngAriane.controller("Graph", ["$scope", "$timeout", "AjaxErrorManager", "$routeParams", "graphService", "DIURLAPI", "NOMSPARTIS", "NOMSPRESTATAIRES", function ($scope, $timeout, AjaxErrorManager, $routeParams, graphService, DIURLAPI, NOMSPARTIS, NOMSPRESTATAIRES) {
    $scope.graph = {
        noData: false,
        Graph: undefined,
        isLoaded: false
    };

    $scope.graphService = graphService;

    $scope.routeParams = $routeParams;

    var workerPoids = new Worker('scripts/workers/AJAXgetWorkerPoids.js');

    workerPoids.onmessage = function (e) {
        $timeout(function () {
            if (e.data.exit_code === 1) {
                $scope.graph.datas = e.data.datas;

                if (e.data.datas.length === 0 || e.data.datas.every(function (val) {
                        return val["Back Office"] === 0 && val["En Attente"] === 0;
                    }) === true){
                    //AUCUNE DONNÉE
                    $scope.graph.noData = true;
                    document.querySelector("#graph").innerHTML = "";
                }
                else{
                    e.data.datas = e.data.datas.filter(function (val) {
                        //SI ON EST EN PROD, ON N'AFFICHE PAS LES PRESTATAIRES
                        // O_o A refactorer via Ariane Profil
                        if (location.host.indexOf("arianeinformatique.st.sncf.fr") === 0)
                            return NOMSPRESTATAIRES.every(function (nom) {
                                    return val.nomPrenom.indexOf(nom) === -1
                                })
                        //NI PHILIPPE
                                && val.nomPrenom.indexOf("FISCHER") === -1
                        //NI LES "PARTIS"
                                && NOMSPARTIS.every(function (nom) {
                                    return val.nomPrenom.indexOf(nom) === -1
                                });
                        else
                            return true;
                    });

                    if ($scope.graph.Graph === undefined){
                        //NOUVEAU GRAPH
                        $scope.graph.Graph = new Highcharts.Chart({
                            chart: {
                                type: 'bar',
                                height: e.data.datas.length * 25,
                                renderTo: "graph"
                            },
                            title: {
                                text: undefined
                            },
                            xAxis: {
                                title: {
                                    text: "AGENTS",
                                    style: {
                                        color: "#4d759e"
                                    }
                                },
                                categories: e.data.datas.map(function (val) {
                                    return val.nomPrenom
                                })
                            },
                            yAxis: {
                                min: 0,
                                title: {
                                    text: "CHARGE DE TRAVAIL",
                                    style: {
                                        color: "#4d759e"
                                    }
                                }
                            },
                            legend: {
                                reversed: true
                            },
                            plotOptions: {
                                series: {
                                    stacking: 'normal'
                                }
                            },
                            series: [
                                {
                                    name: "Charge Effectuée",
                                    data: e.data.datas.map(function (val) {
                                        return val["Charge Effectué"]
                                    }),
                                    stack: "Fait",
                                    color : "#1CB6E9"
                                },
                                {
                                    name: "En Attente",
                                    data: e.data.datas.map(function (val) {
                                        return val["En Attente"]
                                    }),
                                    stack: "A faire",
                                    color : "#04B404"

                                },
                                {
                                    name: "Back Office",
                                    data: e.data.datas.map(function (val) {
                                        return val["Back Office"]
                                    }),
                                    stack: "A faire",
                                    color : "#993366"
                                }
                            ]
                        });
                    }
                    else{
                        //MISE À JOUR DU GRAPH
                        $scope.graph.Graph.series[0].setData(e.data.datas.map(function (val) {
                            return val["En Attente"]
                        }));

                        $scope.graph.Graph.series[1].setData(e.data.datas.map(function (val) {
                            return val["Back Office"]
                        }));
                    }
                }
            }
            else {
                if (e.data.err_code === 200){
                    AjaxErrorManager.Gerer("Erreur lors de la récupération de la répartition des charges. "  + e.data.err_msg);
                }
                else {
                    AjaxErrorManager.Gerer("ERREUR le serveur n'a pas pu traiter la demande de récupération de la répartition des charges.");
                }
            }
        }, 0)
    };

    /**
     * MET À JOUR DYNAMIQUEMENT LE TABLEAU
     */
    $scope.$watch("graphService.reload", function (newVal, oldVal) {
        if(newVal === oldVal || newVal === undefined)
            return;

        workerPoids.postMessage({url : DIURLAPI.URLapiNancy});
    });

    /**
     * @HACK
     * AU PREMIER CLICK ON CHARGE LE GRAPH
     * POUR QU'IL PRENNE TOUTE LA PLACE DISPONIBLE,
     * SINON IL PREND MOINS DE LA MOITIÉ DE LA PLACE DISPONIBLE
     * ... MERCI HIGHCHARTS
     */
    $scope.graph.draw = function(){
        if ($scope.graph.isLoaded === true)
            return;

        $scope.graph.isLoaded = true;

        workerPoids.postMessage({url : DIURLAPI.URLapiNancy});
    }
}]);