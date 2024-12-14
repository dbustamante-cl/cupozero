import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tax_id: "",
    country_code: "CL", // Valor predeterminado para Chile
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Función para formatear el RUT con puntos y guion
  const formatRut = (value) => {
    const cleanValue = value.replace(/\D/g, ""); // Elimina todo excepto números
    if (cleanValue.length <= 1) return cleanValue;
    if (cleanValue.length <= 4) return `${cleanValue.slice(0, -1)}-${cleanValue.slice(-1)}`;
    if (cleanValue.length <= 7)
      return `${cleanValue.slice(0, -4)}.${cleanValue.slice(-4, -1)}-${cleanValue.slice(-1)}`;
    return `${cleanValue.slice(0, -7)}.${cleanValue.slice(-7, -4)}.${cleanValue.slice(
      -4,
      -1
    )}-${cleanValue.slice(-1)}`;
  };

  // Función para limpiar el RUT antes de enviar (sin puntos ni guion)
  const cleanRut = (value) => value.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar el RUT para que se guarde sin puntos ni guion
    const cleanedData = { ...formData, tax_id: cleanRut(formData.tax_id) };

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        setSuccessMessage("Usuario registrado exitosamente.");
        setTimeout(() => navigate("/login"), 2000); // Redirige al login
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Error al registrar el usuario.");
      }
    } catch (err) {
      console.error("Error en el servidor:", err);
      setErrorMessage("Error de conexión con el servidor.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Formatear el RUT si el campo es `tax_id`
    if (name === "tax_id") {
      setFormData({ ...formData, tax_id: formatRut(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="form-section">
          <h2>Crea tu cuenta</h2>
          <p>Regístrate, prueba y envíanos tus comentarios.</p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="tax_id"
              placeholder="RUT/DNI"
              value={formData.tax_id}
              onChange={handleChange}
              required
              style={{ textAlign: "left" }}
            />
            <select
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
              required
              style={{ textAlign: "left" }}
            >
              <option value="CL">Chile</option>
              <option value="AR">Argentina</option>
              <option value="PE">Perú</option>
            </select>
            <input
              type="text"
              name="first_name"
              placeholder="Nombre"
              value={formData.first_name}
              onChange={handleChange}
              required
              style={{ textAlign: "left" }}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Apellido"
              value={formData.last_name}
              onChange={handleChange}
              required
              style={{ textAlign: "left" }}
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ textAlign: "left" }}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ textAlign: "left" }}
            />
            <button type="submit" className="register-btn">
              Regístrate
            </button>
          </form>
          <p className="login-text">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
        <div className="illustration-section">
          <div className="illustration">
            <div className="lightbulb"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;