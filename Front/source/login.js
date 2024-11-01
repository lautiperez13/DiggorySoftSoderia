document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Realizar la solicitud a la API con Axios
    axios.get("http://localhost:3000/login", {
        params: {
            username: username,
            password: password
        }
    })
    .then(response => {
        // Si el login es exitoso
        if (response.data.message === "Inicio de sesión exitoso") {
            alert("Bienvenido, " + response.data.user.nombre);
            window.location.href = "modulos.html"; // Redirige al menú
        } else {
            document.getElementById("error-message").innerText = "Usuario o contraseña incorrectos";
        }
    })
    .catch(error => {
        console.error("Error durante el inicio de sesión:", error);
        document.getElementById("error-message").innerText = "Error al intentar iniciar sesión";
    });
});
