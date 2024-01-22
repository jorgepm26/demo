module.exports=class Utility {
  obtenerUsuario=(environment)=> {
    switch(environment) {
      case "pp":
        return "ISCAR01"
      case "qa":
        return "ISCAR01"
    }
  }
  obtenerContrasena=(environment)=> {
    switch(environment) {
      case "pp":
        return "iscar01"
      case "qa":
        return "iscar01"
    }
  }
  cadenaConexion=(environment)=> {
    switch(environment) {
      case "pp":
        return "172.29.5.100/ORCL01"
      case "qa":
        return "172.27.5.100/ORCL01"
    }
  }
}