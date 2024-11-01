// Llamamos a la función para obtener los pedidos
obtenerPedidos();

document.addEventListener('DOMContentLoaded', function() {
    const addOrderBtn = document.getElementById('add-order-btn');
    const orderForm = document.getElementById('order-form');
    const newOrderForm = document.getElementById('new-order-form');
    const orderList = document.getElementById('order-list');
    const closeModal = document.getElementsByClassName('close')[0];
    const clienteSelect = document.getElementById("cliente");
    const direccionInput = document.getElementById("direccion");
    const barrioInput = document.getElementById("barrio");
    const diaEntregaInput = document.getElementById("diaEntrega"); // Nuevo campo para el día de entrega
    let editingRow = null;

    // Mostrar el formulario para añadir pedidos
    addOrderBtn.addEventListener('click', function() {
        orderForm.style.display = 'block';
        newOrderForm.reset();  // Resetear el formulario
        editingRow = null;  // Reiniciar la variable de edición
        direccionInput.value = ""; // Limpiar los campos de dirección, barrio y día de entrega
        barrioInput.value = "";
        diaEntregaInput.value = ""; // Limpiar el día de entrega
    });

    // Cerrar el formulario modal
    closeModal.addEventListener('click', function() {
        orderForm.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    cargarRecorridos();
    cargarTiposPedido();
    cargarFormasPago();
    obtenerPedidos();
});


// Función para cargar los recorridos
function cargarRecorridos() {
    axios.get('http://localhost:3000/recorridos')
        .then(response => {
            const recorridoSelect = document.getElementById('recorrido');
            response.data.forEach(recorrido => {
                const option = document.createElement('option');
                option.value = recorrido.idRecorrido;
                option.textContent = recorrido.nombre;
                recorridoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar recorridos:', error);
        });
}

// Función para cargar tipos de pedido
function cargarTiposPedido() {
    axios.get('http://localhost:3000/tipos_pedido')
        .then(response => {
            const tipoPedidoSelect = document.getElementById('tipoPedido');
            response.data.forEach(tipoPedido => {
                const option = document.createElement('option');
                option.value = tipoPedido.idTipo_de_pedido;
                option.textContent = tipoPedido.descripcion;
                tipoPedidoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar tipos de pedido:', error);
        });
}

// Función para cargar formas de pago
function cargarFormasPago() {
    axios.get('http://localhost:3000/formas_pago')
        .then(response => {
            const formaPagoSelect = document.getElementById('formaPago');
            response.data.forEach(formaPago => {
                const option = document.createElement('option');
                option.value = formaPago.idForma_de_pago;
                option.textContent = formaPago.nombre;
                formaPagoSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar formas de pago:', error);
        });
}


function guardarPedido() {
    // Obtener los valores del formulario
    const fecha_de_pedido = document.getElementById('fechaPedido').value;
    const estado = document.getElementById('estado').value;
    const idRecorrido = document.getElementById('recorrido').value;
    const idCliente = document.getElementById('cliente').value;
    const idTipo_de_pedido = document.getElementById('tipoPedido').value;
    const idForma_de_pago = document.getElementById('formaPago').value;

    // Crear el objeto con los datos del pedido
    const pedidoData = {
        fecha_de_pedido,
        estado,
        idRecorrido,
        idCliente,
        idTipo_de_pedido,
        idForma_de_pago
    };

    // Enviar los datos del pedido al backend
    axios.post('http://localhost:3000/guardar-pedido', pedidoData)
        .then(response => {
            console.log('Pedido guardado:', response.data);
            alert('Pedido guardado correctamente');

            const idPedido = response.data.idPedido; // Asegúrate de obtener el ID del pedido guardado

            // Guardar productos en pedidoxproductos
            const productosData = carrito.map(producto => ({
                idPedido, // Usar el idPedido obtenido
                idProducto: producto.id,
                cantidad: producto.cantidad,
                precio: producto.precio * producto.cantidad
            }));

            // Enviar los datos de los productos al backend
            return axios.post('http://localhost:3000/guardar-pedidoxproductos', productosData);
        })
        .then(response => {
            console.log('Productos guardados en pedidoxproductos:', response.data);
            obtenerPedidos(); // Actualizar la lista de pedidos
            location.reload();
        })
        .catch(error => {
            console.error('Error al guardar el pedido o los productos:', error);
            alert('Hubo un error al guardar el pedido o los productos');
        });
}


function actualizarPedido() {
    let idPedido = parseInt(document.getElementById("idPedido").value, 10);
    let fechaPedido = document.getElementById("fechaPedido").value;
    let estado = document.getElementById("estado").value;
    let idRecorrido = parseInt(document.getElementById("recorrido").value, 10);
    let idTipoPedido = parseInt(document.getElementById("tipoPedido").value, 10);
    let idFormaPago = parseInt(document.getElementById("formaPago").value, 10);

    // Actualiza los datos generales del pedido
    axios.put(`http://localhost:3000/pedidos/${idPedido}`, {
        fechaPedido: fechaPedido,
        estado: estado,
        idRecorrido: idRecorrido,
        idTipoPedido: idTipoPedido,
        idFormaPago: idFormaPago
    })
    .then(() => {
        // Llama a la función para actualizar los productos del pedido
        actualizarProductosDelPedido(idPedido);
        alert('Pedido y productos actualizados con éxito');
        obtenerPedidos();  // Llama a esta función para refrescar la lista de pedidos en la interfaz
        location.reload();
    })
    .catch(error => {
        console.error('Error al actualizar pedido:', error);
    });
}


function actualizarProductosDelPedido(idPedido) {
    const productos = carrito.map(item => ({
        idProducto: item.id,
        cantidad: item.cantidad,
        precio: item.precio * item.cantidad
    }));

    axios.put(`http://localhost:3000/pedidos/${idPedido}/productos`, { productos })
        .then(response => {
            console.log(response.data);
            alert("Productos del pedido actualizados correctamente.");
        })
        .catch(error => {
            console.error("Error al actualizar los productos del pedido:", error);
        });
}







// Mostrar clientes de la bd en el select Cliente
document.addEventListener("DOMContentLoaded", () => {
    const clienteSelect = document.getElementById("cliente");
    const direccionInput = document.getElementById("direccion");
    const barrioInput = document.getElementById("barrio");
    const diaEntregaInput = document.getElementById("diaEntrega"); // Nuevo campo para el día de entrega

    // Función para obtener los nombres de los clientes y llenar el select
    const obtenerClientes = async () => {
        try {
            const respuesta = await fetch("http://localhost:3000/clientes/nombres"); // La ruta del backend

            if (!respuesta.ok) {
                throw new Error("Error al obtener los clientes");
            }

            const clientes = await respuesta.json();

            // Limpiar el select antes de agregar los clientes
            clienteSelect.innerHTML = "<option value disabled selected=''>Seleccionar cliente</option>";

            // Añadir cada cliente como una opción en el select
            clientes.forEach((cliente) => {
                const opcion = document.createElement("option");
                opcion.value = cliente.idCliente; // El valor será el ID del cliente
                opcion.textContent = cliente.nombre; // El texto será el nombre del cliente
                clienteSelect.appendChild(opcion);
            });
        } catch (error) {
            console.error("Hubo un error al cargar los clientes:", error);
        }
    };

    // Llamar a la función cuando se cargue la página
    obtenerClientes();

    // Función para obtener dirección, barrio y día de entrega del cliente seleccionado
    clienteSelect.addEventListener("change", async (event) => {
        const clienteId = event.target.value;
    
        if (clienteId) {
            try {
                // Primera consulta: obtener datos del cliente
                const respuesta = await fetch(`http://localhost:3000/clientes/${clienteId}`);
                const cliente = await respuesta.json();
    
                // Verificar la respuesta en la consola
                console.log(cliente);
    
                // Rellenar los campos con la información del cliente
                direccionInput.value = cliente.direccion;
    
                // Segunda consulta: obtener nombre del barrio usando el idBarrio
                if (cliente.idBarrio) {
                    const respuestaBarrio = await fetch(`http://localhost:3000/barrios/${cliente.idBarrio}`);
                    const barrio = await respuestaBarrio.json();
    
                    // Asignar el nombre del barrio al input correspondiente
                    barrioInput.value = barrio.nombre;
                    
                    // Tercera consulta: obtener el día de entrega usando el idBarrio
                    const respuestaDiaEntrega = await fetch(`http://localhost:3000/barrios/${cliente.idBarrio}/dia-de-entrega`);
                    const diaEntrega = await respuestaDiaEntrega.json();

                    // Asignar el día de entrega al input correspondiente
                    diaEntregaInput.value = diaEntrega.diaDeEntrega;
                } else {
                    barrioInput.value = "";  // Si no hay barrio, dejar vacío
                    diaEntregaInput.value = ""; // Si no hay día de entrega, dejar vacío
                }
            } catch (error) {
                console.error("Error al obtener el cliente, barrio o día de entrega:", error);
            }
        }
    });
});


function eliminarPedido(idPedido) {
    axios.delete('http://localhost:3000/pedidos/' + idPedido)
        .then(respuesta => {
            alert("Pedido Eliminado");
            obtenerPedidos();  // Refresca la lista después de eliminar
        })
        .catch(error => {
            console.error('Error al eliminar pedido:', error);
        });
}

// Cargar productos en el select
const obtenerProductos = async () => {
    try {
        const respuesta = await fetch("http://localhost:3000/productos");
        const productos = await respuesta.json();
        const productoSelect = document.getElementById("producto");

        productos.forEach((producto) => {
            const opcion = document.createElement("option");
            opcion.value = producto.idProducto;
            opcion.textContent = producto.nombre;
            opcion.dataset.precio = producto.precio_unitario; // Guardar el precio unitario
            productoSelect.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error al obtener los productos:", error);
    }
};

// Llamar a la función para cargar productos
obtenerProductos();

const carrito = []; // Array para almacenar los productos en el carrito

function agregarProducto() {
    const productoSelect = document.getElementById("producto");
    const cantidadInput = document.getElementById("cantidad");
    const carritoTabla = document.getElementById("carritoTabla");
    const totalPedido = document.getElementById("totalPedido");

    const productoId = productoSelect.value;
    const productoNombre = productoSelect.options[productoSelect.selectedIndex].text;
    const cantidad = parseInt(cantidadInput.value, 10);
    const precioUnitario = parseFloat(productoSelect.options[productoSelect.selectedIndex].dataset.precio);

    // Calcular total para el producto
    const totalProducto = precioUnitario * cantidad;

    // Agregar el producto al carrito
    carrito.push({ id: productoId, nombre: productoNombre, cantidad, precio: precioUnitario, total: totalProducto });

    // Actualizar la tabla del carrito
    actualizarCarrito();

    // Calcular el total del pedido
    const total = carrito.reduce((acc, item) => acc + item.total, 0);
    totalPedido.textContent = total.toFixed(2);
}

function actualizarCarrito() {
    const carritoTabla = document.getElementById("carritoTabla");
    const totalPedido = document.getElementById("totalPedido");
    carritoTabla.innerHTML = ""; // Limpiar tabla antes de actualizar

    let total = 0; // Variable para calcular el total

    carrito.forEach((item, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${item.total.toFixed(2)}</td>
            <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
        `;

        carritoTabla.appendChild(fila);

        // Sumar el total de cada producto al total del pedido
        total += item.total;
    });

    // Actualizar el total del pedido en el elemento correspondiente
    totalPedido.textContent = total.toFixed(2);
}

function eliminarProducto(index) {
    carrito.splice(index, 1); // Eliminar producto del array
    actualizarCarrito(); // Actualizar tabla y recalcular total después de eliminar
}



function obtenerPedidos() {
    axios.get('http://localhost:3000/pedidos')
    .then(response => {
      const pedidos = response.data;
      const tableBody = document.getElementById('order-list');
      tableBody.innerHTML = '';  // Limpiar la tabla antes de agregar los nuevos datos
  
      pedidos.forEach(pedido => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${pedido.idPedido}</td>
          <td>${pedido.cliente}</td>
          <td>${pedido.fecha_de_pedido.split('T')[0]}</td>
          <td>${pedido.recorrido}</td>
          <td>${pedido.tipo_pedido}</td>
          <td>${pedido.forma_pago}</td>
          <td>
              <button onclick="mostrarProductos(${pedido.idPedido})">Ver Productos</button>
              <button onclick="modificarPedido(${pedido.idPedido})">Modificar</button>
              <button onclick="eliminarPedido(${pedido.idPedido})">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);

        // Crear fila para la subgrilla de productos (oculta inicialmente)
        const productosRow = document.createElement('tr');
        productosRow.id = `productos-${pedido.idPedido}`;
        productosRow.style.display = "none";
        productosRow.innerHTML = `
          <td colspan="7">
            <table class="fl-subtable">
              <thead>
                <tr>
                  <th>ID Producto</th>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody id="productos-list-${pedido.idPedido}">
                <!-- Productos dinámicos -->
              </tbody>
            </table>
          </td>
        `;
        tableBody.appendChild(productosRow);
      });
    })
    .catch(error => {
      console.error('Error al obtener los pedidos:', error);
    });
}

function mostrarProductos(idPedido) {
    const productosRow = document.getElementById(`productos-${idPedido}`);
    
    // Alternar la visibilidad de la subgrilla
    productosRow.style.display = productosRow.style.display === "none" ? "" : "none";
  
    if (productosRow.style.display === "") { // Si se muestra la subgrilla
      axios.get(`http://localhost:3000/pedido/${idPedido}/productos`)
        .then(response => {
          const productos = response.data;
          const productosList = document.getElementById(`productos-list-${idPedido}`);
          productosList.innerHTML = ""; // Limpiar la lista de productos
  
          let totalPedido = 0; // Inicializar el total del pedido
  
          productos.forEach(producto => {
            const productoRow = document.createElement("tr");
            const totalProducto = producto.precio // Calcular el total de cada producto
            totalPedido += totalProducto; // Acumular el total
  
            productoRow.innerHTML = `
              <td>${producto.idProducto}</td>
              <td>${producto.nombre}</td>
              <td>${producto.cantidad}</td>
              <td>${producto.precio}</td>
            `;
            productosList.appendChild(productoRow);
          });
  
          // Añadir una fila para mostrar el total del pedido
          const totalRow = document.createElement("tr");
          totalRow.innerHTML = `
            <td colspan="3" style="text-align: right; font-weight: bold;">Total del Pedido:</td>
            <td>${totalPedido.toFixed(2)}</td>
          `;
          productosList.appendChild(totalRow); // Añadir la fila al final de la subgrilla
        })
        .catch(error => {
          console.error("Error al cargar los productos del pedido:", error);
        });
    }
  }




function modificarPedido(idPedido) {
    axios.get('http://localhost:3000/pedidos/' + idPedido)
        .then(respuesta => {
            const pedido = respuesta.data;
            document.getElementById("idPedido").value = pedido.idPedido;
            document.getElementById("fechaPedido").value = pedido.fecha_de_pedido.split('T')[0];
            document.getElementById("estado").value = pedido.estado;
            document.getElementById("recorrido").value = pedido.idRecorrido;
            document.getElementById("cliente").value = pedido.idCliente;
            document.getElementById("tipoPedido").value = pedido.idTipo_de_pedido;
            document.getElementById("formaPago").value = pedido.idForma_de_pago;

            autocompletarDetallesCliente(pedido.idCliente);

            document.getElementById("botonGuardarForm").disabled = true;
            document.getElementById("botonModificarForm").disabled = false;

            // Limpiar el carrito antes de cargar los productos del pedido
            carrito.length = 0;

            // Obtener los productos del pedido
            axios.get(`http://localhost:3000/pedidos/${idPedido}/productos`)
                .then(respuestaProductos => {
                    const productos = respuestaProductos.data;

                    productos.forEach(producto => {
                        carrito.push({
                            id: producto.idProducto,
                            nombre: producto.nombre,
                            cantidad: producto.cantidad,
                            precio: producto.precio_unitario,
                            total: producto.total
                        });
                    });

                    // Actualizar la tabla del carrito en el formulario
                    actualizarCarrito();
                })
                .catch(error => {
                    console.error("Error al obtener los productos del pedido:", error);
                });

            document.getElementById("botonGuardarForm").disabled = true;
            document.getElementById("botonModificarForm").disabled = false;

            smoothScrollToTop();
            toggleFormularioModif();
        })
        .catch(error => {
            console.error("Error al obtener el pedido:", error);
        });
}





async function autocompletarDetallesCliente(clienteId) {
    const direccionInput = document.getElementById("direccion");
    const barrioInput = document.getElementById("barrio");
    const diaEntregaInput = document.getElementById("diaEntrega");

    try {
        // Obtener los datos del cliente
        const respuestaCliente = await fetch(`http://localhost:3000/clientes/${clienteId}`);
        const cliente = await respuestaCliente.json();

        // Rellenar el campo de dirección
        direccionInput.value = cliente.direccion;

        // Obtener el nombre del barrio
        if (cliente.idBarrio) {
            const respuestaBarrio = await fetch(`http://localhost:3000/barrios/${cliente.idBarrio}`);
            const barrio = await respuestaBarrio.json();
            barrioInput.value = barrio.nombre;

            // Obtener el día de entrega
            const respuestaDiaEntrega = await fetch(`http://localhost:3000/barrios/${cliente.idBarrio}/dia-de-entrega`);
            const diaEntrega = await respuestaDiaEntrega.json();
            diaEntregaInput.value = diaEntrega.diaDeEntrega;
        } else {
            barrioInput.value = "";
            diaEntregaInput.value = "";
        }
    } catch (error) {
        console.error("Error al obtener detalles del cliente:", error);
    }
}



function smoothScrollToTop() {
    const scrollStep = -window.scrollY / (500 / 15); // 500ms duración, más tiempo más suave
    const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
            window.scrollBy(0, scrollStep);
        } else {
            clearInterval(scrollInterval);
        }
    }, 15); // Intervalo de 15ms para hacerlo más fluido
}

function toggleFormulario() {
    const formWrapper = document.querySelector('.form-wrapper');
    const formulario = document.getElementById('clienteForm');
    document.getElementById("cliente").disabled = false;
    document.getElementById("botonGuardarForm").disabled = false;
    document.getElementById("botonModificarForm").disabled = true;
    formulario.reset();
    const carritoContainer = document.getElementById('carrito');
    const boton = document.getElementById('toggleFormButton');

    // Cambiar el estado de visibilidad
    if (formWrapper.style.display === "none" && carritoContainer.style.display === "none") {
        formWrapper.style.display = "block";  // Mostrar el contenedor del formulario
        formulario.style.display = "flex";    // Mostrar el formulario
        carritoContainer.style.display = "block";  // Mostrar el carrito
        boton.textContent = "Ocultar Formulario";
    } else {
        formWrapper.style.display = "none";  // Ocultar el contenedor del formulario
        formulario.style.display = "none";   // Ocultar el formulario
        carritoContainer.style.display = "none";  // Ocultar el carrito
        boton.textContent = "Añadir Pedido";
    }
}

function toggleFormularioModif() {
    const formulario = document.getElementById('clienteForm');
    const clientebox = document.getElementById('cliente')
    clientebox.disabled = true;
    const formWrapper = document.querySelector('.form-wrapper');
    const carritoContainer = document.getElementById('carrito');
    const botonModif = document.getElementById('botonModificarForm');
    const boton = document.getElementById('toggleFormButton');

    formWrapper.style.display = "block";  // Mostrar el contenedor del formulario
    formulario.style.display = "flex";  // Mostrar formulario
    carritoContainer.style.display = "block";  // Mostrar el carrito
    boton.textContent = "Ocultar Formulario";  // Cambiar texto del botón
}



document.addEventListener("DOMContentLoaded", () => {
    const clienteSelect = document.getElementById("cliente");
    const barrioSelect = document.getElementById("idBarrio");  // Select de barrios
    const direccionInput = document.getElementById("direccion");

    // Función para obtener los nombres de los clientes y llenar el select de clientes
    const obtenerClientes = async () => {
        try {
            const respuesta = await fetch("http://localhost:3000/clientes/nombres");  // Ruta del backend para clientes

            if (!respuesta.ok) {
                throw new Error("Error al obtener los clientes");
            }

            const clientes = await respuesta.json();

            // Limpiar el select antes de agregar los clientes
            clienteSelect.innerHTML = "<option value disabled selected=''>Seleccionar cliente</option>";

            // Añadir cada cliente como una opción en el select
            clientes.forEach((cliente) => {
                const opcion = document.createElement("option");
                opcion.value = cliente.idCliente;
                opcion.textContent = cliente.nombre;
                clienteSelect.appendChild(opcion);
            });
        } catch (error) {
            console.error("Hubo un error al cargar los clientes:", error);
        }
    };

    // Función para obtener los barrios y llenar el select de barrios
    const obtenerBarrios = async () => {
        try {
            const respuesta = await fetch("http://localhost:3000/barrios");  // Ruta del backend para barrios

            if (!respuesta.ok) {
                throw new Error("Error al obtener los barrios");
            }

            const barrios = await respuesta.json();

            // Limpiar el select antes de agregar los barrios
            barrioSelect.innerHTML = "<option value disabled selected=''>Seleccionar barrio</option>";

            // Añadir cada barrio como una opción en el select
            barrios.forEach((barrio) => {
                const opcion = document.createElement("option");
                opcion.value = barrio.idBarrio;  // El valor será el ID del barrio
                opcion.textContent = barrio.nombre;  // El texto será el nombre del barrio
                barrioSelect.appendChild(opcion);
            });
        } catch (error) {
            console.error("Hubo un error al cargar los barrios:", error);
        }
    };

    // Llamar a las funciones cuando se cargue la página
    obtenerClientes();
    obtenerBarrios();

    // Función para obtener dirección y barrio del cliente seleccionado
    clienteSelect.addEventListener("change", async (event) => {
        const clienteId = event.target.value;

        if (clienteId) {
            try {
                const respuesta = await fetch(`http://localhost:3000/clientes/${clienteId}`);
                const cliente = await respuesta.json();

                // Rellenar los campos con la información del cliente
                direccionInput.value = cliente.direccion;
                barrioSelect.value = cliente.idBarrio;  // Seleccionamos el barrio correspondiente al cliente
            } catch (error) {
                console.error("Error al obtener el cliente:", error);
            }
        }
    });
});
