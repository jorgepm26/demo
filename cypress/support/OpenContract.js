/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
class OpenContract {
    login=(environment)=> {
        cy.visit("https://"+environment+"-opencontract.europcar.com.mx/",{failOnStatusCode: false});
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT RES_USRCRE FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql1).then(query1=> {
                if(query1.rows.length>0) {
                    let sql2="SELECT USR_IDEUSR,USR_PSWUSR FROM TRCI_USUARIO WHERE USR_CODUSR='"+query1.rows[0][0]+"'";
                    cy.task("sqlQuery",sql2).then(query2=> {
                        cy.get("#usuario").type(query2.rows[0][0]);
                        localStorage.setItem("user",query2.rows[0][0]);
                        cy.get("#password").type(query2.rows[0][1]);
                        localStorage.setItem("password",query2.rows[0][1]);
                    });
                    cy.get("#formCheckInOnline button").click();
                }
            });
        });
    }
    validarSitio=(include)=> cy.url().should("include",include);
    oficinaPorRegion=()=> {
        let sql="SELECT USR_CODOFI FROM TRCI_USUARIO WHERE USR_IDEUSR='"+localStorage.getItem("user")+"'";
        cy.task("sqlQuery",sql).then(query=> {
            if([478,480,481].indexOf(query.rows[0][0])>-1) {
                //Oficina por región
                this.validarSitio("/Apertura/Counter/OfficePerRegion");
                cy.get("input[name='counter']").check(query.rows[0][0].toString());
                cy.get("#button_counter").click();
            }
        });
    }
    sala=()=> {
        let sql="SELECT OFE_CODOFE,OFE_NOMOFE,OFE_IPADDR FROM TRCO_OFICINA_ESCRITORIO "+
        "WHERE OFE_CODOFI=(SELECT USR_CODOFI FROM TRCI_USUARIO "+
        "WHERE USR_IDEUSR='"+localStorage.getItem("user")+"') "+
        "AND OFE_FLGEST='A'";
        cy.task("sqlQuery",sql).then(query=> {
            if(query.rows.length>0) {
                let counter=Math.floor(Math.random()*query.rows.length);
                if(this.validarIP(query.rows[counter][2])) {
                    cy.get("input[name='counter']").check(query.rows[counter][0]+"_*_"+query.rows[counter][1]);
                    cy.get("#button_counter").click();
                }
                else {
                    throw new Error("Escritorio seleccionado no valido");
                }
            }
            else {
                cy.get("nav #perfil").then(profile=> {
                    cy.wrap(profile).click();
                    cy.wrap(profile).find("a[href='/Apertura/Counter/LiberarCounter']").click();
                });
                //Liberar salas
                this.validarSitio("/Apertura/Counter/LiberarCounter");
                this.liberarSalaOcupada();
                //Seleccionar sala
                this.validarSitio("/Apertura/Counter");
                cy.wait(2000).then(()=> this.sala());
            }
        });
    }
    liberarSalaOcupada=()=> {
        let sql="SELECT OFE_CODOFE,OFE_NOMOFE,OFE_IPADDR FROM TRCO_OFICINA_ESCRITORIO "+
        "WHERE OFE_CODOFI=(SELECT USR_CODOFI FROM TRCI_USUARIO "+
        "WHERE USR_IDEUSR='"+localStorage.getItem("user")+"') "+
        "AND OFE_FLGEST='O'";
        cy.task("sqlQuery",sql).then(query=> {
            if(query.rows.length>0) {
                let counter=Math.floor(Math.random()*query.rows.length);
                if(this.validarIP(query.rows[counter][2])) {
                    cy.get("input[name='counter']").check(query.rows[counter][0].toString());
                }
                else {
                    throw new Error("Escritorio seleccionado no valido");
                }
            }
            else {
                throw new Error("No cuenta con escritorios ocupados para liberar");
            }
        });
        cy.get("#button_counter").click();
        cy.get("a[href='/Apertura/Counter']",{timeout: 4000}).click();
    }
    validarIP=(dirIP)=> dirIP.split(".").map(i=> Number(i)).filter(i=> i>=0 && i<256).length===4;
    idioma=()=> {
        if(config.openContract.changeLanguage) {
            cy.get("input[name='idioma']").check("US");
        }
        cy.get("#formIdioma button").contains("Aceptar").click();
    }
    listaReserva=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> cy.get("#reservacionNombre").type(json.booking));
        cy.get("#BuscarReservas").click();
        cy.get("#tablelistaReservas>tbody>tr>td").last().find("input[type='checkbox']").check();
        cy.get("#btnInitOpenContract").click();
        cy.get("#modalTempOpenContract").then(modal=> {
            cy.wait(6000).then(()=> {
                if(Cypress.$(modal).is(":visible")) {
                    cy.wrap(modal).contains(config.openContract.changeLanguage ? "Accept" : "Aceptar").click();
                }
            });
        });
    }
    omitirIsBiometrics=(skipIsBiometrics,environment)=> {
        if(skipIsBiometrics) {
            cy.visit("https://"+environment+"-opencontract.europcar.com.mx/Apertura/Reservation/ReservarOnline");
        }
        else {
            cy.get("nav #perfil").then(profile=> {
                cy.wrap(profile).click();
                cy.wrap(profile).find("#omitBiometricPage").click();
            });
            cy.get("#ModalSkipBiometrics").then(modal=> {
                cy.wrap(modal).find("#motive_id").select(2);
                cy.wrap(modal).find("#motive_comment").type("Test");
                cy.wrap(modal).find("#btn_skip_biometrics").click();
            });
            cy.get("#BiometricModalAuthorization").then(modal=> {
                cy.wrap(modal).find("#agentePasswordBiometric").type(localStorage.getItem("password"));
                cy.wrap(modal).find("#aceptar_Authorization_biometric").click();
            });
        }
    }
    datosReservacion=()=> {
        cy.get("#modalComentarios #btnModalCloseComments").click();
        cy.get("#buttonNext").click();
    }
    asignarAuto=()=> {
        cy.get("footer button").click();
        cy.get("#ModalCarConcession").then(modal=> {
            cy.wait(6000).then(()=> {
                if(Cypress.$(modal).is(":visible")) {
                    cy.wrap(modal).find("#btnNextConcession").click();
                }
            });
        });
    }
    seleccionarPaquetes=(environment)=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            if(config.openContract.packages.request) {
                let arrayPLI=["PLI"];
                let arraySmart=["PLI","PAI","ERA","SLI"];
                let arrayBasic1=["PLI","LDW"];
                let arrayBasic2=["PLI","CDW","THW"];
                let arrayBasic3=["PLI","WCDW","THW"];
                let arrayMedium1=["PLI","LDW","PAI","ERA","GTP"];
                let arrayMedium2=["PLI","CDW","THW","PAI","ERA","GTP"];
                let arrayMedium3=["PLI","WCDW","THW","PAI","ERA","GTP"];
                let arrayPremium1=["PLI","LDW","PAI","ERA","DP","GTP"];
                let arrayPremium2=["PLI","CDW","THW","PAI","ERA","DP","GTP"];
                let arrayPremium3=["PLI","WCDW","THW","PAI","ERA","DP","GTP"];
                let coverage=[];
                let sql1="SELECT RES_CODRES,RES_CODCLI,RES_CODTAR,RES_CODPLC FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
                cy.task("sqlQuery",sql1).then(query1=> {
                    if([6,141551,141552].indexOf(query1.rows[0][1])>-1) { //WLK MX, WLK PA y WLK CR
                        if([2,1251,1252].indexOf(query1.rows[0][2])>-1) { //TARIFA WALKING
                            let sql2="SELECT REE_CODEXT FROM TRCB_RESERVA_EXTRA WHERE REE_CODRES='"+query1.rows[0][0]+"'";
                            cy.task("sqlQuery",sql2).then(query2=> {
                                for(let i=0;i<query2.rows.length;i++) {
                                    coverage.push(query2.rows[i][0]);
                                }
                                if(arrayPLI.sort().length==coverage.sort().length && arrayPLI.every((v,i)=> v===coverage[i])) {
                                    cy.get("#slick-slide-control03").click();
                                    cy.get("#Smart").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                }
                                else if(arraySmart.sort().length==coverage.sort().length && arraySmart.every((v,i)=> v===coverage[i])) {
                                    cy.get("#slick-slide-control02").click();
                                    cy.get("#Basic").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                }
                                else if((arrayBasic1.sort().length==coverage.sort().length && arrayBasic1.every((v,i)=> v===coverage[i])) ||
                                (arrayBasic2.sort().length==coverage.sort().length && arrayBasic2.every((v,i)=> v===coverage[i])) ||
                                (arrayBasic3.sort().length==coverage.sort().length && arrayBasic3.every((v,i)=> v===coverage[i]))) {
                                    cy.get("#slick-slide-control01").click();
                                    cy.get("#Medium").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                }
                                else if((arrayMedium1.sort().length==coverage.sort().length && arrayMedium1.every((v,i)=> v===coverage[i])) ||
                                (arrayMedium2.sort().length==coverage.sort().length && arrayMedium2.every((v,i)=> v===coverage[i])) ||
                                (arrayMedium3.sort().length==coverage.sort().length && arrayMedium3.every((v,i)=> v===coverage[i]))) {
                                    cy.get("#Premium").click();
                                    //Extras
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                    cy.get("#addExtrasSingle").click();
                                }
                                else if((arrayPremium1.sort().length==coverage.sort().length && arrayPremium1.every((v,i)=> v===coverage[i])) ||
                                (arrayPremium2.sort().length==coverage.sort().length && arrayPremium2.every((v,i)=> v===coverage[i])) ||
                                (arrayPremium3.sort().length==coverage.sort().length && arrayPremium3.every((v,i)=> v===coverage[i]))) {
                                    cy.get(".NextOmitir").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                }
                                else {
                                    throw new Error("Lista de coberturas no disponible");
                                }
                            });
                        }
                        else {
                            throw new Error("Tarifa no disponible");
                        }
                    }
                    else if([226,141555,141556].indexOf(query1.rows[0][1])>-1) { //WEB MX, WEB PA y WEB CR
                        if([539,1255,1256].indexOf(query1.rows[0][2])>-1) { //TARIFA WEB
                            switch(query1.rows[0][3]) {
                                case "BASIC":
                                    cy.get("#slick-slide-control01").click();
                                    cy.get("#Medium").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                    break;
                                case "MEDIUM":
                                    cy.get("#Premium").click();
                                    //Extras
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                    cy.get("#addExtrasSingle").click();
                                    break;
                                case "PREMIUM":
                                    cy.get(".NextOmitir").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                    break;
                                default:
                                    throw new Error("Paquete no disponible");
                            }
                        }
                        else {
                            throw new Error("Tarifa no disponible");
                        }
                    }
                    else if([189030,189417,189419].indexOf(query1.rows[0][1])>-1) { //DEAL MX, DEAL PA y DEAL CR
                        if(query1.rows[0][3]===null) {
                            let sql3="SELECT REE_CODEXT FROM TRCB_RESERVA_EXTRA WHERE REE_CODRES='"+query1.rows[0][0]+"'";
                            cy.task("sqlQuery",sql3).then(query3=> {
                                if(query3.rows.length>0) {
                                    for(let i=0;i<query3.rows.length;i++) {
                                        coverage.push(query3.rows[i][0]);
                                    }
                                    if(arrayPLI.sort().length==coverage.sort().length && arrayPLI.every((v,i)=> v===coverage[i])) {
                                        cy.get("#slick-slide-control03").click();
                                        cy.get("#Smart").click();
                                        //Cobertura adicional
                                        cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                        cy.get("#agregarInsurances").click();
                                        //Extras
                                        this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                        cy.get("#addExtrasSingle").click();
                                    }
                                    else {
                                        throw new Error("Lista de coberturas no disponible");
                                    }
                                }
                                else {
                                    throw new Error("No cuenta con cobertura para continuar con la apertura");
                                }
                            });
                        }
                        else {
                            if(["BASIC","PDBAS","DBASCR"].indexOf(query1.rows[0][3])>-1) {
                                cy.get("#slick-slide-control01").click();
                                cy.get("#Medium").click();
                                //Cobertura adicional
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                cy.get("#agregarInsurances").click();
                                //Extras
                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                cy.get("#addExtrasSingle").click();
                            }
                            else if(["MEDIUM","PDMED","DMEDCR"].indexOf(query1.rows[0][3])>-1) {
                                cy.get("#Premium").click();
                                //Extras
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                cy.get("#addExtrasSingle").click();
                            }
                            else if(["PREMIUM","PDPREM","DPREMCR"].indexOf(query1.rows[0][3])>-1) {
                                cy.get(".NextOmitir").click();
                                //Cobertura adicional
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                cy.get("#agregarInsurances").click();
                                //Extras
                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                cy.get("#addExtrasSingle").click();
                            }
                            else {
                                throw new Error("Paquete no disponible");
                            }
                        }
                    }
                    else if([119864,144709,161281].indexOf(query1.rows[0][1])>-1) { //CC-2018 MX, CC-2018 PA, CC-2018 CR
                        if([42,1281,1354].indexOf(query1.rows[0][2])>-1) { //TARIFA MTD
                            if(query1.rows[0][3]===null) {
                                let sql4="SELECT REE_CODEXT FROM TRCB_RESERVA_EXTRA WHERE REE_CODRES='"+query1.rows[0][0]+"'";
                                cy.task("sqlQuery",sql4).then(query4=> {
                                    for(let i=0;i<query4.rows.length;i++) {
                                        coverage.push(query4.rows[i][0]);
                                    }
                                    if((arrayBasic1.sort().length==coverage.sort().length && arrayBasic1.every((v,i)=> v===coverage[i])) ||
                                    (arrayBasic2.sort().length==coverage.sort().length && arrayBasic2.every((v,i)=> v===coverage[i]))) {
                                        cy.get("#slick-slide-control01").click();
                                        cy.get("#Medium").click();
                                        //Cobertura adicional
                                        cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                        cy.get("#agregarInsurances").click();
                                        //Extras
                                        this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                        cy.get("#addExtrasSingle").click();
                                    }
                                    else if((arrayMedium1.sort().length==coverage.sort().length && arrayMedium1.every((v,i)=> v===coverage[i])) ||
                                    (arrayMedium2.sort().length==coverage.sort().length && arrayMedium2.every((v,i)=> v===coverage[i]))) {
                                        cy.get("#Premium").click();
                                        //Extras
                                        cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                        cy.get("#addExtrasSingle").click();
                                    }
                                    else if((arrayPremium1.sort().length==coverage.sort().length && arrayPremium1.every((v,i)=> v===coverage[i])) ||
                                    (arrayPremium2.sort().length==coverage.sort().length && arrayPremium2.every((v,i)=> v===coverage[i]))) {
                                        cy.get(".NextOmitir").click();
                                        //Cobertura adicional
                                        cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                        cy.get("#agregarInsurances").click();
                                        //Extras
                                        this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                        cy.get("#addExtrasSingle").click();
                                    }
                                    else {
                                        throw new Error("Lista de coberturas no disponible");
                                    }
                                });
                            }
                            else {
                                if(["BASIC","PABASIC"].indexOf(query1.rows[0][3])>-1) {
                                    cy.get("#slick-slide-control01").click();
                                    cy.get("#Medium").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                }
                                else if(["MEDIUM","PAMEDIUM"].indexOf(query1.rows[0][3])>-1) {
                                    cy.get("#Premium").click();
                                    //Extras
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                    cy.get("#addExtrasSingle").click();
                                }
                                else if(["PREMIUM","PAPRIEMIUM"].indexOf(query1.rows[0][3])>-1) {
                                    cy.get(".NextOmitir").click();
                                    //Cobertura adicional
                                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                    cy.get("#agregarInsurances").click();
                                    //Extras
                                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                    cy.get("#addExtrasSingle").click();
                                }
                                else {
                                    throw new Error("Paquete no disponible");
                                }
                            }
                        }
                        else if([1085,1255,1256].indexOf(query1.rows[0][2])>-1) { //TARIFA WEB
                            if(["BASIC","WEBBASIC"].indexOf(query1.rows[0][3])>-1) {
                                cy.get("#slick-slide-control01").click();
                                cy.get("#Medium").click();
                                //Cobertura adicional
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                cy.get("#agregarInsurances").click();
                                //Extras
                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                cy.get("#addExtrasSingle").click();
                            }
                            else if(query1.rows[0][3]==="MEDIUM") {
                                cy.get("#Premium").click();
                                //Extras
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                cy.get("#addExtrasSingle").click();
                            }
                            else if(query1.rows[0][3]==="PREMIUM") {
                                cy.get(".NextOmitir").click();
                                //Cobertura adicional
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                cy.get("#agregarInsurances").click();
                                //Extras
                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                cy.get("#addExtrasSingle").click();
                            }
                            else {
                                throw new Error("Paquete no disponible");
                            }
                        }
                        else {
                            throw new Error("Tarifa no disponible");
                        }
                    }
                    else if(query1.rows[0][1]===132758) { //KEDDY MX
                        if(query1.rows[0][2]===1184) { //WEB KEDDY
                            if(["KBASIC","WEBBASIC"].indexOf(query1.rows[0][3])>-1) {
                                cy.get("#slick-slide-control01").click();
                                cy.get("#Medium").click();
                                //Cobertura adicional
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                cy.get("#agregarInsurances").click();
                                //Extras
                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                cy.get("#addExtrasSingle").click();
                            }
                            else if(query1.rows[0][3]==="KMEDIUM") {
                                cy.get("#Premium").click();
                                //Extras
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                cy.get("#addExtrasSingle").click();
                            }
                            else if(query1.rows[0][3]==="KPREMIUM") {
                                cy.get(".NextOmitir").click();
                                //Cobertura adicional
                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                cy.get("#agregarInsurances").click();
                                //Extras
                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                cy.get("#addExtrasSingle").click();
                            }
                            else {
                                throw new Error("Paquete no disponible");
                            }
                        }
                        else {
                            throw new Error("Tarifa no disponible");
                        }
                    }
                    else if(query1.rows[0][1]===175149) { //DEAL MX TGZ
                        let sql5="SELECT OFI_CODPLA FROM TRCO_OFICINA WHERE OFI_CODOFI=(SELECT RES_SALOFI FROM TRCB_RESERVA WHERE RES_LOCRES='"+query1.rows[0][0]+"')";
                        cy.task("sqlQuery",sql5).then(query5=> {
                            if(query5.rows[0][0]===174) {
                                if(query1.rows[0][3]===null) {
                                    let sql6="SELECT REE_CODEXT FROM TRCB_RESERVA_EXTRA WHERE REE_CODRES='"+query1.rows[0][0]+"'";
                                    cy.task("sqlQuery",sql6).then(query6=> {
                                        if(query6.rows.length>0) {
                                            for(let i=0;i<query6.rows.length;i++) {
                                                coverage.push(query6.rows[i][0]);
                                            }
                                            if(arrayPLI.sort().length==coverage.sort().length && arrayPLI.every((v,i)=> v===coverage[i])) {
                                                cy.get("#slick-slide-control03").click();
                                                cy.get("#Smart").click();
                                                //Cobertura adicional
                                                cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                                cy.get("#agregarInsurances").click();
                                                //Extras
                                                this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                                cy.get("#addExtrasSingle").click();
                                            }
                                            else {
                                                throw new Error("Lista de coberturas no disponible");
                                            }
                                        }
                                        else {
                                            throw new Error("No cuenta con cobertura para continuar con la apertura");
                                        }
                                    });
                                }
                                else {
                                    switch(query1.rows[0][3]) {
                                        case "BASIC":
                                            cy.get("#slick-slide-control01").click();
                                            cy.get("#Medium").click();
                                            //Cobertura adicional
                                            cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                            cy.get("#agregarInsurances").click();
                                            //Extras
                                            this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                            cy.get("#addExtrasSingle").click();
                                            break;
                                        case "MEDIUM":
                                            cy.get("#Premium").click();
                                            //Extras
                                            cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/complementaralgunextra"));
                                            cy.get("#addExtrasSingle").click();
                                            break;
                                        case "PREMIUM":
                                            cy.get(".NextOmitir").click();
                                            //Cobertura adicional
                                            cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"));
                                            cy.get("#agregarInsurances").click();
                                            //Extras
                                            this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                                            cy.get("#addExtrasSingle").click();
                                            break;
                                        default:
                                            throw new Error("Paquete no disponible");
                                    }
                                }
                            }
                            else {
                                throw new Error("Oficina virtual, favor de buscar el localizador clon Europcar MX"); 
                            }
                        });
                    }
                    else {
                        throw new Error("Cliente no disponible");
                    }
                });
            }
            else {
                let sql9="SELECT COUNT(TRE.REE_CODEXT) FROM TRCB_RESERVA_EXTRA TRE,TRCB_RESERVA TR "+
                "WHERE TRE.REE_CODRES=TR.RES_CODRES "+
                "AND TR.RES_LOCRES='"+json.booking+"' "+
                "AND TRE.REE_CODEXT IN('CDW','WCDW')";
                cy.task("sqlQuery",sql9).then(query9=> {
                    let urlIndividualCoverage=query9.rows[0][0]>0 ? "" : "?typeVLF=2";
                    if(query9.rows[0][0]>0) {
                        cy.visit("https://"+environment+"-opencontract.europcar.com.mx/Apertura/Insurances/AgregarCoberturaIndividual");
                    }
                    else {
                        cy.get("a[href='AgregarCoberturaIndividual"+urlIndividualCoverage+"']").click();
                    }
                    //Cobertura adicional
                    cy.wait(4000).then(()=> this.validarSitio("/Apertura/Insurances/AgregarCoberturaIndividual"+urlIndividualCoverage));
                    if(query9.rows[0][0]===0 && config.openContract.packages.insuranceCDW) {
                        cy.get("#formInsuranceSingle #waiverPlus_CDW").click();
                    }
                    cy.get("#agregarInsurances").click();
                    //Extras
                    this.validarSitio("/Apertura/Insurances/complementaralgunextra");
                    cy.get("#addExtrasSingle").click();
                });
            }
        });
    }
    gasolinaPrepagada=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql="SELECT RES_CHKGAP,RES_CODEMP FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql).then(query=> {
                if(query.rows[0][0]==="N") {
                    //Gasolina prepagada
                    this.validarSitio("/Apertura/Car/PrepaidFuel");
                    cy.get("a[href='../"+(query.rows[0][1]===1 ? "Payment/GarantizarRentaAuto" : "Car/ContractPrintChoose")+"']").click();
                    if(query.rows[0][1]!==1) {
                        //Contrato digital
                        this.validarSitio("/Apertura/Car/ContractPrintChoose");
                        cy.get("#DigitalContract").click();
                    }
                }
            });
        });
    }
    garantizarAuto=()=> {
        cy.get("#btnOthersOptionPayment").click();
        cy.get("#agentePassword").type(localStorage.getItem("password"));
        cy.get("#aceptar_Authorization").click();
    }
    pagoGarantia=(flagPay)=> {
        if(flagPay==="F") {
            cy.get("img[src='/images/ic-forzado.png']").click();
            /*cy.get("#agentePassword").type(localStorage.getItem("password"));
            cy.get("#aceptar_Authorization").click();*/
        }
        else if(flagPay==="C") {
            cy.get("img[src='/images/ic-efectivo.png']").click();
            //Garantía en efectivo
            this.validarSitio("/Apertura/Payment/AdministracionEfectivo");
            cy.readFile(Cypress.env("dataBooking")).then(json=> {
                let sql="SELECT RES_CODDIV FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
                cy.task("sqlQuery",sql).then(query=> {
                    cy.get("input[name='currency']").check(query.rows[0][0],{force: true});
                    if(query.rows[0][0]==="MXN") {
                        cy.get("#priceTotalMXN").invoke("val").then(value=> {
                            if(Cypress.$("#typeCashbills").is(":visible")) {
                                let bills=parseInt(value/100)*100;
                                cy.get("#priceBills").clear().type(Number.parseFloat(bills).toFixed(2));
                                cy.get("#priceCoins").clear().type(Number.parseFloat(value-bills).toFixed(2));
                            }
                        });
                    }
                });
            });
            cy.get("#signature-pad").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2,{force: true}));
            cy.get("#signature-padS").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2,{force: true}));
            cy.get("#btnSubmit").click({force: true});
            cy.get("#ModalConfirmPayment #confirmCash").click();
        }
        else {
            cy.wait(2000).then(()=> { throw new Error("Opción no disponible") });
        }
    }
    prepagoTarjeta=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql="SELECT TC.* FROM TRCB_COBRO TC,TRCB_RESERVA TR "+
            "WHERE TC.COB_CODRES=TR.RES_CODRES "+
            "AND TR.RES_LOCRES='"+json.booking+"' "+
            "AND TC.COB_FLGMCO='T'"
            cy.task("sqlQuery",sql).then(query=> {
                if(query.rows.length>0 && ["C","F"].indexOf(config.openContract.flagPayComplement)>-1) {
                    //Verificación de prepago
                    this.validarSitio("/Apertura/Payment/ValidateCredit");
                    cy.get("#NoCreditCard").click();
                }
            });
        });
    }
    pagoAdicionales=()=> {
        cy.get("#btnOthersPayment").click();
        cy.get("#agentePassword").type(localStorage.getItem("password"));
        cy.get("#aceptar_Authorization").click();
    }
    requiereFactura=()=> {
        cy.get("input[name='tipoFactura']").eq(0).check();
        cy.get("#buttonFacturarPago").click();
    }
    esClientePrivilegio=()=> {
        let sql1="SELECT USR_CODEMP FROM TRCI_USUARIO WHERE USR_IDEUSR='"+localStorage.getItem("user")+"'";
        cy.task("sqlQuery",sql1).then(query1=> {
            if(query1.rows[0][0]===1) {
                cy.readFile(Cypress.env("dataBooking")).then(json=> {
                    let sql2="SELECT IRE_CODCLP FROM TRCI_INTERFACE_RESERVA WHERE IRE_LOCRES='"+json.booking+"'";
                    cy.task("sqlQuery",sql2).then(query2=> {
                        if(query2.rows.length===0 || query2.rows[0][0]===null) {
                            //Encuesta para afiliarse a cliente privilegio
                            this.validarSitio("/Apertura/Documentation/ViajeroFrecuente");
                            cy.get("input[name='viajeroFrecuente']").eq(1).check();
                            cy.get("#isTravelNo input[name='agregarViajeroFrecuente']").eq(1).check();
                            cy.get("#Button").click();
                        }
                    });
                });
            }
        });
    }
    informacionINE=()=> {
        cy.get("#dia").find("option:selected").then(days=> {
            if(days.text()==="dd") {
                cy.get("#dia").select(27);
            }
        });
        cy.get("#mes").find("option:selected").then(months=> {
            if(months.text()==="mm") {
                cy.get("#mes").select(6);
            }
        });
        cy.get("#anio").find("option:selected").then(years=> {
            if(years.text()==="aaaa") {
                cy.get("#anio").select("1992");
            }
        });
        cy.get("#email").invoke("val").then(email=> {
            if(email.length===0) {
                cy.get("#email").type("jorge.pat@isconsulting-it.com");
            }
        });
        cy.get("#ciudad").invoke("val").then(ciudad=> {
            if(ciudad.length===0) {
                cy.get("#ciudad").type("Cancún");
            }
        });
        cy.get("#estado").invoke("val").then(estado=> {
            if(estado.length===0) {
                cy.get("#estado").type("QuintanaRoo");
            }
        });
        cy.get("#direccion").invoke("val").then(direccion=> {
            if(direccion.length===0) {
                cy.get("#direccion").type("Supermanzana 91");
            }
        });
        cy.get("#telefono").invoke("val").then(telefono=> {
            if(telefono.length===0) {
                cy.get("#telefono").type("9984816145");
            }
        });
        cy.get("#codigopostal").invoke("val").then(codigoPostal=> {
            if(codigoPostal.length===0) {
                cy.get("#codigopostal").type("77516");
            }
        });
        cy.get("#formInformationContract").then(()=> {
            if(Cypress.$("#img_1").attr("src")==="/images/imageFront.png") {
                this.tomarFoto("#divImageFront a");
            }
            if(Cypress.$("#img_2").attr("src")==="/images/imageBack.png") {
                this.tomarFoto("#divImageRear a");
            }
        });
        cy.get("#bottonInformacionCorrecta").click();
    }
    tomarFoto=(div)=> {
        cy.get(div).click();
        cy.wait(2000).then(()=> {
            cy.get("#take-snapshot").click();
            cy.get("#add-photo-and-send").click();
        });
    }
    identificacionPago=()=> {
        cy.get("#btnCopyInforModal").click();
        cy.get("#btnFormInformation").click();
        cy.get("#idCommitContract",{timeout: 2000}).click();
    }
    casoImprevisto=()=> {
        cy.get("#contactInfo").type("Caribe Internacional");
        cy.get("#btnCase").click();
    }
    datosConductor=()=> {
        cy.get("#no_licencia").invoke("val").then(noLicencia=> {
            if(noLicencia.length===0) {
                cy.get("#no_licencia").type(123456);
            }
        });
        cy.get("#Place").invoke("val").then(place=> {
            if(place.length===0) {
                cy.get("#Place").type("Cancún");
            }
        });
        cy.get("#formDatosConductorPrincipal").then(()=> {
            let day=Cypress.$("#fecha_devolucion_dia").find("option:selected").text();
            let month=Cypress.$("#fecha_devolucion_mes").find("option:selected").text();
            let year=Cypress.$("#fecha_devolucion_ano").find("option:selected").text();
            if(day==="dd" || month==="mm" || year==="aaaa") {
                cy.get("input[name='licencia_cdmx']").check();
            }
            if(Cypress.$("#img_1").attr("src")==="/images/imageFront.jpg") {
                this.tomarFoto("#divImageFront a");
            }
            if(Cypress.$("#img_2").attr("src")==="/images/imageBack.jpg") {
                this.tomarFoto("#divImageRear a");
            }
        });
        cy.get("#buttonDatosConductorPrincipal").click();
    }
    hackBS=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql="SELECT COUNT(TRE.REE_CODEXT) FROM TRCB_RESERVA_EXTRA TRE,TRCB_RESERVA TR "+
            "WHERE TRE.REE_CODRES=TR.RES_CODRES "+
            "AND TR.RES_LOCRES='"+json.booking+"' "+
            "AND TRE.REE_CODEXT='BS'";
            cy.task("sqlQuery",sql).then(query=> {
                if(query.rows[0][0]>0) {
                    //Conductor adicional
                    this.validarSitio("/Apertura/Driver/DatosConductorPrincipal");
                    this.datosConductor();
                }
            });
        });
    }
    validarDatosCliente=()=> {
        cy.get("#sendValitationPage").click();
        cy.get("#agentePassword").type(localStorage.getItem("password"));
        cy.get("#aceptar_Authorization").click();
    }
    cartaDeAceptacion=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql1="SELECT RES_CODRES,RES_ESTDIU FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql1).then(query1=> {
                let sql2="SELECT (SELECT RES_ESTDIU FROM TRCB_RESERVA WHERE RES_REFRES='"+query1.rows[0][0]+"' AND RES_FLGTIP='T' AND RES_FLGEST='A') - "+query1.rows[0][1]+" DIF FROM DUAL";
                cy.task("sqlQuery",sql2).then(query2=> {
                    if(query2.rows[0][0]>0) {
                        //Carta de aceptación de garantías
                        this.validarSitio("/Apertura/Documentation/AcceptanceCoverages");
                        cy.get("#formAcceptanceCoverages").then(form=> {
                            let listCoverages=form.find(".row>.col-lg-12>.row>.col-lg-6:eq(0) [data-toggle='modal']");
                            if(listCoverages.length>0) {
                                for(let i=0;i<listCoverages.length;i++) {
                                    let dataModal=Cypress.$(listCoverages).eq(i).data("target").split("#");
                                    Cypress.$(listCoverages).eq(i).click();
                                    cy.wait(2000).then(()=> {
                                        cy.get("#"+dataModal[1]+" .canvas-signature").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2,{force: true}));
                                        cy.get("#"+dataModal[1]).contains("Aceptar").click();
                                    });
                                }
                            }
                        });
                        cy.get("input[name='reasons[5]']").check();
                        cy.get("#btnSignatureAcceptanceCoverage").click();
                        cy.get("#signature-acceptance-coverage").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2,{force: true}));
                        cy.get("#modalSignatureAcceptanceCoverage").contains("Aceptar").click();
                        cy.get("#btnFormAcceptanceCoverage").click();
                    }
                });
            });
        });
    }
    aceptarClausurasPagos=()=> {
        cy.get("#main-container").then(container=> {
            if(container.find("[data-target='#modalSignaturePaymentWeb']").length>0) {
                cy.get("[data-target='#modalSignaturePaymentWeb']").click();
                cy.get("#signature-payment-web").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
                cy.get("#modalSignaturePaymentWeb").contains(config.openContract.changeLanguage ? "Accept" : "Aceptar").click();
            }
            if(container.find("[data-target='#modalResposibility']").length>0) {
                cy.get("[data-target='#modalResposibility']").click();
                cy.get("#signature-responsability").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
                cy.get("#modalResposibility").contains(config.openContract.changeLanguage ? "Accept" : "Aceptar").click();
            }
            cy.get("input[name='acceptClausulas']").check();
            cy.get("input[name='acceptExtras']").check();
            if(container.find("input[name='acceptVLF']").length>0) {
                cy.get("input[name='acceptVLF']").check();
            }
            if(container.find("input[name='PlacasCR']").length>0) {
                cy.get("input[name='PlacasCR']").check();
            }
            cy.get("#btnSignatureClausulas").click();
            cy.get("#signature-clauses-extras").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
            cy.get("#modalSignatureClausulas").contains(config.openContract.changeLanguage ? "Accept" : "Aceptar").click();
            if(container.find("[data-target='#modalSignatureVLF']").length>0) {
                cy.get("[data-target='#modalSignatureVLF']").click();
                cy.get("#signature-VLF-extras").then(canvas=> cy.wrap(canvas).scrollIntoView().click(canvas.width/2,canvas.height/2));
                cy.get("#modalSignatureVLF").contains(config.openContract.changeLanguage ? "Accept" : "Aceptar").click();
            }
            cy.get("[data-target='#modalSignatureContract']").click();
            cy.get("#signature-contract").then(canvas=> cy.wrap(canvas).scrollIntoView().click((canvas.width/2,canvas.height/2),{force: true}));
            cy.get("#modalSignatureContract").contains(config.openContract.changeLanguage ? "Accept" : "Aceptar").click();
        });
        cy.get("#btnSubmitContentSignature").click({force: true});
        /*cy.get("#agentePassword").type(localStorage.getItem("password"));
        cy.get("#aceptar_Authorization").click();*/
    }
    elegirContrato=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql="SELECT RES_CHKGAP,RES_CODEMP FROM TRCB_RESERVA WHERE RES_LOCRES='"+json.booking+"'";
            cy.task("sqlQuery",sql).then(query=> {
                if(query.rows[0][0]==="S" && query.rows[0][0]!==1) {
                    //Menú
                    this.validarSitio("/Apertura/Menu");
                    cy.get("#ModalError").contains(config.openContract.changeLanguage ? "Cancel" : "Cancelar").click();
                    cy.get("a[href='Car/ContractPrintChoose']").click();
                    //Contrato digital
                    this.validarSitio("/Apertura/Car/ContractPrintChoose");
                    cy.get("#DigitalContract").click();
                    //Garantia
                    this.validarSitio("/Apertura/Payment/GarantizarRentaAuto");
                    cy.get("a[href='/Apertura/Menu#!']").click();
                    //Menú
                    this.validarSitio("/Apertura/Menu");
                    cy.get("a[href='Contract/Contrato']").click();
                }
            });
        });
    }
    /*guardarContrato=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            cy.get("#contractBookingNumber").then(p=> {
                json.contract=p.text();
                cy.writeFile(Cypress.env("dataBooking"),json);
            });
        });
        cy.get("#sendSignatureContract").click();
    }*/
    cambiarIdioma=()=> {
        if(config.openContract.changeLanguage) {
            cy.wait(2000).then(()=> {
                cy.get("nav #idiomas").then(languages=> {
                    cy.wrap(languages).click();
                    cy.wrap(languages).find("[data-idioma='US']").click();
                });
            });
            //Iniciar apertura
            cy.wait(2000).then(()=> this.validarSitio("/Apertura/Counter/Employeetakesturn"));
        }
    }
    imprimirContrato=()=> {
        cy.wait(2000).then(()=> {
            cy.get("nav #perfil").then(profile=> {
                cy.wrap(profile).click();
                cy.wrap(profile).find("a[href='/Apertura/Contract/ContractPrint']").click();
            });
        });
    }
    localizarContrato=()=> {
        cy.readFile(Cypress.env("dataBooking")).then(json=> {
            let sql="SELECT RES_LOCRES FROM TRCB_RESERVA "+
            "WHERE RES_REFRES=(SELECT RES_CODRES FROM TRCB_RESERVA "+
            "WHERE RES_LOCRES='"+json.booking+"') "+
            "AND RES_FLGTIP='A'";
            cy.task("sqlQuery",sql).then(query=> {
                cy.get("#bookingNumber").type(query.rows[0][0]);
            });
        });
        cy.get("button").contains(config.openContract.changeLanguage ? "Print" : "Imprimir").click();
    }
    tomarCaptura=()=> cy.screenshot(Math.round(new Date().getTime()/1000).toString());
}

export default new OpenContract();