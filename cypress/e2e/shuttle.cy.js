/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import Shuttle from "../support/Shuttle";
describe("Shuttle",()=> {
    let environment=config.environment;
    it("Transportar pasajeros",()=> {
        //Iniciar sesión
        Shuttle.login(environment);
        //Seleccionar vehículo
        Shuttle.validarSitio("/Shuttle/Dashboard/");
        cy.wait(2000).then(()=> Shuttle.sala());
        //Transportar vehículo
        Shuttle.validarSitio("/Shuttle/Dashboard/ShowPassengers");
        Shuttle.transportarVehiculo();
    });
});