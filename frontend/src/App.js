import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DebtList from "./components/DebtList";
import CardAdmin from "./components/CardAdmin";
import DebtSummary from "./components/DebtSummary";
import Login from "./components/Login";
import Register from "./components/Register";
import { jwtDecode } from "jwt-decode";

const App = ({ setIsAuthenticated, isAuthenticated }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showCardAdmin, setShowCardAdmin] = useState(false);
  const [userName, setUserName] = useState(""); // Define `userName` y `setUserName`
  const [storesUpdated, setStoresUpdated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.first_name); // Decodifica y actualiza el nombre
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error al decodificar el token en App:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
  }, [setIsAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserName(""); // Limpia el estado `userName`
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login setIsAuthenticated={setIsAuthenticated} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Register />
          )
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <div className="flex h-screen bg-gray-100">
              <Sidebar
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                setShowCardAdmin={setShowCardAdmin}
                storesUpdated={storesUpdated}
                setStoresUpdated={setStoresUpdated}
              />
              <div className="flex-1 flex flex-col">
                <Header
                  userName={userName} // Pasa el nombre del usuario
                  setUserName={setUserName} // Pasa la función `setUserName`
                />
                <main className="p-4 overflow-auto">
                  {showCardAdmin ? (
                    <CardAdmin setStoresUpdated={setStoresUpdated} />
                  ) : selectedAccount ? (
                    <DebtList selectedAccount={selectedAccount} />
                  ) : (
                    <DebtSummary />
                  )}
                </main>
              </div>
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;