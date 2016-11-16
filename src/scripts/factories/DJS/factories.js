"use strict";

ngAriane.factory("CheckModalDjs", ["DAL_DJS", "JoursName", "$cookieStore", function (DAL_DJS, JoursName, $cookieStore) {
    var That = this;

    That.CheckGetModal = function (tabReq) {
        var dataDjs;

        if(tabReq[0].cp === $cookieStore.get("agent"))
        {
            DAL_DJS.LireDJS({
                    cp: tabReq[0].cp,
                    annee: tabReq[0].date.getFullYear(),
                    semaine: tabReq[0].date.getWeekNumber()
                })
                .success(function (datas) {
                    if (datas.exit_code === 1) {
                        tabReq.forEach(function(val){
                            That.lesJoursPointer.push(val.date);
                        });
                        datas.djs.cpActeur = $cookieStore.get("agent");
                        delete datas.djs.verrouiller;
                        delete datas.djs.cloturer;
                        delete datas.djs.valider;

                        That.show(datas.djs);

                    }
                    else {
                        console.log("N'a pas pu checker la djs");
                    }
                });
        }




    };
    That.lesJoursPointer = [];
    That.lesJoursAVerrouiller = [];

    That.djs = {};

    That.show = function(laDjs){
        That.djs = laDjs;

        That.lesJoursPointer.forEach(function (laDate) {
            if(That.djs.lesJours[JoursName.joursName[laDate.getDay()]].minutesRestantes <= 0)
            {
                That.lesJoursAVerrouiller.push(laDate);
            }
        });

        That.lesJoursPointer = [];

        if(That.lesJoursAVerrouiller.length > 1)
            $("#modal-multiple-verrouillage-djs").modal({backdrop: 'static', keyboard: false});
        else if (That.lesJoursAVerrouiller.length === 1)
            $("#modal-verrouillage-djs").modal({backdrop: 'static', keyboard: false});

    };

    return That;
}]);

ngAriane.factory("FctValidationDpx", ["DatasAgents","SignalrRequest", function (DatasAgents, SignalrRequest) {
    var That = this;

    That.NotifierDpx = function (cpAgent, dateJour ) {

        var tabDpx = [];
        var dicoAgent = {};
        DatasAgents.liste.forEach(function (val) {
            dicoAgent[val.cp] = val;
        });

        for(var agt in dicoAgent)
        {
            if(dicoAgent[agt].habilitation === "Encadrement" && dicoAgent[agt].secteur === dicoAgent[cpAgent].secteur)
                tabDpx.push(dicoAgent[agt].cp);
        }

        if(dicoAgent[cpAgent].habilitation !== "Encadrement")
            SignalrRequest.NotifDpxJournéeVerrouiller(tabDpx, dicoAgent[cpAgent].nomPrenom,cpAgent, dateJour);
    };

    return That;
}]);