# Automatización Europcar

## Componentes

Se compone de los siguientes entornos:
- [NodeJS] - Entorno de ejecución de scripts
- [Cypress] - Entorno testing E2E
- [OracleClient] - Cliente Oracle para conexión a BD

Al igual que los siguientes plugins contenidos en Cypress:
- [OracleDB] - Plugin de conexión a BD
- [Mochawesome] - Plugin reporteador

## Ejecución

Agregar la ruta de la carpeta principal de Node.js en Variable PATH del sistema  
Agregar la ruta de la carpeta principal del Cliente Oracle en Variable PATH del sistema  
Realizar la ejecución del proyecto con el comando:
```sh
npm run test
```
o la ejecución del proyecto con reporteador con el comando:
```sh
npm run html-report
```

## Contenido

Se compone de las siguientes aplicaciones:
- Counter
- TV
- Shuttle
- Damages
- OpenContract
- CarDelivery
- CloseContract
- Europcar Web/CIO

### Counter

| Test | Descripción |
| ------ | ------ |
| Buscar reservación por apellido/reservación | Realiza la búsqueda de reserva/reservas por apellido/reservación |
| Buscar reservación por búsqueda avanzada | Realiza la búsqueda de reserva/reservas en la sección de búsqueda avanzada por reserva, localizador externo, plaza, fecha, dias renta, todas, directas y externos |
| Crear Walking | Realiza el proceso de reservación tomando en cuenta oficina (No Aeropuerto/Aeropuerto), Tipo de moneda, Si requiere traslado, gas prepagado y babyseat |
| Crear Local | Parecido al anterior, con la diferencia que está configurado para reservación con una hora posterior al actual |
| Ver voucher | Realiza la búsqueda del voucher de la reserva |

### TV

Realiza la búsqueda del nombre de pasajero en lista de espera o en apertura de contrato

### Shuttle

Realiza la carga y descarga de clientes. Los prerrequisitos para su ejecución son:
- Oficina Checkin que cuente con vehículos para transportación (Ejemplo, Cancún Aeropuerto)
- Sala distinto a Checkin (Siempre y cuando cuente con oficinas secundarias en la misma ciudad)

### Damages

| Test | Descripción |
| ------ | ------ |
| Asignar auto a reserva | Realiza la asignación de auto con estatus DI a la reserva contenida en data.json |
| Cambiar auto a reserva | Realiza el cambio de auto con estatus DI al contrato contenido en data.json sin gasolina/con gasolina prepagada |
| Ver daños/cuadre de auto | Realiza la revisión de auto ya sea por auto encajonado, cuadre del auto o por daños según la necesidad del auxiliar |
| Estacionamiento | Filtra los autos que se encuentran en estacionamiento |

### OpenContract

| Test | Descripción |
| ------ | ------ |
| Asignar contracto a reserva | Realiza la asignación contrato a la reserva contenida en data.json por: moneda, selección de PQ, selección de cobertura adicional (Oficina Aeropuerto y cobertura WCDW seleccionado en sala) y tipo de pago de garantia (Forzado y Efectivo) |
| Imprimir contrato | Realiza la búsqueda del voucher del contrato |

### CarDelivery

Realiza la revisión del auto para entrega. El prerrequisito para su ejecución es:
- Contrato contenido en data.json

### CloseContract

Realiza el cierre de contrato con pago (Forzado y Efectivo), sin facturar. El prerrequisito para su ejecución es:
- Contrato contenido en data.json

### Europcar Web/CIO

| Test | Descripción |
| ------ | ------ |
| Crear reserva web (Invitados/Cliente lealtad) | Realiza el proceso de reservación tomando en cuenta si se trata de cliente invitado o si es lealtad |
| Actualizar paquete (Invitados/Cliente lealtad) | Realiza la actualización de paquete en caso de que el cliente requiera un paquete con mayores beneficios |
| Modificar reserva Web (Invitados/Cliente lealtad) | Realiza la actualización de reserva por fecha/oficina/auto paquete en caso de que el cliente requiera cambiar alguno de estos |
| Realizar CIO a reserva web (Invitados) | Realiza la actualización de datos a la reserva para el titular de la reserva y de pago |

[NodeJS]: <https://nodejs.org/es/>
[Cypress]: <https://www.cypress.io/>
[OracleClient]: <https://www.oracle.com/mx/database/technologies/instant-client/winx64-64-downloads.html>
[OracleDB]: <https://www.npmjs.com/package/oracledb>
[Mochawesome]: <https://www.npmjs.com/package/cypress-mochawesome-reporter>