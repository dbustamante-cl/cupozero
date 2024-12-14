import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Asegúrate de importar correctamente

function Header({ userName, setUserName }) {
  const [loading, setLoading] = useState(true); // Estado para controlar el mensaje de carga

  useEffect(() => {
    // Verifica si el nombre del usuario ya está definido
    if (!userName) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token); // Decodifica el token
          setUserName(decoded.first_name); // Actualiza el estado del nombre de usuario
        } catch (err) {
          console.error("Error al decodificar el token en Header:", err);
        }
      }
    }
    setLoading(false); // Finaliza el estado de carga
  }, [userName, setUserName]);

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">
        Control Personal de Finanzas
      </h1>
      {/* Mostrar el nombre del usuario o mensaje de carga */}
      {!loading ? (
        userName ? (
          <p className="text-lg text-gray-600">Hola, {userName}</p>
        ) : (
          <p className="text-lg text-gray-600">No se pudo cargar el usuario</p>
        )
      ) : (
        <p className="text-lg text-gray-600">Cargando usuario...</p>
      )}
    </header>
  );
}

export default Header;