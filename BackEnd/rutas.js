const router = require('express').Router();
const { inicializar, buscarObras, traducir } = require('./app.js');
const url = 'https://collectionapi.metmuseum.org/public/collection/v1/';

router.get('/objects/:id', async (req, res) => {
  const { id: objetoId } = req.params;

  try {
    const obtener = (await import('node-fetch')).default;
    const respuesta = await obtener(`${url}objects/${objetoId}`);
    const data = await respuesta.json();

    const title = await traducir(data.title);
    const culture = await traducir(data.culture) || 'Sin Datos';
    const dynasty = await traducir(data.dynasty) || 'Sin Datos';
    
    console.log(title);
    res.json({ ...data, title, culture, dynasty });
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