/**
 * Created by PRJS12821 on 29/06/2016.
 */
"use strict";
var style = document.createElement("style");
style.appendChild(document.createTextNode("/*surcharge de jquery-ui.structure*/ .ui-front {z-index: 1050;} .ui-menu-item>p{margin-bottom: 0;} .ui-menu-item>p+p{font-size: 14px;}"));

document.head.appendChild(style);

angular.module("AutocompleteJQuery", [])
    .factory('jQuery', ["$window", function ($window) {
        return $window.jQuery;
    }])
    .directive('jqAutocomplete', ["jQuery", "$timeout", function (jQuery, $timeout) {
        return {
            restrict: "E",
            replace: true,
            template: "<input ng-model='valeur' type='text' />",
            link: function (scope, element, attrs) {
                var options = {
                    minLength: 1,
                    cache: false,
                    select: function (event, ui) {
                        //console.log("select", ui.item);
                        scope.jqModel = ui.item;

                        $timeout(function () {
                            element.val(_getLabel(ui.item));
                        }, 0)
                    },
                    change: function (event, ui) {
                        //console.log("change", ui.item);
                        scope.jqModel = ui.item;

                        $timeout(function () {
                            if (ui.item !== null)
                                element.val(_getLabel(ui.item));
                            else
                                element.val("");
                        }, 0);
                    }
                };

                if (scope.jqFctRenderDatas !== undefined) {
                    options.create = function () {
                        $(this).data('ui-autocomplete')._renderItem = scope.jqFctRenderDatas;
                    }
                }

                if (scope.jqUrl !== undefined && scope.jqDatasLocal !== undefined)
                    throw "Vous ne pouvez pas utiliser à la fois les attributs jq-url et jq-datas. Vous devez choisir entre une URL et des données locales.";

                if (scope.jqUrl === undefined && scope.jqDatasLocal === undefined)
                    throw "Vous devez utiliser au moins un des attributs jq-url et jq-datas. Vous devez choisir entre une URL et des données locales.";

                if (scope.jqDatasLocal !== undefined) {
                    //console.log("datas local");

                    if (angular.isArray(scope.jqDatasLocal))
                        options.source = scope.jqDatasLocal;
                    else
                        throw "jq-datas doit être un tableau.";
                }

                if (scope.jqUrl !== undefined) {
                    if(angular.isString(scope.jqUrl)){
                        var l_url = scope.jqUrl && scope.jqUrl.trim() || "";

                        if (l_url.length > 0)
                            l_url += (l_url.charAt(l_url.length-1) !== "/" ? "/" : "");

                        options.source = function (request, response) {
                            jQuery.ajax({
                                    url: l_url + request.term.trim(),
                                    dataType: "json"
                                })
                                .done(function (datas) {
                                    response(scope.jqFctDatas !== undefined ? scope.jqFctDatas(datas) : datas);
                                });
                        }
                    }
                    else
                        throw "jq-url doit être une chaine de caractères.";
                }

                if (scope.jqDelay !== undefined) {
                    if (angular.isNumber(scope.jqDelay))
                        options.delay = scope.jqDelay;
                    else
                        throw "jq-delay doit être un nombre.";
                }

                jQuery(element).autocomplete(options);

                //DATA-BINDING
                scope.$watch("jqModel", function (newVal, oldVal) {
                    //console.log("$watch:", newVal, oldVal);
                    element.val(_getLabel(newVal));
                    scope.valeur = _getLabel(newVal);
                });

                /**
                 * RETOURNE LA VALEUR DU LABEL
                 * @param {Object} obj
                 * @returns {*}
                 * @private
                 */
                var _getLabel = function (obj) {
                    if (obj === null || obj === undefined)
                        return null;

                    return obj[scope.jqItemLabel] || obj.label;
                };
            },
            scope:{
                jqModel: "=",
                jqUrl: "@",
                jqDatasLocal: "=",
                jqFctDatas: "=",
                jqFctRenderDatas: "=",
                jqItemLabel: "@",
                jqItemValue: "@",
                jqDelay: "="
            }
        };
    }]);