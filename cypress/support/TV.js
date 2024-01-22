/// <reference types="cypress" />
class TV {
    login=(environment)=> {
        cy.visit("https://"+environment+"-tv.europcar.com.mx/",{failOnStatusCode: false});
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT TRP.RPA_FLGEST,TR.RES_USRCRE FROM TRCB_RESERVA_PASAJERO TRP,TRCB_RESERVA TR "+
            "WHERE TRP.RPA_CODRES=TR.RES_CODRES "+
            "AND TR.RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql1).then(query1=> {
                if(query1.rows.length>0) {
                    if(["TV","PR"].indexOf(query1.rows[0][0])>-1) {
                        let sql2="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODUSR='"+query1.rows[0][1]+"'";
                        cy.task("sqlQuery",sql2).then(query2=> {
                            cy.get("#usuario").type(query2.rows[0][0]);
                            localStorage.setItem("user",query2.rows[0][0]);
                            cy.get("#password").type(query2.rows[0][1]);
                        });
                        cy.get("#formCheckInOnline button").click();
                    }
                    else {
                        cy.wait(2000).then(()=> { throw new Error("Reserva cuenta con estatus no válido para continuar con la apertura de contrato") });
                    }
                }
            });
        });
    }
    validarSitio=(include)=> cy.url().should("include",include);
    sala=()=> {
        let sql="SELECT TO2.OFI_CODOFI FROM TRCO_OFICINA TO2,TRCI_USUARIO TU "+
        "WHERE TO2.OFI_CODOFI=TU.USR_CODOFI "+
        "AND TU.USR_IDEUSR='"+localStorage.getItem("user")+"'";
        cy.task("sqlQuery",sql).then(query=> {
            cy.get("input[name='office']").check(query.rows[0][0].toString());
            localStorage.setItem("office",query.rows[0][0]);
        });
        cy.get("#Button").click();
    }
    iniciarTurnos=()=> {
        cy.get("#botonA").click();
        cy.get("form").then(form=> {
            cy.readFile(Cypress.env("dataBooking")).then(json=> {
                let sql="SELECT TRP.RPA_NOMRPA,TRP.RPA_APERPA,TRP.RPA_FLGEST,TRP.RPA_CODOFI FROM TRCB_RESERVA_PASAJERO TRP,TRCB_RESERVA TR "+
                "WHERE TRP.RPA_CODRES=TR.RES_CODRES "+
                "AND TR.RES_LOCRES='"+json.booking+"'";
                cy.task("sqlQuery",sql).then(query=> {
                    let coincidence=false;
                    if(query.rows[0][2]==="TV") {
                        let listName=form.find(".row>.col-lg-7");
                        if(listName.length>0) {
                            for(let i=0;i<listName.length;i++) {
                                if(Cypress.$(listName).eq(i).find("p").html().includes((query.rows[0][0]+" "+query.rows[0][1]).toUpperCase()) && (parseInt(localStorage.getItem("office"))===query.rows[0][3])) {
                                    cy.log("El cliente "+(query.rows[0][0]+" "+query.rows[0][1]).toUpperCase()+" está en lista de espera");
                                    coincidence=true;
                                    return false;
                                }
                            }
                        }
                        if(!coincidence) {
                            throw new Error("El cliente "+(query.rows[0][0]+" "+query.rows[0][1]).toUpperCase()+" no está en lista de espera");
                        }
                    }
                    else {
                        let listBooking=form.find(".list-module .module .SelfText2");
                        if(listBooking.length>0) {
                            for(let i=0;i<listBooking.length;i++) {
                                if(Cypress.$(listBooking).eq(i).html().includes(json.booking) && (parseInt(localStorage.getItem("office"))===query.rows[0][3])) {
                                    cy.log("La reserva "+json.booking+ " se ubica en el módulo "+Cypress.$(listBooking).eq(i).parents(".module").children().first().find("p").last().html());
                                    coincidence=true;
                                    return false;
                                }
                            }
                        }
                        if(!coincidence) {
                            throw new Error("La reserva "+json.booking+" no se ubica en algún módulo");
                        }
                    }
                });
            });
        });
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new TV();