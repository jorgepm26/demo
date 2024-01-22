/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import TV from "../support/TV";
describe("TV",()=> {
    let environment=config.environment;
    it("Pantalla turnos",()=> {
        //Iniciar sesión
        TV.login(environment);
        //Seleccionar oficina
        TV.validarSitio("/Turnos/Dashboard/");
        cy.wait(2000).then(()=> TV.sala());
        //Iniciar turnos
        TV.validarSitio("/Turnos/Dashboard/Desktop");
        TV.iniciarTurnos();
    });
});