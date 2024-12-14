import React, { useState, useEffect } from "react";
import api from "../services/api";

function AccountList({ onSelectAccount }) {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    // Cargar las cuentas desde la API
    api.get("/accounts")
      .then((response) => {
        setAccounts(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar las cuentas:", error);
      });
  }, []);

  return (
    <div>
      <h2>Cuentas</h2>
      {accounts.length > 0 ? (
        <select onChange={(e) => onSelectAccount(e.target.value)} defaultValue="">
          <option value="" disabled>
            Selecciona una cuenta
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      ) : (
        <p>No hay cuentas disponibles. Por favor, agrega una cuenta desde el backend.</p>
      )}
    </div>
  );
}

export default AccountList;
