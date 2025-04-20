export default function BadgeEstado({ estado }) {
  const colorClasses = {
    aceptado: "bg-green-100 text-green-700",
    rechazado: "bg-red-100 text-red-700",
    pendiente: "bg-yellow-100 text-yellow-700",
  };

  const clases = colorClasses[estado] || "bg-gray-100 text-gray-700";

  return (
    <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${clases}`}>
      {estado}
    </span>
  );
}
