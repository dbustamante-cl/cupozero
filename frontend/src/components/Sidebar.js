import React, { useState, useEffect } from "react";

function Sidebar({ selectedAccount, setSelectedAccount, setShowCardAdmin, storesUpdated }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [activeStores, setActiveStores] = useState([]); // Almacena las tiendas activas del usuario

  const userId = localStorage.getItem("user_id"); // Obtiene el ID del usuario desde localStorage

  useEffect(() => {
    if (!userId) {
      console.error("Usuario no identificado.");
      return;
    }

    const fetchActiveStores = async () => {
      try {
        // Llamada al backend para obtener las tiendas activas
        const response = await fetch(`http://localhost:3000/api/stores?user_id=${userId}`);
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const allStores = await response.json();
        if (!Array.isArray(allStores)) {
          throw new Error("Respuesta del servidor no válida. Se esperaba un array.");
        }

        // Filtra las tiendas activas
        const filteredStores = allStores.filter(
          (store) => store.status === true || store.status === "true"
        );

        setActiveStores(filteredStores); // Guarda las tiendas activas en el estado
        console.log("Tiendas activas cargadas:", filteredStores);
      } catch (error) {
        console.error("Error al cargar las tiendas activas del usuario:", error);
        setActiveStores([]); // En caso de error, establece una lista vacía
      }
    };

    fetchActiveStores();
  }, [userId, storesUpdated]); // Refresca cuando se actualizan las tiendas o el usuario

  const toggleMenu = (menuName) => {
    setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
  };

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col">
      <div className="p-4 font-bold text-xl">ControlCard</div>
      <nav className="flex-1">
        <ul>
          {/* Resumen */}
          <li>
            <button
              onClick={() => {
                setSelectedAccount(null);
                setShowCardAdmin(false); // Asegura que el Administrador de Tarjetas no esté activo
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-200"
            >
              Resumen
            </button>
          </li>

          {/* Cuentas */}
          <li
            className="p-4 hover:bg-blue-700 cursor-pointer flex justify-between items-center"
            onClick={() => toggleMenu("Cuentas")}
          >
            Cuentas
            <span>{openMenu === "Cuentas" ? "−" : "+"}</span>
          </li>

          {/* Lista de tiendas activas */}
          {openMenu === "Cuentas" && (
            <ul className="pl-6">
              {activeStores.map((store, index) => (
                <li
                  key={store.user_store_id || index} // Clave única
                  className={`p-2 hover:bg-blue-700 cursor-pointer ${
                    selectedAccount?.user_store_id === store.user_store_id ? "bg-blue-700" : ""
                  }`}
                  onClick={() => {
                    console.log("Tienda seleccionada:", store); // Registro de depuración
                    setSelectedAccount(store); // Actualiza la tienda seleccionada
                    setShowCardAdmin(false); // Asegura que no esté activo el Administrador de Tarjetas
                  }}
                  style={{ backgroundColor: store.color_code || "#ffffff" }} // Fallback a blanco si no hay `color_code`
                >
                  {store.name}
                </li>
              ))}
            </ul>
          )}

          {/* Configuración */}
          <li
            className="p-4 hover:bg-blue-700 cursor-pointer flex justify-between items-center"
            onClick={() => toggleMenu("Configuración")}
          >
            Configuración
            <span>{openMenu === "Configuración" ? "−" : "+"}</span>
          </li>

          {openMenu === "Configuración" && (
            <ul className="pl-6">
              <li
                className="p-2 hover:bg-blue-700 cursor-pointer"
                onClick={() => {
                  setShowCardAdmin(true); // Activa el Administrador de Tarjetas
                  setSelectedAccount(null); // Deselecciona cualquier cuenta
                }}
              >
                Administrador de Tarjetas
              </li>
              <li className="p-2 hover:bg-blue-700 cursor-pointer">
                Otras Configuraciones
              </li>
            </ul>
          )}

          {/* Reportes */}
          <li className="p-4 hover:bg-blue-700 cursor-pointer">Reportes</li>
        </ul>
      </nav>
      <div
        className="p-4 border-t border-blue-700 cursor-pointer hover:bg-blue-700"
        onClick={() => {
          localStorage.removeItem("token"); // Cierra sesión
          window.location.reload(); // Recarga la página
        }}
      >
        Cerrar sesión
      </div>
    </div>
  );
}

export default Sidebar;