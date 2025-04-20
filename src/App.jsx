import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Buscar from "./pages/Buscar";
import Postulaciones from "./pages/Postulaciones";
import Navbar from "./components/Navbar";
import DetalleEmpleo from "./pages/DetalleEmpleo"; // 👈 NUEVO

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/postulaciones" element={<Postulaciones />} />
        <Route path="/empleo/:id" element={<DetalleEmpleo />} /> {/* 👈 NUEVA RUTA */}
      </Routes>
    </div>
  );
}

export default App;
