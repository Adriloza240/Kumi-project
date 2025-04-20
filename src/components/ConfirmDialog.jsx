export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white/30 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-scaleIn">
  
          <h3 className="text-xl font-bold text-gray-800 mb-2">¿Estás seguro?</h3>
          <p className="text-sm text-gray-700 mb-4">{message}</p>
  
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-1 rounded-lg border border-gray-300 hover:bg-white/40 transition text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  }
  