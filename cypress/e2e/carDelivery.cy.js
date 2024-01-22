/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import CarDelivery from "../support/CarDelivery";
describe("Car Delivery",()=> {
    it("Entregar auto",()=> {
        let environment=config.environment;
        //Iniciar sesión
        CarDelivery.login(environment);
        //Opciones
        CarDelivery.validarSitio("/Delivery/Dashboard/");
        cy.get(".cuadro_entrega_devolucion",{timeout: 2000}).click();
        //Datos del auto
        CarDelivery.validarSitio("/Delivery/Dashboard/datosAuto");
        CarDelivery.datosAuto();
        //Entrada
        cy.wait(16000).then(()=> CarDelivery.validarSitio("/Delivery/Dashboard/entrada"));
        CarDelivery.entrada();
        //Revisión equipamiento
        cy.wait(4000).then(()=> CarDelivery.validarSitio("/Delivery/Dashboard/revisionEquipamiento"));
        CarDelivery.revisionEquipamiento();
        //Asignación exitosa
        cy.wait(8000).then(()=> CarDelivery.validarSitio("/Delivery/Dashboard/asignacionExitosa"));
        cy.get(".content_pago_exitoso").contains("Salir").click();
    });
});