/// <reference types="cypress" />
class CarDelivery {
    login=(environment)=> {
        cy.visit("https://"+environment+"-cardelivery.europcar.com.mx/",{failOnStatusCode: false});
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT TA.AUT_FLGEST,TR.RES_LOCRES,TR.RES_USRCRE FROM TRCB_RESERVA TR,TRCF_AUTO TA "+
            "WHERE TR.RES_CODAUT=TA.AUT_CODAUT "+
            "AND TR.RES_LOCRES=(SELECT RES_LOCRES FROM TRCB_RESERVA "+
            "WHERE RES_REFRES=(SELECT RES_CODRES FROM TRCB_RESERVA "+
            "WHERE RES_LOCRES='"+json.booking+"') "+
            "AND RES_FLGTIP='A')";
            cy.task("sqlQuery",sql1).then(query1=> {
                if(query1.rows.length>0) {
                    if(query1.rows[0][0]==="RE") {
                        localStorage.setItem("contract",query1.rows[0][1]);
                        let sql2="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODUSR='"+query1.rows[0][2]+"'";
                        cy.task("sqlQuery",sql2).then(query2=> {
                            cy.get("#usuario").type(query2.rows[0][0]);
                            cy.get("#password").type(query2.rows[0][1]);
                        });
                        cy.get("input[value='Entrar']").click();
                    }
                    else {
                        cy.wait(2000).then(()=> { throw new Error("Reserva cuenta con estatus no válido para continuar con la entrega de auto") });
                    }
                }
            });
        });
    }
    validarSitio=(include)=> cy.url().should("include",include);
    datosAuto=()=> {
        cy.wait(2000).then(()=> cy.get("#buscador").type(localStorage.getItem("contract")));
        cy.get("input[value='Buscar']").first().click();
    }
    entrada=()=> {
        cy.get("#modalComentarios").contains("Enterado").click();
        cy.get(".input-photos").find(".photo-item").then(img=> {
            img.eq(0).find(".size-photo-individual").click();
            for(let i=0;i<img.length;i++) {
                cy.wait(2000).then(()=> {
                    cy.get(".photo-list").eq(i).find("img").click();
                    cy.get(".take-snapshot").click();
                });
            }
        });
        cy.get("#btnContinuar").click();
        cy.get(".fa-edit").click();
        cy.wait(2000).then(()=> {
            let sql="SELECT TA.AUT_LITGAS FROM TRCF_AUTO TA,TRCB_RESERVA TR "+
            "WHERE TA.AUT_CODAUT=TR.RES_CODAUT "+
            "AND TR.RES_LOCRES='"+localStorage.getItem("contract")+"'";
            cy.task("sqlQuery",sql).then(query=> cy.get(".mileage-and-gas select").eq(0).select(query.rows[0][0]));
        });
        cy.get(".continueDeliverySign").click();
    }
    revisionEquipamiento=()=> {
        cy.get(".btn-si").then(btn=> {
            for(let i=0;i<btn.length;i++) {
                cy.get(btn).eq(i).click();
            }
        });
        cy.get(".continueDeliverySign").click();
        cy.get("#jq-signature-canvas-1").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
        cy.get("#modalFirmaClient").contains("Aceptar").click();
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new CarDelivery();