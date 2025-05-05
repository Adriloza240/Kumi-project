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
  const [favoritosCvs, setFavoritosCvs] = useState([]);
  const [detalleCV, setDetalleCV] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");
  const [filtroSector, setFiltroSector] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("");
  const [filtroExperiencia, setFiltroExperiencia] = useState("");
  const [filtroEducacion, setFiltroEducacion] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
useEffect(() => {
  const cargarDatos = () => {
    setEmpleos(JSON.parse(localStorage.getItem("empleos")) || []);
    setPostulaciones(JSON.parse(localStorage.getItem("postulaciones")) || []);
    setFavoritos(JSON.parse(localStorage.getItem("favoritos")) || []);
    setFavoritosCvs(JSON.parse(localStorage.getItem("favoritosCvs")) || []);

    // Cargar todos los CVs posibles
    const todosLosCVs = [];
    
    // 1. Buscar CVs en la clave "cvs" (formato antiguo)
    const cvsPlural = JSON.parse(localStorage.getItem("cvs")) || [];
    if (Array.isArray(cvsPlural)) {
      todosLosCVs.push(...cvsPlural.map(cv => ({
        ...cv,
        // Asegurar que tenga correo (usar correo del usuario si existe)
        correo: cv.correo || (user?.correo || '')
      })));
    }

    // 2. Buscar CVs individuales por usuario (formato nuevo)
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.forEach(user => {
      const cvKey = `cv_${user.correo}`;
      const cvData = JSON.parse(localStorage.getItem(cvKey));
      if (cvData) {
        todosLosCVs.push({
          ...cvData,
          correo: user.correo,
          nombreCompleto: cvData.nombreCompleto || `${user.nombre} ${user.apellido || ''}`.trim()
        });
      }
    });

    // Eliminar duplicados (por correo)
    const cvsUnicos = todosLosCVs.filter((cv, index, self) =>
      index === self.findIndex(t => t.correo === cv.correo)
    );

    setCvs(cvsUnicos);
  };

  cargarDatos();
}, [user?.correo]);
  const yaPostulado = (id) =>
    postulaciones.some((p) => p.usuario === user?.correo && p.empleoId === id);

  const toggleFavorito = (id) => {
    const actualizados = favoritos.includes(id)
      ? favoritos.filter((f) => f !== id)
      : [...favoritos, id];
    setFavoritos(actualizados);
    localStorage.setItem("favoritos", JSON.stringify(actualizados));
  };

  const toggleFavoritoCv = (correo) => {
    const actualizados = favoritosCvs.includes(correo)
      ? favoritosCvs.filter((f) => f !== correo)
      : [...favoritosCvs, correo];
    setFavoritosCvs(actualizados);
    localStorage.setItem("favoritosCvs", JSON.stringify(actualizados));
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

  const exportarCVPDF = (cv) => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text(`Currículum de ${cv.nombreCompleto}`, 105, 20, { align: 'center' });
    
    // Información básica
    doc.setFontSize(12);
    doc.text(`📧 ${cv.correo} | 📱 ${cv.telefono} | 📍 ${cv.direccion}`, 105, 30, { align: 'center' });
    
    // Profesión
    doc.setFontSize(16);
    doc.text(cv.profesion || 'Profesión no especificada', 105, 40, { align: 'center' });
    
    // Experiencia
    doc.setFontSize(14);
    doc.text("Experiencia Profesional", 14, 50);
    doc.setFontSize(12);
    let y = 60;
    
    if (cv.experiencias?.length > 0) {
      cv.experiencias.forEach(exp => {
        doc.text(`• ${exp.puesto} en ${exp.institucion} (${exp.fechaInicio} - ${exp.fechaFin})`, 20, y);
        doc.text(`Funciones: ${exp.funciones}`, 25, y + 7);
        y += 15;
      });
    } else if (cv.experiencia) {
      const splitText = doc.splitTextToSize(cv.experiencia, 180);
      doc.text(splitText, 20, y);
      y += splitText.length * 7;
    } else {
      doc.text("No se registró experiencia laboral", 20, y);
      y += 10;
    }
    
    // Formación
    doc.setFontSize(14);
    doc.text("Formación Académica", 14, y + 10);
    doc.setFontSize(12);
    y += 20;
    
    if (cv.formaciones?.length > 0) {
      cv.formaciones.forEach(form => {
        doc.text(`• ${form.titulo} en ${form.institucion} (${form.fechaInicio} - ${form.fechaFin})`, 20, y);
        y += 10;
      });
    } else {
      doc.text("No se registró formación académica", 20, y);
      y += 10;
    }
    
    // Habilidades
    doc.setFontSize(14);
    doc.text("Habilidades", 14, y + 10);
    doc.setFontSize(12);
    
    if (cv.habilidades) {
      doc.text(cv.habilidades, 20, y + 20);
    } else if (cv.habilidadesList?.length > 0) {
      const habilidades = cv.habilidadesList.map(h => `${h.nombre} (${h.nivel})`).join(', ');
      doc.text(habilidades, 20, y + 20);
    } else {
      doc.text("No se registraron habilidades", 20, y + 20);
    }
    
    doc.save(`CV_${cv.nombreCompleto?.replace(' ', '_') || 'candidato'}.pdf`);
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

  const cvsFiltrados = cvs.filter((cv) => {
    const textoBusqueda = busqueda.toLowerCase();
    const habilidades = cv.habilidadesList 
      ? cv.habilidadesList.map(h => h.nombre).join(' ') 
      : cv.habilidades || '';
    
    return (
      (busqueda
        ? cv.nombreCompleto?.toLowerCase().includes(textoBusqueda) ||
          habilidades.toLowerCase().includes(textoBusqueda) ||
          (cv.experiencia && cv.experiencia.toLowerCase().includes(textoBusqueda)) ||
          (cv.profesion && cv.profesion.toLowerCase().includes(textoBusqueda))
        : true) &&
      (filtroCiudad 
        ? (cv.direccion && cv.direccion.toLowerCase().includes(filtroCiudad.toLowerCase())) 
        : true) &&
      (filtroSector 
        ? (cv.profesion && cv.profesion.toLowerCase().includes(filtroSector.toLowerCase())) 
        : true) &&
      (filtroExperiencia 
        ? (cv.experiencia && cv.experiencia.toLowerCase().includes(filtroExperiencia.toLowerCase())) 
        : true) &&
      (filtroEducacion 
        ? (cv.formaciones && cv.formaciones.some(f => 
            f.titulo && f.titulo.toLowerCase().includes(filtroEducacion.toLowerCase()))) 
        : true)
    );
  });

  const obtenerHabilidadesParaMostrar = (cv) => {
    if (cv.habilidadesList?.length > 0) {
      return cv.habilidadesList.slice(0, 3).map(h => h.nombre).join(', ');
    }
    return cv.habilidades?.split(',').slice(0, 3).join(', ') || 'No especificadas';
  };

  const obtenerExperienciaParaMostrar = (cv) => {
    if (cv.experiencias?.length > 0) {
      return cv.experiencias[0].puesto + (cv.experiencias.length > 1 ? ` +${cv.experiencias.length - 1} más` : '');
    }
    return cv.experiencia?.slice(0, 80) || 'No especificada';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fadeIn space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 text-center">
        {modo === "empleo" ? "Buscar Empleos" : "Buscar Candidatos"}
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
          Buscar Candidatos
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
          placeholder={modo === "empleo" ? "🏢 Sector" : "🎯 Profesión"}
          value={filtroSector}
          onChange={(e) => setFiltroSector(e.target.value)}
          className="p-2 border rounded-xl shadow-sm"
        />
        {modo === "empleo" ? (
          <input
            type="text"
            placeholder="⏳ Contrato"
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="p-2 border rounded-xl shadow-sm"
          />
        ) : (
          <select
            value={filtroExperiencia}
            onChange={(e) => setFiltroExperiencia(e.target.value)}
            className="p-2 border rounded-xl shadow-sm"
          >
            <option value="">Todos los niveles</option>
            <option value="sin experiencia">Sin experiencia</option>
            <option value="junior">Junior (1-3 años)</option>
            <option value="semi senior">Semi-Senior (3-5 años)</option>
            <option value="senior">Senior (5+ años)</option>
          </select>
        )}
      </div>

      {modo === "postulante" && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <select
            value={filtroEducacion}
            onChange={(e) => setFiltroEducacion(e.target.value)}
            className="p-2 border rounded-xl shadow-sm"
          >
            <option value="">Todos los niveles educativos</option>
            <option value="secundario">Secundario</option>
            <option value="terciario">Terciario</option>
            <option value="universitario">Universitario</option>
            <option value="posgrado">Posgrado</option>
          </select>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {modo === "empleo" 
            ? `Empleos encontrados: ${empleosFiltrados.length}` 
            : `Candidatos encontrados: ${cvsFiltrados.length}`}
        </p>
        {modo === "empleo" ? (
          <button
            onClick={exportarPDF}
            className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            📄 Exportar PDF
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            {favoritosCvs.length > 0 && `⭐ ${favoritosCvs.length} favoritos`}
          </div>
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
                <p className="text-sm text-gray-600">📍 {e.ciudad || "No especificada"}</p>
                <p className="text-sm text-gray-600">🏢 {e.sector || "No especificado"}</p>
                <p className="text-sm text-gray-600">📝 {e.tipoContrato || "No especificado"}</p>
                {e.salario && <p className="text-green-600 font-semibold">💰 ${e.salario}</p>}
              </motion.div>
            ))
          : cvsFiltrados.map((cv, i) => (
            <motion.div
    key={i}
    whileHover={{ scale: 1.02 }}
    className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center text-center cursor-pointer relative"
  >
    <div className="absolute top-2 right-2 flex gap-2">
      <button
        onClick={(ev) => {
          ev.stopPropagation();
          toggleFavoritoCv(cv.correo);
        }}
        className="text-xl"
      >
        {favoritosCvs.includes(cv.correo) ? "⭐" : "☆"}
      </button>
      <button 
        onClick={(ev) => {
          ev.stopPropagation();
          exportarCVPDF(cv);
        }}
        className="text-sm bg-blue-500 text-white px-2 rounded"
      >
        PDF
      </button>
    </div>
    
    {cv.avatar ? (
      <img
        src={cv.avatar}
        alt="Avatar"
        className="w-20 h-20 object-cover rounded-full border mb-3"
        onClick={() => setDetalleCV(cv)}
      />
    ) : (
      <div 
        className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center text-gray-400 text-sm cursor-pointer"
        onClick={() => setDetalleCV(cv)}
      >
        Sin Foto
      </div>
    )}

    <h3 
      className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600"
      onClick={() => setDetalleCV(cv)}
    >
      {cv.nombreCompleto || "Nombre no especificado"}
    </h3>
    
    <div className="w-full text-left mt-2 space-y-1">
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Profesión:</span> {cv.profesion || "No especificada"}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Ubicación:</span> {cv.direccion || "No especificada"}
      </p>
      
      <div className="mt-2">
        <p className="text-sm font-semibold">Experiencia:</p>
        {cv.experiencias?.length > 0 ? (
          <ul className="text-xs text-gray-600 list-disc list-inside">
            {cv.experiencias.slice(0, 2).map((exp, idx) => (
              <li key={idx}>{exp.puesto} en {exp.institucion}</li>
            ))}
            {cv.experiencias.length > 2 && (
              <li>+{cv.experiencias.length - 2} experiencias más</li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">No especificada</p>
        )}
      </div>
      
      <div className="mt-2">
        <p className="text-sm font-semibold">Habilidades destacadas:</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {obtenerHabilidadesParaMostrar(cv).split(',').map((hab, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {hab.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>

    <button
      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:scale-105 transition"
      onClick={() => setDetalleCV(cv)}
    >
      Ver CV completo
    </button>
  </motion.div>
))}
      </div>

      <Publicidad />

      <Modal isOpen={!!detalleCV} onClose={() => setDetalleCV(null)} size="lg">
  {detalleCV && (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold text-indigo-700">
          📄 Currículum de {detalleCV.nombreCompleto || "Candidato"}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => exportarCVPDF(detalleCV)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Descargar PDF
          </button>
          <button 
            onClick={() => toggleFavoritoCv(detalleCV.correo)}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
          >
            {favoritosCvs.includes(detalleCV.correo) ? "★ Favorito" : "☆ Favorito"}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {detalleCV.avatar && (
          <img 
            src={detalleCV.avatar} 
            alt="avatar" 
            className="h-32 w-32 rounded-full border-4 border-gray-200 object-cover" 
          />
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
          <div className="col-span-2">
            <h4 className="text-lg font-semibold text-gray-800">{detalleCV.profesion || "Profesional"}</h4>
          </div>
          <p><b>📧 Correo:</b> {detalleCV.correo || "No especificado"}</p>
          <p><b>📱 Teléfono:</b> {detalleCV.telefono || "No especificado"}</p>
          <p><b>📍 Dirección:</b> {detalleCV.direccion || "No especificada"}</p>
          <p><b>🎂 Fecha nacimiento:</b> {detalleCV.fechaNacimiento || "No especificada"}</p>
          {detalleCV.licencia === "Sí" && (
            <p className="col-span-2">
              <b>🚗 Licencia de conducir:</b> Sí {detalleCV.licenciaNumero && `(N° ${detalleCV.licenciaNumero})`}
            </p>
          )}
        </div>
      </div>

      {detalleCV.perfilProfesional && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">👤 Perfil Profesional</h4>
          <p className="text-gray-700">{detalleCV.perfilProfesional}</p>
        </div>
      )}

      {/* Secciones mejoradas con acordeones */}
      <div className="space-y-4">
        {/* Experiencia Laboral */}
        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-3 bg-gray-100 font-semibold flex justify-between items-center">
            <span>💼 Experiencia Laboral</span>
            <span>▼</span>
          </button>
          <div className="p-4">
            {detalleCV.experiencias?.length > 0 ? (
              detalleCV.experiencias.map((exp, i) => (
                <div key={i} className="mb-4 pb-4 border-b last:border-b-0">
                  <p className="font-medium">• {exp.puesto} en {exp.institucion}</p>
                  <p className="text-gray-600 text-sm">{exp.fechaInicio} - {exp.fechaFin || "Actualidad"}</p>
                  {exp.funciones && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold">Funciones:</p>
                      <p className="text-gray-600 text-sm">{exp.funciones}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No se registró experiencia laboral</p>
            )}
          </div>
        </div>

        {/* Formación Académica */}
        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-3 bg-gray-100 font-semibold flex justify-between items-center">
            <span>🎓 Formación Académica</span>
            <span>▼</span>
          </button>
          <div className="p-4">
            {detalleCV.formaciones?.length > 0 ? (
              detalleCV.formaciones.map((f, i) => (
                <div key={i} className="mb-3">
                  <p className="font-medium">• {f.grado} en {f.titulo}</p>
                  <p className="text-gray-600 text-sm">{f.institucion} ({f.fechaInicio} - {f.fechaFin})</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No se registró formación académica</p>
            )}
          </div>
        </div>

        {/* Habilidades */}
        <div className="border rounded-lg overflow-hidden">
          <button className="w-full text-left p-3 bg-gray-100 font-semibold flex justify-between items-center">
            <span>✨ Habilidades</span>
            <span>▼</span>
          </button>
          <div className="p-4">
            {detalleCV.habilidadesList?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {detalleCV.habilidadesList.map((h, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {h.nombre} {h.nivel && `(${h.nivel})`}
                  </span>
                ))}
              </div>
            ) : detalleCV.habilidades ? (
              <div className="flex flex-wrap gap-2">
                {detalleCV.habilidades.split(',').map((habilidad, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {habilidad.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No se registraron habilidades</p>
            )}
          </div>
        </div>

        {/* Cursos y Certificaciones */}
        {detalleCV.cursos?.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button className="w-full text-left p-3 bg-gray-100 font-semibold flex justify-between items-center">
              <span>📚 Cursos y Certificaciones</span>
              <span>▼</span>
            </button>
            <div className="p-4">
              {detalleCV.cursos.map((curso, i) => (
                <div key={i} className="mb-3">
                  <p className="font-medium">• {curso.nombre}</p>
                  <p className="text-gray-600 text-sm">{curso.institucion} ({curso.ano}) - {curso.cargaHoraria} horas</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referencias */}
        {detalleCV.referencias?.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <button className="w-full text-left p-3 bg-gray-100 font-semibold flex justify-between items-center">
              <span>📞 Referencias</span>
              <span>▼</span>
            </button>
            <div className="p-4">
              {detalleCV.referencias.map((ref, i) => (
                <div key={i} className="mb-3">
                  <p className="font-medium">• {ref.nombre}</p>
                  <p className="text-gray-600 text-sm">{ref.cargo} en {ref.institucion}</p>
                  <p className="text-gray-600 text-sm">📱 {ref.celular}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {detalleCV.correo && (
        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={() => {
              window.location.href = `mailto:${detalleCV.correo}?subject=Interés en tu perfil profesional`;
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            ✉️ Contactar al candidato
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(detalleCV.correo);
              alert(`Correo copiado: ${detalleCV.correo}`);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            📋 Copiar correo
          </button>
        </div>
      )}
    </div>
  )}
</Modal>
    </div>
  )};
