import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Publicidad from "../components/Publicidad";

export default function Landing() {
  const [empleos, setEmpleos] = useState([]);
  const [modoOscuro, setModoOscuro] = useState(() => {
    const saved = localStorage.getItem("modoOscuro");
    return saved ? JSON.parse(saved) : false;
  });
  const [rol, setRol] = useState(() => {
    return localStorage.getItem("rol") || "empleado";
  });
  const [estadisticas, setEstadisticas] = useState({
    empleos: 0,
    empresas: 0,
    postulaciones: 0,
  });

  useEffect(() => {
    localStorage.setItem("modoOscuro", JSON.stringify(modoOscuro));
  }, [modoOscuro]);

  useEffect(() => {
    localStorage.setItem("rol", rol);
  }, [rol]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("empleos")) || [];
    setEmpleos(data);
    animateContadores({
      empleos: data.length,
      empresas: 24,
      postulaciones: data.reduce((acc, e) => acc + (e.postulaciones || 0), 0) || 72,
    });
  }, []);

  const animateContadores = ({ empleos, empresas, postulaciones }) => {
    let e = 0, emp = 0, p = 0;
    const interval = setInterval(() => {
      e += 1;
      emp += 1;
      p += 3;
      setEstadisticas({
        empleos: Math.min(e, empleos),
        empresas: Math.min(emp, empresas),
        postulaciones: Math.min(p, postulaciones),
      });
      if (e >= empleos && emp >= empresas && p >= postulaciones) clearInterval(interval);
    }, 30);
  };

  const beneficios = rol === "empresa"
    ? [
        { titulo: "📢 Publica Vacantes", texto: "Gestiona tus publicaciones de manera sencilla y efectiva." },
        { titulo: "🎯 Encuentra Talento", texto: "Accede a una base de datos de postulantes calificados." },
        { titulo: "🚀 Destaca tu empresa", texto: "Promociona tu marca como empleador." },
      ]
    : [
        { titulo: "📝 Postúlate Fácilmente", texto: "Encuentra empleos que se ajusten a tu perfil y aplica en segundos." },
        { titulo: "📄 CV Online", texto: "Crea y descarga tu currículum profesional." },
        { titulo: "🔔 Alertas Inteligentes", texto: "Recibe notificaciones personalizadas." },
      ];
      return (
        <div className={`${modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-800"} transition-all duration-500`}>
          <div className={`min-h-[90vh] flex flex-col justify-center items-center text-center px-6 py-16 space-y-6 ${modoOscuro ? "bg-gray-800" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"}`}>
            <motion.h1
              className="text-5xl font-extrabold"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Bienvenido a <span className="text-yellow-300">Trabajo</span>
            </motion.h1>
            <motion.p
              className="max-w-2xl text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {rol === "empresa"
                ? "Publica vacantes, encuentra talento y administra tus postulaciones con facilidad."
                : "Explora empleos, postúlate y crea tu currículum digital en minutos."}
            </motion.p>
    
            <style>
              {`
                @keyframes scrollSlide {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-scroll-slide {
                  animation: scrollSlide 30s linear infinite;
                }
              `}
            </style>
    
            <div className="flex gap-4 justify-center items-center mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rol"
                  value="empleado"
                  checked={rol === "empleado"}
                  onChange={() => setRol("empleado")}
                  className="accent-blue-500"
                />
                Soy Empleado
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rol"
                  value="empresa"
                  checked={rol === "empresa"}
                  onChange={() => setRol("empresa")}
                  className="accent-yellow-500"
                />
                Soy Empresa
              </label>
            </div>
    
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/register"
                className="px-6 py-3 bg-yellow-400 text-indigo-900 font-semibold rounded-xl shadow hover:scale-105 transition"
              >
                Crear Cuenta
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border border-white text-white rounded-xl hover:bg-white hover:text-indigo-600 transition"
              >
                Iniciar Sesión
              </Link>
            </motion.div>
    
            <div className="absolute top-5 right-5">
              <label className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm font-semibold">🌙</span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={modoOscuro}
                  onChange={() => setModoOscuro(!modoOscuro)}
                />
                <div className="w-12 h-6 bg-white rounded-full p-1 flex items-center transition-all duration-300 shadow-inner">
                  <div
                    className={`w-4 h-4 rounded-full bg-indigo-500 transform duration-300 ${modoOscuro ? "translate-x-6" : "translate-x-0"}`}
                  />
                </div>
                <span className="ml-2 text-sm font-semibold">☀️</span>
              </label>
            </div>
          </div>
      {/* Beneficios */}
      <section className="py-16 text-center space-y-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-blue-700">
          {rol === "empresa" ? "Ventajas para Empresas" : "Beneficios para Postulantes"}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 px-6">
          {beneficios.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              whileHover={{ scale: 1.05 }}
            >
              <h4 className="text-xl font-semibold mb-2">{item.titulo}</h4>
              <p className="text-sm text-gray-600">{item.texto}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contadores */}
      <section className="py-12 bg-white text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-8">Estadísticas en tiempo real</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
          <div className="p-6 rounded-xl shadow bg-indigo-50">
            <p className="text-4xl font-extrabold text-indigo-600">{estadisticas.empleos}</p>
            <p className="mt-2 text-gray-700">Empleos publicados</p>
          </div>
          <div className="p-6 rounded-xl shadow bg-indigo-50">
            <p className="text-4xl font-extrabold text-indigo-600">{estadisticas.empresas}</p>
            <p className="mt-2 text-gray-700">Empresas registradas</p>
          </div>
          <div className="p-6 rounded-xl shadow bg-indigo-50">
            <p className="text-4xl font-extrabold text-indigo-600">{estadisticas.postulaciones}</p>
            <p className="mt-2 text-gray-700">Postulaciones</p>
          </div>
        </div>
      </section>

      {/* Slider automático de empleos */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">Últimos empleos publicados</h2>
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-scroll-slide whitespace-nowrap">
            {empleos.map((e) => (
              <motion.div
                key={e.id}
                className="min-w-[280px] bg-white border border-gray-200 p-5 rounded-xl shadow hover:shadow-indigo-400 hover:scale-[1.03] transition flex-shrink-0 relative"
              >
                <span className="absolute top-2 right-2 bg-yellow-300 text-xs px-2 py-1 rounded-full font-bold">
                  NUEVO
                </span>
                <h4 className="text-lg font-bold text-gray-800">{e.titulo}</h4>
                <p className="text-sm text-gray-600">📍 {e.ciudad}</p>
                <p className="text-sm text-gray-600">🏢 {e.empresa}</p>
                <p className="text-sm text-gray-600">📝 {e.tipoContrato || "Contrato indefinido"}</p>
                <Link
                  to={`/empleo/${e.id}`}
                  className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                >
                  Ver más detalles →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Call to Action final */}
      <section className="bg-yellow-100 py-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-100 via-white to-yellow-100 opacity-20 animate-pulse"></div>
        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-gray-800 mb-4">🎉 ¡Promociona tu empresa aquí!</h3>
          <p className="text-sm text-gray-700 mb-6">
            Si tienes una empresa y deseas mostrar tus vacantes con mayor visibilidad, contáctanos y aparece aquí como destacado.
          </p>
          <a
            href="mailto:contacto@trabajopolis.com"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Contáctanos
          </a>
        </motion.div>
      </section>
      <Publicidad />

    </div>
  );
}
    