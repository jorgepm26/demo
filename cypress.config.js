const { defineConfig } = require("cypress");
const config=require("./cypress/fixtures/Config.json");
const Utility=require("./cypress/support/Utility");

module.exports = defineConfig({
  env: {
    db: {
      user: new Utility().obtenerUsuario(config.environment),
      password: new Utility().obtenerContrasena(config.environment),
      connectString: new Utility().cadenaConexion(config.environment)
    },
    dataBooking: "C://Users/Jorge Pat/data.json"
  },
  e2e: {
    setupNodeEvents(on,config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      let oracledb=require("oracledb");

      let queryData=async(config,query)=> {
        let conn;
        try {
          conn=await oracledb.getConnection(config);
          return await conn.execute(query);
        }
        catch(err) {
          console.error(err);
        }
        finally {
          if(conn) {
            try {
              await conn.close();
            }
            catch(err) {
              console.error(err);
            }
          }
        }
      };

      on("task", {
        sqlQuery: (query)=> {
          return queryData(config.env.db,query);
        }
      });
    },
    supportFile: false
  },
  pageLoadTimeout: 240000,
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    charts: true,
    embeddedScreenshots: true,
    ignoreVideos: true,
    inlineAssets: true,
    reportPageTitle: "Reporte de ejecución de test",
    saveAllAttempts: false
  },
  video: true
});