import React, { useState, useEffect } from "react";

function Sidebar({ selectedAccount, setSelectedAccount, setShowCardAdmin, storesUpdated }) {
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado para colapsar el menú
  const [openMenu, setOpenMenu] = useState(null); // Controla el menú abierto
  const [activeStores, setActiveStores] = useState([]); // Lista de tiendas activas
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      console.error("Usuario no identificado.");
      return;
    }

    const fetchActiveStores = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/stores?user_id=${userId}`);
        if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);
        const allStores = await response.json();
        const filteredStores = allStores.filter(
          (store) => store.status === true || store.status === "true"
        );
        setActiveStores(filteredStores);
      } catch (error) {
        console.error("Error al cargar las tiendas activas del usuario:", error);
        setActiveStores([]);
      }
    };

    fetchActiveStores();
  }, [userId, storesUpdated]);

  const toggleMenu = (menuName) => {
    setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
  };

  // Lógica para expandir el menú si está colapsado y el usuario selecciona algo
  const handleItemClick = (callback) => {
    if (isCollapsed) {
      setIsCollapsed(false); // Expande el menú si está colapsado
    }
    if (callback) callback(); // Ejecuta cualquier lógica asociada al clic
  };

  return (
    <div
      className={`h-full ${
        isCollapsed ? "w-16" : "w-64"
      } bg-gray-50 text-gray-800 border-r border-gray-200 shadow-lg flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 font-bold text-xl flex items-center justify-between">
        {!isCollapsed && (
          <img
          src="/logo-creditix.png" // Reemplaza esta ruta con la de tu imagen (ej: public/creditix.png)
          alt="Logo"
          className="w-32" // Ajusta el tamaño de la imagen según tu diseño
        />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="material-icons">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {/* Resumen */}
          <li>
            <button
              onClick={() => handleItemClick(() => {
                setSelectedAccount(null);
                setShowCardAdmin(false);
              })}
              className={`w-full px-4 py-3 text-left flex items-center rounded-lg ${
                !openMenu && !selectedAccount ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <span className="material-icons mr-3 text-gray-600">dashboard</span>
              {!isCollapsed && "Dashboard"}
            </button>
          </li>

          {/* Cuentas */}
          <li>
            <div
              className={`px-4 py-3 flex justify-between items-center cursor-pointer rounded-lg ${
                openMenu === "Cuentas" ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
              onClick={() => handleItemClick(() => toggleMenu("Cuentas"))}
            >
              <div className="flex items-center">
                <span className="material-icons mr-3 text-gray-600">account_balance_wallet</span>
                {!isCollapsed && "Cuentas"}
              </div>
              {!isCollapsed && (
                <span className="text-gray-600">{openMenu === "Cuentas" ? "−" : "+"}</span>
              )}
            </div>
            {openMenu === "Cuentas" && !isCollapsed && (
              <ul className="pl-6">
                {activeStores.map((store, index) => (
                  <li
                    key={store.user_store_id || index}
                    className={`py-2 hover:bg-gray-100 cursor-pointer rounded-lg ${
                      selectedAccount?.user_store_id === store.user_store_id
                        ? "bg-gray-200"
                        : ""
                    }`}
                    onClick={() => handleItemClick(() => {
                      setSelectedAccount(store);
                      setShowCardAdmin(false);
                    })}
                  >
                    {store.name}
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Configuración */}
          <li>
            <div
              className={`px-4 py-3 flex justify-between items-center cursor-pointer rounded-lg ${
                openMenu === "Configuración" ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
              onClick={() => handleItemClick(() => toggleMenu("Configuración"))}
            >
              <div className="flex items-center">
                <span className="material-icons mr-3 text-gray-600">settings</span>
                {!isCollapsed && "Configuración"}
              </div>
              {!isCollapsed && (
                <span className="text-gray-600">{openMenu === "Configuración" ? "−" : "+"}</span>
              )}
            </div>
            {openMenu === "Configuración" && !isCollapsed && (
              <ul className="pl-6">
                <li
                  className="py-2 hover:bg-gray-100 cursor-pointer rounded-lg"
                  onClick={() => handleItemClick(() => {
                    setShowCardAdmin(true);
                    setSelectedAccount(null);
                  })}
                >
                  Administrador de Tarjetas
                </li>
                <li className="py-2 hover:bg-gray-100 cursor-pointer rounded-lg">
                  Otras Configuraciones
                </li>
              </ul>
            )}
          </li>

          {/* Reportes */}
          <li>
            <button
              onClick={() => handleItemClick(() => {})}
              className={`w-full px-4 py-3 text-left flex items-center rounded-lg ${
                !openMenu && selectedAccount?.type === "Reportes" ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <span className="material-icons mr-3 text-gray-600">bar_chart</span>
              {!isCollapsed && "Reportes"}
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div
        className={`p-4 border-t border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer rounded-lg ${
          isCollapsed ? "justify-center" : ""
        }`}
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      >
        <span className="flex items-center">
          <span className="material-icons mr-2">logout</span>
          {!isCollapsed && "Cerrar sesión"}
        </span>
      </div>
    </div>
  );
}

export default Sidebar;