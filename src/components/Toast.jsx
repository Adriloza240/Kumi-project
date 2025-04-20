export default function Toast({ message, type }) {
    return (
      <div className={`fixed top-5 right-5 p-4 rounded-xl shadow-xl text-white animate-fadeIn
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
        {message}
      </div>
    );
  }
  