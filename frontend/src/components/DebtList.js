import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./DebtList.css";
import { getManualExpenses, updateManualExpenses } from "../services/api";
import axios from "axios";


function DebtList({ selectedAccount }) {
  const userId = localStorage.getItem("user_id");
  const storeId = selectedAccount?.store_id || selectedAccount?.user_store_id;
  const [debts, setDebts] = useState([]);
  const [isSubscription, setIsSubscription] = useState(false); // NUEVO: Estado para el tipo de registro
  const [categories, setCategories] = useState([]); // Asegúrate de cargar categorías correctamente
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año seleccionado
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [valorCuota, setValorCuota] = useState(null);
  const [total, setTotal] = useState(0);
  const [cuotas, setCuotas] = useState(0);
  const storeColor = selectedAccount?.color_code || "#000";
  const [showPaidDebts, setShowPaidDebts] = useState(false); // Estado del switch
  const [insurance, setInsurance] = useState(0); // Estado para seguros
  const [adminFee, setAdminFee] = useState(0); // Estado para cargos administrativos
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [modalMonth, setModalMonth] = useState(selectedMonth); // Estado para el mes en el modal
  const [selectedStore, setSelectedStore] = useState(null); // Asegúrate de que sea actualizado al seleccionar una tienda.
  

<DebtList selectedStore={selectedStore} selectedAccount={selectedAccount} />

useEffect(() => {
  if (selectedStore) {
    console.log("Tienda seleccionada:", selectedStore);
    // Aquí puedes llamar a `fetchManualExpenses` o realizar otra lógica
    fetchManualExpenses();
  }
}, [selectedStore]); // Dependencia para disparar el efecto cuando cambia

const openModal = () => {
  if (!selectedStore) {
    alert("Por favor, selecciona una tienda antes de continuar.");
    return;
  }
  setModalMonth(selectedMonth); // Inicializa el mes del modal con el mes seleccionado
  setModalOpen(true); // Abre el modal
};

  const [sortOrder, setSortOrder] = useState("asc"); // Estado para el orden (asc o desc)

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc")); // Alterna entre ascendente y descendente
    fetchDebts(); // Recargar los datos con el nuevo orden
  };

  const newExpense = {
    user_id: userId,
    store_id: storeId,
    expense_type: "Seguro",
    amount: insuranceAmount, // Asegúrate de tener esta variable
    month: selectedMonth,
    year: selectedYear,
  };
  

  useEffect(() => {
    if (selectedAccount) {
      fetchManualExpenses();
    }
  }, [selectedAccount, selectedMonth, selectedYear]); // Dependencias



// Actualizar gastos, seguros y reversos
const fetchManualExpenses = async () => {
  const userId = localStorage.getItem("user_id");
  const storeId = selectedAccount?.store_id || selectedAccount?.user_store_id;

  if (!userId || !storeId) {
    console.error("Usuario o cuenta no identificados. No se pueden cargar gastos manuales.");
    return;
  }

  try {
    const response = await api.get("/manual-expenses", {
      params: { user_id: userId, store_id: storeId, year: selectedYear },
    });

    const defaultExpenses = Array(12).fill({ insurance: 0, adminFee: 0, reversal: 0 });

    const expenses = response.data.reduce((acc, expense) => {
      const monthIndex = expense.month - 1; // Ajustar índice del mes
      if (monthIndex >= 0 && monthIndex < 12) {
        acc[monthIndex] = {
          insurance: expense.expense_type === "Seguro" ? expense.amount : acc[monthIndex].insurance,
          adminFee: expense.expense_type === "Administración" ? expense.amount : acc[monthIndex].adminFee,
          reversal: expense.expense_type === "Reverso" ? expense.amount : acc[monthIndex].reversal,
        };
      }
      return acc;
    }, defaultExpenses);

    setManualExpenses(expenses);
    console.log("Gastos procesados en frontend:", expenses);
  } catch (error) {
    console.error("Error al cargar los gastos manuales:", error);
  }
};


  // Formatear números
  const formatNumber = (number) => {
    return number
      ? Math.round(number).toLocaleString("es-CL", {
          maximumFractionDigits: 0,
        })
      : "0";
  };
  
  // Calcular cuota
  const handleTotalChange = (value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setTotal(parsedValue);
      calcularCuota(parsedValue, cuotas);
    }
  };

  const handleCuotasChange = (value) => {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      setCuotas(parsedValue);
      calcularCuota(total, parsedValue);
    }
  };

  const calcularCuota = (totalValue, cuotasValue) => {
    if (!totalValue || !cuotasValue || totalValue <= 0 || cuotasValue <= 0) {
      // Si alguno de los valores no es válido, no calcular
      setValorCuota(null);
      return;
    }
  
    // Realiza el cálculo solo si los valores son válidos
    const cuota = totalValue / cuotasValue;
    setValorCuota(cuota);
  };

  // Manejo de Comision y cargos
  useEffect(() => {
    if (selectedAccount) {
      fetchManualExpenses();
    }
  }, [selectedAccount, selectedMonth, selectedYear]); // Dependencias: cuenta seleccionada, mes y año
  
  

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      }
    };

    fetchCategories();
  }, []);

// Cargar deudas
const fetchDebts = async () => {
  const storeId = selectedAccount?.store_id || selectedAccount?.user_store_id;

  if (!storeId) {
    console.warn("La cuenta seleccionada no tiene un ID válido:", selectedAccount);
    return;
  }

  try {
    const apiResponse = await api.get("/debts", {
      params: {
        accountId: storeId,
        purchaseYear: selectedYear,
        userId: localStorage.getItem("user_id"), // Agregar filtro por usuario
      },
    });

    const currentDate = new Date();

    const processedDebts = apiResponse.data.map((debt) => {
      const {
        purchase_value = 0,
        installments = 0,
        installment_value = 0,
        purchase_month = 0,
        purchase_year = 0,
        end_date,
        is_subscription,
      } = debt;

      const parsedEndDate = end_date ? new Date(end_date) : null;

      // Determinar si la suscripción está activa
      const isActive =
        is_subscription && (!parsedEndDate || parsedEndDate >= currentDate);

      // Calcular cuotas pagadas
      const cuotasPagadas = (() => {
        if (selectedYear < purchase_year) return 0;
        const monthsElapsed =
          (selectedYear - purchase_year) * 12 + (selectedMonth - purchase_month);

        if (parsedEndDate) {
          const monthsUntilEnd =
            (parsedEndDate.getFullYear() - purchase_year) * 12 +
            (parsedEndDate.getMonth() + 1 - purchase_month);
          return Math.min(monthsElapsed + 1, monthsUntilEnd);
        }

        return Math.max(0, monthsElapsed + 1);
      })();

      // Calcular saldo restante
      const saldo = is_subscription
        ? purchase_value
        : Math.max(0, purchase_value - cuotasPagadas * installment_value);

      // Calcular montos mensuales
const monthlyTotals = Array.from({ length: 12 }, (_, month) => {
  const currentMonth = new Date(selectedYear, month); // Fecha del mes actual
  const startDate = new Date(purchase_year, purchase_month - 1); // Fecha de inicio
  const isEndDateValid = parsedEndDate && parsedEndDate instanceof Date; // Validación de fecha de término
  
  // Suscripción
  if (is_subscription) {
    const isWithinSubscription =
      (!isEndDateValid || currentMonth <= parsedEndDate) &&
      currentMonth >= startDate;
    return isWithinSubscription ? purchase_value : null;
  }

  // Compra por cuotas
  if (!is_subscription) {
    const monthsElapsed = 
      (selectedYear - purchase_year) * 12 + (month - (purchase_month - 1));

    const isWithinInstallments =
      monthsElapsed >= 0 && monthsElapsed < installments;
    return isWithinInstallments ? installment_value : null;
  }

  // Default (no suscripción ni compra)
  return null;
});

      return {
        ...debt,
        purchase_value: parseFloat(purchase_value),
        installments: parseInt(installments, 10),
        installment_value: parseFloat(installment_value),
        purchase_month: parseInt(purchase_month, 10),
        purchase_year: parseInt(purchase_year, 10),
        monthlyTotals,
        cuotasPagadas,
        saldo,
        isActive,
      };
    });

    // Ordenar y filtrar deudas
    const sortedDebts = [...processedDebts].sort((a, b) => {
      const valueA = a.monthlyTotals[selectedMonth - 1] || 0;
      const valueB = b.monthlyTotals[selectedMonth - 1] || 0;
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });

    const filteredDebts = sortedDebts.filter((debt) =>
      showPaidDebts ? true : debt.monthlyTotals[selectedMonth - 1] !== null
    );

    setDebts(filteredDebts);
  } catch (error) {
    console.error("Error al cargar las deudas:", error.message || error);
  }
};


// Efectos
useEffect(() => {
  if (selectedAccount && selectedMonth && selectedYear) {
    fetchManualExpenses();
  }
}, [selectedAccount, selectedMonth, selectedYear]);

useEffect(() => {
  if (selectedAccount && selectedYear) {
    fetchDebts();
  }
}, [selectedAccount, selectedYear, selectedMonth, showPaidDebts]);

const handleSave = async (e) => {
  e.preventDefault();

  // Obtener el usuario desde localStorage
  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    alert("Usuario no identificado. Inicia sesión nuevamente.");
    return;
  }

  // Extraer datos del formulario
  const isSubscription = e.target.is_subscription?.value === "true";
  const store_id = selectedAccount?.store_id || null;
  const description = e.target.description?.value || "";
  const total = isSubscription
    ? parseFloat(e.target.monthly_total?.value) // Total mensual para suscripciones
    : parseFloat(e.target.total?.value); // Total para compras
  const cuotas = isSubscription ? 999 : parseInt(e.target.cuotas?.value, 10); // 999 cuotas para suscripciones
  const purchase_month = modalMonth; // Mes desde el estado del modal
  const purchase_year = parseInt(e.target.purchase_year?.value, 10); // Año seleccionado en el formulario
  const category_id = e.target.category_id?.value || null; // Categoría seleccionada
  const end_date = e.target.end_date?.value || null; // Fecha de baja para suscripciones

  // Validar los datos obligatorios
  if (!store_id) {
    alert("Debe seleccionar una tienda válida.");
    return;
  }
  if (!description || !total || !purchase_month || !purchase_year || !category_id) {
    alert("Todos los campos son obligatorios.");
    return;
  }
  if (total <= 0) {
    alert("El total debe ser mayor a 0.");
    return;
  }

  // Crear el objeto de datos para enviar al backend
  const payload = {
    user_id,
    store_id,
    description,
    purchase_value: total,
    installments: cuotas,
    purchase_month,
    purchase_year,
    is_subscription: isSubscription,
    category_id,
    end_date,
  };

  console.log("Datos enviados al backend:", payload);

  try {
    // Si estamos editando, hacer una solicitud PUT
    if (editingDebt) {
      const response = await axios.put(
        `http://localhost:3000/api/debts/${editingDebt.id}`,
        payload
      );

      if (response.status === 200) {
        alert("Registro actualizado exitosamente.");
      } else {
        alert("Error al actualizar el registro.");
      }
    } else {
      // Si estamos creando un nuevo registro, hacer una solicitud POST
      const response = await axios.post("http://localhost:3000/api/debts", payload);

      if (response.status === 201) {
        alert(
          isSubscription
            ? "Suscripción creada exitosamente."
            : "Deuda creada exitosamente."
        );
      } else {
        alert("Error al crear el registro.");
      }
    }

    // Cerrar el modal y refrescar la lista de deudas
    setModalOpen(false);
    fetchDebts();
  } catch (err) {
    console.error("Error al guardar la deuda o suscripción:", err);
    alert("Ocurrió un error al guardar la deuda o suscripción.");
  }
};

  


  //borrar deuda
  const handleDelete = async (id, description) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${description}"?`)) {
      try {
        await api.delete(`/debts/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Deuda eliminada exitosamente.");
        fetchDebts(); // Recargar datos después de eliminar
      } catch (error) {
        console.error("Error al eliminar la deuda:", error);
        alert("Hubo un problema al intentar eliminar la deuda.");
      }
    }
  };
  

  // Cargar gastos manuales
const loadExpenses = async () => {
  try {
    const response = await getManualExpenses(userId, storeId, selectedMonth, selectedYear);
    const expenses = response.data;
    setInsurance(expenses?.[0]?.insurance || 0);
    setAdminFee(expenses?.[0]?.admin_fee || 0);
  } catch (error) {
    console.error("Error al cargar los gastos manuales:", error);
  }
};

const [manualExpenses, setManualExpenses] = useState(
  Array(12).fill({ insurance: "", adminFee: ""})
);

const updateManualExpense = (month, type, value) => {
  setManualExpenses((prev) => {
    const updated = [...prev];
    updated[month] = { ...updated[month], [type]: parseFloat(value) || 0 };
    return updated;
  });
};


// Guardar gastos manuales
const saveManualExpense = async (month, type) => {
  const userId = localStorage.getItem("user_id");
  const storeId = selectedAccount?.user_store_id || selectedAccount?.store_id;

  if (!userId || !storeId) {
    console.warn("Datos de usuario o cuenta faltantes:", { userId, storeId });
    alert("Usuario o cuenta no identificados. Por favor, selecciona una cuenta.");
    return;
  }

  // Mapeo para convertir la clave interna (en inglés) a la clave esperada por el backend (en español)
  const typeMapping = {
    insurance: "Seguro",
    adminFee: "Administración",
    reversal: "Reverso",
  };

  const expenseType = typeMapping[type]; // Mapear la clave interna a la externa

  if (!expenseType) {
    alert("Tipo de gasto inválido.");
    return;
  }

  const amount = parseFloat(manualExpenses[month]?.[type]);

  // Validaciones
  if (type === "reversal" && (isNaN(amount) || amount >= 0)) {
    alert("El monto del reverso debe ser negativo y diferente de 0.");
    return;
  } else if (type !== "reversal" && (isNaN(amount) || amount <= 0)) {
    alert("El monto debe ser mayor a 0.");
    return;
  }

  const expenseData = {
    user_id: userId,
    store_id: storeId,
    month: month + 1,
    year: selectedYear,
    expense_type: expenseType, // Ahora envía el nombre mapeado en español
    amount,
    is_reversal: type === "reversal",
  };

  try {
    const response = await api.put("/manual-expenses", expenseData);

    if (response.status === 200 || response.status === 201) {
      console.log("Gasto manual guardado exitosamente:", expenseData);
      alert("Gasto manual guardado exitosamente.");
    } else {
      console.warn("Error al guardar el gasto manual:", response.data.message);
      alert(response.data.message || "No se pudo guardar el gasto manual.");
    }
  } catch (error) {
    console.error("Error al guardar el gasto manual:", error);
    alert("Hubo un problema al guardar el gasto manual.");
  }
};




  // Editar deuda
  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setIsSubscription(debt.is_subscription); // Configura el tipo (compra o suscripción)
    setModalMonth(debt.purchase_month); // Configura el mes seleccionado
    setTotal(debt?.purchase_value || 0);
    setCuotas(debt?.installments || 0);
    calcularCuota(debt.purchase_value, debt.installments);
    setSelectedYear(debt.purchase_year);
    setModalOpen(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{selectedAccount.name}</h1>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <label htmlFor="month-selector" className="mr-2 font-bold">
            Selecciona el mes:
          </label>
          <select
            id="month-selector"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("es", { month: "long" })}
              </option>
            ))}
          </select>
          <label htmlFor="year-selector" className="ml-4 mr-2 font-bold">
            Año:
          </label>
          <select
            id="year-selector"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - 2 + i}>
                {new Date().getFullYear() - 2 + i}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center mb-4">
  <label htmlFor="togglePaidDebts" className="mr-2 font-bold">
    Mostrar deudas saldadas:
  </label>
  <input
    id="togglePaidDebts"
    type="checkbox"
    checked={showPaidDebts}
    onChange={() => setShowPaidDebts(!showPaidDebts)}
    className="toggle-checkbox"
  />
</div>
        <button
          onClick={() => {
            setEditingDebt(null);
            setModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Nueva Deuda
        </button>
      </div>

      

      {modalOpen && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full">
      <h2 className="text-lg font-bold mb-4">
        {editingDebt ? "Editar Registro" : "Agregar Nuevo Registro"}
      </h2>
      <form onSubmit={handleSave}>
        {/* Tipo de Registro */}
        <div className="mb-4">
            <label className="block font-bold mb-2">Tipo:</label>
            <select
              name="is_subscription" // IMPORTANTE: El nombre debe coincidir
              defaultValue={isSubscription ? "true" : "false"}
              onChange={(e) => setIsSubscription(e.target.value === "true")}
              className="border px-3 py-2 rounded w-full"
              disabled={!!editingDebt} // Deshabilita si estamos en modo edición
            >
              <option value="false">Compra</option>
              <option value="true">Suscripción</option>
            </select>
          </div>


        {/* Campos para Compra */}
        {!isSubscription && (
          <>
            <div className="mb-4">
              <label className="block font-bold mb-2">Producto/Servicio:</label>
              <input
                name="description" // Este debe coincidir con el backend
                type="text"
                defaultValue={editingDebt?.description || ""}
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>  
            <div className="mb-4">
  <label className="block font-bold mb-2">Total:</label>
  <input
    name="total"
    type="number"
    defaultValue={editingDebt?.purchase_value || ""}
    className="border px-3 py-2 rounded w-full"
    onChange={(e) => {
      const newTotal = parseFloat(e.target.value) || 0; // Actualiza el estado del total
      setTotal(newTotal);
      calcularCuota(newTotal, cuotas); // Recalcula el valor de la cuota
    }}
    required
  />
</div>
<div className="mb-4">
  <label className="block font-bold mb-2">Número de Cuotas:</label>
  <input
    name="cuotas"
    type="number"
    defaultValue={editingDebt?.installments || ""}
    className="border px-3 py-2 rounded w-full"
    onChange={(e) => {
      const newCuotas = parseInt(e.target.value) || 0; // Actualiza el estado de las cuotas
      setCuotas(newCuotas);
      calcularCuota(total, newCuotas); // Recalcula el valor de la cuota
    }}
    required
  />
</div>
<div className="mb-4">
  <label className="block font-bold mb-2">Valor Cuota:</label>
  <div className="text-gray-700 font-semibold">
  {valorCuota !== null ? `$${Math.round(valorCuota).toLocaleString("es-CL", { maximumFractionDigits: 0 })}` : "-"}
  </div>
</div>
          </>
        )}

        {/* Campos para Suscripción */}
        {isSubscription && (
          <>
            <div className="mb-4">
              <label className="block font-bold mb-2">Servicio suscrito:</label>
              <input
                name="description" // Este debe coincidir con el backend
                type="text"
                defaultValue={editingDebt?.description || ""}
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>  
            <div className="mb-4">
              <label className="block font-bold mb-2">Total Mensual:</label>
              <input
                name="monthly_total"
                type="number"
                defaultValue={editingDebt?.purchase_value || ""}
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>
          </>
        )}

      {/* Campo de Baja: Solo visible en edición */}
        {editingDebt && isSubscription && (
          <div className="mb-4">
            <label className="block font-bold mb-2">Fecha de Baja:</label>
            <input
              name="end_date"
              type="date"
              defaultValue={editingDebt?.end_date?.split('T')[0] || ""}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        )}

        {/* Mes y Año de Inicio */}
        <div className="mb-4">
    <label className="block font-bold mb-2">Mes:</label>
    <select
      value={modalMonth}
      onChange={(e) => setModalMonth(Number(e.target.value))}
      className="border px-3 py-2 rounded w-full"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <option key={i} value={i + 1}>
          {new Date(0, i).toLocaleString("es", { month: "long" })}
        </option>
      ))}
    </select>
  </div>


        <div className="mb-4">
          <label className="block font-bold mb-2">Año de Inicio:</label>
          <select
            name="purchase_year"
            value={editingDebt?.purchase_year || selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {/* Categoría */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Categoría:</label>
          <select
            name="category_id"
            className="border px-3 py-2 rounded w-full"
            defaultValue={editingDebt?.category_id || ""}
            required
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_categoria}
              </option>
            ))}
          </select>
        </div>


        {/* Botones */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      <table className="min-w-full bg-white shadow rounded overflow-hidden">
  <thead>
    <tr>
      <th className="px-4 py-2">Producto/Servicio</th>
      <th className="px-4 py-2 text-right">Total</th>
      <th className="px-4 py-2 text-right">Saldo</th>
      <th>Status Subsc.</th>
      {Array.from({ length: 12 }).map((_, i) => (
        <th
          key={i}
          className={`px-4 py-2 text-right ${
            i + 1 === selectedMonth ? "cursor-pointer underline" : ""
          }`}
          onClick={i + 1 === selectedMonth ? toggleSortOrder : undefined} // Solo el mes seleccionado permite clic
        >
          {new Date(0, i).toLocaleString("es", { month: "short" })}{" "}
          {i + 1 === selectedMonth && (sortOrder === "asc" ? "⬆️" : "⬇️")}
        </th>
      ))}
      <th className="px-4 py-2 text-right">Cuotas Pagadas</th>
      <th className="px-4 py-2 text-right">Total de Cuotas</th>
      <th className="px-4 py-2 text-center">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {debts.map((debt, index) => (
      <tr key={index}>
        <td className="px-4 py-2">{debt.description || "Sin descripción"}</td>
        <td className="px-4 py-2 text-right">
          ${formatNumber(debt.purchase_value || 0)}
        </td>
        <td className="px-4 py-2 text-right">
          ${formatNumber(debt.saldo || 0)}
        </td>
        <td className="px-4 py-2 text-center">
          {debt.is_subscription ? (debt.isActive ? "Activa" : "Baja") : ""}
        </td>
        {Array.from({ length: 12 }).map((_, month) => (
          <td
            key={month}
            className={`px-4 py-2 text-right ${
              month + 1 === selectedMonth ? "bg-gray-200 font-bold" : ""
            }`}
          >
            {debt.monthlyTotals && debt.monthlyTotals[month] !== null
              ? `$${formatNumber(debt.monthlyTotals[month] || 0)}`
              : "-"}
          </td>
        ))}
        <td className="px-4 py-2 text-right">
          {formatNumber(debt.cuotasPagadas || 0)}
        </td>
        <td className="px-4 py-2 text-right">
          {formatNumber(debt.installments || 0)}
        </td>
        <td className="px-4 py-2 text-center">
          <button
            className="text-blue-500 hover:text-blue-700 mx-2"
            onClick={() => handleEdit(debt)}
          >
            ✏️
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={async () => {
              if (
                window.confirm(
                  `¿Seguro que deseas eliminar la deuda "${debt.description}"?`
                )
              ) {
                try {
                  await api.delete(`/debts/${debt.id}`);
                  alert("Deuda eliminada exitosamente.");
                  fetchDebts();
                } catch (error) {
                  console.error("Error al eliminar la deuda:", error);
                  alert("Hubo un problema al intentar eliminar la deuda.");
                }
              }
            }}
          >
            🗑️
          </button>
        </td>
      </tr>
    ))}


  {/* Fila de Subtotales */}
  <tr className="bg-gray-700 text-white font-bold">
  <td className="px-4 py-2" colSpan="4">Subtotal</td>
  {Array.from({ length: 12 }).map((_, month) => {
    const monthlySubtotal = debts.reduce((acc, debt) => {
      const value = parseFloat(debt.monthlyTotals[month]) || 0; // Asegura valores numéricos válidos
      return acc + value;
    }, 0);
    return (
      <td key={month} className="px-4 py-2 text-right">
        ${formatNumber(monthlySubtotal)}
      </td>
    );
  })}
  <td colSpan="3"></td>
</tr>

{/* Fila de Seguro */}
<tr>
  <td className="px-4 py-2" colSpan="4">Seguro</td>
  {Array.from({ length: 12 }).map((_, month) => (
    <td key={month} className="px-4 py-2 text-right">
      <input
        type="text"
        className="border px-2 py-1 rounded w-full text-sm text-right"
        value={
          month + 1 <= selectedMonth // Mostrar solo hasta el mes seleccionado
            ? formatNumber(manualExpenses[month]?.insurance || 0)
            : "" // Dejar vacío los meses posteriores
        }
        onChange={(e) => {
          if (month + 1 === selectedMonth) {
            const rawValue = e.target.value.replace(/\./g, ""); // Remover separadores de miles
            const numericValue = parseInt(rawValue, 10) || 0; // Convertir a número
            updateManualExpense(month, "insurance", numericValue); // Usa la clave interna aquí
          }
        }}
        onBlur={() => {
          if (month + 1 === selectedMonth) {
            saveManualExpense(month, "insurance"); // Enviar siempre el valor en inglés
          }
        }}
        disabled={month + 1 !== selectedMonth} // Solo el mes seleccionado es editable
      />
    </td>
  ))}
  <td colSpan="3"></td>
</tr>


{/* Fila de Cargo de Administración */}
<tr>
  <td className="px-4 py-2" colSpan="4">Cargo de Administración</td>
  {Array.from({ length: 12 }).map((_, month) => (
    <td key={month} className="px-4 py-2 text-right">
      <input
        type="text"
        className="border px-2 py-1 rounded w-full text-sm text-right"
        value={
          month + 1 <= selectedMonth // Mostrar solo hasta el mes seleccionado
            ? formatNumber(manualExpenses[month]?.adminFee || 0)
            : "" // Dejar vacío los meses posteriores
        }
        onChange={(e) => {
          if (month + 1 === selectedMonth) {
            const rawValue = e.target.value.replace(/\./g, ""); // Remover separadores de miles
            const numericValue = parseInt(rawValue, 10) || 0; // Convertir a número
            updateManualExpense(month, "adminFee", numericValue);
          }
        }}
        onBlur={() => {
          if (month + 1 === selectedMonth) {
            saveManualExpense(month, "adminFee"); // Envía "Administración" al guardar
          }
        }}
        disabled={month + 1 !== selectedMonth} // Solo el mes seleccionado es editable
      />
    </td>
  ))}
  <td colSpan="3"></td>
</tr>


{/* Fila de Reverso */}
<tr>
  <td className="px-4 py-2" colSpan="4">Reverso</td>
  {Array.from({ length: 12 }).map((_, month) => (
    <td key={month} className="px-4 py-2 text-right">
      <input
        type="text"
        className="border px-2 py-1 rounded w-full text-sm text-right"
        value={
          month + 1 <= selectedMonth // Mostrar solo hasta el mes seleccionado
            ? formatNumber(manualExpenses[month]?.reversal || 0)
            : "" // Dejar vacío los meses posteriores
        }
        onChange={(e) => {
          if (month + 1 === selectedMonth) {
            const rawValue = e.target.value.replace(/\./g, ""); // Remover separadores de miles
            const numericValue = parseInt(rawValue, 10) || 0; // Convertir a número
            updateManualExpense(month, "reversal", numericValue);
          }
        }}
        onBlur={() => {
          if (month + 1 === selectedMonth) {
            saveManualExpense(month, "reversal"); // Envía "Reverso" al guardar
          }
        }}
        disabled={month + 1 !== selectedMonth} // Solo el mes seleccionado es editable
      />
    </td>
  ))}
  <td colSpan="3"></td>
</tr>


{/* Fila de Total a Pagar */}
<tr className="bg-gray-700 text-white font-bold">
  <td className="px-4 py-2" colSpan="4">Total a Pagar</td>
  {Array.from({ length: 12 }).map((_, month) => {
    // Suma los valores de deudas
    const allDebtsTotal = debts.reduce((acc, debt) => {
      return acc + (parseFloat(debt.monthlyTotals[month]) || 0);
    }, 0);

    // Suma de seguro, cargo de administración y reverso
    const insuranceTotal = parseFloat(manualExpenses[month]?.insurance || 0);
    const adminFeeTotal = parseFloat(manualExpenses[month]?.adminFee || 0);
    const reversalTotal = parseFloat(manualExpenses[month]?.reversal || 0);

    // Cálculo del total mensual
    const total =
      allDebtsTotal + insuranceTotal + adminFeeTotal - reversalTotal;

    return (
      <td key={month} className="px-4 py-2 text-right">
        ${formatNumber(total)}
      </td>
    );
  })}
  <td colSpan="3"></td>
</tr>
</tbody>



      </table>
    </div>
  );
}
export default DebtList;