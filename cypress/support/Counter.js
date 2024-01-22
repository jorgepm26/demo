/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
class Counter {
    login=(environment,needBooking)=> {
        cy.visit("https://"+environment+"-counter.europcar.com.mx/",{failOnStatusCode: false});
        if(needBooking) {
            cy.readFile(Cypress.env("dataBooking")).then(json=> {
                let sql1="SELECT RES_USRCRE FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
                cy.task("sqlQuery",sql1).then(query1=> {
                    if(query1.rows.length>0) {
                        let sql2="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODUSR='"+query1.rows[0][0]+"'";
                        cy.task("sqlQuery",sql2).then(query2=> {
                            cy.get("#usuario").type(query2.rows[0][0]);
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
                    cy.get("#usuario").type(query.rows[office][0]);
                    localStorage.setItem("user",query.rows[office][0]);
                    cy.get("#password").type(query.rows[office][1]);
                }
            });
        }
        cy.get("#formCheckInOnline button").click();
    }
    validarSitio=(include)=> cy.url().should("include",include);
    sala=()=> {
        let sql="SELECT TOC.OCO_CODOFI,TOC.OCO_CODOCO FROM TRCO_OFICINA_COUNTER TOC,TRCI_USUARIO TU "+
        "WHERE TOC.OCO_CODOFI=TU.USR_CODOFI "+
        "AND TU.USR_IDEUSR='"+localStorage.getItem("user")+"'";
        cy.task("sqlQuery",sql).then(query=> {
            cy.get("input[name='terminal']").check(query.rows[0][0]===4 && config.counter.shuttle.request ? "1" : query.rows[0][1].toString());
            localStorage.setItem("position",query.rows[0][0]===4 && config.counter.shuttle.request ? 1 : 0);
            cy.get("input[name='terminal']:checked").invoke("attr","data-name").then(checked=> localStorage.setItem("officeSelected",checked));
        });
        cy.get("#boton").click();
    }
    buscar=(searchBooking)=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> cy.get("#nombre").type(searchBooking ? json.booking : "Test"));
        cy.get("#btnSearch").click();
    }
    opcionListaReserva=(searchBooking)=> {
        this.validarSitio("/Salas/Dashboard/CustomerArrivalConfirmation");
        if(searchBooking) {
            this.tablaConfirmacion("#bookingListTable>tr");
        }
        else {
            this.tablaBusqueda("#bookingListTable>tr");
        }
    }
    tablaConfirmacion=(table)=> {
        cy.get(table+">td:eq(1)",{timeout: 4000}).then(()=> {
            cy.get(table).then(tr=> {
                let columns=tr.find("td").length;
                let column=Math.floor(Math.random()*columns);
                if(column<columns) {
                    if(column===columns-2) {
                        cy.wrap(tr).find("td").eq(column).find(".icon-cancelar").click();
                    }
                }
            });
        });
    }
    tablaBusqueda=(table)=> {
        cy.get(table+">td:eq(1)",{timeout: 64000}).then(()=> {
            cy.get(table).then(tr=> {
                let row=Math.floor(Math.random()*tr.length);
                if(row<tr.length) {
                    let columns=tr.eq(row).find("td").length;
                    let column=Math.floor(Math.random()*columns);
                    if(column<columns) {
                        if(column<columns-2) {
                            cy.wrap(tr).eq(row).find("td").eq(column).click();
                            this.validarSitio("/Salas/Dashboard/CustomerArrivalConfirmation");
                            this.tablaConfirmacion(table);
                        }
                        if(column===columns-1) {
                            cy.wrap(tr).eq(row).find("td").eq(column).find(".icon-cancelar").click();
                        }
                    }
                }
            });
        });
    }
    busquedaAvanzada=(advancedSearch)=> {
        cy.get("#bookingListTable>tr>td:eq(1)",{timeout: 4000}).then(()=> {
            if(advancedSearch>=1 && advancedSearch<=5) {
                switch(advancedSearch) {
                    case 1:
                        cy.readFile(Cypress.env("dataBooking")).then(json=> cy.get("#reservacionNombre").type(json.booking));
                        break;
                    case 2:
                        let sql="SELECT RES_NUMBON FROM TRCB_RESERVA "+
                        "WHERE TRUNC(RES_SALFEC)=TRUNC(SYSDATE) "+
                        "AND RES_FLGEST='A' "+
                        "AND RES_SALOFI IN (SELECT OFI_CODOFI FROM TRCO_OFICINA "+
                        "WHERE OFI_CODPLA=(SELECT TO2.OFI_CODPLA FROM TRCO_OFICINA TO2,TRCI_USUARIO TU "+
                        "WHERE TO2.OFI_CODOFI=TU.USR_CODOFI "+
                        "AND TU.USR_IDEUSR='"+localStorage.getItem("user")+"')) "+
                        "AND RES_NUMBON IS NOT NULL";
                        "ORDER BY RES_SALFEC DESC";
                        cy.task("sqlQuery",sql).then(query=> {
                            let booking=Math.floor(Math.random()*query.rows.length);
                            if(booking<query.rows.length) {
                                cy.get("#localizadorExterno").type(query.rows[booking][0]);
                            }
                        });
                        break;
                    case 3:
                        cy.get("#CityId").then(option=> cy.wrap(option).select(Math.floor(Math.random()*option.find("option").length)));
                        break;
                    case 4:
                        cy.get("#fechaPickup").invoke("val",this.obtieneFecha(new Date(Date.now()+(1000*60*60*24*config.counter.search.options.maxDaysRangePickup)),"-")).trigger("change");
                        break;
                    case 5:
                        cy.get("#RentalDays").then(option=> cy.wrap(option).select(Math.floor(Math.random()*option.find("option").length)));
                        break;
                }
                cy.get("img[alt='Buscar']").click();
            }
            else if(advancedSearch>=6 && advancedSearch<=8) {
                let value=advancedSearch===6 ? "Todas" : advancedSearch===7 ? "Directas" : "Externos";
                cy.get("input[value='"+value+"']").click();
            }
            else {
                throw new Error("Opción no disponible");
            }
        });
        this.tablaBusquedaAvanzada("#bookingListTable>tr");
    } 
    tablaBusquedaAvanzada=(table)=> {
        cy.get(table,{timeout: 4000}).then(tr=> {
            let row=Math.floor(Math.random()*tr.length);
            if(row<tr.length) {
                let columns=tr.eq(row).find("td").length;
                let column=Math.floor(Math.random()*columns);
                if(column<columns) {
                    if(column<=5) {
                        cy.wrap(tr).eq(row).find("td").eq(column).click();
                        this.validarSitio("/Salas/Dashboard/CustomerArrivalConfirmation");
                        this.tablaConfirmacion(table);
                    }
                    if(column===columns-1) {
                        cy.wrap(tr).eq(row).find("td").eq(column).find(".icon-cancelar").click();
                    }
                }
            }
        });
    }
    opcionRenta=(local)=> {
        this.validarSitio("/Salas/Dashboard/"+local);
        if(local==="SetRentalDays") {
            let maxDaysWalking=config.counter.booking.maxDaysWalking;
            if(maxDaysWalking>0 && maxDaysWalking<=60) {
                let days=Math.floor(Math.random()*maxDaysWalking);
                cy.get("#selectedDays").select(days);
                localStorage.setItem("days",days+1);
                cy.get("#botonA").click();
            }
            else {
                cy.wait(2000).then(()=> { throw new Error("Días limite no válido para continuar con la renta de auto") });
            }
        }
        else {
            if(config.counter.booking.minHoursLOC>=3) {
                let date=new Date(Date.now()+(1000*60*60*config.counter.booking.minHoursLOC));
                let moduleDate=date.getMinutes()%15;
                let newDate=new Date(date.getTime()+(1000*60*(moduleDate<=7 ? -moduleDate : 15-moduleDate)));
                let newTimeSplit=newDate.toLocaleTimeString('en-US').split(/[ :]+/);
                let newTime=(newTimeSplit[0]<10 ? "0" : "")+newTimeSplit[0]+":"+newTimeSplit[1]+" "+newTimeSplit[3];
                let fechaEntrega=this.obtieneFecha(newDate,"/");
                cy.get("#fecha_entrega").invoke("val",fechaEntrega).trigger("change");
                localStorage.setItem("deadline",fechaEntrega);
                cy.get("#checkoutTime").select(newTime);
                let dateCheckin=new Date(newDate.getTime()+(1000*60*60*24));
                let fechaDevolucion=this.obtieneFecha(dateCheckin,"/");
                cy.get("#fecha_devolucion").invoke("val",fechaDevolucion).trigger("change");
                localStorage.setItem("returnDate",fechaDevolucion);
                cy.get("#checkinTime").select(newTime);
                localStorage.setItem("days",1);
                cy.get("#botonA").click();
            }
            else {
                cy.wait(2000).then(()=> { throw new Error("Horas minimas no válido para continuar con la renta de auto") });
            }
        }
    }
    seleccionarAuto=()=> {
        cy.get("#formulario").then(()=> {
            let daysSelected=localStorage.getItem("days");
            if(daysSelected===Cypress.$("#oficina_de_devolucion").find("option:selected").text().trim()) {
                if(!localStorage.getItem("deadline") && !localStorage.getItem("returnDate")) {
                    let deadline=new Date(Date.now());
                    localStorage.setItem("deadline",this.obtieneFecha(deadline,"/"));
                    localStorage.setItem("returnDate",this.obtieneFecha(new Date(deadline.getTime()+(1000*60*60*24*daysSelected)),"/"));
                }
                if(localStorage.getItem("deadline")===Cypress.$("#checkoutDay").html() && localStorage.getItem("returnDate")===Cypress.$("#checkinDay").html()) {
                    cy.get("#ModelList>div").then(list=> {
                        let car=Math.floor(Math.random()*list.length);
                        if(car<list.length) {
                            localStorage.setItem("carModel",Cypress.$(list).eq(car).find(".car-selection-card .ap_radiobtn").attr("data-modelid"));
                            cy.wrap(list).eq(car).find(".car-selection-card").click();
                        }
                    });
                }
                else {
                    cy.wait(2000).then(()=> { throw new Error("Día de salida/devolución no coinciden para continuar con la renta de auto") });
                }
            }
        });
        cy.get("#botonA").click();
    }
    obtieneFecha=(date,separator)=> new Array(date.getDate(),date.getMonth()+1,date.getFullYear()).map(aD=> (aD<10 ? "0" : "")+aD).join(separator);
    reservacionWalking=()=> {
        cy.get("#formDatos").then(()=> {
            let sql1="SELECT TO2.OFI_CODEMP,TO2.OFI_CHKAER FROM TRCO_OFICINA TO2,TRCI_USUARIO TU "+
            "WHERE TO2.OFI_CODOFI=TU.USR_CODOFI "+
            "AND TU.USR_IDEUSR='"+localStorage.getItem("user")+"'";
            cy.task("sqlQuery",sql1).then(query1=> {
                let currency=query1.rows[0][0]===1 ? "MXN" : query1.rows[0][0]===19 ? "CRC" : "USD";
                cy.get("input[name='Currency']").check(currency,{force: true});
                if(localStorage.getItem("deadline")===Cypress.$("#fecha_entrega").val() && localStorage.getItem("returnDate")===Cypress.$("#fecha_devolucion").val()) {
                    if(localStorage.getItem("days")===Cypress.$("#oficina_de_devolucion").find("option:selected").text().trim()) {
                        if(localStorage.getItem("officeSelected")===Cypress.$("#terminalName").val()) {
                            let sql2="SELECT MOD_NOMMOD,MOD_VERMOD FROM TRCF_MODELO WHERE MOD_CODMOD='"+localStorage.getItem("carModel")+"'";
                            cy.task("sqlQuery",sql2).then(query2=> {
                                if(query2.rows[0][0]+" "+query2.rows[0][1]===Cypress.$("#car_type").val()) {
                                    let insuranceList=["PLI"];
                                    if(config.counter.booking.insuranceCDW) {
                                        insuranceList.push(currency==="MXN" && query1.rows[0][1]==="S" ? "WCDW" : "CDW","THW");
                                    }
                                    cy.get("input[name='InsuranceList[]']").check(insuranceList);
                                    let sql3="SELECT CAD_UNIDES FROM TRCA_DIVISA_CAMBIO "+
                                    "WHERE TRUNC(CAD_FECCRE)=TRUNC(SYSDATE) "+
                                    "AND CAD_DIVDES='"+currency+"'";
                                    cy.task("sqlQuery",sql3).then(query3=> {
                                        let subtotal=query3.rows.length>0 ? (currency==="USD" ? 1 : query3.rows[0][0]) : Cypress.$("#ExchangeRateAmount").val();
                                        let total=Math.floor(Number.parseFloat(subtotal)*config.counter.booking.tariffPerDay);
                                        cy.get("#tariffPerDay").type(total);
                                        cy.get("#TariffPerWeek").invoke("val").then(TariffPerWeek=> {
                                            if(localStorage.getItem("days")*total===parseInt(TariffPerWeek)) {
                                                cy.get("#clientName").type("Test");
                                                cy.get("#clientLastName").type("Test");
                                                cy.get("#signature").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
                                                if(config.counter.booking.extras.babySeat || config.counter.booking.extras.prepaidGas) {
                                                    cy.get("#btnAditionals").click();
                                                    if(config.counter.booking.extras.babySeat) {
                                                        cy.get("#q_extra_BS").select(1);
                                                    }
                                                    if(config.counter.booking.extras.prepaidGas) {
                                                        cy.get("#q_extra_PPF").select(1);
                                                    }
                                                    cy.get("#btnFormAditionalOk").click();
                                                }
                                            }
                                        });
                                    });
                                }
                                else {
                                    cy.wait(2000).then(()=> { throw new Error("Modelo de auto no coincide para continuar con la renta de auto") });
                                }
                            });
                        }
                    }
                }
            });
        });
        //cy.get("#botonA").click();
    }
    seleccionarExtras=(uselocal)=> {
        if(!uselocal) {
            //Extras
            this.validarSitio("/Salas/Dashboard/extras");
            cy.get("a").contains("No gracias").click();
            let position=parseInt(localStorage.getItem("position"));
            cy.get("input[name='requestShuttle']").eq(position).check();
            if(position===1 && config.counter.shuttle.options.addPax) {
                cy.get("#addPax").click();
            }
            cy.get("#modalRequestShuttle").contains("Confirmar").click();
        }
    }
    guardarReservacion=()=> {
        cy.get("#numberWalking").then(p=> cy.writeFile(Cypress.env("dataBooking"),{booking: p.text()}));
        cy.get("#btnAccept").click();
    }
    verVoucher=()=> {
        cy.get("nav #perfil").then(profile=> {
            cy.wrap(profile).click();
            cy.wrap(profile).find("a[href='/Salas/Dashboard/SearchVoucher']").click();
        });
    }
    localizarWalking=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> cy.get("#number-walking").type(json.booking));
        cy.get("button").contains("Buscar").click();
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new Counter();