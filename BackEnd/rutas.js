const router = require('express').Router();
const { inicializar, buscarObras, traducir } = require('./app.js');
const url = 'https://collectionapi.metmuseum.org/public/collection/v1/';

router.get('/objects/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const obtener = (await import('node-fetch')).default;
    const respuesta = await obtener(`${url}objects/${id}`);
    const data = await respuesta.json();

    data.title = await traducir(data.title);
    data.culture = await traducir(data.culture);
    data.dynasty = await traducir(data.dynasty);
    data.objectDate	= await traducir(data.objectDate);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener o traducir datos:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

router.get('/departments', async (req, res) => {
    const departamentoss = await inicializar();
    res.json(departamentoss);
});

router.get('/search', async (req, res) => {
    const palabraClave = req.query.q;
    const departamentos = req.query.departamento;
    const ubicacion = req.query.ubicacion;
    const objetos = await buscarObras(palabraClave, departamentos, ubicacion);
    res.json(objetos);
});

module.exports = router;