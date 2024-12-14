import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        // Imprimir el token en la consola
        console.log("Token recibido:", token);

        // Decodificar el token y ver sus datos
        try {
          const decodedToken = jwt_decode(token);
          console.log("Datos del token decodificado:", decodedToken);

          // Puedes redirigir al usuario después de decodificar el token si lo deseas
          navigate("/"); // Esto redirige al usuario a la página principal
        } catch (err) {
          console.error("Error al decodificar el token:", err);
        }
      } else {
        const error = await response.json();
        alert(error.message || "Error en el inicio de sesión");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error de conexión con el servidor");
    }
  };


  return (
    <div className="login-container">
      <h1>Inicio de Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" id="email" placeholder="Correo electrónico" required />
        <input type="password" id="password" placeholder="Contraseña" required />
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
