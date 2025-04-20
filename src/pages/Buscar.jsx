import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { motion } from "framer-motion";
import Publicidad from "../components/Publicidad";
import Modal from "../components/Modal";

export default function Buscar() {
  const [modo, setModo] = useState("empleo");
  const [empleos, setEmpleos] = useState([]);
  const [cvs, setCvs] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [detalleCV, setDetalleCV] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [filtroSector, setFiltroSector] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    setEmpleos(JSON.parse(localStorage.getItem("empleos")) || []);
    setCvs(JSON.parse(localStorage.getItem("cvs")) || []);
    setPostulaciones(JSON.parse(localStorage.getItem("postulaciones")) || []);
    setFavoritos(JSON.parse(localStorage.getItem("favoritos")) || []);
  }, []);

  const yaPostulado = (id) =>
    postulaciones.some((p) => p.usuario === user?.correo && p.empleoId === id);

  const toggleFavorito = (id) => {
    const actualizados = favoritos.includes(id)
      ? favoritos.filter((f) => f !== id)
      : [...favoritos, id];
    setFavoritos(actualizados);
    localStorage.setItem("favoritos", JSON.stringify(actualizados));
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Empleos Filtrados", 14, 20);
    const data = empleosFiltrados.map((e) => [
      e.titulo,
      e.empresa,
      e.ciudad || "-",
      e.sector || "-",
      e.tipoContrato || "-",
    ]);
    doc.autoTable({
      head: [["Título", "Empresa", "Ciudad", "Sector", "Contrato"]],
      body: data,
      startY: 30,
    });
    doc.save("empleos_filtrados.pdf");
  };

  const empleosFiltrados = empleos.filter((e) =>
    (busqueda
      ? e.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      : true) &&
    (filtroCiudad ? e.ciudad?.toLowerCase().includes(filtroCiudad.toLowerCase()) : true) &&
    (filtroSector ? e.sector?.toLowerCase().includes(filtroSector.toLowerCase()) : true) &&
    (filtroContrato ? e.tipoContrato?.toLowerCase().includes(filtroContrato.toLowerCase()) : true)
  );

  const cvsFiltrados = cvs.filter((cv) =>
    (busqueda
      ? cv.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cv.habilidades?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cv.experiencia?.toLowerCase().includes(busqueda.toLowerCase())
      : true) &&
    (filtroCiudad ? cv.direccion?.toLowerCase().includes(filtroCiudad.toLowerCase()) : true) &&
    (filtroSector ? cv.profesion?.toLowerCase().includes(filtroSector.toLowerCase()) : true)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fadeIn space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 text-center">
        {modo === "empleo" ? "Buscar Empleos" : "Buscar Currículums"}
      </h2>

      <div className="flex justify-center gap-4">
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            modo === "empleo" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setModo("empleo")}
        >
          Buscar Empleo
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            modo === "postulante" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setModo("postulante")}
        >
          Buscar Postulante
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-2 border rounded-xl shadow-sm"
        />
        <input
          type="text"
          placeholder="📍 Ciudad"
          value={filtroCiudad}
          onChange={(e) => setFiltroCiudad(e.target.value)}
          className="p-2 border rounded-xl shadow-sm"
        />
        <input
          type="text"
          placeholder="🏢 Sector / Profesión"
          value={filtroSector}
          onChange={(e) => setFiltroSector(e.target.value)}
          className="p-2 border rounded-xl shadow-sm"
        />
        {modo === "empleo" && (
          <input
            type="text"
            placeholder="⏳ Contrato"
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="p-2 border rounded-xl shadow-sm"
          />
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Resultados: {modo === "empleo" ? empleosFiltrados.length : cvsFiltrados.length}
        </p>
        {modo === "empleo" && (
          <button
            onClick={exportarPDF}
            className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            📄 Exportar PDF
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modo === "empleo"
          ? empleosFiltrados.map((e) => (
              <motion.div
                key={e.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border p-4 rounded-xl shadow-md relative cursor-pointer"
                onClick={() => navigate(`/empleo/${e.id}`)}
              >
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      toggleFavorito(e.id);
                    }}
                  >
                    {favoritos.includes(e.id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{e.titulo}</h3>
                <p className="text-sm text-gray-600">{e.empresa}</p>
                <p className="text-sm text-gray-600">📍 {e.ciudad}</p>
                <p className="text-sm text-gray-600">🏢 {e.sector}</p>
                <p className="text-sm text-gray-600">📝 {e.tipoContrato}</p>
                {e.salario && <p className="text-green-600 font-semibold">💰 ${e.salario}</p>}
              </motion.div>
            ))
          : cvsFiltrados.map((cv, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center text-center cursor-pointer"
                onClick={() => setDetalleCV(cv)}
              >
                {cv.avatar ? (
                  <img
                    src={cv.avatar}
                    alt="Avatar"
                    className="w-20 h-20 object-cover rounded-full border mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center text-gray-400 text-sm">
                    Sin Foto
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-800">{cv.nombreCompleto}</h3>
                <p className="text-sm text-gray-600 mb-1">📍 {cv.direccion}</p>
                <p className="text-sm text-gray-600 mb-1">🎓 {cv.profesion}</p>

                <p className="text-sm text-gray-600 mt-2">
                  🧠 <strong>Habilidades:</strong> {cv.habilidades}
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  💼 <strong>Experiencia:</strong> {cv.experiencia?.slice(0, 80)}...
                </p>

                <button
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:scale-105 transition"
                >
                  📄 Ver CV completo
                </button>
              </motion.div>
            ))}
      </div>

      <Publicidad />

      <Modal isOpen={!!detalleCV} onClose={() => setDetalleCV(null)}>
        {detalleCV && (
          <div className="space-y-2 text-sm text-gray-700">
            <h3 className="text-xl font-bold text-indigo-700 text-center">📄 Currículum</h3>
            {detalleCV.avatar && <img src={detalleCV.avatar} alt="avatar" className="mx-auto h-24 rounded-full" />}
            <p><b>👤 Nombre:</b> {detalleCV.nombreCompleto}</p>
            <p><b>🎯 Profesión:</b> {detalleCV.profesion}</p>
            <p><b>📧 Correo:</b> {detalleCV.correo}</p>
            <p><b>📍 Dirección:</b> {detalleCV.direccion}</p>
            <p><b>📱 Teléfono:</b> {detalleCV.telefono}</p>
            <p><b>💼 Experiencia:</b> {detalleCV.experiencia}</p>
            <p><b>✨ Habilidades:</b> {detalleCV.habilidades}</p>
            <p><b>📅 Fecha de nacimiento:</b> {detalleCV.fechaNacimiento}</p>

            {detalleCV.formaciones?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mt-3">🎓 Formación Académica:</h4>
                {detalleCV.formaciones.map((f, i) => (
                  <p key={i}>• {f.titulo} en {f.institucion} ({f.fechaInicio} - {f.fechaFin})</p>
                ))}
              </div>
            )}

            {detalleCV.experiencias?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mt-3">🛠 Experiencia Laboral:</h4>
                {detalleCV.experiencias.map((exp, i) => (
                  <div key={i} className="text-sm">
                    <p>• {exp.puesto} en {exp.institucion} ({exp.fechaInicio} - {exp.fechaFin})</p>
                    <p className="ml-2 text-gray-600">📍 {exp.direccion} | ☎️ {exp.telefono}</p>
                    <p className="ml-2 italic text-gray-500">Funciones: {exp.funciones}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
