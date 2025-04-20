import ConfirmDialog from "../components/ConfirmDialog";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import Modal from "../components/Modal";    
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import BadgeEstado from "../components/BadgeEstado";


export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setUsuario(JSON.parse(data));
    } else {
      navigate("/login");
    }
  }, []);

  if (!usuario) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fadeIn space-y-10">
      <h2 className="text-4xl font-extrabold text-center text-gradient bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
        Bienvenido, {usuario.nombre} 👋
      </h2>
      {usuario.tipo === "empresa" ? <EmpresaDashboard /> : <EmpleadoDashboard />}
    </div>
  );
}

function EmpresaDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [salario, setSalario] = useState("");
  const [misEmpleos, setMisEmpleos] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const { showToast } = useToast();

  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [tipoContrato, setTipoContrato] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [funciones, setFunciones] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [requisitosExtra, setRequisitosExtra] = useState("");
  const [beneficios, setBeneficios] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [logoEmpresa, setLogoEmpresa] = useState(null);

  const publicarEmpleo = (e) => {
    e.preventDefault();
    const nuevoEmpleo = {
      id: Date.now(),
      titulo,
      descripcion,
      salario,
      ciudad,
      sector,
      tipoContrato,
      ubicacion,
      objetivo,
      funciones,
      requisitos,
      requisitosExtra,
      beneficios,
      fechaLimite,
      logoEmpresa,
      empresa: JSON.parse(localStorage.getItem("user")).nombre,
      postulantes: [],
    };

    const empleosGuardados = JSON.parse(localStorage.getItem("empleos")) || [];
    empleosGuardados.push(nuevoEmpleo);
    localStorage.setItem("empleos", JSON.stringify(empleosGuardados));
    showToast("✅ Empleo publicado correctamente");
    setTitulo("");
    setDescripcion("");
    setSalario("");
    actualizarLista();
    setShowModal(false);
  };

  const actualizarLista = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const todos = JSON.parse(localStorage.getItem("empleos")) || [];
    const mios = todos.filter((e) => e.empresa === user.nombre);
    setMisEmpleos(mios);
  };

  const eliminarPostulante = (empleoId, i) => {
    setConfirmMessage("¿Deseas eliminar este postulante?");
    setConfirmAction(() => () => {
      const nuevos = [...misEmpleos];
      nuevos.find((emp) => emp.id === empleoId).postulantes.splice(i, 1);
      localStorage.setItem(
        "empleos",
        JSON.stringify(
          JSON.parse(localStorage.getItem("empleos")).map((e) =>
            e.id === empleoId ? nuevos.find((emp) => emp.id === empleoId) : e
          )
        )
      );
      setMisEmpleos([...nuevos]);
      showToast("❌ Postulante eliminado");
    });
    setConfirmOpen(true);
  };

  const exportarPostulantes = (empleo) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/assets/logo.png";
    logo.onload = () => {
      doc.addImage(logo, "PNG", 10, 8, 30, 15);
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`Postulantes a: ${empleo.titulo}`, 50, 18);
      doc.setFontSize(10);
      let y = 28;
      const detalles = [
        { label: "Empresa", value: empleo.empresa },
        { label: "Ciudad", value: empleo.ciudad },
        { label: "Sector", value: empleo.sector },
        { label: "Tipo de contrato", value: empleo.tipoContrato },
        { label: "Ubicación", value: empleo.ubicacion },
        { label: "Objetivo", value: empleo.objetivo },
        { label: "Funciones", value: empleo.funciones },
        { label: "Requisitos", value: empleo.requisitos },
        { label: "Requisitos extra", value: empleo.requisitosExtra },
        { label: "Beneficios", value: empleo.beneficios },
      ];
      detalles.forEach((det) => {
        if (det.value) {
          doc.text(`${det.label}: ${det.value}`, 10, y);
          y += 6;
        }
      });

      doc.setFillColor(30, 58, 138);
      doc.rect(10, y, 190, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("Nombre", 15, y + 5);
      doc.text("Estado", 90, y + 5);
      y += 12;
      doc.setTextColor(0);
      empleo.postulantes.forEach((p) => {
        doc.text(p.nombre, 15, y);
        doc.text(p.estado, 90, y);
        y += 8;
      });

      doc.save(`postulantes_${empleo.titulo}.pdf`);
      showToast("✅ PDF exportado correctamente");
    };
  };

  const exportarPostulantesExcel = async (empleo) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Postulantes");

    sheet.addRow(["Detalles de la Oferta"]);
    sheet.addRow(["Campo", "Valor"]);

    const detalles = [
      ["Empresa", empleo.empresa],
      ["Título", empleo.titulo],
      ["Ciudad", empleo.ciudad],
      ["Sector", empleo.sector],
      ["Tipo de contrato", empleo.tipoContrato],
      ["Ubicación", empleo.ubicacion],
      ["Objetivo", empleo.objetivo],
      ["Funciones", empleo.funciones],
      ["Requisitos", empleo.requisitos],
      ["Requisitos extra", empleo.requisitosExtra],
      ["Beneficios", empleo.beneficios],
    ];

    detalles.forEach((det) => sheet.addRow(det));
    sheet.addRow([]);
    sheet.addRow(["Postulantes"]);
    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Estado", key: "estado", width: 15 },
    ];

    empleo.postulantes.forEach((p) => {
      sheet.addRow({ nombre: p.nombre, estado: p.estado });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `postulantes_${empleo.titulo}.xlsx`);
    showToast("✅ Excel exportado correctamente");
  };

  const eliminarEmpleo = (id) => {
    setConfirmMessage("¿Deseas eliminar este empleo completo?");
    setConfirmAction(() => () => {
      const nuevos = misEmpleos.filter((e) => e.id !== id);
      const todos = JSON.parse(localStorage.getItem("empleos")) || [];
      const actualizados = todos.filter((e) => e.id !== id);
      localStorage.setItem("empleos", JSON.stringify(actualizados));
      setMisEmpleos(nuevos);
      showToast("❌ Empleo eliminado correctamente");
    });
    setConfirmOpen(true);
  };

  useEffect(() => {
    actualizarLista();
  }, []);
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-blue-600">Panel de Empresa</h3>
        <button
          onClick={() => setShowModal(true)}
          className="py-2 px-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:scale-105 transition"
        >
          ➕ Publicar empleo
        </button>
      </div>

      {/* 📄 MODAL PARA PUBLICAR */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Publicar nueva oferta</h3>
        <form onSubmit={publicarEmpleo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="p-3 border rounded-xl" type="text" placeholder="Título del puesto" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          <input className="p-3 border rounded-xl" type="text" placeholder="Ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />
          <input className="p-3 border rounded-xl" type="text" placeholder="Sector o industria" value={sector} onChange={(e) => setSector(e.target.value)} required />
          <input className="p-3 border rounded-xl" type="text" placeholder="Tipo de contrato" value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} required />
          <input className="p-3 border rounded-xl" type="text" placeholder="Ubicación física (opcional)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
          <input className="p-3 border rounded-xl" type="text" placeholder="Objetivo del puesto" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} required />
          <textarea className="p-3 border rounded-xl col-span-full" placeholder="Descripción del empleo" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          <textarea className="p-3 border rounded-xl col-span-full" placeholder="Funciones principales" value={funciones} onChange={(e) => setFunciones(e.target.value)} required />
          <textarea className="p-3 border rounded-xl col-span-full" placeholder="Requisitos (formación, experiencia, habilidades)" value={requisitos} onChange={(e) => setRequisitos(e.target.value)} required />
          <textarea className="p-3 border rounded-xl col-span-full" placeholder="Requisitos complementarios (opcional)" value={requisitosExtra} onChange={(e) => setRequisitosExtra(e.target.value)} />
          <textarea className="p-3 border rounded-xl col-span-full" placeholder="Beneficios ofrecidos" value={beneficios} onChange={(e) => setBeneficios(e.target.value)} />
          <input className="p-3 border rounded-xl" type="number" placeholder="Salario (opcional)" value={salario} onChange={(e) => setSalario(e.target.value)} />
          <input className="p-3 border rounded-xl" type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} required />
          <input
            type="file"
            accept="image/*"
            className="p-3 border rounded-xl col-span-full"
            onChange={(e) => {
              const file = e.target.files[0];
              const reader = new FileReader();
              reader.onload = () => setLogoEmpresa(reader.result);
              if (file) reader.readAsDataURL(file);
            }}
          />
          <button className="col-span-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:scale-105 transition">
            Publicar oferta
          </button>
        </form>
      </Modal>

      {/* 💼 LISTA DE EMPLEOS */}
      <div className="grid md:grid-cols-2 gap-6">
        {misEmpleos.map((empleo) => (
          <div key={empleo.id} className="bg-white p-6 rounded-3xl shadow-lg border hover:shadow-2xl transition space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-800">{empleo.titulo}</h4>
                <p className="text-sm text-gray-500">📍 {empleo.ciudad} — 🏢 {empleo.sector}</p>
                <p className="text-sm text-gray-500">📝 {empleo.tipoContrato} — 💰 {empleo.salario || "No especificado"}</p>
                {empleo.fechaLimite && <p className="text-sm text-gray-500">📅 Fecha límite: {empleo.fechaLimite}</p>}
              </div>
              {empleo.logoEmpresa && (
                <img src={empleo.logoEmpresa} alt="Logo" className="h-12 w-12 object-contain rounded-xl" />
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-700">
              <p>🎯 <b>Objetivo:</b> {empleo.objetivo}</p>
              <p>🛠 <b>Funciones:</b> {empleo.funciones}</p>
              <p>🎓 <b>Requisitos:</b> {empleo.requisitos}</p>
              {empleo.requisitosExtra && <p>✅ <b>Extra:</b> {empleo.requisitosExtra}</p>}
              {empleo.beneficios && <p>🎁 <b>Beneficios:</b> {empleo.beneficios}</p>}
              <p className="text-gray-600">{empleo.descripcion}</p>
            </div>

            {/* 📥 Postulantes */}
            <div>
              <p className="text-sm font-semibold text-blue-500">Postulantes:</p>
              {empleo.postulantes.length > 0 ? (
                <table className="w-full text-sm mt-2 border-t border-gray-200">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleo.postulantes.map((p, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-1">{p.nombre}</td>
                        <td>
                          <select
                            className="text-xs border rounded px-2 py-0.5"
                            value={p.estado}
                            onChange={(e) => {
                              const nuevos = [...misEmpleos];
                              nuevos.find((emp) => emp.id === empleo.id).postulantes[i].estado = e.target.value;
                              localStorage.setItem(
                                "empleos",
                                JSON.stringify(
                                  JSON.parse(localStorage.getItem("empleos")).map((e) =>
                                    e.id === empleo.id ? nuevos.find((emp) => emp.id === empleo.id) : e
                                  )
                                )
                              );
                              setMisEmpleos([...nuevos]);
                              showToast(`✅ Estado de ${p.nombre} actualizado`);
                            }}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="aceptado">Aceptado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={() => eliminarPostulante(empleo.id, i)} className="text-red-500 hover:text-red-700 text-xs">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="italic text-gray-400">Sin postulantes aún</p>
              )}
            </div>

            {/* 📤 Acciones */}
            <div className="flex gap-3 text-sm mt-3">
              <button onClick={() => exportarPostulantes(empleo)} className="text-indigo-600 underline">
                Exportar PDF
              </button>
              <button onClick={() => exportarPostulantesExcel(empleo)} className="text-green-600 underline">
                Exportar Excel
              </button>
              <button onClick={() => eliminarEmpleo(empleo.id)} className="text-red-500 underline ml-auto">
                Eliminar empleo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          confirmAction();
          setConfirmOpen(false);
        }}
      >
        {confirmMessage}
      </ConfirmDialog>
    </div>
  );
}


  

function EmpleadoDashboard() {
  const [experiencias, setExperiencias] = useState([
    { institucion: "", puesto: "", fechaInicio: "", fechaFin: "", direccion: "", telefono: "", funciones: "" }
  ]);
    const [profesion, setProfesion] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [habilidades, setHabilidades] = useState("");
    const [empleos, setEmpleos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filtro, setFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
const [filtroCiudad, setFiltroCiudad] = useState("");
const [filtroSector, setFiltroSector] = useState("");
const [filtroContrato, setFiltroContrato] = useState("");
const [formaciones, setFormaciones] = useState([
  { institucion: "", titulo: "", fechaInicio: "", fechaFin: "" }
]);

    const [avatar, setAvatar] = useState(null); 
    const [nombreCompleto, setNombreCompleto] = useState("");
const [fechaNacimiento, setFechaNacimiento] = useState("");
const [estadoCivil, setEstadoCivil] = useState("");
const [sexo, setSexo] = useState("");
const [correo, setCorreo] = useState("");
const [telefono, setTelefono] = useState("");
const [direccion, setDireccion] = useState("");
const [licencia, setLicencia] = useState("");
const [libretaMilitar, setLibretaMilitar] = useState("");
const [expectativaSalarial, setExpectativaSalarial] = useState("");
const [ci, setCI] = useState("");

    const { showToast } = useToast();

  
    // 💾 PASO NUEVO: carga automática del CV
    useEffect(() => {
      const storedEmpleos = JSON.parse(localStorage.getItem("empleos")) || [];
      setEmpleos(storedEmpleos);
    
      const cvGuardado = JSON.parse(localStorage.getItem("cv"));
      if (cvGuardado) {
        setProfesion(cvGuardado.profesion || "");
        setFormaciones(cvGuardado.formaciones || []);
        setExperiencia(cvGuardado.experiencia || "");
        setHabilidades(cvGuardado.habilidades || "");
        setAvatar(cvGuardado.avatar || null);
        setNombreCompleto(cvGuardado.nombreCompleto || "");
        setFechaNacimiento(cvGuardado.fechaNacimiento || "");
        setEstadoCivil(cvGuardado.estadoCivil || "");
        setSexo(cvGuardado.sexo || "");
        setCorreo(cvGuardado.correo || "");
        setTelefono(cvGuardado.telefono || "");
        setDireccion(cvGuardado.direccion || "");
        setLicencia(cvGuardado.licencia || "");
        setLibretaMilitar(cvGuardado.libretaMilitar || "");
        setExpectativaSalarial(cvGuardado.expectativaSalarial || "");
        setCI(cvGuardado.ci || "");
        setExperiencias(cvGuardado.experiencias || []);
      }
    }, []);
    
  


  const crearCV = (e) => {
  e.preventDefault();
  const cvData = {
    profesion,
    formaciones, // ✅ Nueva línea

    experiencia,
    habilidades,
    avatar,
    nombreCompleto,
    fechaNacimiento,
    estadoCivil,
    sexo,
    correo,
    telefono,
    direccion,
    licencia,
    libretaMilitar,
    expectativaSalarial,
    ci,
    experiencias, // ✅ AÑADIDO
  };

  localStorage.setItem("cv", JSON.stringify(cvData));
  showToast("✅ CV guardado correctamente");
  setShowModal(false);
};




  const postularme = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const nuevosEmpleos = empleos.map((empleo) => {
      if (empleo.id === id && !empleo.postulantes.some(p => p.nombre === user.nombre)) {
        empleo.postulantes.push({ nombre: user.nombre, estado: "pendiente" });
      }
      return empleo;
    });
    localStorage.setItem("empleos", JSON.stringify(nuevosEmpleos));
    setEmpleos(nuevosEmpleos);
    showToast("✅ Te postulaste correctamente");
  };

  const retirarPostulacion = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const actualizados = empleos.map((empleo) => {
      if (empleo.id === id) {
        empleo.postulantes = empleo.postulantes.filter((p) => p.nombre !== user.nombre);
      }
      return empleo;
    });
    localStorage.setItem("empleos", JSON.stringify(actualizados));
    setEmpleos(actualizados);
    showToast("❌ Postulación retirada");
  };

  const obtenerPostulaciones = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return empleos.filter((empleo) =>
      empleo.postulantes.some(p => p.nombre === user.nombre)
    );
  };

  const estadoDePostulacion = (empleo) => {
    const user = JSON.parse(localStorage.getItem("user"));
    return empleo.postulantes.find(p => p.nombre === user.nombre)?.estado || "pendiente";
  };

  const postulacionesFiltradas = obtenerPostulaciones().filter((empleo) => {
    if (filtro === "todos") return true;
    return estadoDePostulacion(empleo) === filtro;
  });
  const exportarPostulantesExcel = async (empleo) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Postulantes");
  
    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Estado", key: "estado", width: 15 },
    ];
  
    empleo.postulantes.forEach(p => {
      sheet.addRow({ nombre: p.nombre, estado: p.estado });
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `postulantes_${empleo.titulo}.xlsx`);
    showToast("📥 Excel exportado correctamente");
  };
  

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Mis Postulaciones", 14, 20);
    const data = postulacionesFiltradas.map((e) => [
      e.titulo,
      e.empresa,
      estadoDePostulacion(e),
    ]);
    doc.autoTable({
      head: [["Puesto", "Empresa", "Estado"]],
      body: data,
      startY: 30,
      styles: { fontSize: 10 },
    });
    doc.save("mis_postulaciones.pdf");
  };
  


const exportarCV = () => {
    if (!profesion || !experiencia || !habilidades) {
        showToast("❌ Completa tu CV antes de exportar");
        doc.setFontSize(12);
doc.setTextColor(60, 60, 60);
doc.text("🎓 Formación Académica:", 14, y);
y += 10;
doc.setFontSize(10);
formaciones.forEach((form) => {
  doc.text(`• ${form.titulo} en ${form.institucion}`, 18, y); y += 6;
  doc.text(`   Desde ${form.fechaInicio} hasta ${form.fechaFin}`, 18, y); y += 8;
});

        return;
    }



    const doc = new jsPDF();

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 10, 190, 277, 5, 5, 'FD');
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.roundedRect(10, 10, 190, 277, 5, 5);

    // Avatar real
    if (avatar) {
        doc.addImage(avatar, "JPEG", 90, 20, 30, 30, undefined, "FAST");
    } else {
        doc.setDrawColor(150);
        doc.circle(105, 35, 15, 'S');
        doc.setFontSize(8);
        doc.text("Tu Avatar", 105, 36, { align: "center" });
    }

    doc.setFontSize(18);
    doc.setTextColor(72, 61, 139);
    doc.text("🌸 Mi Currículum", 14, 65);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`👤 Nombre: ${JSON.parse(localStorage.getItem("user")).nombre}`, 14, 75);
    doc.text(`🎯 Profesión: ${profesion}`, 14, 85);
    doc.text("💼 Experiencia:", 14, 95);

    doc.setFontSize(10);
    doc.text(experiencia, 18, 105, { maxWidth: 170 });

    doc.setFontSize(12);
    doc.text("✨ Habilidades:", 14, 130);

    doc.setFontSize(10);
    habilidades.split(",").forEach((h, i) => {
        doc.text(`- ${h.trim()}`, 18, 140 + i * 7);
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Generado desde Projecto | Glass Style | Powered by ChatGPT", 14, 285);

    doc.save("mi_curriculum.pdf");
    showToast("📄 CV exportado con avatar incluido");
};



  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-green-600">Panel de Empleado</h3>
        <button onClick={() => setShowModal(true)} className="py-2 px-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:scale-105 transition">➕ Crear Currículum</button>
      </div>
      {profesion && experiencia && habilidades && (
  <button
    onClick={() => setShowModal(true)}
    className="ml-2 py-2 px-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-medium hover:scale-105 transition"
  >
    ✏️ Editar CV
  </button>
)}
{profesion && experiencia && habilidades && (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-3 mt-6">
    <h3 className="text-xl font-bold text-indigo-600">🎓 Vista previa de mi CV</h3>
    {avatar && <img src={avatar} alt="Avatar" className="h-24 rounded-full border shadow-md mb-4" />}
    <p><b>👤 Nombre:</b> {nombreCompleto}</p>
    <p><b>🎯 Profesión:</b> {profesion}</p>
    <p><b>📅 Fecha de nacimiento:</b> {fechaNacimiento}</p>
    <p><b>📧 Correo:</b> {correo}</p>
    <p><b>📱 Teléfono:</b> {telefono}</p>
    <p><b>🏠 Dirección:</b> {direccion}</p>
    <p><b>💼 Experiencia:</b> {experiencia}</p>
    <p><b>✨ Habilidades:</b> {habilidades}</p>

    {formaciones.length > 0 && (
      <div>
        <h4 className="font-semibold mt-4 text-gray-700">📘 Formación Académica:</h4>
        {formaciones.map((f, i) => (
          <p key={i} className="text-sm text-gray-600">• {f.titulo} en {f.institucion} ({f.fechaInicio} - {f.fechaFin})</p>
        ))}
      </div>
    )}

    {experiencias.length > 0 && (
      <div>
        <h4 className="font-semibold mt-4 text-gray-700">🛠 Experiencia Laboral:</h4>
        {experiencias.map((exp, i) => (
          <div key={i} className="text-sm text-gray-600 mb-2">
            <p>• {exp.puesto} en {exp.institucion} ({exp.fechaInicio} - {exp.fechaFin})</p>
            <p className="ml-4">📍 {exp.direccion} | ☎️ {exp.telefono}</p>
            <p className="ml-4 italic">Funciones: {exp.funciones}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}






<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
    <h3 className="text-xl font-bold mb-4 text-green-600">Crear mi Currículum</h3>
    <form onSubmit={crearCV} className="space-y-4">
    <h4 className="text-lg font-semibold text-gray-700 mt-4">🛠 Experiencia Laboral</h4>
{experiencias.map((exp, i) => (
  <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border p-4 rounded-lg mb-3">
    <input type="text" className="p-2 border rounded" placeholder="Institución" value={exp.institucion} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].institucion = e.target.value;
      setExperiencias(nuevo);
      <h4 className="text-lg font-semibold text-gray-700 mt-6">🎓 Formación Académica</h4>
{formaciones.map((form, i) => (
  <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border p-4 rounded-lg mb-3">
    <input type="text" className="p-2 border rounded" placeholder="Institución" value={form.institucion} onChange={(e) => {
      const nuevo = [...formaciones];
      nuevo[i].institucion = e.target.value;
      setFormaciones(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Título obtenido" value={form.titulo} onChange={(e) => {
      const nuevo = [...formaciones];
      nuevo[i].titulo = e.target.value;
      setFormaciones(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Fecha inicio" value={form.fechaInicio} onChange={(e) => {
      const nuevo = [...formaciones];
      nuevo[i].fechaInicio = e.target.value;
      setFormaciones(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Fecha fin" value={form.fechaFin} onChange={(e) => {
      const nuevo = [...formaciones];
      nuevo[i].fechaFin = e.target.value;
      setFormaciones(nuevo);
    }} />
  </div>
))}
<button
  type="button"
  className="px-3 py-1 bg-green-500 text-white text-sm rounded"
  onClick={() => setFormaciones([...formaciones, { institucion: "", titulo: "", fechaInicio: "", fechaFin: "" }])}
>
  ➕ Agregar otra formación
</button>

    }} />
    <input type="text" className="p-2 border rounded" placeholder="Puesto" value={exp.puesto} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].puesto = e.target.value;
      setExperiencias(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Fecha inicio" value={exp.fechaInicio} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].fechaInicio = e.target.value;
      setExperiencias(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Fecha fin" value={exp.fechaFin} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].fechaFin = e.target.value;
      setExperiencias(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Dirección" value={exp.direccion} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].direccion = e.target.value;
      setExperiencias(nuevo);
    }} />
    <input type="text" className="p-2 border rounded" placeholder="Teléfono" value={exp.telefono} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].telefono = e.target.value;
      setExperiencias(nuevo);
    }} />
    <textarea className="p-2 border rounded col-span-2" placeholder="Principales funciones" value={exp.funciones} onChange={(e) => {
      const nuevo = [...experiencias];
      nuevo[i].funciones = e.target.value;
      setExperiencias(nuevo);
    }} />
  </div>
))}

<button
  type="button"
  className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
  onClick={() => setExperiencias([...experiencias, { institucion: "", puesto: "", fechaInicio: "", fechaFin: "", direccion: "", telefono: "", funciones: "" }])}
>
  ➕ Agregar otra experiencia
</button>

      
    <input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="date" placeholder="Fecha de nacimiento" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Estado civil" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Licencia de conducir" value={licencia} onChange={(e) => setLicencia(e.target.value)} />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Libreta militar (solo varones)" value={libretaMilitar} onChange={(e) => setLibretaMilitar(e.target.value)} />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Expectativa salarial" value={expectativaSalarial} onChange={(e) => setExpectativaSalarial(e.target.value)} />
<input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="C.I. o Pasaporte" value={ci} onChange={(e) => setCI(e.target.value)} />

        <input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Profesión" value={profesion} onChange={(e) => setProfesion(e.target.value)} required />

        <textarea className="w-full p-3 border rounded-lg shadow-sm" placeholder="Experiencia laboral" value={experiencia} onChange={(e) => setExperiencia(e.target.value)} required></textarea>

        <input className="w-full p-3 border rounded-lg shadow-sm" type="text" placeholder="Habilidades (separadas por coma)" value={habilidades} onChange={(e) => setHabilidades(e.target.value)} required />

       


        <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => setAvatar(reader.result);
                if (file) reader.readAsDataURL(file);
            }}
            className="w-full p-2 border rounded-lg"
        />

        <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:scale-105 transition">Guardar CV</button>
    </form>
</Modal>



      <div>

<div>
<div className="mb-6 space-y-2">

    
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

       

    </div>
</div>


 

  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
  {empleos
    .filter((emp) => {
      const hoy = new Date();


      
        ;
    })
    .map((empleo) => {


      const user = JSON.parse(localStorage.getItem("user"));
      const postulante = empleo.postulantes.find(p => p.nombre === user.nombre);
      const yaPostulado = Boolean(postulante);
      const estado = postulante?.estado || "pendiente";

      return (
        <div key={empleo.id} className={`relative bg-white/30 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-gray-200 transition-all transform hover:scale-[1.03] hover:shadow-2xl duration-300 ${yaPostulado && "ring-2 ring-blue-400"}`}>
          
          {/* Badge flotante glass */}
          {yaPostulado && (
            <span className={`absolute -top-3 -right-3 px-3 py-1 rounded-full shadow-md text-xs font-semibold backdrop-blur ${
              estado === "aceptado" ? "bg-green-500/80 text-white" :
              estado === "rechazado" ? "bg-red-500/80 text-white" :
              "bg-yellow-400/80 text-white"
            }`}>
              {estado}
            </span>
          )}

          <h4 className="text-xl font-semibold text-gray-800 mb-2">{empleo.titulo}</h4>
          <p className="text-sm text-gray-700 mb-2">Publicado por: {empleo.empresa}</p>
          <p className="text-sm text-gray-600 mb-3">{empleo.descripcion}</p>
          <p className="text-sm text-gray-600">📍 Ciudad: {empleo.ciudad || "No especificada"}</p>
<p className="text-sm text-gray-600">🏢 Sector: {empleo.sector || "No especificado"}</p>
<p className="text-sm text-gray-600">📝 Tipo de contrato: {empleo.tipoContrato || "No especificado"}</p>
{empleo.beneficios && <p className="text-sm text-green-600">🎁 Beneficios: {empleo.beneficios}</p>}
{empleo.objetivo && <p className="text-sm text-gray-600 italic">🎯 {empleo.objetivo}</p>}

          {empleo.salario && <p className="mt-1 text-sm font-semibold text-green-600">💰 ${empleo.salario}</p>}
          {empleo.ciudad && <p className="text-sm text-gray-600">📍 Ciudad: {empleo.ciudad}</p>}
{empleo.sector && <p className="text-sm text-gray-600">🏢 Sector: {empleo.sector}</p>}
{empleo.tipoContrato && <p className="text-sm text-gray-600">📄 Tipo de contrato: {empleo.tipoContrato}</p>}
{empleo.ubicacion && <p className="text-sm text-gray-600">🗺️ Ubicación del trabajo: {empleo.ubicacion}</p>}
{empleo.objetivo && <p className="text-sm text-gray-600">🎯 Objetivo: {empleo.objetivo}</p>}
{empleo.funciones && <p className="text-sm text-gray-600">🔧 Funciones principales: {empleo.funciones}</p>}
{empleo.requisitos && <p className="text-sm text-gray-600">📚 Requisitos: {empleo.requisitos}</p>}
{empleo.requisitosExtra && <p className="text-sm text-gray-600">✨ Requisitos complementarios: {empleo.requisitosExtra}</p>}
{empleo.beneficios && <p className="text-sm text-gray-600">🎁 Beneficios: {empleo.beneficios}</p>}


          {/* Botón glass animado */}
          {!yaPostulado ? (
            <button
              onClick={() => {
                if (confirm("¿Deseas postularte a este empleo?")) {
                  const nuevosEmpleos = empleos.map((emp) => {
                    if (emp.id === empleo.id && !emp.postulantes.some(p => p.nombre === user.nombre)) {
                      emp.postulantes.push({ nombre: user.nombre, estado: "pendiente" });
                    }
                    return emp;
                  });
                  localStorage.setItem("empleos", JSON.stringify(nuevosEmpleos));
                  setEmpleos(nuevosEmpleos);
                  showToast("✅ Te postulaste correctamente");
                }
              }}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold transition-transform transform hover:scale-105 active:scale-95 w-full shadow-lg backdrop-blur"
            >
              Postularme
            </button>
          ) : (
            <p className="text-sm mt-2 text-blue-600 font-medium">Ya estás postulado</p>
          )}
        </div>
      );
    })}
  </div>
</div>


        <h3 className="text-2xl font-bold text-indigo-700 mb-4">Mis Postulaciones</h3>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setFiltro("todos")} className="px-3 py-1 border rounded-lg text-sm">Todos</button>
          <button onClick={() => setFiltro("pendiente")} className="px-3 py-1 border rounded-lg text-yellow-600 text-sm">Pendientes</button>
          <button onClick={() => setFiltro("aceptado")} className="px-3 py-1 border rounded-lg text-green-600 text-sm">Aceptados</button>
          <button onClick={() => setFiltro("rechazado")} className="px-3 py-1 border rounded-lg text-red-500 text-sm">Rechazados</button>
          {profesion && experiencia && habilidades && (
  <p className="text-sm text-gray-500 mb-2">Tienes un CV creado, puedes exportarlo o editarlo.</p>
)}

          <button onClick={exportarPDF} className="ml-auto px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm">Exportar PDF</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {postulacionesFiltradas.length > 0 ? (
    postulacionesFiltradas.map((empleo) => (
      <div key={empleo.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">{empleo.titulo}</h4>
        <p className="text-sm text-gray-600 mb-1">Empresa: {empleo.empresa}</p>
        <p className="text-sm text-gray-700">{empleo.descripcion}</p>
        {empleo.salario && <p className="mt-1 text-sm font-semibold text-green-600">💰 ${empleo.salario}</p>}
        <p className="text-sm mt-2">Estado: <span className={`px-2 py-0.5 rounded text-xs ${
          estadoDePostulacion(empleo) === "aceptado" ? "bg-green-100 text-green-700" :
          estadoDePostulacion(empleo) === "rechazado" ? "bg-red-100 text-red-600" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {estadoDePostulacion(empleo)}
        </span></p>
        <button onClick={() => retirarPostulacion(empleo.id)} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-xl hover:scale-105 transition w-full">Retirar postulación</button>
      </div>
    ))
  ) : (
    <p className="text-gray-400 text-sm">No hay postulaciones en esta categoría.</p>
  )}
</div>
</div>
</div>
);
}
