const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: "localhost", // Cambia esto si es diferente
  user: "root", // Tu usuario de MySQL
  password: "teal458", // Tu contraseña de MySQL
  database: "bddiggory", // Cambia esto por tu base de datos
});


db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos MySQL");
});

app.listen(3000, () => {
  console.log("Servidor iniciado en el puerto 3000");
});

// Endpoint para agregar un nuevo cliente
app.post("/clientes", (req, res) => {
  const { nombre, direccion, telefono, ciudad, idBarrio } = req.body;
  const query = "INSERT INTO cliente (nombre, direccion, telefono, ciudad, idBarrio) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [nombre, direccion, telefono, ciudad, idBarrio], (err, result) => {
    if (err) {
      console.error("Error al agregar el cliente:", err);
      res.status(500).send("Error al agregar el cliente");
    } else {
      res.send("Cliente agregado correctamente");
    }
  });
});


app.put("/clientes/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, direccion, telefono, ciudad, idBarrio } = req.body;
  const query = "UPDATE cliente SET nombre = ?, direccion = ?, telefono = ?, ciudad = ?, idBarrio = ? WHERE idCliente = ?";
  db.query(query, [nombre, direccion, telefono, ciudad, idBarrio, id], (err, result) => {
    if (err) {
      console.error("Error al actualizar el cliente:", err);
      res.status(500).send("Error al actualizar el cliente");
    } else {
      res.send("Cliente actualizado correctamente");
    }
  });
});

// Ruta para actualizar un pedido en el backend
app.put("/pedidos/:id", (req, res) => {
  const id = req.params.id;
  const { fechaPedido, estado, idRecorrido, idTipoPedido, idFormaPago, } = req.body;
  
  const query = `
      UPDATE pedido 
      SET fecha_de_pedido = ?, estado = ?, idRecorrido = ?, idTipo_de_pedido = ?, idForma_de_pago = ? 
      WHERE idPedido = ?
  `;
  
  db.query(query, [fechaPedido, estado, idRecorrido, idTipoPedido, idFormaPago, id], (err, result) => {
      if (err) {
          console.error("Error al actualizar el pedido:", err);
          res.status(500).send("Error al actualizar el pedido");
      } else {
          res.send("Pedido actualizado correctamente");
      }
  });
});


app.delete('/clientes/:id', (req, res) => {
  const idCliente = req.params.id;
  const query = `UPDATE cliente SET estado = 'inactivo' WHERE idCliente = ?`;

  db.query(query, [idCliente], (err, result) => {
      if (err) {
          console.error("Error al desactivar el cliente:", err);
          return res.status(500).send("Error al desactivar el cliente");
      }
      if (result.affectedRows === 0) {
          return res.status(404).send("Cliente no encontrado");
      }
      res.send("Cliente desactivado exitosamente");
  });
});



// Ruta para obtener todos los productos
app.get("/productos", (req, res) => {
  const query = "SELECT idProducto, nombre, precio_unitario FROM producto";
  db.query(query, (err, result) => {
      if (err) {
          console.error("Error al obtener los productos:", err);
          res.status(500).send("Error al obtener los productos");
      } else {
          res.json(result);
      }
  });
});


app.post('/guardar-pedidoxproductos', (req, res) => {
  const productosData = req.body; // Array de productos

  const query = `INSERT INTO pedidoxproductos (idPedido, idProducto, cantidad, precio) VALUES ?`;

  // Transformar los productos en un formato adecuado para la consulta
  const values = productosData.map(producto => [producto.idPedido, producto.idProducto, producto.cantidad, producto.precio]);

  db.query(query, [values], (err, result) => {
      if (err) {
          console.error("Error al guardar los productos:", err);
          return res.status(500).send("Error al guardar los productos");
      }
      res.json({ message: 'Productos guardados correctamente', result });
  });
});


// Ruta para obtener los productos de un pedido específico
app.get("/pedido/:idPedido/productos", function(req, res) {
  const idPedido = req.params.idPedido;

  const query = `
    SELECT p.idProducto, p.nombre, pxp.cantidad, pxp.precio
    FROM pedidoxproductos pxp
    JOIN producto p ON pxp.idProducto = p.idProducto
    WHERE pxp.idPedido = ?
  `;

  db.query(query, [idPedido], function(err, results) {
    if (err) {
      console.error("Error al obtener los productos del pedido:", err);
      res.status(500).json({ error: "Error al obtener los productos del pedido" });
      return;
    }
    res.json(results);
  });
});


app.get('/pedidos/:idPedido/productos', (req, res) => {
  const idPedido = req.params.idPedido;

  const query = `
      SELECT pp.idProducto, p.nombre, pp.cantidad, p.precio_unitario
      FROM pedidoxproductos AS pp
      INNER JOIN producto AS p ON pp.idProducto = p.idProducto
      WHERE pp.idPedido = ?;
  `;

  db.query(query, [idPedido], (error, results) => {
      if (error) {
          console.error('Error al obtener los productos del pedido:', error);
          res.status(500).send('Error al obtener los productos del pedido');
      } else {
          // Mapear resultados para incluir total calculado
          const productos = results.map(producto => ({
              idProducto: producto.idProducto,
              nombre: producto.nombre,
              cantidad: producto.cantidad,
              precio_unitario: producto.precio_unitario,
              total: producto.precio_unitario * producto.cantidad
          }));
          res.json(productos);
      }
  });
});




app.put("/pedidos/:idPedido/productos", (req, res) => {
  const idPedido = req.params.idPedido;
  const productos = req.body.productos; // Array de productos con idProducto, cantidad y precio

  // Borrar productos antiguos asociados al pedido
  const deleteQuery = `DELETE FROM pedidoxproductos WHERE idPedido = ?`;
  db.query(deleteQuery, [idPedido], (error, results) => {
      if (error) {
          console.error("Error al eliminar productos antiguos:", error);
          return res.status(500).send("Error al actualizar los productos del pedido.");
      }

      // Insertar productos nuevos
      const insertQuery = `INSERT INTO pedidoxproductos (idPedido, idProducto, cantidad, precio) VALUES ?`;
      const valores = productos.map((producto) => [
          idPedido,
          producto.idProducto,
          producto.cantidad,
          producto.precio,
      ]);

      db.query(insertQuery, [valores], (error, results) => {
          if (error) {
              console.error("Error al insertar productos nuevos:", error);
              return res.status(500).send("Error al actualizar los productos del pedido.");
          }

          res.send("Productos del pedido actualizados con éxito.");
      });
  });
});



// Obtener recorridos
app.get('/recorridos', (req, res) => {
  db.query('SELECT idRecorrido, nombre FROM recorrido', (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Error al obtener recorridos' });
      }
      res.json(results);
  });
});

// Obtener tipos de pedido
app.get('/tipos_pedido', (req, res) => {
  db.query('SELECT idTipo_de_pedido, descripcion FROM tipo_de_pedido', (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Error al obtener tipos de pedido' });
      }
      res.json(results);
  });
});

// Obtener formas de pago
app.get('/formas_pago', (req, res) => {
  db.query('SELECT idForma_de_pago, nombre FROM forma_de_pago', (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Error al obtener formas de pago' });
      }
      res.json(results);
  });
});








// Ruta para guardar el pedido
app.post('/guardar-pedido', (req, res) => {
  const { fecha_de_pedido, estado, idRecorrido, idCliente, idTipo_de_pedido, idForma_de_pago } = req.body;

  const query = `INSERT INTO pedido (fecha_de_pedido, estado, idRecorrido, idCliente, idTipo_de_pedido, idForma_de_pago)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [fecha_de_pedido, estado, idRecorrido, idCliente, idTipo_de_pedido, idForma_de_pago], (err, result) => {
      if (err) {
          console.error("Error al guardar el pedido:", err);
          return res.status(500).send("Error al guardar el pedido");
      }
      // Devuelve el ID del pedido guardado
      res.json({ idPedido: result.insertId }); // Asegúrate de que esta línea esté presente
  });
});





app.get("/login", (req, res) => {
  const { username, password } = req.query;  // Obtenemos los parámetros de consulta

  if (!username || !password) {
    return res.status(400).send("Usuario y contraseña son requeridos");
  }

  // Consulta a la base de datos para verificar usuario y contraseña
  db.query(
    "SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?",
    [username, password],
    (err, result) => {
      if (err) {
        console.error("Error al intentar iniciar sesión:", err);
        res.status(500).send("Error al intentar iniciar sesión");
      } else if (result.length === 0) {
        res.status(401).send("Usuario o contraseña incorrectos");
      } else {
        // Si el usuario es válido, retornamos los datos del usuario o un mensaje de éxito
        res.json({ message: "Inicio de sesión exitoso", user: result[0] });
      }
    }
  );
});


app.get('/clientes', (req, res) => {
  const query = `
      SELECT c.idCliente, c.nombre, c.direccion, c.telefono, c.ciudad, b.nombre AS nombreBarrio 
      FROM cliente c
      JOIN barrio b ON c.idBarrio = b.idBarrio
      WHERE c.estado = 'activo'`;

  db.query(query, (err, result) => {
      if (err) {
          console.error("Error al obtener los clientes:", err);
          return res.status(500).send("Error al obtener los clientes");
      }
      res.json(result);
  });
});


app.get("/clientes/nombres", (req, res) => {
  const query = "SELECT idCliente, nombre FROM cliente WHERE estado = 'activo'";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los nombres de los clientes:", err);
      res.status(500).send("Error al obtener los nombres de los clientes");
    } else {
      res.json(results);
    }
  });
});



app.get("/clientes/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM cliente WHERE idCliente = ? AND estado = 'activo'";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al obtener el cliente:", err);
      res.status(500).send("Error al obtener el cliente");
    } else if (result.length === 0) {
      res.status(404).send("Cliente no encontrado o inactivo");
    } else {
      res.json(result[0]);
    }
  });
});



app.get('/pedidos', (req, res) => {
  const query = `
      SELECT p.idPedido, p.fecha_de_pedido, p.estado, 
             r.nombre AS recorrido, 
             c.nombre AS cliente, 
             tp.descripcion AS tipo_pedido, 
             fp.nombre AS forma_pago
      FROM pedido p
      JOIN recorrido r ON p.idRecorrido = r.idRecorrido
      JOIN cliente c ON p.idCliente = c.idCliente
      JOIN tipo_de_pedido tp ON p.idTipo_de_pedido = tp.idTipo_de_pedido
      JOIN forma_de_pago fp ON p.idForma_de_pago = fp.idForma_de_pago;
  `;
  
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error al obtener los pedidos');
          return;
      }
      res.json(results);
  });
});


app.get("/pedidos/:idPedido", (req, res) => {
  const idPedido = req.params.idPedido;

  db.query(
    "SELECT * FROM pedido WHERE idPedido = ?",
    [idPedido],
    (err, result) => {
      if (err) {
        console.error("Error al obtener el pedido:", err);
        return res.status(500).send("Error al obtener el pedido");
      }
      if (result.length === 0) {
        return res.status(404).send("Pedido no encontrado");
      }
      res.json(result[0]); // Devolver los datos del pedido
    }
  );
});


app.get("/pedidos/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM pedido WHERE idPedido = ?", [id], (err, result) => {
    if (err) {
      console.error("Error al obtener el pedido:", err);
      res.status(500).send("Error al obtener el pedido");
    } else if (result.length === 0) {
      res.status(404).send("Pedido no encontrado");
    } else {
      res.json(result[0]);
    }
  });
});



app.delete("/pedidos/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM pedido WHERE idPedido = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar el pedido:", err);
      res.status(500).send("Error al eliminar el pedido");
    } else {
      res.send("Pedido eliminado correctamente");
    }
  });
});


app.get("/clientes/:id", (req, res) => {
  const id = req.params.id;
  const query = `
      SELECT c.direccion, b.nombre AS barrio
      FROM cliente c
      JOIN barrio b ON c.idBarrio = b.idBarrio
      WHERE c.idCliente = ? AND c.estado = 'activo'
  `;

  db.query(query, [id], (err, result) => {
      if (err) {
          console.error("Error al obtener el cliente:", err);
          return res.status(500).send("Error al obtener el cliente");
      }

      if (result.length === 0) {
          return res.status(404).send("Cliente no encontrado o inactivo");
      }

      res.json(result[0]);
  });
});



app.get("/barrios/:idBarrio", (req, res) => {
  const idBarrio = req.params.idBarrio;
  const query = "SELECT nombre FROM barrio WHERE idBarrio = ?";

  db.query(query, [idBarrio], (err, result) => {
      if (err) {
          console.error("Error al obtener el barrio:", err);
          return res.status(500).send("Error al obtener el barrio");
      }

      if (result.length === 0) {
          return res.status(404).send("Barrio no encontrado");
      }

      res.json(result[0]);
  });
});

app.get("/barrios", (req, res) => {
  const query = "SELECT * FROM barrio"; // O ajusta los campos que quieras obtener

  db.query(query, (err, result) => {
      if (err) {
          console.error("Error al obtener los barrios:", err);
          return res.status(500).send("Error al obtener los barrios");
      }

      if (result.length === 0) {
          return res.status(404).send("No se encontraron barrios");
      }

      res.json(result); // Enviar todos los barrios como respuesta
  });
});


app.get("/barrios/:idBarrio/dia-de-entrega", (req, res) => {
  const idBarrio = req.params.idBarrio;
  const query = `
    SELECT d.nombre AS diaDeEntrega
    FROM barrio b
    JOIN dia_de_entrega d ON b.idDia_de_entrega = d.idDia_de_entrega
    WHERE b.idBarrio = ?`;

  db.query(query, [idBarrio], (err, result) => {
    if (err) {
      console.error("Error al obtener el día de entrega:", err);
      return res.status(500).send("Error al obtener el día de entrega");
    }

    if (result.length === 0) {
      return res.status(404).send("Día de entrega no encontrado para el barrio");
    }

    res.json(result[0]); // Retorna el día de entrega
  });
});


app.get("/dias-de-entrega", (req, res) => {
  const query = "SELECT * FROM dia_de_entrega"; // Ajusta si necesitas campos específicos

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error al obtener los días de entrega:", err);
      return res.status(500).send("Error al obtener los días de entrega");
    }

    res.json(result); // Enviar todos los días de entrega como respuesta
  });
});

