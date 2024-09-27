// Variables globales
const apiUrl = 'search';
const resultadosPorPagina = 20;
const url = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
const maxPaginas = 20;
let paginaActual = 1;
let totalPaginas = 1;
let totalObjectIDs = [];
let objectIDsPaginaActual = [];


async function buscarObras(palabraClave = '', departamento = '', ubicacion = '') {
    const gifCargando = document.querySelector('.contenedor-loader');
    const textoCargando = document.querySelector('.cargando');

    // Mostrar el loader
    gifCargando.style.display = 'flex'; 
    textoCargando.style.display = 'flex'; 

    try {
        let url = 'search'; 

        if (palabraClave) {
            url += `?q=${encodeURIComponent(palabraClave)}`;
        } else {
            url += `?q=*`; 
        }

        if (departamento && departamento !== '0') {
            url += `&department=${departamento}`;
        }

        if (ubicacion) {
            url += `&geoLocation=${encodeURIComponent(ubicacion)}`;
        }

        const response = await fetch(url); 

        if (!response.ok) throw new Error('Error en la respuesta de la API');
        
        const data = await response.json();

        if (data.objectIDs && data.objectIDs.length > 0) {
            totalObjectIDs = data.objectIDs;
            totalPaginas = Math.ceil(totalObjectIDs.length / resultadosPorPagina);
            if (totalPaginas > maxPaginas) totalPaginas = maxPaginas;
            mostrarResultados();
            mostrarPaginacion();
        } else {
            mostrarMensaje('No se encontraron resultados.');
            ocultarPaginacion();
        }
    } catch (error) {
        console.error('Error al buscar obras:', error);
        mostrarMensaje('Hubo un problema al buscar las obras. Inténtalo de nuevo más tarde.');
        ocultarPaginacion();
    } finally {
        gifCargando.style.display = 'none';
        textoCargando.style.display = 'none';
    }
}

// Función para mostrar los resultados
async function mostrarResultados() {
    const contenedor = document.getElementById('resultados');
    contenedor.innerHTML = '';

    const startIndex = (paginaActual - 1) * resultadosPorPagina;
    const endIndex = startIndex + resultadosPorPagina;

    objectIDsPaginaActual = totalObjectIDs.slice(startIndex, Math.min(endIndex, totalObjectIDs.length));

    for (const id of objectIDsPaginaActual) {
        try {

            const response = await fetch(`/objects/${id}`);
            if (!response.ok) continue;

            const data = await response.json();

            const imagenUrl = data.primaryImageSmall || './sources/imgAlternativa.jpg';
            const titulo = 'Titulo: ' + (data.title || 'Sin título');
            const cultura = data.culture ? 'Cultura: ' + data.culture : 'Cultura: Sin Datos';
            const dinastia = data.dynasty ? 'Dinastia: ' + data.dynasty : 'Dinastia: Sin Datos';
            const fecha = data.objectDate ? 'Fecha: ' + data.objectDate : 'Fecha: Sin Datos';

            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta');

            tarjeta.innerHTML = `
                <div class="imagen-container" style="position: relative;">
                    <img src="${imagenUrl}" alt="${titulo}" style="max-width: 100%; height: auto;">
                    <div class="fecha" style="position: absolute; bottom: 0; background: rgba(0, 0, 0, 0.7); color: white; width: 100%; display: none; text-align: center;">${fecha}</div>
                </div>
                <div class="info">
                    <h3>${titulo}</h3>
                    <p class="cultura">${cultura}</p>
                    <p class="dinastia">${dinastia}</p>
                </div>
                ${data.additionalImages && data.additionalImages.length >= 2 ? '<button onclick="mostrarImagenesAdicionales(' + id + ')">Mostrar imágenes adicionales</button>' : ''}
            `;
            contenedor.appendChild(tarjeta);

            // Eventos para mostrar la fecha al pasar el mouse
            const imagenContainer = tarjeta.querySelector('.imagen-container');
            const fechaDiv = tarjeta.querySelector('.fecha');

            imagenContainer.addEventListener('mouseenter', () => {
                fechaDiv.style.display = 'block';
            });

            imagenContainer.addEventListener('mouseleave', () => {
                fechaDiv.style.display = 'none';
            });

        } catch (error) {
            console.error('Error al obtener datos del objeto con ID', id, error);
        }
    }

    // Verifica si hay menos de 20 objetos en la página
    if (objectIDsPaginaActual.length < resultadosPorPagina) {
        mostrarMensaje(`Mostrando ${objectIDsPaginaActual.length} objetos.`);
    }

    mostrarPaginacion();
}

// Función para mostrar la paginación
function mostrarPaginacion() {
    const contenedor = document.getElementById('paginacion');
    contenedor.innerHTML = ''; // Limpiar paginación previa

    const numPaginas = Math.min(totalPaginas, maxPaginas);
    for (let i = 1; i <= numPaginas; i++) {
        const paginaBoton = document.createElement('button');
        paginaBoton.textContent = i;

        // Añadir el evento de clic al botón
        paginaBoton.addEventListener('click', () => {
            paginaActual = i;
            mostrarResultados();
            mostrarPaginacion(); // Actualiza la paginación para reflejar el cambio de página
        });

        if (i === paginaActual) {
            paginaBoton.classList.add('active');
        }

        contenedor.appendChild(paginaBoton);
    }

    // Mostrar el contenedor de paginación
    contenedor.style.display = 'flex';
}

function ocultarPaginacion() {
    const contenedor = document.getElementById('paginacion');
    contenedor.style.display = 'none';
}
// Función para mostrar un mensaje
function mostrarMensaje(mensaje) {
    const contenedor = document.getElementById('resultados');
    contenedor.innerHTML = `<p>${mensaje}</p>`;
    mostrarPaginacion(); 
}
// Función para abrir una nueva pestaña con imágenes adicionales de una obra específica
// Función para abrir una nueva pestaña con imágenes adicionales de una obra específica
async function mostrarImagenesAdicionales(objectID) {
    try {
        // Obtener los datos de la obra específica
        const response = await fetch(`${url}/${objectID}`);
        const data = await response.json();

        if (!data.additionalImages || data.additionalImages.length < 2) {
            alert('No hay suficientes imágenes adicionales disponibles para esta obra.');
            return;
        }

        // Filtrar imágenes para asegurarse de que no se muestre la imagen principal
        const imagenesAdicionales = data.additionalImages.filter(imagen => imagen !== data.primaryImageSmall);

        if (imagenesAdicionales.length < 2) {
            alert('No hay suficientes imágenes adicionales disponibles para esta obra.');
            return;
        }

        // Abrir una nueva ventana o pestaña
        const nuevaVentana = window.open('', '_blank');

        // Crear el contenido HTML para la nueva ventana
        let contenidoHTML = `
            <html>
            <head>
                <title>Imágenes Adicionales</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                    .imagen { margin: 10px; display: inline-block; }
                    img { max-width: 200px; max-height: 200px; margin: 5px; }
                    .boton-volver { 
                        margin-top: 20px; 
                        padding: 10px 20px; 
                        background-color: #007bff; 
                        color: white; 
                        border: none; 
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                    }
                    .boton-volver:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <h1>Imágenes Adicionales</h1>
                <div id="imagenes">
        `;

        imagenesAdicionales.forEach(url => {
            contenidoHTML += `<div class="imagen"><img src="${url}" alt="Imagen adicional"></div>`;
        });

        contenidoHTML += `
                </div>
                <button class="boton-volver" onclick="window.close();">Volver al historial</button>
            </body>
            </html>
        `;

        // Escribir el contenido en la nueva ventana
        nuevaVentana.document.write(contenidoHTML);
        nuevaVentana.document.close();
    } catch (error) {
        console.error('Error al mostrar imágenes adicionales:', error);
    }
}


// Inicialización de la búsqueda y carga de departamentos
async function inicializar() {
    try {
        // Cargar todos los departamentos en el select
        const response = await fetch('departments');
        const dataDepartamentos = await response.json();
        console.log(dataDepartamentos);
        const selectDepartamento = document.getElementById('departamento');
        selectDepartamento.innerHTML = '<option value="0">Todos los departamentos</option>';

        dataDepartamentos.departments.forEach(departamento => {
            const option = document.createElement('option');
            option.value = departamento.departmentId;
            option.textContent = departamento.displayName;
            selectDepartamento.appendChild(option);
        });

        paginaActual = 1;
        await buscarObras(); 
    } catch (error) {
        console.error('Error al cargar los departamentos:', error);
    }
    ocultarPaginacion();
}

document.addEventListener('DOMContentLoaded', inicializar);

document.getElementById('buscarBtn').addEventListener('click', () => {
    const palabraClave = document.getElementById('palabraClave').value.trim();
    const departamento = document.getElementById('departamento').value;
    const ubicacion = document.getElementById('ubicacion').value.trim();

    if (!palabraClave && !departamento && !ubicacion !== 0) {
        paginaActual = 1; 
        buscarObras('', departamento); 
    } else if (!palabraClave && !ubicacion) {
        paginaActual = 1; 
        buscarObras('', departamento, ubicacion); 
    } else {
        paginaActual = 1; 
        buscarObras(palabraClave, departamento, ubicacion);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const imagenContainer = document.querySelector('.imagen-container');
    const fecha = document.querySelector('.fecha');

    imagenContainer.addEventListener('mouseenter', () => {
        fecha.style.display = 'block';
    });

    imagenContainer.addEventListener('mouseleave', () => {
        fecha.style.display = 'none';
    });
});
inicializar();