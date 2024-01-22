/// <reference types="cypress" />
class Shuttle {
    login=(environment)=> {
        cy.visit("https://"+environment+"-shuttle.europcar.com.mx/",{failOnStatusCode: false});
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT TRP.RPA_FLGEST,TR.RES_USRCRE FROM TRCB_RESERVA_PASAJERO TRP,TRCB_RESERVA TR "+
            "WHERE TRP.RPA_CODRES=TR.RES_CODRES "+
            "AND TR.RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql1).then(query1=> {
                if(query1.rows.length>0) {
                    if(query1.rows[0][0]==="WS") {
                        let sql2="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODUSR='"+query1.rows[0][1]+"'";
                        cy.task("sqlQuery",sql2).then(query2=> {
                            cy.get("#usuario").type(query2.rows[0][0]);
                            localStorage.setItem("user",query2.rows[0][0]);
                            cy.get("#password").type(query2.rows[0][1]);
                        });
                        cy.get("#formCheckInOnline button").click();
                    }
                    else {
                        cy.wait(2000).then(()=> { throw new Error("Reserva cuenta con estatus no válido para continuar con la transportación de pasajeros") });
                    }
                }
            });
        });
    }
    validarSitio=(include)=> cy.url().should("include",include);
    sala=()=> {
        let sql="SELECT AUT_CODAUT FROM TRCF_AUTO "+
        "WHERE AUT_FLGEST='CO' "+
        "AND AUT_CODPLA=(SELECT TO2.OFI_CODPLA FROM TRCO_OFICINA TO2,TRCI_USUARIO TU "+
        "WHERE TO2.OFI_CODOFI=TU.USR_CODOFI "+
        "AND TU.USR_IDEUSR='"+localStorage.getItem("user")+"') "+
        "AND AUT_CHKSHU='S'";
        cy.task("sqlQuery",sql).then(query=> {
            let car=Math.floor(Math.random()*query.rows.length);
            cy.get("input[name='shuttle']").check(query.rows[car][0].toString());
        });
        cy.get("#Button").click();
    }
    transportarVehiculo=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            this.busquedaReserva("#index .contenedor",json.booking);
            this.busquedaReserva("#levanded_passengers .contenedor",json.booking);
        });
        cy.get("#dislodge_all").click();
        cy.get("[data-bb-handler='confirm']").click();
    }
    busquedaReserva=(div,booking)=> {
        let listBooking=cy.get(div).find("#contract").contains(booking);
        if(listBooking) {
            listBooking.parent().siblings(div==="#index .contenedor" ? ".lateral" : "#lateral").click();
        }
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new Shuttle();