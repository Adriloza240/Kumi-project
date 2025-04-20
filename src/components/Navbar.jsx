import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const leerUsuario = () => {
      const data = localStorage.getItem("user");
      setUser(data ? JSON.parse(data) : null);
    };

    leerUsuario();
    window.addEventListener("storage", leerUsuario);
    return () => window.removeEventListener("storage", leerUsuario);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const tipo = user?.tipo?.toLowerCase();

  const navLinkBase = "text-gray-700 hover:text-blue-600 font-medium transition duration-200";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 hover:scale-105"
        >
          Projecto
        </Link>

        {/* Botón hamburguesa */}
        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Navegación completa */}
        <div
          className={`${
            menuOpen ? "block" : "hidden"
          } sm:flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-x-5 mt-4 sm:mt-0 absolute sm:static top-full left-0 w-full sm:w-auto bg-white sm:bg-transparent p-4 sm:p-0 shadow sm:shadow-none transition-all duration-300`}
        >
          <Link to="/" className={navLinkBase}>
            Inicio
          </Link>
          <Link to="/buscar" className={navLinkBase}>
            Buscar Empleos
          </Link>

          {user ? (
            <>
              <span className="text-gray-600 sm:inline hidden">
                👋 Hola, <b>{user.nombre?.split(" ")[0]}</b>
              </span>

              <span
                className={`capitalize text-xs font-semibold px-2 py-1 rounded-full shadow animate-pulse ${
                  tipo === "empresa"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {tipo}
              </span>

              <Link to="/perfil" className={navLinkBase}>
                Perfil
              </Link>

              {tipo === "empresa" && (
                <Link to="/pagos" className="text-gray-700 hover:text-pink-600 font-medium transition duration-200">
                  Pagos
                </Link>
              )}

              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-md"
              >
                {tipo === "empresa" ? "Panel Empresa" : "Dashboard"}
              </Link>

              <button
                onClick={logout}
                className="px-3 py-1 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkBase}>
                Login
              </Link>
              <Link to="/register" className={navLinkBase}>
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
