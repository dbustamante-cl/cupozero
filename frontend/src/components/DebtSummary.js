import React, { useEffect, useState } from "react";
import api from "../services/api";

function DebtSummary() {
  const currentYear = new Date().getFullYear(); // Año actual
  const [summary, setSummary] = useState([]); // Resumen general
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Manejo de errores
  const [year, setYear] = useState(currentYear); // Año seleccionado

  // Cargar datos del resumen desde la API
  useEffect(() => {
    const fetchSummary = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setError("El ID del usuario no está disponible.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/resume/debt-summary", {
          params: { user_id: userId, year }, // Pasar el user_id y el año como query params
        });

        if (response.data && Array.isArray(response.data)) {
          setSummary(response.data); // Guardar los datos en el estado
        } else {
          setError("La respuesta del servidor no es válida.");
        }
      } catch (err) {
        setError("Error al obtener el resumen de deudas.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [year]); // Volver a cargar datos cuando cambie el año

  // Calcular totales por mes y total anual
  const calculateTotals = () => {
    const monthlyTotals = Array(12).fill(0);
    let annualTotal = 0;

    summary.forEach((item) => {
      // Sumar valores de cada mes y añadirlos al total mensual
      ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"].forEach((month, i) => {
        const value = parseFloat(item[month]) || 0;
        monthlyTotals[i] += value;
      });

      // Sumar el total anual de cada cuenta
      annualTotal += parseFloat(item.total) || 0;
    });

    return { monthlyTotals, annualTotal };
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!summary.length) return <p>No hay datos disponibles para el año {year}.</p>;

  const { monthlyTotals, annualTotal } = calculateTotals();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resumen de Deudas Totales</h1>

      {/* Selector de Año */}
      <div className="mb-4">
        <label htmlFor="year-select" className="mr-2">Selecciona el Año:</label>
        <select
          id="year-select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {/* Generar opciones para los últimos 5 años */}
          {Array.from({ length: 5 }).map((_, i) => {
            const yearOption = currentYear - i;
            return (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            );
          })}
        </select>
      </div>

      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-green-500 text-white">
          <tr>
            <th className="px-4 py-2 text-left">Cuenta</th>
            {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((month, i) => (
              <th key={i} className="px-4 py-2 text-right">{month}</th>
            ))}
            <th className="px-4 py-2 text-right">Año Total</th>
          </tr>
        </thead>
        <tbody>
          {/* Filas con datos de cuentas */}
          {summary.map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-2">{item.store_name}</td>
              {["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"].map((month, i) => (
                <td key={i} className="px-4 py-2 text-right">
                  {item[month] > 0 ? `$ ${Math.round(item[month]).toLocaleString("es-CL")}` : "-"}
                </td>
              ))}
              <td className="px-4 py-2 text-right">
                $ {Math.round(item.total || 0).toLocaleString("es-CL")}
              </td>
            </tr>
          ))}

          {/* Fila de Totales */}
          <tr className="bg-gray-300 font-bold">
            <td className="px-4 py-2">Totales</td>
            {monthlyTotals.map((amount, i) => (
              <td key={i} className="px-4 py-2 text-right">
                $ {Math.round(amount).toLocaleString("es-CL")}
              </td>
            ))}
            <td className="px-4 py-2 text-right">$ {Math.round(annualTotal).toLocaleString("es-CL")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DebtSummary;