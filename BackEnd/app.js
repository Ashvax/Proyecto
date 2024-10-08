const fetch = require('node-fetch'); 
const baseapi = 'https://collectionapi.metmuseum.org/public/collection/v1/';
const searchUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const translate = require('node-google-translate-skidz');

async function inicializar() {
    const response = await fetch(`${baseapi}departments`);
    const dataDepartamentos = await response.json();
    return dataDepartamentos;
}
async function buscarObras(palabraClave = '', departamento = '', ubicacion = '') {
    try {
        let url = `${searchUrl}`; 

        if (palabraClave) {
            url += `?q=${encodeURIComponent(palabraClave)}`;
        } else {
            url += `?q=*`; 
        }

        if (departamento && departamento !== '0') {
            url += `&departmentId=${departamento}`;
        }

        if (ubicacion) {
            url += `&geoLocation=${encodeURIComponent(ubicacion)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        const dataObras = await response.json();
        return dataObras;
    } catch (error) {
        console.error('Error al buscar obras:', error);
    }
}

async function traducir(texto, traducido = 'es') {
    if(!texto){
        return Promise.resolve('');
    }
    return new Promise((resolve, reject) => {
       translate(
        {
            text: texto,
            source : 'en',
            target : traducido,
        },
        (resultado ) => {
            if (resultado && resultado.translation) {
                resolve(resultado.translation);
        } else {
            reject(new Error('Error al traducir el texto'));
        }
        }
    );
    });
}
module.exports ={inicializar, buscarObras, traducir};