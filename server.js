const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const rutas = require('./BackEnd/rutas');

app.use(express.json());

const loggerMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

// Usar el middleware antes de las rutas
app.use(loggerMiddleware);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});
app.use(rutas);
app.listen(port, () => {
    console.log(`Estamos Activo on http://localhost:${port}`);
})