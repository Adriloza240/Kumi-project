import { useEffect, useState } from "react";

const anuncios = [
  {
    id: 1,
    titulo: "🔹 Empresas Premium",
    descripcion: "Publica tus ofertas con mayor visibilidad en Trabajopolis.",
    enlace: "/contacto",
    color: "bg-indigo-100",
  },
  {
    id: 2,
    titulo: "🎓 Cursos Online Certificados",
    descripcion: "Potencia tu CV con nuestros aliados educativos.",
    enlace: "https://cursosonline.com",
    color: "bg-yellow-100",
  },
  {
    id: 3,
    titulo: "💼 Plantillas de CV Pro",
    descripcion: "Descarga diseños profesionales para destacar.",
    enlace: "https://cvpremium.com",
    color: "bg-emerald-100",
  },
];

export default function Publicidad() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActual((prev) => (prev + 1) % anuncios.length);
    }, 7000);

    return () => clearInterval(intervalo);
  }, []);

  const ad = anuncios[actual];

  return (
    <div className={`p-4 rounded-xl shadow-md border mt-10 ${ad.color}`}>
      <h4 className="font-bold text-lg">{ad.titulo}</h4>
      <p className="text-sm text-gray-700">{ad.descripcion}</p>
      <a
        href={ad.enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline inline-block mt-2"
      >
        Más información →
      </a>
    </div>
  );
}
