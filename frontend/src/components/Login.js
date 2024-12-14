import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
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
  
        // Guardar el token en localStorage
        localStorage.setItem("token", token);
  
        try {
          const decodedToken = jwtDecode(token);
          console.log("Token decodificado:", decodedToken);
          localStorage.setItem("user_id", decodedToken.id);
          setIsAuthenticated(true);
          navigate("/"); // Redirigir tras éxito
        } catch (err) {
          console.error("Error al decodificar el token:", err);
        }
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Credenciales inválidas");
      }
    } catch (err) {
      console.error("Error en el servidor:", err);
      setErrorMessage("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa tus credenciales para continuar</p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            Iniciar sesión
          </button>
        </form>



        <p className="signup-text">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
      <div className="login-right">
        <h3>Sistema de Gestion de Tarjetas de Credito</h3>
        <p>Accede a las últimas actualizaciones y mejoras.</p>
      </div>
    </div>
  );
};

export default Login;