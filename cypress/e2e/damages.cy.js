/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import Damages from "../support/Damages";
describe("Damages",()=> {
    let environment=config.environment;
    it.skip("Ver cuadre/autocajón/daños de auto",()=> {
        //Iniciar sesión
        Damages.login(environment,false);
        //Seleccionar oficina
        Damages.validarSitio("/Danos/Office");
        cy.wait(2000).then(()=> Damages.sala());
        //Opciones
        Damages.validarSitio("/Danos/Dashboard");
        if(config.viewDamages>=1 && config.viewDamages<=3) {
            cy.get("img[src='/images/ic-"+(config.viewDamages==1 ? "cajon" : config.viewDamages==2 ? "cuadre" : "daño-veh")+".png']").click();
            //Asignar auto
            Damages.validarSitio("/Danos/Dashboard/datosAuto");
            cy.wait(2000).then(()=> Damages.datosAuto());
            //Entrada
            Damages.validarSitio("/Danos/Dashboard/entrada");
            Damages.entrada(environment);
            if(config.viewDamages===1) {
                //Revisión equipamiento
                Damages.validarSitio("/Danos/Dashboard/revisionEquipamiento");
                Damages.revisionEquipamiento();
                //Fotos unidad
                Damages.validarSitio("/Danos/Dashboard/fotosEquipamiento");
                cy.wait(4000).then(()=> Damages.fotosEquipamiento()); //Error plugin
            }
            else if(config.viewDamages===2) {
                //Asignación
                cy.wait(8000).then(()=> Damages.validarSitio("/Danos/Dashboard/asignacion"));
                cy.get(".content_pago_exitoso").contains("SALIR").click();
            }
            else {
                //Firma cliente
                Damages.validarSitio("/Danos/Dashboard/firmaCliente");
                Damages.firmaCliente();
                //Daño actualizado exitoso
                cy.wait(8000).then(()=> Damages.validarSitio("/Danos/Dashboard/asignacion"));
                cy.get(".content_pago_exitoso").contains("SALIR").click();
            }
        }
        else {
            throw new Error("Opción no disponible");
        }
    });
    it.skip("Ver estacionamiento",()=> {
        //Iniciar sesión
        Damages.login(environment,false);
        //Seleccionar oficina
        Damages.validarSitio("/Danos/Office");
        cy.wait(2000).then(()=> Damages.sala());
        //Opciones
        Damages.validarSitio("/Danos/Dashboard");
        cy.get("img[src='/images/ico_watch_parking.png']").click();
        //Asignar auto
        Damages.validarSitio("/Danos/Dashboard/drawers");
        Damages.verEstacionamiento();
    });
    it("Asignar auto a reserva",()=> {
        //Iniciar sesión
        Damages.login(environment,true);
        //Seleccionar oficina
        Damages.validarSitio("/Danos/Office");
        cy.wait(2000).then(()=> Damages.sala());
        //Opciones
        Damages.validarSitio("/Danos/Dashboard");
        cy.get("a[href='/Danos/AssignCar/ReservationList']",{timeout: 2000}).click();
        //Asignar auto
        Damages.validarSitio("/Danos/AssignCar/ReservationList");
        Damages.asignarAuto();
    });
    it.skip("Intercambiar auto a reserva",()=> {
        //Iniciar sesión
        Damages.login(environment,true);
        //Seleccionar oficina
        Damages.validarSitio("/Danos/Office");
        cy.wait(2000).then(()=> Damages.sala());
        //Opciones
        Damages.validarSitio("/Danos/Dashboard");
        cy.get("a[href='/Danos/Dashboard/intercambioAuto']").click();
        //Intercambio de auto
        Damages.validarSitio("/Danos/Dashboard/intercambioAuto");
        cy.wait(2000).then(()=> Damages.intercambiarAuto());
        //Intercambio exitoso
        cy.wait(8000).then(()=> Damages.validarSitio("/Danos/Dashboard/intercambioAutoExitoso"));
        cy.get("a[href='/Danos/Dashboard']").click();
    });
});