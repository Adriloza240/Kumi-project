import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DetalleEmpleo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleo, setEmpleo] = useState(null);
  const [yaPostulado, setYaPostulado] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("empleos")) || [];
    const encontrado = data.find((e) => String(e.id) === id);
    setEmpleo(encontrado);

    const usuario = JSON.parse(localStorage.getItem("user"));
    setUser(usuario);

    if (encontrado && usuario) {
      const yaPostulo = encontrado.postulantes?.some(p => p.nombre === usuario.nombre);
      setYaPostulado(yaPostulo);
    }
  }, [id]);

  const actualizarPostulantes = (nuevosPostulantes) => {
    const data = JSON.parse(localStorage.getItem("empleos")) || [];
    const index = data.findIndex((e) => String(e.id) === id);
    if (index !== -1) {
      data[index].postulantes = nuevosPostulantes;
      localStorage.setItem("empleos", JSON.stringify(data));
      setEmpleo(data[index]);
    }
  };

  const handlePostular = () => {
    if (!user) return alert("⚠️ Debes iniciar sesión para postularte.");

    if (yaPostulado) return;

    const nuevoPostulante = { nombre: user.nombre, estado: "pendiente" };
    const nuevos = [...(empleo.postulantes || []), nuevoPostulante];
    actualizarPostulantes(nuevos);
    setYaPostulado(true);
    alert("✅ Postulación realizada con éxito.");
  };

  const handleCancelar = () => {
    if (!user) return;

    const nuevos = empleo.postulantes?.filter(p => p.nombre !== user.nombre);
    actualizarPostulantes(nuevos);
    setYaPostulado(false);
    alert("❌ Has cancelado tu postulación.");
  };

  if (!empleo) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-red-600">Empleo no encontrado</h2>
        <Link to="/buscar" className="text-blue-500 underline mt-4 block">Volver a buscar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-14 bg-white shadow-xl rounded-3xl border border-gray-200 space-y-12 animate-fadeIn">
      <header className="flex justify-between items-center flex-wrap gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-700 mb-2">{empleo.titulo}</h1>
          <p className="text-xl text-gray-600"><strong> Empresa:</strong> {empleo.empresa}</p>
        </div>
        {empleo.logoEmpresa && (
          <img src={empleo.logoEmpresa} alt="Logo empresa" className="h-20 object-contain" />
        )}
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-lg text-gray-800">
        <p><strong> Ciudad:</strong> {empleo.ciudad}</p>
        <p><strong> Contrato:</strong> {empleo.tipoContrato}</p>
        <p><strong> Salario:</strong> {empleo.salario || "No especificado"}</p>
        <p><strong> Fecha límite:</strong> {empleo.fechaLimite || "Sin definir"}</p>
        <p><strong> Sector:</strong> {empleo.sector}</p>
        <p><strong> Ubicación:</strong> {empleo.ubicacion || "Remoto / No especificado"}</p>
      </section>

      <section className="space-y-8 text-gray-700 text-lg leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1"> Descripción</h2>
          <p>{empleo.descripcion}</p>
        </div>
        {empleo.objetivo && (
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-1"> Objetivo</h2>
            <p>{empleo.objetivo}</p>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1"> Funciones</h2>
          <p>{empleo.funciones}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1"> Requisitos</h2>
          <p>{empleo.requisitos}</p>
        </div>
        {empleo.requisitosExtra && (
          <div>
            <h2 className="text-2xl font-semibold text-blue-600 mb-1"> Requisitos extra</h2>
            <p>{empleo.requisitosExtra}</p>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-1"> Beneficios</h2>
          <p>{empleo.beneficios}</p>
        </div>
      </section>

      <footer className="flex justify-between items-center flex-wrap gap-4">
        <Link to="/buscar" className="text-blue-600 hover:underline text-lg">← Volver</Link>
        {!user ? (
          <p className="text-red-600 font-medium">Inicia sesión para postularte</p>
        ) : yaPostulado ? (
          <button
            onClick={handleCancelar}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Cancelar postulación
          </button>
        ) : (
          <button
            onClick={handlePostular}
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Postularme
          </button>
        )}
      </footer>
    </div>
  );
}
