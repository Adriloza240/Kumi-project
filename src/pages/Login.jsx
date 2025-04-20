import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Loader from "../components/Loader";
import Toast from "../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPass = pass.length >= 6;

  const handleLogin = (e) => {
    e.preventDefault();

    if (!isValidEmail || !isValidPass) {
      setToast({ message: "❌ Datos inválidos", type: "error" });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const user = usuarios.find((u) => u.correo === email && u.password === pass);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        setToast({ message: "✅ Bienvenido", type: "success" });
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setToast({ message: "❌ Credenciales incorrectas", type: "error" });
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-gray-100 to-blue-100 px-4">
      {loading && <Loader />}
      {toast && <Toast {...toast} />}
      {!loading && (
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md space-y-6 border border-gray-200"
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-indigo-700">Iniciar Sesión</h2>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">Correo electrónico</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg shadow-sm"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">Contraseña</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg shadow-sm"
              placeholder="••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>

          {/* Botón login */}
          <button
            type="submit"
            disabled={!isValidEmail || !isValidPass}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              isValidEmail && isValidPass
                ? "bg-indigo-600 text-white hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Entrar
          </button>

          {/* Registro */}
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </motion.form>
      )}
    </div>
  );
}
