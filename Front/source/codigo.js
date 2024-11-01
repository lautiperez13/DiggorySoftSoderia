// Llamamos a la función para obtener los clientes
obtenerClientes();


function eliminarCliente(idCliente) {
    axios.delete('http://localhost:3000/clientes/' + idCliente)
        .then(respuesta => {
            alert("Cliente Eliminado");
            obtenerClientes();  // Refresca la lista después de eliminar
        })
        .catch(error => {
            console.error('Error al eliminar cliente:', error);
        });
}



function guardarCliente() {
    let nombre = document.getElementById("nombre").value;
    let direccion = document.getElementById("direccion").value;
    let telefono = document.getElementById("telefono").value;
    let ciudad = document.getElementById("ciudad").value;
    let idBarrio = parseInt(document.getElementById("idBarrio").value, 10);

    axios.post('http://localhost:3000/clientes', {
        nombre: nombre,
        direccion: direccion,
        telefono: telefono,
        ciudad: ciudad,
        idBarrio: idBarrio
    })
    .then(res => {
        alert('Cliente agregado con éxito');
        obtenerClientes();
        document.getElementById("clienteForm").reset();  // Reiniciar formulario
        location.reload();
    })
    .catch(error => {
        console.error('Error al agregar cliente:', error);
    });
}

function actualizarCliente() {
    let idCliente = parseInt(document.getElementById("idCliente").value, 10);
    let nombre = document.getElementById("nombre").value;
    let direccion = document.getElementById("direccion").value;
    let telefono = document.getElementById("telefono").value;
    let ciudad = document.getElementById("ciudad").value;
    let idBarrio = parseInt(document.getElementById("idBarrio").value, 10);

    axios.put('http://localhost:3000/clientes/' + idCliente, {
        nombre: nombre,
        direccion: direccion,
        telefono: telefono,
        ciudad: ciudad,
        idBarrio: idBarrio
    })
    .then(res => {
        alert('Cliente modificado con éxito');
        obtenerClientes();
    })
    .catch(error => {
        console.error('Error al actualizar cliente:', error);
    });
}

function obtenerClientes() {
    axios.get('http://localhost:3000/clientes')
        .then(respuesta => {
            let datos = respuesta.data;
            let table_cliente = document.getElementById("table_cliente");
            table_cliente.innerHTML = '';  // Limpiar tabla antes de añadir

            datos.forEach(cliente => {
                let fila = document.createElement('tr');

                fila.innerHTML = `
                    <td>${cliente.idCliente}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.direccion}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.ciudad}</td>
                    <td>${cliente.nombreBarrio}</td>  <!-- Mostrar el nombre del barrio -->
                    <td>
                        <button onclick="modificarDatos(${cliente.idCliente})">Modificar</button>
                        <button onclick="eliminarCliente(${cliente.idCliente})">Eliminar</button>
                    </td>
                `;

                table_cliente.appendChild(fila);
            });
        })
        .catch(error => {
            console.error('Error al obtener clientes:', error);
        });
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
    const formulario = document.getElementById('clienteForm');
    const boton = document.getElementById('toggleFormButton');
    const formWrapper = document.querySelector('.form-wrapper');
    document.getElementById("botonGuardarForm").disabled = false;
    document.getElementById("botonModificarForm").disabled = true;
    formulario.reset();
    
    if (formulario.style.display === "none") {
        formulario.style.display = "flex";  // Mostrar formulario
        formWrapper.style.display = "block";
        boton.textContent = "Ocultar Formulario";  // Cambiar texto del botón
    } else {
        formulario.style.display = "none";  // Ocultar formulario
        formWrapper.style.display = "none";
        boton.textContent = "Añadir Cliente";  // Cambiar texto del botón
    }
}

function toggleFormularioModif() {
    const formulario = document.getElementById('clienteForm');
    const formWrapper = document.querySelector('.form-wrapper');
    const botonModif = document.getElementById('botonModificarForm');
    const boton = document.getElementById('toggleFormButton');

    formulario.style.display = "flex";  // Mostrar formulario
    formWrapper.style.display = "block"
    boton.textContent = "Ocultar Formulario";  // Cambiar texto del botón
    
}



function modificarDatos(idCliente) {
    axios.get('http://localhost:3000/clientes/' + idCliente)
        .then(respuesta => {
            let cliente = respuesta.data;
            document.getElementById("idCliente").value = cliente.idCliente;
            document.getElementById("nombre").value = cliente.nombre;
            document.getElementById("direccion").value = cliente.direccion;
            document.getElementById("telefono").value = cliente.telefono;
            document.getElementById("ciudad").value = cliente.ciudad;
            document.getElementById("idBarrio").value = cliente.idBarrio;

            document.getElementById("botonGuardarForm").disabled = true;
            document.getElementById("botonModificarForm").disabled = false;

            // Desplazamiento suave hacia la parte superior donde está el formulario
            smoothScrollToTop();
            toggleFormularioModif();
            
        })
        .catch(error => {
            console.error('Error al obtener cliente:', error);
        });
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
