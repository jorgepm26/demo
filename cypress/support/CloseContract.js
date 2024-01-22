/// <reference types="cypress" />
class CloseContract {
    login=(environment)=> {
        cy.visit("https://"+environment+"-closecontract.europcar.com.mx/",{failOnStatusCode: false});
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
                            localStorage.setItem("user",query2.rows[0][0]);
                            cy.get("#password").type(query2.rows[0][1]);
                        });
                        cy.get("input[value='Entrar']").click();
                    }
                    else {
                        cy.wait(2000).then(()=> { throw new Error("Reserva cuenta con estatus no válido para continuar con la devolución de auto") });
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
            cy.get("input[name='counter']").then(counter=> {
                for(let i=0;i<counter.length;i++) {
                    if(Cypress.$(counter).eq(i).val().split("_")[0]===query.rows[0][0].toString()) {
                        cy.wrap(counter).eq(i).click();
                        return false;
                    }
                }
            });
        });
        cy.get("#Button").click();
    }
    datosAuto=()=> {
        cy.wait(2000).then(()=> cy.get("#buscador").type(localStorage.getItem("contract")));
        cy.get("#getContrato").click();
    }
    verificacion=()=> {
        cy.get("#modalComentarios #btnAcceptComments").click();
        cy.get("#setReturnTime").click();
    }
    babyseat=()=> {
        let sql="SELECT COUNT(TRE.REE_CODEXT) FROM TRCB_RESERVA_EXTRA TRE,TRCB_RESERVA TR "+
        "WHERE TRE.REE_CODRES=TR.RES_CODRES "+
        "AND TR.RES_LOCRES='"+localStorage.getItem("contract")+"' "+
        "AND TRE.REE_CODEXT='BS'";
        cy.task("sqlQuery",sql).then(query=> {
            if(query.rows[0][0]>0) {
                //Revisar asiento de bebé
                this.validarSitio("/Devolucion/Dashboard/revisionBabySeat");
                cy.wait(2000).then(()=> cy.get("a button").contains("Continuar").click());
            }
        });
    }
    entrada=(skipOutputPhotos)=> {
        if(!skipOutputPhotos) {
            cy.get(".input-photos").find(".photo-item").then(img=> {
                img.eq(0).find(".size-photo-individual").click();
                for(let i=0;i<img.length;i++) {
                    cy.wait(2000).then(()=> {
                        cy.get(".photo-list").eq(i).find("img").click();
                        cy.get(".take-snapshot").click();
                    });
                }
            });
            cy.get("#contentCamera .bottomButton button").click();
        }
        cy.get("#btnshowBoxGas").click();
        cy.wait(2000).then(()=> {
            let sql="SELECT TA.AUT_LITGAS FROM TRCF_AUTO TA,TRCB_RESERVA TR "+
            "WHERE TA.AUT_CODAUT=TR.RES_CODAUT "+
            "AND TR.RES_LOCRES='"+localStorage.getItem("contract")+"'";
            cy.task("sqlQuery",sql).then(query=> cy.get("#SetCarFuelAndKms").select(query.rows[0][0]));
        });
        cy.get("#btnCloseContract").click();
    }
    encuesta=()=> {
        cy.get("input[name='encuesta0si']").check();
        cy.get("input[name='encuesta1si']").check();
        cy.get("a button").contains("Continuar").click();
    }
    condiciones=()=> {
        cy.get("input[name='encuesta']").eq(1).check();
        cy.get(".content_encuesta").then(container=> {
            if(container.find("input[name='encuestaPlaca']").length>0) {
                cy.get("input[name='encuestaPlaca']").check("S");
            }
        });
        cy.get("a button").contains("Continuar").click();
        cy.get("#identification").then(modal=> {
            cy.wait(4000).then(()=> {
                if(Cypress.$(modal).is(":visible")) {
                    cy.wrap(modal).find("button").click();
                }
            });
        });
    }
    cierre=()=> {
        cy.get("#btnCompleted").click();
        cy.get("#btnSetOption").click();
    }
    formaPago=(skipPayment,environment)=> {
        if(skipPayment) {
            cy.visit("https://"+environment+"-closecontract.europcar.com.mx/Devolucion/Dashboard/factura");
        }
        else {
            cy.wait(2000).then(()=> {
                cy.request("https://"+environment+"-closecontract.europcar.com.mx/Devolucion/Dashboard/GetCloseContract").its("body").then(body=> {
                    let jsonBody=JSON.parse(body);
                    let sql1="SELECT RES_FLGGAR FROM TRCB_RESERVA WHERE RES_LOCRES='"+localStorage.getItem("contract")+"'";
                    cy.task("sqlQuery",sql1).then(query1=> {
                        if(query1.rows[0][0]==="D") {
                            let sql2="SELECT TGE.GEF_IMPORT,GEF_CODDIV FROM TRCB_GARANTIA_EFECTIVO TGE,TRCB_RESERVA TR "+
                            "WHERE TGE.GEF_CODRES=TR.RES_CODRES "+
                            "AND TR.RES_LOCRES='"+localStorage.getItem("contract")+"'";
                            cy.task("sqlQuery",sql2).then(query2=> {
                                let totalWarranty=Number.parseFloat(jsonBody.CloseContract.PendingAmountUSD * (query2.rows[0][1]==="USD" ? 1 : jsonBody.CloseContract.CurrencyExchange)).toFixed(2);
                                if(query2.rows[0][0]>totalWarranty) {
                                    cy.get("#select_method_payment input[value='Devolver']").click();
                                    cy.get("#modalConfirmYesNo #btnYesConfirmYesNo").click();
                                    //Devolución de garantía en efectivo
                                    this.validarSitio("/Devolucion/Dashboard/devolucion_garantia");
                                    cy.wait(2000).then(()=> this.pagoGarantia());
                                }
                                else {
                                    cy.get("#select_method_payment #btn-cash").click();
                                    this.validarSitio("/Devolucion/Dashboard/efectivo");
                                    this.pagoEfectivo();
                                    //Formas de pago
                                    this.validarSitio("/Devolucion/Dashboard/formasPago");
                                    cy.wait(16000).then(()=> this.formaPago(skipPayment,environment));
                                }
                            });
                        }
                        else {
                            if(query1.rows[0][0]==="F") {
                                let totalPayment=Number.parseFloat(jsonBody.CloseContract.PendingAmountUSD).toFixed(2);
                                if(totalPayment>0) {
                                    cy.get("#select_method_payment #btn-cash").click();
                                    this.validarSitio("/Devolucion/Dashboard/efectivo");
                                    this.pagoEfectivo();
                                    //Formas de pago
                                    this.validarSitio("/Devolucion/Dashboard/formasPago");
                                    cy.wait(16000).then(()=> cy.get("#btnCheckPendingWarranty").click());
                                }
                                else {
                                    cy.get("#btnCheckPendingWarranty").click();
                                }
                            }
                        }
                    });
                });
            });
        }
    }
    pagoEfectivo=()=> {
        let sql="SELECT RES_CODDIV FROM TRCB_RESERVA "+
        "WHERE RES_LOCRES='"+localStorage.getItem("contract")+"'";
        cy.task("sqlQuery",sql).then(query=> {
            let currency=query.rows[0][0]==="USD" ? "usd" : "MXN";
            cy.wait(2000).then(()=> cy.get("input[name='"+currency+"']").check());//No aparece moneda CRC
            if(query.rows[0][0]==="MXN") {
                cy.get("#billMxn").invoke("val").then(value=> {
                    let bills=parseInt(value/100)*100;
                    cy.get("#billMxn").clear().type(Number.parseFloat(bills).toFixed(2));
                    cy.get("#coinMxn").clear().type(Number.parseFloat(value-bills).toFixed(2));
                });
            }
        });
        cy.get("#jq-signature-canvas-1").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
        cy.get("#jq-signature-canvas-2").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
        cy.get("#btnSetContractPayment").click();
        cy.get("#modalConfirmYesNo #btnYesConfirmYesNo").click();
    }
    pagoGarantia=()=> {
        cy.get("#jq-signature-canvas-1").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2,{force: true}));
        cy.get(".checkbox").find("#terms").check({force: true});
        cy.get("#btnCloseContract").click({force: true});
        cy.get("#FirmaClient #getContrato").click();
    }
    factura=()=> {
        cy.get("input[name='no']").check();
        cy.get("#buttonDatosConductorPrincipal").click();
    }
    firmaCliente=()=> {
        cy.get("#jq-signature-canvas-1").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
        cy.get("a button").contains("Aceptar").click();
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new CloseContract();