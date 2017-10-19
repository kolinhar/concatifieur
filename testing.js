/**
 * Created by PRJS12821 on 18/10/2017.
 */
"use strict";
const assert = require('assert');
const fctPerso = require('./fctPerso.js');

describe('fctPerso', function() {
    describe('isMovable: retourne true si l\'url est un chemin local relatif ou absolu sinon false', function() {
        it("true", function() {
            assert.equal(true, fctPerso.isMovable("./styles/style.css"));
        });

        it("false", function () {
            assert.equal(false, fctPerso.isMovable("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"));
        });

        it("false", function () {
            assert.equal(false, fctPerso.isMovable("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"));
        });

        it("false", function () {
            assert.equal(false, fctPerso.isMovable("ftp:/maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"));
        });

        it("false", function () {
            assert.equal(false, fctPerso.isMovable("ftps://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"));
        });

        it("true", function () {
            assert.equal(true, fctPerso.isMovable("../node_modules/angular/angular.js"));
        });

        it("true", function () {
            assert.equal(true, fctPerso.isMovable("styles/leaflet.css"));
        });

        it("false", function () {
            assert.equal(false, fctPerso.isMovable(""));
        });

        it("false", function () {
            assert.equal(false, fctPerso.isMovable(null));
        });
    });

    describe("extractScriptPath: retourne le chemin d'une balise script", function () {
        it("'<script>alert('test');</script>'", function () {
            assert.equal("", fctPerso.extractScriptPath("<script>alert('test');</script>"))
        });

        it("<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">", function () {
            assert.equal("", fctPerso.extractScriptPath("<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">"))
        });

        it("'<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>'", function () {
            assert.equal("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js", fctPerso.extractScriptPath("<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>"))
        });

        it("'<script src='../node_modules/angular/angular.js'></script>'", function () {
            assert.equal("../node_modules/angular/angular.js", fctPerso.extractScriptPath("<script src='../node_modules/angular/angular.js'></script>"))
        });

        it("'<link rel=\"stylesheet\" href=\"styles/leaflet.css\" />'", function () {
            assert.equal("", fctPerso.extractScriptPath("<link rel=\"stylesheet\" href=\"styles/leaflet.css\" />"))
        });
    });

    describe("extractStylePath: retourne le chemin d'une balise link pour le style", function () {
        it("'<script>alert('test');</script>'", function () {
            assert.equal("", fctPerso.extractStylePath("<script>alert('test');</script>"))
        });

        it("<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">", function () {
            assert.equal("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css", fctPerso.extractStylePath("<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">"))
        });

        it("'<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>'", function () {
            assert.equal("", fctPerso.extractStylePath("<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>"))
        });

        it("'<script src='../node_modules/angular/angular.js'></script>'", function () {
            assert.equal("", fctPerso.extractStylePath("<script src='../node_modules/angular/angular.js'></script>"))
        });

        it("'<link rel=\"stylesheet\" href=\"styles/leaflet.css\" />'", function () {
            assert.equal("styles/leaflet.css", fctPerso.extractStylePath("<link rel=\"stylesheet\" href=\"styles/leaflet.css\" />"))
        });

        it("'<style>.rainbow{background-color: yellow;}</style>'", function () {
            assert.equal("", fctPerso.extractStylePath("<style>.rainbow{background-color: yellow;}</style>"))
        });
    });

    describe("getOtherProps: retourne la liste les propriétés autres que rel, src et href d'une balise", function () {
        it("'<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>'", function () {
            assert.equal(JSON.stringify({
                integrity: "sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa",
                crossorigin: "anonymous"
            }), JSON.stringify(fctPerso.getOtherProps("<script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>")))
        });

        it("'<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css\" integrity=\"sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp\" crossorigin=\"anonymous\">'", function () {
            assert(JSON.stringify({
                integrity: "sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp",
                crossorigin: "anonymous"
            }),
            JSON.stringify(fctPerso.getOtherProps(`<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
          crossorigin="anonymous"/>`)))
        });

        it("'<script src='../node_modules/angular/angular.js'></script>'", function () {
            assert.equal(JSON.stringify({}),
            JSON.stringify(fctPerso.getOtherProps("<script src='../node_modules/angular/angular.js'></script>")))
        });

        it("'<style>.rainbow{background-color: yellow;}</style>'", function () {
            assert.equal(JSON.stringify({id:"blabla inutile"}),
            JSON.stringify(fctPerso.getOtherProps("<style id='blabla inutile'>.rainbow{background-color: yellow;}</style>")))
        });

        it("'<style data-autre='blabla inutile'>.rainbow{background-color: yellow;}</style>'", function () {
            assert.equal(JSON.stringify({"data-autre":"blabla inutile"}),
            JSON.stringify(fctPerso.getOtherProps("<style data-autre='blabla inutile'>.rainbow{background-color: yellow;}</style>")))
        });
    })
});
