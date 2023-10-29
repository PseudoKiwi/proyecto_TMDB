const express = require('express');
const app = express();
const funciones = require('./funciones.js');
const apiKey = "183112942a110588ed0841a673f2ceb3";

app.use(express.json());

app.get('/favoritos', async (req, res) => {
  try {
    const email = req.body.email;
    const token = req.headers.token;

    const favoritos = await funciones.obtenerFavoritos(email, token);
    res.json(favoritos);
  } catch (error) {
    res.status(403).json({ mensaje: 'Usuario no autenticado' });
  }
});

app.post('/registrar', (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    funciones.registrar(email, firstName, lastName, password);
    res.json({ mensaje: 'Solicitud POST recibida' });
  } catch (error) {
    res.status(400).end('Error al analizar los datos JSON');
  }
});

app.post('/autenticar', async (req, res) => {
  try {
    const email = req.body.email;
    const token = await funciones.autenticar(email);
    res.json({ mensaje: 'Solicitud POST recibida', token: token });
  } catch (error) {
    res.status(400).end('Error al analizar los datos JSON');
  }
});

app.post('/agregarFavorito', async (req, res) => {
  try {
    const { email, id } = req.body;
    const userToken = req.headers.token;
    await funciones.addFav(email, userToken, apiKey, id);
    res.json({ message: 'Favorito exitosamente agregado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
  }
});

app.get('/buscar', async (req, res) => {
  try {
    const keyword = req.body.keyword;
    const email = req.body.email;
    const userToken = req.headers.token;

    const result = await funciones.getSearch(email, userToken, apiKey, keyword);
    res.json(result);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la solicitud' });
  }
});

const port = 8081;
app.listen(port, () => {
  console.log(`Servidor Express en ejecución en el puerto ${port}`);
});