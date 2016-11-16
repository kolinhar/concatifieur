/**
 * Created by PVWS02941 on 25/04/2016.
 */
/**
 * Created by PRJS12821 on 21/08/2015.
 */
"use strict";

ngAriane.factory("FichesFactory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        GetAll: function () {
            return $http({
                url: DIURLAPI.URLapiNancy + "fiches",
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: "json",
                data: {}
            });
        }
    }
}]);

