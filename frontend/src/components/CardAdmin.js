import React, { useState, useEffect } from "react";
import "./CardAdmin.css"; // CSS actualizado para estilos
import axios from "axios";

const CardAdmin = ({ setStoresUpdated }) => {
  const [commercialCards, setCommercialCards] = useState([]); // Todas las tiendas comerciales
  const [userStores, setUserStores] = useState([]);
  const [bankCards, setBankCards] = useState([]); // Tarjetas bancarias
  const [newBankCard, setNewBankCard] = useState({ bank: "", type: "" }); // Nueva tarjeta bancaria
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de creación
  const userId = localStorage.getItem("user_id"); // ID del usuario
  
  const isStoreActive = (id, isCustom) => {
    const userStore = userStores.find((store) => 
      isCustom ? store.custom_store_id === id : store.store_id === id
    );
  
    console.log("Evaluando isStoreActive:", {
      id,
      isCustom,
      encontrado: !!userStore,
      status: userStore?.status,
    });
  
    return userStore ? userStore.status === "true" : false;
  };

  // Cargar tiendas comerciales y tarjetas bancarias
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/stores", {
          params: { user_id: userId },
        });

        const stores = response.data;

        // Filtrar tarjetas comerciales (is_custom === "false")
        const filteredCommercialCards = stores.filter(
          (store) => store.is_custom === "false"
        );

        // Filtrar tarjetas bancarias personalizadas (is_custom === "true" y store_id !== -1)
        const filteredBankCards = stores.filter(
          (store) => store.is_custom === "true" && store.store_id !== -1
        );

        setCommercialCards(filteredCommercialCards);
        setBankCards(filteredBankCards);
      } catch (error) {
        console.error("Error al cargar tiendas:", error);
      }
    };

    fetchStores();
  }, [userId]);

  // Manejar el toggle de tarjetas (comerciales o bancarias)
  const handleToggle = async (storeId, isActive, isCustom) => {
    try {
      // Crear el payload según el tipo de tarjeta
      const payload = isCustom
        ? { user_id: userId, custom_store_id: storeId, status: isActive }
        : { user_id: userId, store_id: storeId, status: isActive };
  
      console.log("Enviando datos al backend:", payload);
  
      // Realizar la actualización en el backend
      await axios.put("http://localhost:3000/api/user_stores", payload);
  
      // Refrescar userStores
      const updatedUserStores = await axios.get("http://localhost:3000/api/user_stores", {
        params: { user_id: userId },
      });
  
      setUserStores(updatedUserStores.data);
  
      console.log("Estado actualizado en userStores:", updatedUserStores.data);
  
      // Notificar al Sidebar que las tiendas han cambiado
      setStoresUpdated((prev) => !prev); // Cambia el estado booleano para disparar el useEffect en el Sidebar
    } catch (error) {
      console.error("Error al actualizar el estado de la tienda:", error);
    }
  };

  useEffect(() => {
    const fetchUserStores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user_stores", {
          params: { user_id: userId },
        });
        console.log("Datos actualizados de userStores:", response.data);
        setUserStores(response.data); // Verifica que los datos incluyan custom_store_id
      } catch (error) {
        console.error("Error al cargar las tiendas del usuario:", error);
      }
    };
  
    fetchUserStores();
  }, [userId]);
  

  // Manejar creación de tarjetas bancarias
  const handleCreateBankCard = async () => {
    if (!newBankCard.bank || !newBankCard.type) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const cardName = `${newBankCard.type} ${newBankCard.bank}`;

    try {
      const storeResponse = await axios.post("http://localhost:3000/api/stores", {
        user_id: userId,
        name: cardName,
        logo_url: null,
        color_code: "#000",
        is_custom: "true",
      });

      const { customStoreId } = storeResponse.data;

      if (!customStoreId) {
        throw new Error("No se pudo obtener el ID de la tarjeta personalizada.");
      }


      // Refrescar las tarjetas bancarias
      const updatedBankCards = await axios.get("http://localhost:3000/api/stores", {
        params: { user_id: userId },
      });

      setBankCards(
        updatedBankCards.data.filter(
          (card) => card.is_custom === "true" && card.store_id !== -1
        )
      );


      

      // Reiniciar los campos del formulario y cerrar el modal
      setNewBankCard({ bank: "", type: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al crear tarjeta bancaria:", error);
      alert("Hubo un problema al crear la tarjeta bancaria.");
    }
  };

  return (
    <div className="card-admin">
      <h2>Administrador de Tarjetas</h2>

      {/* Tarjetas Comerciales */}
      <div className="card-list">
      {commercialCards.map((store) => {
  const isActive = isStoreActive(store.store_id, false);
  return (
    <div key={`store-${store.store_id}`} className="card-item">
      <img src={store.logo_url} alt={store.name} className="card-logo" />
      <p>{store.name}</p>
      <label className="switch">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => handleToggle(store.store_id, !isActive, false)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
})}
</div>

      {/* Tarjetas Bancarias */}
      <section className="section">
        <h3>Tarjetas Bancarias</h3>
        <div className="card-list">
        {bankCards.map((card) => {
          const isActive = isStoreActive(card.store_id || card.custom_store_id, true); // Comparar correctamente
          console.log(`Tarjeta bancaria: ${card.name}, Activa: ${isActive}`);
          return (
            <div key={`bank-card-${card.store_id || card.custom_store_id}`} className="card-item no-logo">
              <p>{card.name}</p>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => handleToggle(card.store_id || card.custom_store_id, !isActive, true)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          );
        })}
      </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="create-bank-card-btn"
        >
          Crear Tarjeta Bancaria
        </button>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Crear Nueva Tarjeta Bancaria</h2>
              <input
                type="text"
                placeholder="Banco"
                value={newBankCard.bank}
                onChange={(e) => setNewBankCard({ ...newBankCard, bank: e.target.value })}
              />
              <input
                type="text"
                placeholder="Tipo de tarjeta"
                value={newBankCard.type}
                onChange={(e) => setNewBankCard({ ...newBankCard, type: e.target.value })}
              />
              <button onClick={handleCreateBankCard}>Crear</button>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CardAdmin;