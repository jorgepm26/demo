/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import CloseContract from "../support/CloseContract";
describe("Close Contract",()=> {
    let environment=config.environment;
    it("Cerrar contracto a reserva",()=> {
        //Iniciar sesión
        CloseContract.login(environment);
        //Seleccionar sala
        CloseContract.validarSitio("/Devolucion/Office");
        cy.wait(2000).then(()=> CloseContract.sala());
        //Opciones
        CloseContract.validarSitio("/Devolucion/Dashboard");
        cy.get("#initProcess",{timeout: 2000}).click();
        //Datos del auto
        CloseContract.validarSitio("/Devolucion/Dashboard/datosAuto");
        CloseContract.datosAuto();
        //Información del cliente
        cy.wait(4000).then(()=> CloseContract.validarSitio("/Devolucion/Dashboard/clientInfo"));
        cy.get("#btnVerify").click();
        //Verificación
        CloseContract.validarSitio("/Devolucion/Dashboard/verificacion");
        cy.wait(2000).then(()=> CloseContract.verificacion());
        //Babyseat (Si aplica)
        cy.wait(2000).then(()=> CloseContract.babyseat());
        //Entrada
        cy.wait(2000).then(()=> CloseContract.validarSitio("/Devolucion/Dashboard/entrada"));
        CloseContract.entrada(config.closeContract.skipOutputPhotos);
        //Encuesta
        cy.wait(48000).then(()=> CloseContract.validarSitio("/Devolucion/Dashboard/encuesta"));
        CloseContract.encuesta();
        //Condiciones
        CloseContract.validarSitio("/Devolucion/Dashboard/car_terms");
        CloseContract.condiciones();
        //Resumen
        cy.wait(16000).then(()=> CloseContract.validarSitio("/Devolucion/Dashboard/resumen"));
        cy.get("#btnEncuesta").click()
        //Cierre
        CloseContract.validarSitio("/Devolucion/Dashboard/cierre");
        cy.wait(2000).then(()=> CloseContract.cierre());
        //Formas de pago
        CloseContract.validarSitio("/Devolucion/Dashboard/formasPago");
        cy.wait(16000).then(()=> CloseContract.formaPago(config.closeContract.skipPayment,environment));
        //Requiere factura
        CloseContract.validarSitio("/Devolucion/Dashboard/factura");
        cy.wait(4000).then(()=> CloseContract.factura());
        //Factura
        CloseContract.validarSitio("/Devolucion/Dashboard/invoicePosibilities");
        cy.wait(2000).then(()=> cy.get("a button").contains("Continuar").click());
        //Firma cliente
        CloseContract.validarSitio("/Devolucion/Dashboard/firmaCliente");
        CloseContract.firmaCliente();
        //Terminado
        cy.wait(8000).then(()=> CloseContract.validarSitio("/Devolucion/Dashboard/terminado"));
        cy.get("a button").contains("Salir").click();
    });
});