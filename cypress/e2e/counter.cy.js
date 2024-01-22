/// <reference types="cypress" />
import {default as config} from "../fixtures/Config.json";
import Counter from "../support/Counter";
describe("Counter",()=> {
    let environment=config.environment;
    it.skip("Buscar reservación por apellido/reservación o búsqueda avanzada",()=> {
        //Iniciar sesión
        Counter.login(environment,false);
        //Seleccionar sala
        Counter.validarSitio("/Salas/Dashboard/");
        cy.wait(2000).then(()=> Counter.sala());
        //Opciones
        Counter.validarSitio("/Salas/Dashboard/Options");
        cy.get("a[href='/Salas/Dashboard/Search']").click();
        //Localizar la reservación
        Counter.validarSitio("/Salas/Dashboard/Search");
        if(config.counter.search.simpleSearch) {
            Counter.buscar(config.counter.search.options.searchBooking);
            //Lista de reservas
            Counter.opcionListaReserva(config.counter.search.options.searchBooking);
        }
        else {
            cy.get("a[href='/Salas/Dashboard/AdvancedSearch']").click();
            //Lista de reservas
            Counter.validarSitio("/Salas/Dashboard/AdvancedSearch");
            Counter.busquedaAvanzada(config.counter.search.options.idAdvancedSearch);
        }
    });
    it("Crear Walking/Local",()=> {
        //Iniciar sesión
        Counter.login(environment,false);
        //Seleccionar sala
        Counter.validarSitio("/Salas/Dashboard/");
        cy.wait(2000).then(()=> Counter.sala());
        //Opciones
        Counter.validarSitio("/Salas/Dashboard/Options");
        let local=!config.counter.booking.useLocal ? "SetRentalDays" : "createReservationLog";
        cy.get("a[href='/Salas/Dashboard/"+local+"']").click();
        //Dias de renta
        Counter.opcionRenta(local);
        //Seleccionar auto
        cy.wait(4000).then(()=> Counter.validarSitio("/Salas/Dashboard/SelectCar"));
        Counter.seleccionarAuto();
        //Reservación Walking
        cy.wait(2000).then(()=> Counter.validarSitio("/Salas/Dashboard/Reservation"));
        Counter.reservacionWalking();
        //Extras
        cy.wait(2000).then(()=> Counter.seleccionarExtras(config.counter.booking.useLocal));
        //Guardar reservación
        cy.wait(8000).then(()=> Counter.validarSitio("/Salas/Dashboard/ShowCompleteBooking"));
        Counter.guardarReservacion();
    });
    it.skip("Ver voucher",()=> {
        //Iniciar sesión
        Counter.login(environment,true);
        //Seleccionar sala
        Counter.validarSitio("/Salas/Dashboard/");
        cy.wait(2000).then(()=> Counter.sala());
        //Opciones
        Counter.validarSitio("/Salas/Dashboard/Options");
        Counter.verVoucher();
        //Localizar la Walking
        Counter.validarSitio("/Salas/Dashboard/SearchVoucher");
        Counter.localizarWalking();
    });
});