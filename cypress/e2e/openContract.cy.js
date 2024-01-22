/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import OpenContract from "../support/OpenContract";
describe("Open Contract",()=> {
    let environment=config.environment;
    beforeEach(()=> {
        //Iniciar sesión
        OpenContract.login(environment);
        //Oficina por región (Si aplica)
        cy.wait(2000).then(()=> OpenContract.oficinaPorRegion());
        //Seleccionar sala
        OpenContract.validarSitio("/Apertura/Counter");
        cy.wait(2000).then(()=> OpenContract.sala());
        //Iniciar apertura
        OpenContract.validarSitio("/Apertura/Counter/Employeetakesturn");
    });
    it("Aperturar contracto a reserva",()=> {
        cy.get("a[href='Language']").click();
        //Idioma
        OpenContract.validarSitio("/Apertura/Counter/Language");
        OpenContract.idioma();
        //Lista Reserva
        OpenContract.validarSitio("/Apertura/Counter/listaReservasOnline");
        OpenContract.listaReserva();
        //Omitir IsBiometrics
        cy.wait(32000).then(()=> OpenContract.validarSitio("/Apertura/Reservation/isbiometric"));
        OpenContract.omitirIsBiometrics(config.openContract.skipIsBiometrics,environment);
        //Datos de reservación
        OpenContract.validarSitio("/Apertura/Reservation/ReservarOnline");
        OpenContract.datosReservacion();
        //Upgrade
        OpenContract.validarSitio("/Apertura/Reservation/Upgrade");
        cy.get("a[href='DocumentosRequeridos']").click();
        //Documentos requeridos
        OpenContract.validarSitio("/Apertura/Reservation/DocumentosRequeridos");
        cy.get("#Button").click();
        //Asignar auto
        OpenContract.validarSitio("/Apertura/Reservation/AsignarAutoContrato");
        OpenContract.asignarAuto();
        //Coberturas
        cy.wait(4000).then(()=> OpenContract.validarSitio("/Apertura/Insurances/InsurancesIncluded"));
        cy.get("#btnSubmitInsurancesIncluded").click();
        //Paquetes
        OpenContract.validarSitio("/Apertura/Insurances/PackagesList");
        OpenContract.seleccionarPaquetes(environment);
        //Gasolina prepagada (Si aplica)
        OpenContract.gasolinaPrepagada();
        //Garantia
        OpenContract.validarSitio("/Apertura/Payment/GarantizarRentaAuto");
        OpenContract.garantizarAuto();
        //Otras formas de garantizar
        OpenContract.validarSitio("/Apertura/Payment/PagosOtros/1");
        OpenContract.pagoGarantia(config.openContract.flagPayWarranty);
        //Prepago con tarjeta (Si aplica)
        OpenContract.prepagoTarjeta();
        //Pago de adicionales
        OpenContract.validarSitio("/Apertura/Payment/PagoAdicionales");
        OpenContract.pagoAdicionales();
        //Otras formas de pago
        OpenContract.validarSitio("/Apertura/Payment/PagosOtros/2");
        OpenContract.pagoGarantia(config.openContract.flagPayComplement);
        //Desea facturar
        cy.wait(2000).then(()=> OpenContract.validarSitio("/Apertura/Invoicing/FacturarPago"));
        OpenContract.requiereFactura();
        //Ingresar identificación oficial
        OpenContract.validarSitio("/Apertura/Documentation/EstamosPorConcluir");
        cy.get("[data-id='1']").click();
        //Encuesta para afiliarse a cliente privilegio (Si aplica)
        OpenContract.esClientePrivilegio();
        //Documento identificación
        OpenContract.validarSitio("/Apertura/Documentation/DocumentoIdentificacion");
        cy.get("#setTypeDocument").click();
        //Verificar información (INE)
        OpenContract.validarSitio("/Apertura/Documentation/VerificarInformacionCorrecta");
        OpenContract.informacionINE();
        //Ingresar identificación oficial
        cy.wait(4000).then(()=> OpenContract.validarSitio("/Apertura/Documentation/EstamosPorConcluir"));
        OpenContract.identificacionPago();
        //Caso imprevisto
        OpenContract.validarSitio("/Apertura/Contract/CasoImprevisto");
        OpenContract.casoImprevisto();
        //Datos del conductor principal
        OpenContract.validarSitio("/Apertura/Driver/DatosConductorPrincipal");
        OpenContract.datosConductor();
        //Hack conductor adicional por BS (Se eliminará esta validación después de su corrección)
        OpenContract.hackBS();
        //Validar datos
        /*OpenContract.validarSitio("/Apertura/Driver/ValidateClientDatas");
        OpenContract.validarDatosCliente();*/
        //Carta de aceptación
        OpenContract.cartaDeAceptacion();
        //Coberturas, clausulas, pagos y transacciones
        OpenContract.validarSitio("/Apertura/Documentation/resumenSignature");
        OpenContract.aceptarClausurasPagos();
        //Seleccionar tipo de contrato en caso de gasolina prepagada (Si aplica)
        OpenContract.elegirContrato();
        //Guardar contrato
        OpenContract.validarSitio("/Apertura/Contract/Contrato");
        cy.get("#sendSignatureContract").click();
        //Confirmar correo
        OpenContract.validarSitio("/Apertura/Contract/EnviarInformacionReserva");
        cy.get("#btnSendMail").click();
        //Felicidades
        cy.wait(64000).then(()=> OpenContract.validarSitio("/Apertura/Contract/Felicidades"));
        cy.get("a[href='../']").click();
    });
    it.skip("Imprimir contrato",()=> {
        OpenContract.cambiarIdioma();
        OpenContract.imprimirContrato();
        //Impresión de contrato
        OpenContract.validarSitio("/Apertura/Contract/ContractPrint#!");
        OpenContract.localizarContrato();
    });
});