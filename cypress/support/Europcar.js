/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
class Europcar {
    iniciar=(loyalty,environment="")=> {
        if(loyalty===false) {
            cy.visit("https://"+environment+"-www.europcar.com.mx/",{failOnStatusCode: false});
        }
        /*cy.get("#modalSelectCookies",{timeout: 4000}).then(cookies=> cy.wrap(cookies).find("#didomi-notice-agree-button").click());
        cy.get("#modalAntiFraud",{timeout: 4000}).then(fraud=> cy.wrap(fraud).find("#anti-fraud-btn-close").click());*/
        cy.get("#idcheckoutLocationName").type("CANCÚN AEROPUERTO");
        cy.get("#ui-id-1",{timeout: 4000}).find(".ap_Fairport").eq(0).click();
        cy.get("input[value='Buscar']").click();
    }
    menuCIO=(environment)=> {
        cy.visit("https://"+environment+"-www.europcar.com.mx/",{failOnStatusCode: false});
        cy.get("[data-target='flota_turismo']").eq(1).click();
        cy.get(".contenidoMenu a[href='https://"+environment+"-movil.europcar.com.mx/Europcar/Login']").click();
    }
    validarSitio=(include)=> cy.url().should("include",include);
    seleccionarAuto=()=> {
        cy.get(".listaAutosBusqueda>.autoLista").then(list=> {
            cy.wrap(list).find(".available").then(available=> {
                let car=Math.floor(Math.random()*available.length);
                if(car<list.length) {
                    cy.wrap(available).eq(car).find(".detallesLista .price").click();
                }
            });
        });
    }
    completarInformacionConductor=(privilege)=> {
        if(!privilege) {
            cy.get("#modalContentClientPrivilege").then(modal=> cy.wrap(modal).find("a[href='#']").click({force: true}));
        }
        cy.get("#reservationForm_firstName").invoke("val").then(firstName=> {
            if(firstName.length===0) {
                cy.get("#reservationForm_firstName").type("Test");
            }
        });
        if(!privilege) {
            cy.get("#reservationForm_lastName").type("Test");
        }
        cy.get("#reservationForm_email").invoke("val").then(email=> {
            if(email.length===0) {
                cy.get("#reservationForm_email").type("jorge.pat@isconsulting-it.com");
            }
        });
        cy.get("#reservationForm_phoneNumber").invoke("val").then(phoneNumber=> {
            if(phoneNumber.length===0) {
                cy.get("#reservationForm_phoneNumber").type("9984816145");
            }
        });
        cy.get("#reservationForm_address").invoke("val").then(address=> {
            if(address.length===0) {
                cy.get("#reservationForm_address").type("Supermanzana 91");
            }
        });
        cy.get("#reservationForm_city").invoke("val").then(city=> {
            if(city.length===0) {
                cy.get("#reservationForm_city").type("Cancún");
            }
        });
        cy.get("#reservationForm_state").invoke("val").then(state=> {
            if(state.length===0) {
                cy.get("#reservationForm_state").type("QuintanaRoo");
            }
        });
        cy.get("#reservationForm_postCode").invoke("val").then(postCode=> {
            if(postCode.length===0) {
                cy.get("#reservationForm_postCode").type("77516");
            }
        });
        cy.get("#dia").find("option:selected").then(days=> {
            if(days.text()==="Día") {
                cy.get("#dia").select(27);
            }
        });
        cy.get("#mes").find("option:selected").then(months=> {
            if(months.text()==="Mes") {
                cy.get("#mes").select(6);
            }
        });
        cy.get("#anio").find("option:selected").then(years=> {
            if(years.text()==="Año") {
                cy.get("#anio").select("1992");
            }
        });
        cy.get("#reservationForm .fixPrecioMovilDatos").click();
    }
    completarInformacionPago=()=> {
        cy.get("#CCNumber").type("4111111111111111");
        cy.get("#reservationForm_cardNumber1").type("Test Test");
        cy.get("#idExpirationMonth").select(12);
        cy.get("#idExpirationYear").select("29");
        cy.get("#reservationForm_cardNumber2").type("369");
        cy.get("input[name='CheckEInvoiceice']").eq(0).check();
        cy.get("#idCheckTermsConditions").check();
        cy.get("#idCheckPresentCard").check();
        cy.get(".fixPrecioMovilDatos").eq(0).click();
    }
    guardarReservacion=()=> cy.get("#bookingNumber").then(span=> cy.writeFile(Cypress.env("dataBooking"),{booking: span.text()}));
    loginCIO=(loyalty)=> {
        if(loyalty) {
            cy.get("#clientPrivilege-tab").click();
            cy.get("#userName").type("TEST");
            let sql="SELECT CLP_PSWWEB FROM TRCG_CLIENTE_PRIVILEGE WHERE CLP_USRWEB='"+config.username.CIO+"'";
            cy.task("sqlQuery",sql).then(query=> cy.get("#password").type(query.rows[0][0]));
        }
        else {
            cy.readFile(Cypress.env("dataBooking")).then(json=> {
                cy.get("#bokingNumber").type(json.booking);
                let sql="SELECT IRE_CLINOM FROM TRCI_INTERFACE_RESERVA WHERE IRE_LOCRES='"+json.booking+"'";
                cy.task("sqlQuery",sql).then(query=> {
                    let fullName=query.rows[0][0].split(" ");
                    let lastName=function(fullName) {
                      let newArray=[];
                      for(let i=1;i<fullName.length;i++) {
                        newArray.push(fullName[i]);
                      }
                      return newArray.join(" ");
                    };
                    cy.get("#lastName").type(lastName(fullName));
                });
            });
        }
        cy.get("#btnLogin").click();
    }
    buscarReserva=(option)=> {
        cy.get(".content").then(content=> {
            cy.readFile(Cypress.env("dataBooking")).then(json=> {
                let sql="SELECT RES_CODRES FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
                cy.task("sqlQuery",sql).then(query=> {
                    let listBooking=content.find("section:eq(0)>.bg-white");
                    let coincidenceBooking=false;
                    if(listBooking.length>0) {
                        for(let i=0;i<listBooking.length;i++) {
                            if(parseInt(Cypress.$(listBooking).eq(i).find(".getReservaID").eq(0).attr("data-booking"))===query.rows[0][0]) {
                                cy.wrap(listBooking).eq(i).find("[data-opcion='"+option+"']").click();
                                coincidenceBooking=true;
                                return false;
                            }
                        }
                    }
                    if(!coincidenceBooking) {
                        throw new Error("La reserva "+json.booking+" no se ubica en la lista");
                    }
                });
            });
        });
    }
    actualizarPQ=(loyalty)=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql="SELECT RES_CODRES,RES_CODPLC FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql).then(query=> {
                if(["BASIC","MEDIUM"].indexOf(query.rows[0][1])>-1) {
                    if(config.europcar.upgradePackage) {
                        if(query.rows[0][1]==="BASIC") {
                            cy.get("#menuMovil_2").click();
                            cy.get(".movilOculto_2 #btn-add-basic").click();
                        }
                        else {
                            cy.get("#menuMovil_3").click();
                            cy.get(".movilOculto_3 #btn-add-basic").click();
                        }
                        cy.get("#bottonInsurances").click();
                        //Datos de pago
                        cy.wait(8000).then(()=> this.validarSitio("/Europcar/Insurances/DataPayment"));
                        this.datosPago();
                        if(loyalty===false) {
                            //Sé cliente frecuente
                            this.validarSitio("/Europcar/CheckInOnline/BePrivilege");
                            cy.get("section a[href='/Europcar/Insurances/SuccessPayment']").click();
                        }
                        //Pago aplicado
                        this.validarSitio("/Europcar/Insurances/SuccessPayment");
                        let urlSuccessPayment=loyalty ? "Privileges/Reserva/"+query.rows[0][0] : "CheckInOnline/Index";
                        cy.get(".success-payment a[href='/Europcar/"+urlSuccessPayment+"']").click();
                    }
                    else {
                        cy.get(".addPackagesGeneralSkipe").click();
                        if(loyalty) {
                            //Pago aplicado
                            this.validarSitio("/Europcar/Insurances/SuccessPayment");
                            cy.get(".success-payment a[href='/Europcar/Privileges/Reserva/"+query.rows[0][0]+"']").click();
                        }
                    }
                }
                else {
                    throw new Error("Opción no disponible");
                }
            });
        });
    }
    modificarCIO=()=> {
        switch(config.europcar.modifyCIO) {
            case 1:
                cy.get("section").eq(0).then(section=> {
                    let dateCheckout=new Date(Cypress.$(section).find("#idcheckoutDay").val().split("/").reverse().join("/"));
                    let dateCheckin=new Date(Cypress.$(section).find("#idcheckinDay").val().split("/").reverse().join("/"));
                    dateCheckout.setDate(dateCheckout.getDate()+1);
                    dateCheckin.setDate(dateCheckin.getDate()+1);
                    let dayCheckout=(dateCheckout.getDate()<10 ? "0" : "")+dateCheckout.getDate();
                    let dayCheckin=(dateCheckin.getDate()<10 ? "0" : "")+dateCheckin.getDate();
                    let monthCheckout=(dateCheckout.getMonth()<10 ? "0" : "")+(dateCheckout.getMonth()+1);
                    let monthCheckin=(dateCheckin.getMonth()<10 ? "0" : "")+(dateCheckin.getMonth()+1);
                    cy.get("#idcheckoutDay").invoke("val",dayCheckout+"/"+monthCheckout+"/"+dateCheckout.getFullYear()).trigger("change");
                    cy.get("#idcheckinDay").invoke("val",dayCheckin+"/"+monthCheckin+"/"+dateCheckin.getFullYear()).trigger("change");
                    cy.get("#idcheckoutDay").click();
                    cy.get(".ui-state-active").click();
                    cy.get("#sendModifyDatas").click();
                });
                break;
            case 2:
                cy.get(".opcioneTabs>li").eq(1).click();
                cy.get("#idcheckinLocationName").clear().type("PLAYA DEL CARMEN - CENTRO");
                cy.get("#ui-id-2",{timeout: 4000}).find(".ui-menu-item-wrapper").eq(0).click();
                cy.get("#sendModifyDatas").click();
                break;
            case 3:
                cy.get(".opcioneTabs>li").eq(2).click();
                cy.wait(8000).then(()=> {
                    cy.get(".selectCarModify").then(modify=> {
                        if(modify.length>0) {
                            let car=Math.floor(Math.random()*modify.length);
                            if(car<modify.length) {
                                cy.wrap(modify).eq(car).click();
                            }
                        }
                    });
                    cy.get("#sendModifyDatas").click();
                });
                break;
            default:
                throw new Error("Opción no disponible");
        }
    }
    datosPago=()=> {
        cy.get("#formDataPayment").then(form=> {
            let divs=Cypress.$(form).find(".card>.card-body>div").length;
            if(parseFloat(Cypress.$(form).find(".card>.card-body>div").eq(divs-1).find(".text-uppercase").text().match(/\d+(\.\d+)?/g))>0) {
                cy.get("#CCNumber").type("4111111111111111");
                cy.get("#CCHolderName").type("Test Test");
                cy.get("#idExpirationMonth").select(12);
                cy.get("#idExpirationYear").select("29");
                cy.get("#CCCVC").type("369",{force: true});
            }
        });
        cy.get("#btn-data-payment").click();
    }
    conductorPrincipal=()=> {
        if(config.europcar.CIO.modifyDriver) {
            cy.get("#SameHolder").check();
            cy.get("#name").type("Test");
            cy.get("#lastname").type("Test");
        }
        cy.get("#code").invoke("val").then(code=> {
            if(code.length===0) {
                cy.get("#code").type(123456);
            }
        });
        cy.get("#Place").invoke("val").then(place=> {
            if(place.length===0) {
                cy.get("#Place").type("Cancún");
            }
        });
        cy.get("#license_cdmx").check();
        this.seleccionarArchivo();
        cy.get("#SaveDriverBotton").click();
    }
    seleccionarArchivo=()=> {
        cy.get("#img-front").click();
        cy.get("#modalOptionPiture .modal-body .pb-3").eq(0).click();
        cy.get("#inputGallery").selectFile("avatar.jpg",{force: true});
        cy.get("#img-back").click();
        cy.get("#modalOptionPiture .modal-body .pb-3").eq(0).click();
        cy.get("#inputGallery").selectFile("avatar.jpg",{force: true});
    }
    seleccionarDocumento=()=> {
        cy.get("input[name='documento_identificacion']").eq(0).check();
        cy.get("#selectDocument").click();
    }
    titularPago=()=> {
        if(config.europcar.CIO.modifyAccountHolder) {
            cy.get("#day").find("option:selected").then(day=> {
                if(day.text()==="day") {
                    cy.get("#day").select(27);
                }
            });
            cy.get("#month").find("option:selected").then(month=> {
                if(month.text()==="mm") {
                    cy.get("#month").select(6);
                }
            });
            cy.get("#year").find("option:selected").then(year=> {
                if(year.text()==="aaaa") {
                    cy.get("#year").select("1992");
                }
            });
            cy.get("#month").find("option:selected").then(month=> {
                if(month.text()==="mm") {
                    cy.get("#month").select(6);
                }
            });
            cy.get("#year").find("option:selected").then(year=> {
                if(year.text()==="aaaa") {
                    cy.get("#year").select("1992");
                }
            });
            cy.get("#telephono").invoke("val").then(telephono=> {
                if(telephono.length===0) {
                    cy.get("#telephono").type("9984816145");
                }
            });
            cy.get("#city").invoke("val").then(city=> {
                if(city.length===0) {
                    cy.get("#city").type("Cancún");
                }
            });
            cy.get("#state").invoke("val").then(state=> {
                if(state.length===0) {
                    cy.get("#state").type("QuintanaRoo");
                }
            });
            cy.get("#email").invoke("val").then(email=> {
                if(email.length===0) {
                    cy.get("#email").type("jorge.pat@isconsulting-it.com");
                }
            });
            cy.get("#direction").invoke("val").then(direction=> {
                if(direction.length===0) {
                    cy.get("#direction").type("Supermanzana 91");
                }
            });
            cy.get("#cp").invoke("val").then(cp=> {
                if(cp.length===0) {
                    cy.get("#cp").type("77516");
                }
            });
        }
        this.seleccionarArchivo();
        cy.get("#SaveHolderBotton").click();
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new Europcar();