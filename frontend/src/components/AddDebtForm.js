import React, { useState } from "react";
import api from "../services/api";

function AddDebtForm({ accountId, onDebtAdded }) {
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [cuotas, setCuotas] = useState("");
  const [mesInicio, setMesInicio] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    api.post("/debts", {
      name,
      total: parseFloat(total),
      cuotas: parseInt(cuotas),
      mes_inicio: parseInt(mesInicio),
      monto_cuota: parseFloat(total) / parseInt(cuotas),
      accountId,
    })
      .then(() => {
        onDebtAdded(); // Actualiza la lista de deudas
        setName("");
        setTotal("");
        setCuotas("");
        setMesInicio("");
      })
      .catch((error) => {
        console.error("Error al agregar deuda:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Deuda</h2>
      <input
        type="text"
        placeholder="Nombre de la deuda"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Total"
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Cuotas"
        value={cuotas}
        onChange={(e) => setCuotas(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Mes de inicio (1-12)"
        value={mesInicio}
        onChange={(e) => setMesInicio(e.target.value)}
        required
      />
      <button type="submit">Agregar</button>
    </form>
  );
}

export default AddDebtForm;
