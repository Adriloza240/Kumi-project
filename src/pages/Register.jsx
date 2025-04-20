import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import { motion } from "framer-motion";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("empleado");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const isValidPass = password.length >= 6;

  const handleRegister = (e) => {
    e.preventDefault();

    if (!nombre || !isValidEmail || !isValidPass) {
      setToast({
        message: "⚠️ Completa todos los campos correctamente",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      const yaExiste = usuarios.some(u => u.correo === correo);
      if (yaExiste) {
        setToast({ message: "❌ El correo ya está registrado", type: "error" });
        setLoading(false);
        return;
      }

      const nuevoUsuario = { nombre, correo, password, tipo };

      // Guardamos en el "registro" general
      localStorage.setItem("usuarios", JSON.stringify([...usuarios, nuevoUsuario]));

      // Guardamos el usuario activo
      localStorage.setItem("user", JSON.stringify(nuevoUsuario));

      setToast({ message: "✅ Cuenta creada exitosamente", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1000);
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-gray-100 to-green-100 px-4">
      {loading && <Loader />}
      {toast && <Toast {...toast} />}
      {!loading && (
        <motion.form
          onSubmit={handleRegister}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md space-y-6"
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-emerald-600">Crear Cuenta</h2>
            <p className="text-sm text-gray-500">Completa los datos para continuar</p>
          </div>

          <input
            className="w-full p-3 border rounded-lg shadow-sm"
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <input
            className="w-full p-3 border rounded-lg shadow-sm"
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          {!isValidEmail && correo && (
            <p className="text-sm text-red-500">Correo inválido</p>
          )}

          <input
            className="w-full p-3 border rounded-lg shadow-sm"
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isValidPass && password && (
            <p className="text-sm text-red-500">Contraseña muy corta</p>
          )}

          <div className="flex justify-around text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="empleado"
                checked={tipo === "empleado"}
                onChange={() => setTipo("empleado")}
              />
              Soy Empleado
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="empresa"
                checked={tipo === "empresa"}
                onChange={() => setTipo("empresa")}
              />
              Soy Empresa
            </label>
          </div>

          <button
            type="submit"
            disabled={!isValidEmail || !isValidPass}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              isValidEmail && isValidPass
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Registrarse
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </motion.form>
      )}
    </div>
  );
}
