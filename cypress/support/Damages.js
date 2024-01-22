/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
class Damages {
    login=(environment,needBooking)=> {
        cy.visit("https://"+environment+"-damages.europcar.com.mx/",{failOnStatusCode: false});
        cy.wait(1000).then(()=> {
            if(needBooking) {
                cy.readFile(Cypress.env("dataBooking")).then(json=> {
                    let sql1="SELECT RES_USRCRE FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
                    cy.task("sqlQuery",sql1).then(query1=> {
                        if(query1.rows.length>0) {
                            let sql2="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODUSR='"+query1.rows[0][0]+"'";
                            cy.task("sqlQuery",sql2).then(query2=> {
                                cy.get("#user").type(query2.rows[0][0]);
                                localStorage.setItem("user",query2.rows[0][0]);
                                cy.get("#password").type(query2.rows[0][1]);
                            });
                        }
                    });
                });
            }
            else {
                let sql="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODOFI="+config.username.idOffice+" AND USR_CHKACT='S' AND USR_CHKVEN='S' ORDER BY USR_NOMUSR ASC";
                cy.task("sqlQuery",sql).then(query=> {
                    if(query.rows.length>0) {
                        let office=Math.floor(Math.random()*query.rows.length);
                        cy.get("#user").type(query.rows[office][0]);
                        localStorage.setItem("user",query.rows[office][0]);
                        cy.get("#password").type(query.rows[office][1]);
                    }
                });
            }
            cy.get("input[value='Entrar']").click();
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
    asignarAuto=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT TRP.RPA_FLGEST,TR.RES_CODAUT FROM TRCB_RESERVA_PASAJERO TRP,TRCB_RESERVA TR "+
            "WHERE TRP.RPA_CODRES=TR.RES_CODRES "+
            "AND TR.RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql1).then(query1=> {
                if(query1.rows.length>0) {
                    if(["TV","PR","PA"].indexOf(query1.rows[0][0])>-1) {
                        if(query1.rows[0][1]===null) {
                            cy.get("#tablelistaReservas>tbody>tr").find("td").contains(json.booking).siblings().last().find("a").click();
                            this.validarSitio("/Danos/AssignCar/AvailableCarList");
                            let sql2="SELECT TA.AUT_CODECO,TA.AUT_FECPVT,TA.AUT_NUMMAT,TOC.OFC_NUMCAJ,TA.AUT_FLGEST,OFI_CLAOFI TO2,TA.AUT_NUMKMS FROM TRCF_AUTO TA,TRCO_OFICINA_CAJON TOC,TRCO_OFICINA TO2 "+
                            "WHERE TA.AUT_CODAUT=TOC.OFC_CODAUT "+
                            "AND TA.AUT_OFISIT=TO2.OFI_CODOFI "+
                            "AND TA.AUT_FLGEST='DI' "+
                            "AND TA.AUT_CODMOD=(SELECT RES_CODMOD FROM TRCB_RESERVA "+
                            "WHERE RES_LOCRES='"+json.booking+"') "+
                            "AND TA.AUT_CODPLA=(SELECT OFI_CODPLA FROM TRCO_OFICINA "+
                            "WHERE OFI_CODOFI=(SELECT RES_SALOFI FROM TRCB_RESERVA "+
                            "WHERE RES_LOCRES='"+json.booking+"')) "+
                            "AND TOC.OFC_FLGEST='RE' "+
                            "ORDER BY TOC.OFC_CODOFI,TOC.OFC_NUMCAJ ASC";
                            cy.task("sqlQuery",sql2).then(query2=> {
                                if(query2.rows.length>0) {
                                    let car=Math.floor(Math.random()*query2.rows.length);
                                    if(car<query2.rows.length) {
                                        cy.get("#tablelistaReservas>tbody>tr").find("td").contains(query2.rows[car][0]).siblings().last().find("a").click();
                                        cy.get("#modalAutoConfirm").contains("Confirmar").click();
                                        this.validarSitio("/Danos/AssignCar/ReservationList");
                                    }
                                }
                                else {
                                    let sql3="SELECT TA.AUT_CODECO,TA.AUT_FECPVT,TA.AUT_NUMMAT,TA.AUT_FLGEST,TO2.OFI_CLAOFI,TA.AUT_NUMKMS FROM TRCF_AUTO TA,TRCO_OFICINA TO2 "+
                                    "WHERE TA.AUT_OFISIT=TO2.OFI_CODOFI "+
                                    "AND TA.AUT_FLGEST='SU' "+
                                    "AND TA.AUT_CODMOD=(SELECT RES_CODMOD FROM TRCB_RESERVA "+
                                    "WHERE RES_LOCRES='"+json.booking+"') "+
                                    "AND TA.AUT_CODPLA=(SELECT OFI_CODPLA FROM TRCO_OFICINA "+
                                    "WHERE OFI_CODOFI=(SELECT RES_SALOFI FROM TRCB_RESERVA "+
                                    "WHERE RES_LOCRES='"+json.booking+"')) "+
                                    "ORDER BY TA.AUT_CODECO ASC";
                                    cy.task("sqlQuery",sql3).then(query3=> {
                                        if(query3.rows.length>0) {
                                            let car=Math.floor(Math.random()*query3.rows.length);
                                            if(car<query3.rows.length) {
                                                cy.get("#tablelistaReservas>tbody>tr").find("td").contains(query3.rows[car][0]).siblings().last().find("a").click();
                                                let sql4="SELECT OFC_NUMCAJ FROM TRCO_OFICINA_CAJON "+
                                                "WHERE OFC_CODOFI=(SELECT RES_SALOFI FROM TRCB_RESERVA "+
                                                "WHERE RES_LOCRES='"+json.booking+"') "+
                                                "AND OFC_FLGEST='SA' "+
                                                "ORDER BY OFC_NUMCAJ ASC";
                                                cy.task("sqlQuery",sql4).then(query4=> {
                                                    let parking=Math.floor(Math.random()*query4.rows.length);
                                                    if(parking<query4.rows.length) {
                                                        cy.get("#modalAutoConfirm #parkingLot").select(query4.rows[parking][0].toString());
                                                        cy.get("#modalAutoConfirm #al").select(1);
                                                        cy.get("#modalAutoConfirm").contains("Confirmar").click();
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            throw new Error("Sin auto para asignar a la reserva");
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            throw new Error("Reserva se encuentra asignada a un auto");
                        }
                    }
                    else {
                        throw new Error("Reserva cuenta con estatus no válido para continuar con la apertura de contrato");
                    }
                }
                else {
                    throw new Error("Reserva no encontrada para continuar con la apertura de contrato");
                }
            });
        });
    }
    intercambiarAuto=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT TR.RES_LOCRES,TR.RES_CHKGAP,TA.AUT_CODMOD,TA.AUT_CODPLA FROM TRCB_RESERVA TR,TRCF_AUTO TA "+
            "WHERE TR.RES_CODAUT=TA.AUT_CODAUT "+
            "AND TR.RES_LOCRES=(SELECT RES_LOCRES FROM TRCB_RESERVA "+
            "WHERE RES_REFRES=(SELECT RES_CODRES FROM TRCB_RESERVA "+
            "WHERE RES_LOCRES='"+json.booking+"') "+
            "AND RES_FLGTIP='A')";
            cy.task("sqlQuery",sql1).then(query1=> {
                if(query1.rows.length>0) {
                    cy.get("#CarActual").type(query1.rows[0][0]);
                    cy.get(".float_boton_send").first().click();
                    if(query1.rows[0][1]==="S") {
                        cy.get("#modalFuelAlert").contains("Sí").click();
                    }
                    let sql2="SELECT AUT_CODECO,AUT_NUMMAT,AUT_NUMSER FROM TRCF_AUTO "+
                    "WHERE AUT_FLGEST='DI' "+
                    "AND AUT_CODMOD='"+query1.rows[0][2]+"' "+
                    "AND AUT_CODPLA='"+query1.rows[0][3]+"'";
                    cy.task("sqlQuery",sql2).then(query2=> {
                        if(query2.rows.length>0) {
                            let car=Math.floor(Math.random()*query2.rows.length);
                            if(car<query2.rows.length) {
                                cy.get("#CarNext").type(query2.rows[car][0]);
                                cy.get(".float_boton_send").last().click();
                                cy.get("#SendChangeCars").click();
                                cy.get("#modalFuelConfirm").then(modal=> {
                                    if(Cypress.$(modal).is(":visible")) {
                                        cy.wrap(modal).contains("Sí").click();
                                    }
                                });
                            }
                            else {
                                throw new Error("Sin auto para el intercambio de auto");
                            }
                        }
                    });
                }
                else {
                    throw new Error("Contrato no encontrado para continuar con el intercambio de auto");
                }
            })
        });
    }
    datosAuto=()=> {
        //let filter=config.viewDamages===1 ? "('DI','SU')" : config.viewDamages===2 ? "('AL','BL','DI','SP','SU','TF','TM','TL','TE')" : "('RE')";
        let filter=config.viewDamages===1 ? "('DI','SU')" : config.viewDamages===2 ? "('AL','BL','DI','SP','SU')" : "('RE')";
        let sql="SELECT AUT_CODECO,AUT_NUMMAT FROM TRCF_AUTO "+
        "WHERE AUT_CODPLA=(SELECT OFI_CODPLA FROM TRCO_OFICINA "+
        "WHERE OFI_CODOFI=(SELECT USR_CODOFI FROM TRCI_USUARIO "+
        "WHERE USR_IDEUSR='"+localStorage.getItem("user")+"')) "+
        "AND AUT_FLGEST IN "+filter;
        cy.task("sqlQuery",sql).then(query=> {
            let car=Math.floor(Math.random()*query.rows.length);
            if(car<query.rows.length) {
                cy.get("#buscador").type(query.rows[car][0]);
                localStorage.setItem("economicNumber",query.rows[car][0].toString());
                cy.get(".content_datos_auto").find("input[value='Buscar']").click();
            }
        });
    }
    entrada=(environment)=> {
        cy.get(".damage").then(()=> {
            let sql1="";
            if(config.viewDamages===1) {
                sql1="SELECT TM.MOD_NOMMOD,TA.AUT_CODECO,TA.AUT_NUMMAT,TA.AUT_NUMSER FROM TRCF_AUTO TA,TRCF_MODELO TM "+
                "WHERE TA.AUT_CODMOD=TM.MOD_CODMOD "+
                "AND TA.AUT_CODECO='"+localStorage.getItem("economicNumber")+"'";
            }
            else if(config.viewDamages===2) {
                sql1="SELECT TM.MOD_NOMMOD,TA.AUT_CODECO,TA.AUT_NUMMAT,TO2.OFI_NOMOFI,TA.AUT_FLGEST FROM TRCF_AUTO TA,TRCF_MODELO TM,TRCO_OFICINA TO2 "+
                "WHERE TA.AUT_CODMOD=TM.MOD_CODMOD "+
                "AND TA.AUT_OFISIT=TO2.OFI_CODOFI "+
                "AND TA.AUT_CODECO='"+localStorage.getItem("economicNumber")+"'";
            }
            else {
                sql1="SELECT * FROM (SELECT TM.MOD_NOMMOD,TA.AUT_CODECO,TA.AUT_NUMMAT,TR.RES_LOCRES FROM TRCB_RESERVA TR,TRCF_AUTO TA,TRCF_MODELO TM "+
                "WHERE TR.RES_CODAUT=TA.AUT_CODAUT "+
                "AND TA.AUT_CODMOD=TM.MOD_CODMOD "+
                "AND TA.AUT_CODECO='"+localStorage.getItem("economicNumber")+"' "+
                "ORDER BY TR.RES_SALFEC DESC) "+
                "WHERE ROWNUM=1";
            }
            cy.task("sqlQuery",sql1).then(query=> {
                cy.get(".damage .header-item").then(item=> {
                    expect(query.rows[0][0]).to.equal(Cypress.$(item).find("p").eq([1,3].indexOf(config.viewDamages)>-1 ? 4 : 5).html());
                    expect(query.rows[0][1]).to.equal(Cypress.$(item).find("p").eq([1,3].indexOf(config.viewDamages)>-1 ? 5 : 6).html());
                    expect(query.rows[0][2]).to.equal(Cypress.$(item).find("p").eq([1,3].indexOf(config.viewDamages)>-1 ? 6 : 7).html());
                    expect(query.rows[0][3]).to.equal(Cypress.$(item).find("p").eq([1,3].indexOf(config.viewDamages)>-1 ? 7 : 8).html());
                    if(config.viewDamages===2) {
                        localStorage.setItem("status",Cypress.$(item).find("p").eq(9).html());
                    }
                });
            });
            if([1,3].indexOf(config.viewDamages)>-1) {
                let sql2="SELECT COUNT(*) FROM TRCF_AUTO_DANO TAD,TRCF_AUTO TA "+
                "WHERE TAD.ADA_CODAUT=TA.AUT_CODAUT "+
                "AND TA.AUT_CODECO='"+localStorage.getItem("economicNumber")+"' "+
                "AND TAD.ADA_CHKVAL='N'";
                cy.task("sqlQuery",sql2).then(query1=> expect(query1.rows[0][0]).to.equal(parseInt(Cypress.$("[data-target='#modalDamages']").find(".count_damages").html())));
            }
            let sql3="SELECT AUT_LITGAS,AUT_KMSULT,AUT_NUMKMS FROM TRCF_AUTO WHERE AUT_CODECO='"+localStorage.getItem("economicNumber")+"'";
            cy.task("sqlQuery",sql3).then(query2=> {
                expect("("+query2.rows[0][0]+"/8)").to.equal(Cypress.$(".gas .s15").html());
                expect("(Ultimo Servicio: "+query2.rows[0][1]+")").to.equal(Cypress.$("#formDelivery .s15").html());
                expect(query2.rows[0][2]).to.equal(parseInt(Cypress.$("#mileage input[name='kms']").val()));
                cy.get(".fa-edit").click();
                cy.get(".mileage-and-gas select").eq(0).select(query2.rows[0][0]);
            });
            if(config.viewDamages===2) {
                cy.request("https://"+environment+"-damages.europcar.com.mx/Danos/Dashboard/GetStationList").its("body").then(body=> {
                    let jsonBody=JSON.parse(body);
                    let sql4="SELECT AUT_OFISIT FROM TRCF_AUTO WHERE AUT_CODECO='"+localStorage.getItem("economicNumber")+"'";
                    cy.task("sqlQuery",sql4).then(query3=> {
                        for(let i=0;i<jsonBody.BaseObjectList.length;i++) {
                            if(jsonBody.BaseObjectList[i].Id===query3.rows[0][0]) {
                                cy.get(".mileage-and-gas select").eq(1).select(jsonBody.BaseObjectList[i].Name);
                                return false;
                            }
                        }
                    });
                    cy.get(".mileage-and-gas select").eq(2).select(localStorage.getItem("status"));
                });
            }
        });
        cy.get(".continueDeliverySign").click();
    }
    firmaCliente=()=> {
        cy.get("#jq-signature-canvas-1").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
        cy.get(".continueDeliverySign").click();
    }
    revisionEquipamiento=()=> {
        cy.get(".btn-si").then(btn=> {
            for(let i=0;i<btn.length;i++) {
                cy.get(btn).eq(i).click();
            }
        });
        cy.get(".continueDeliverySign").click();
    }
    fotosEquipamiento=()=> {
        cy.get(".fotos_equipamiento").find(".size-photo-individual-equipamiento").then(photo=> {
            cy.wrap(photo).eq(0).click();
            cy.get(".slick-track").find(".slick-slide").then(slide=> {
                for(let i=0;i<slide.length;i++) {
                    cy.get(".take-snapshot",{timeout: 2000}).click();
                }
            });
        });
        cy.get(".options-footer button").contains("Continuar").click();
        cy.get(".continueDeliverySign").click();
    }
    verEstacionamiento=()=> {
        cy.get("#row_drawers .drawer:eq(0)",{timeout: 32000}).then(()=> {
            let sql1="SELECT AUT_CODAUT,AUT_CODECO,AUT_NUMMAT FROM TRCF_AUTO "+
            "WHERE AUT_CODPLA=(SELECT OFI_CODPLA FROM TRCO_OFICINA "+
            "WHERE OFI_CODOFI=(SELECT USR_CODOFI FROM TRCI_USUARIO "+
            "WHERE USR_IDEUSR='"+localStorage.getItem("user")+"')) "+
            "AND AUT_FLGEST IN ('DI','SU')";
            cy.task("sqlQuery",sql1).then(query1=> {
                let car=Math.floor(Math.random()*query1.rows.length);
                if(car<query1.rows.length) {
                    let sql2="SELECT * FROM TRCO_OFICINA_CAJON WHERE OFC_CODAUT='"+query1.rows[car][0]+"'";
                    cy.task("sqlQuery",sql2).then(query2=> {
                        if(query2.rows.length===0) {
                            cy.get("#row_drawers .drawer .colorGreenLight h2").then(parking=> {
                                let box=Math.floor(Math.random()*parking.length);
                                if(box<parking.length) {
                                    cy.wrap(parking).eq(box).click();
                                    cy.get("#carnum").type(query1.rows[car][1]);
                                    cy.get("#modalAssignCar .modal-footer button:eq(1)").click();
                                }
                            });
                        }
                        else {
                            throw new Error("Auto asignado al estacionamiento");
                        }
                    });
                }
            });
        });
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new Damages();