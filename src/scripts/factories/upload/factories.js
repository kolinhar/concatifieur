/**
 * Created by PRJS12821 on 09/09/2015.
 */
"use strict";

ngAriane.factory("UploadFatcory", ["$http", "DIURLAPI", function ($http, DIURLAPI) {
    return {
        UploadFileInfos: function (obj) {
            return $http({
                url: DIURLAPI.URLapiUpload + "upload/register",
                method: "POST",
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    format: "json"
                },
                data: obj,
                responseType: "JSON"
            });
        },
        UploadFileDatas: function (guid, file) {
            return $http({
                url: DIURLAPI.URLapiUpload + "upload/file/" + guid,
                method: "POST",
                headers:{
                    'Content-Type': 'multipart/form-data; charset=UTF-8'
                },
                params: {
                    format: "json"
                },
                data: file,
                responseType: "JSON"
            })
        },
        GetFileList: function (obj) {
            return $http({
                url: DIURLAPI.URLapiUpload + "list/" + obj.annee + "/" + obj.numFiche,
                method: "GET",
                params: {
                    format: "json"
                },
                responseType: "JSON"
            });
        }
    };
}]);