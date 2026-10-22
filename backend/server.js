const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos MariaDB / MySQL de XAMPP
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Dejar vacío según la configuración de phpMyAdmin
    database: 'comida_pedidos'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos MariaDB (comida_pedidos)');
    }
});

// --- RUTAS DE LA API ---

// 1. Obtener lista de empresas
app.get('/api/empresas', (req, res) => {
    db.query('SELECT * FROM empresas', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Obtener menús por ID de empresa
app.get('/api/menus/:empresa_id', (req, res) => {
    const { empresa_id } = req.params;
    db.query('SELECT * FROM menus WHERE empresa_id = ?', [empresa_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Registrar un nuevo pedido
app.post('/api/pedidos', (req, res) => {
    const { usuario_id, empresa_id, horario_recogida, total } = req.body;
    const query = 'INSERT INTO pedidos (usuario_id, empresa_id, horario_recogida, total) VALUES (?, ?, ?, ?)';
    
    db.query(query, [usuario_id || 1, empresa_id, horario_recogida, total], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Pedido realizado con éxito', pedidoId: result.insertId });
    });
});

// 4. Iniciar sesión de usuarios (Validación de rol ADMIN o CLIENTE)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT id, nombre, email, rol FROM usuarios WHERE email = ? AND password = ?';
    
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ exito: true, usuario: results[0] });
        } else {
            res.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas' });
        }
    });
});

// 5. Registrar un error del sistema (Módulo del Administrador)
app.post('/api/errores', (req, res) => {
    const { descripcion_error, ruta } = req.body;
    const query = 'INSERT INTO registros_errores (descripcion_error, ruta) VALUES (?, ?)';
    
    db.query(query, [descripcion_error, ruta], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Error registrado' });
    });
});

// Puerto del servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor Backend ejecutándose en http://localhost:${PORT}`);
});