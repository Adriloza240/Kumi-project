export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 z-50 animate-fadeIn">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-xl relative">
          <button
            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition"
            onClick={onClose}
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    );
  }
  