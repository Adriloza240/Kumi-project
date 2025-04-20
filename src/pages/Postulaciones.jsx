import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Postulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const empleos = JSON.parse(localStorage.getItem("empleos")) || [];

    const filtradas = empleos
      .filter((empleo) => empleo.postulantes.some(p => p.nombre === user.nombre))
      .map((empleo) => ({
        ...empleo,
        fecha: new Date(empleo.id).toLocaleDateString(),
        estado: empleo.postulantes.find(p => p.nombre === user.nombre)?.estado || "pendiente"
      }));

    setPostulaciones(filtradas);
  }, []);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Historial de Postulaciones - Trabajo", 14, 20);

    const data = postulaciones.map((e) => [
      e.titulo,
      e.empresa,
      e.fecha,
      e.salario ? `$${e.salario}` : "N/A",
      e.estado,
    ]);

    doc.autoTable({
      head: [["Puesto", "Empresa", "Fecha", "Salario", "Estado"]],
      body: data,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 98, 255] },
    });

    doc.save("mis_postulaciones.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-600">🗂️ Historial de Postulaciones</h2>
        {postulaciones.length > 0 && (
          <button
            onClick={exportarPDF}
            className="py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:scale-105 transition"
          >
            📄 Exportar PDF
          </button>
        )}
      </div>

      {postulaciones.length === 0 ? (
        <p className="text-center text-gray-500">No tienes postulaciones aún.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {postulaciones.map((empleo) => (
            <div
              key={empleo.id}
              className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition"
            >
              <h4 className="text-xl font-semibold text-gray-800 mb-1">{empleo.titulo}</h4>
              <p className="text-sm text-gray-500 mb-1">Empresa: {empleo.empresa}</p>
              <p className="text-sm text-gray-600 mb-1">Fecha de postulación: <span className="text-blue-500 font-medium">{empleo.fecha}</span></p>
              <p className="text-sm text-gray-700">{empleo.descripcion}</p>
              {empleo.salario && <p className="mt-2 font-semibold text-green-600">💰 ${empleo.salario}</p>}
              <p className="text-sm mt-2">Estado: <span className={`font-medium ${
                empleo.estado === "aceptado" ? "text-green-600" :
                empleo.estado === "rechazado" ? "text-red-500" :
                "text-yellow-500"
              }`}>{empleo.estado}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
