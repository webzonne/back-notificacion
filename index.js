require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user:process.env.USER,
    password: process.env.MYSQL_PASSWORD,
    database:process.env.MYSQL_DATABASE
});

db.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos: ', err);
    } else {
      console.log('Conexión exitosa a la base de datos MySQL');
    }
  });


const port = 5000

app.use(cors());

app.listen(port, ()=>{
    console.log('servidor encendido en el puerto 5000')
})

app.use(express.json())

const notificaciones = [
    {id:1, usuario: 'Jorge', nota:'hola'},
    {id:2, usuario: 'Carlos', nota:'buenas'},
    {id:3, usuario: 'Maria', nota:'saludos'},
    {id:4, usuario: 'Ana', nota:'estas bien'}
]

// DEFAULT
app.get('/', (req, res)=>{
    res.send('SISTEMA DE NOTIFICACION')
})

app.get('/db', (req, res) => {
    db.query('SELECT * FROM notas', (err, results) => {
      if (err) {
        console.error('Error al consultar la base de datos: ', err);
        res.status(500).json({ error: 'Error al consultar la base de datos' });
      } else {
        res.json(results);
      }
    });
  });

// AGREGAR NOTIFICACION A LA BASE DE DATOS
app.post('/db', (req, res) => {
    if (!req.body.usuario || !req.body.nota) {
        res.status(400).json({ error: 'Falta el nombre de usuario o la notificación' });
    } else {
        const nuevaNotificacion = {
            usuario: req.body.usuario,
            nota: req.body.nota,
        };

        // Insertar la nueva notificación en la base de datos
        db.query('INSERT INTO notas (usuario, nota) VALUES (?, ?)', [nuevaNotificacion.usuario, nuevaNotificacion.nota], (err, results) => {
            if (err) {
                console.error('Error al insertar la notificación en la base de datos: ', err);
                res.status(500).json({ error: 'Error al insertar la notificación en la base de datos' });
            } else {
                // Devolver la nueva notificación con su ID asignado por la base de datos
                const notificacionInsertada = {
                    id: results.insertId,
                    usuario: nuevaNotificacion.usuario,
                    nota: nuevaNotificacion.nota,
                };
                notificaciones.push(notificacionInsertada);
                res.status(201).json(notificacionInsertada);
            }
        });
    }
});

// VER TODAS LAS NOTIFICACIONES
app.get('/notificaciones', (req, res)=>{
    res.send(notificaciones)
})


// AGREGAR NOTIFICACION
app.post('/notificacion', (req, res) => {
    if (!req.body.usuario || !req.body.nota) {
        res.status(400).json({ error: 'Falta el nombre de usuario o la notificacion' });
    } else {
        const notificacion = {
            id: notificaciones.length + 1,
            usuario: req.body.usuario,
            nota: req.body.nota,
        }
        notificaciones.push(notificacion);
        res.status(201).json(notificaciones);
    }
  
});

// BUSCAR NOTIFICACION
app.get('/notificacion/:id', (req, res)=>{
    const nota = notificaciones.find((s)=> s.id === parseInt(req.params.id));
    if(!nota) return res.status(404).send('notificacion no encontrada')
    else res.send(nota);
})



