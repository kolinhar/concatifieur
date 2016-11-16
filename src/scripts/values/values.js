/**
 * Created by PRJS12821 on 18/03/2015.
 */
"use strict";

/**
 * RETOURNE LE TOKEN POUR L'API PIVOTAL TRACKER
 */
ngAriane.constant("TokenPivotal",
    /**
     * token Aurélien
     */
    "adc86f99db39b01ba39ce8f367374f0b"
    /**
     * token Rémy
     */
    //"e8f428ab2934edfc59af7951f6054f67"
);

/**
 * RETOURNE LE NUMÉRO DE RÉGION
 */
ngAriane.constant("Region", 18);

/**
 * RETOURNE L'ANNNÉE OÙ L'HISTORIQUE COMMENCE
 */
ngAriane.constant("Annee", 2014);

/**
 * RETOURNE UNE REGEXP POUR IDENTIFIER LES CP DES PRESTATAIRES ET DES STAGIAIRES
 */
ngAriane.value("RPreStag", /^(P|S)/i);

/**
 * RETOURNE LA LISTE DES PERSONNELS AYANT QUITTÉS L'ASTI
 */
ngAriane.constant("NOMSPARTIS", ["KOCHER", "RUFFIO", "WALTER", "ERB", "MOTTIN"]);

/**
 * RETOURNE LA LISTE DES PERSONNELS PRESTATAIRES
 */
ngAriane.constant("NOMSPRESTATAIRES", ["GOUNOT", "JUANES", "WEYERS", "HOFFMAN", "ERB"]);