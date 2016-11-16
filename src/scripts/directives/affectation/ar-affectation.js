/**
 * Created by PRJS12821 on 18/08/2016.
 */
"use strict";
//@TODO: à finir
ngAriane.directive("arAffectation", [function () {
    return {
        restrict: "E",
        replace: false,
        template:
            '<select class="form-control"\
                ng-if="arCdtAff1"\
                ng-model="arModel"\
                ng-options="agent.cp as agent.nomPrenom for agent in arListAgents1"\
                ng-change="arAffecte($event)"\
                ng-disabled="arCdtDisabled1"\
                tabindex="scope.arTabindex"></select>\
            <select class="form-control"\
                ng-if="arCdtAff2"\
                ng-model="arModel"\
                ng-options="agent.cp as agent.nomPrenom for agent in arListAgents2"\
                ng-change="arAffecte($event)"\
                ng-disabled="arCdtDisabled2"\
                tabindex="arTabindex"></select>',
        link: function (scope, element, attrs) {
            if (scope.arAffecte === undefined)
                throw "ar-affecte needed!";

            if (scope.arModel === undefined)
                throw "ar-model needed!";

            if (scope.arListAgents1 === undefined)
                throw "ar-list-agents1 needed!";

            if (scope.arListAgents2 === undefined)
                throw "ar-list-agents2 needed!";

            if (scope.arCdtAff1 === undefined)
                throw "ar-cdt-aff1 needed!";

            if (scope.arCdtAff2 === undefined)
                throw "ar-cdt-aff2 needed!";

            if (scope.arCdtDisabled1 === undefined)
                throw "ar-cdt-disabled1 needed!";

            if (scope.arCdtDisabled2 === undefined)
                throw "ar-cdt-disabled2 needed!";
        },
        scope: {
            arModel: "=",
            arListAgents1: "=",
            arListAgents2: "=",
            arCdtAff1: "=",
            arCdtAff2: "=",
            arCdtDisabled1: "=",
            arCdtDisabled2: "=",
            arAffecte: "=",
            arTabindex: "@"
        }
    }
}]);