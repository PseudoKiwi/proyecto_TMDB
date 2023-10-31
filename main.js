// Importación de librería express y funciones
const express = require('express');
const funciones = require('./funciones.js');

// API Key a utilizar
const apiKey = "183112942a110588ed0841a673f2ceb3";

// Inicializo la aplicación
const app = express();

// Permito que la aplicación reciba solicitudes en formato JSON
app.use(express.json());

// Inicializo el token de sesion. Dejará de ser nulo cuando un usuario se autentique
var tokenDeSesion = '';

// ------------------------ GET ENDPOINTS ------------------------ //

// Solicitud GET para obtener favoritos del usuario autenticado
app.get('/favoritos', (req, res) => {

  // Desarmo la solicitud con los datos necesarios del request
  const email = req.body.email;

  // Llamo a la función de obtener favoritos y retorno al cliente la lista de JSON
  funciones.obtenerFavoritos(email, tokenDeSesion).then((favoritos, error) => {
    if (error) throw error;
    res.status(200).json(favoritos);
  }).catch(error => {
    res.status(403).json({ mensaje: error.message });
  });

});

// Solicitud GET para buscar peliculas
app.get('/buscar', (req, res) => {

  // Desarmo la solicitud con los datos necesarios del request
  const { email, keyword } = req.body;

  // Llamo a la función de busqueda y retorno al cliente la lista de JSON
  funciones.obtenerBusqueda(email, tokenDeSesion, apiKey, keyword).then((result, error) => {
    if (error) throw error;
    res.status(200).json(result);
  }).catch(error => {
    res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
  });

});

// ---------------------- FIN GET ENDPOINTS ---------------------- //

// ----------------------- POST ENDPOINTS ------------------------ //

// Solicitud POST para registrar un nuevo usuario
app.post('/registrar', (req, res) => {

  // Desarmo la solicitud con los datos necesarios del request
  const { email, firstName, lastName, password } = req.body;

  // Llamo a la función registrar con los datos necesarios
  funciones.registrar(email, firstName, lastName, password).then((resultado, error) => {
    if (error) throw error;
    res.status(200).json({ message: resultado});
  })
  .catch( error => {
    res.status(400).json({message:error.message});
  });

});

// Solicitud POST para autenticar a un usuario existente
app.post('/autenticar', (req, res) => {

  // Desarmo la solicitud con los datos necesarios del request
  const { email } = req.body;

  // Llamo a la función autenticar con el email del usuario y retorno el token a la aplicación cliente
  funciones.obtenerToken(email).then((resultado, error) => {
    if (error) throw error;
    tokenDeSesion = resultado;
    console.log(tokenDeSesion)
    res.status(200).json({ message: "Usuario autenticado" });
  }).catch(error => {
    res.status(400).json({message:error.message});
  });

});

// Solicitud POST para agregar una película favoritos del usuario autenticado
app.post('/agregarFavorito', async (req, res) => {
  
  // Desarmo la solicitud con los datos necesarios del request
  const { email, id } = req.body;
  
  // Llamo a la función agregarFavorito para agregar la película especificada a los favoritos del usuario
  funciones.agregarFavorito(email, tokenDeSesion, apiKey, id).then((error) => {
    if (error) throw error;
    res.status(200).json({ message: "Favorito correctamente ingresado"});
  }).catch(error => {
    res.status(500).json({ mensaje:error.message });
  });

});

// ---------------------- FIN POST ENDPOINTS --------------------- //

// Defino que la aplicación escuchará solicitudes del puerto 8081
const port = 8081;
app.listen(port, () => {
  console.log(`Servidor Express en ejecución en el puerto ${port}`);
});