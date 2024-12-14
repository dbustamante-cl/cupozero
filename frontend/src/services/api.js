import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // URL base de tu backend
});

// Función para obtener los gastos manuales
export const getManualExpenses = async (userId, storeId, month, year) => {
  return api.get(`/manual-expenses`, {
    params: {
      user_id: userId,
      store_id: storeId,
      month,
      year,
    },
  });
};

// Función para actualizar o insertar gastos manuales
export const updateManualExpenses = async (data) => {
  return api.put(`/manual-expenses`, data);
};

// Exporta la instancia API por si necesitas otros endpoints
export default api;
