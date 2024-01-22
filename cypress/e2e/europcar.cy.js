/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import Europcar from "../support/Europcar";
describe("Europcar MX",()=> {
    let environment=config.environment;
    it("Crear Reserva Web - Invitados",()=> {
        //Iniciar
        Europcar.iniciar(false,environment);
        //Seleccionar auto
        Europcar.validarSitio("/seleccion.php");
        Europcar.seleccionarAuto();
        //Seleccionar extras
        Europcar.validarSitio("/seleccionExtras.php");
        cy.get("#fixPrecio .fixPrecioMovil").click();
        //Complete su información - Información del conductor
        Europcar.validarSitio("/datos.php");
        cy.wait(8000).then(()=> Europcar.completarInformacionConductor(false));
        //Complete su información - Forma de pago
        Europcar.validarSitio("/pago.php");
        Europcar.completarInformacionPago();
        //Gauardar reservación
        Europcar.validarSitio("/confirmacion.php");
        Europcar.guardarReservacion();
    });
    it.skip("Crear Reserva Web - Cliente lealtad",()=> {
        //Menú CheckIn Online
        Europcar.menuCIO(environment);
        //Login CheckIn Online
        Europcar.validarSitio("/Europcar/Login");
        Europcar.loginCIO(true);
        //Dashboard cliente lealtad
        Europcar.validarSitio("/Europcar/Privileges/");
        cy.get("a[href='/Europcar/Privileges/createReservation']").click();
        //Iniciar
        Europcar.iniciar(true);
        //Seleccionar auto
        Europcar.validarSitio("/seleccion.php");
        Europcar.seleccionarAuto();
        //Seleccionar extras
        Europcar.validarSitio("/seleccionExtras.php");
        cy.get("#fixPrecio .fixPrecioMovil").click();
        //Complete su información - Información del conductor
        Europcar.validarSitio("/datos.php");
        cy.wait(8000).then(()=> Europcar.completarInformacionConductor(true));
        //Complete su información - Forma de pago
        Europcar.validarSitio("/pago.php");
        Europcar.completarInformacionPago();
        //Gauardar reservación
        Europcar.validarSitio("/confirmacion.php");
        Europcar.guardarReservacion();
    });
    it.skip("Actualizar PQ Reserva Web - Invitados",()=> {
        //Menú CheckIn Online
        Europcar.menuCIO(environment);
        //Login CheckIn Online
        Europcar.validarSitio("/Europcar/Login");
        Europcar.loginCIO(false);
        //Indice de reserva
        Europcar.validarSitio("/Europcar/CheckInOnline/Index/1");
        cy.get("a[href='/Europcar/Insurances/index/1']").click();
        //Coberturas/Extras
        Europcar.validarSitio("/Europcar/Insurances/index/1");
        Europcar.actualizarPQ(false);
    });
    it.skip("Actualizar PQ Reserva Web - Cliente lealtad",()=> {
        //Menú CheckIn Online
        Europcar.menuCIO(environment);
        //Login CheckIn Online
        Europcar.validarSitio("/Europcar/Login");
        Europcar.loginCIO(true);
        //Dashboard cliente lealtad
        Europcar.validarSitio("/Europcar/Privileges/");
        Europcar.buscarReserva(1);
        //Coberturas/Extras
        Europcar.validarSitio("/Europcar/Insurances/");
        Europcar.actualizarPQ(true);
        //Dashboard cliente lealtad
        Europcar.validarSitio("/Europcar/Privileges");
    });
    it.skip("Modificar Reserva Web - Invitados",()=> {
        //Menú CheckIn Online
        Europcar.menuCIO(environment);
        //Login CheckIn Online
        Europcar.validarSitio("/Europcar/Login");
        Europcar.loginCIO(false);
        //Indice de reserva
        Europcar.validarSitio("/Europcar/CheckInOnline/Index/1");
        cy.get("a[href='/Europcar/Modificar']").click();
        //Modificar por Fecha/Oficina/Auto
        Europcar.validarSitio("/Europcar/Modificar");
        Europcar.modificarCIO();
        //Datos de pago
        cy.wait(8000).then(()=> Europcar.validarSitio("/Europcar/Insurances/DataPayment"));
        Europcar.datosPago();
        //Sé cliente frecuente
        Europcar.validarSitio("/Europcar/CheckInOnline/BePrivilege");
        cy.get("section a[href='/Europcar/Insurances/SuccessPayment']").click();
        //Pago aplicado
        Europcar.validarSitio("/Europcar/Insurances/SuccessPayment");
        cy.get(".success-payment a[href='/Europcar/CheckInOnline/Index']").click();
        //Indice de reserva
        Europcar.validarSitio("/Europcar/CheckInOnline/Index");
    });
    it.skip("Modificar Reserva Web - Cliente lealtad",()=> {
        //Menú CheckIn Online
        Europcar.menuCIO(environment);
        //Login CheckIn Online
        Europcar.validarSitio("/Europcar/Login");
        Europcar.loginCIO(true);
        //Dashboard cliente lealtad
        Europcar.validarSitio("/Europcar/Privileges/");
        Europcar.buscarReserva(2);
        //Modificar por Fecha/Oficina/Auto
        Europcar.validarSitio("/Europcar/Modificar/");
        Europcar.modificarCIO();
        //Datos de pago
        cy.wait(8000).then(()=> Europcar.validarSitio("/Europcar/Insurances/DataPayment"));
        Europcar.datosPago();
        //Pago aplicado
        Europcar.validarSitio("/Europcar/Insurances/SuccessPayment");
        cy.get(".success-payment a[href='/Europcar/Privileges']").click();
        //Dashboard cliente lealtad
        Europcar.validarSitio("/Europcar/Privileges");
    });
    it.skip("Realizar CIO Reserva Web - Invitados",()=> {
        //Menú CheckIn Online
        Europcar.menuCIO(environment);
        //Login CheckIn Online
        Europcar.validarSitio("/Europcar/Login");
        Europcar.loginCIO(false);
        //Indice de reserva
        Europcar.validarSitio("/Europcar/CheckInOnline/Index/1");
        cy.get("#btn-checkin").click();
        //Bienvenidos CIO
        Europcar.validarSitio("/Europcar/CheckInOnline/InfoCheckIn");
        cy.get("#btn-finished").click();
        //Conductor principal
        Europcar.validarSitio("/Europcar/CheckInOnline/DriverData");
        Europcar.conductorPrincipal();
        //Identificación del titular
        Europcar.validarSitio("/Europcar/CheckInOnline/SelectIdentification");
        Europcar.seleccionarDocumento();
        //Titular de tarjeta de pago
        Europcar.validarSitio("/Europcar/CheckInOnline/IdentificationData");
        Europcar.titularPago();
        //Documentación correcto
        cy.wait(2000).then(()=> Europcar.validarSitio("/Europcar/CheckInOnline/AdminCheckIn"));
        cy.get("#btn-finished").click();
        //Extras
        Europcar.validarSitio("/Europcar/Insurances/");
        cy.get(".addPackagesGeneralSkipe").click();
        //Sé cliente frecuente
        Europcar.validarSitio("/Europcar/CheckInOnline/BePrivilege");
        cy.get("section a[href='/Europcar/Insurances/SuccessPayment']").click();
        //Pago aplicado
        Europcar.validarSitio("/Europcar/Insurances/SuccessPayment");
        cy.get(".success-payment a[href='/Europcar/CheckInOnline/Index']").click();
        //Indice de reserva
        Europcar.validarSitio("/Europcar/CheckInOnline/Index");
    });
});