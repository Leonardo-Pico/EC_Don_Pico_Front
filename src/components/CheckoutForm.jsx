import { useState } from 'react';
import { CreditCard, MapPin, ArrowLeft, Shield } from 'lucide-react';

function CheckoutForm({ total, subtotal, envio, onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    instrucciones: '',
    metodoPago: 'tarjeta'
  });
  const [procesando, setProcesando] = useState(false);

  const formatearPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0';
    return `$${precio.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesando(true);
    await onSubmit(formData);
    setProcesando(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Volver al carrito
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6 text-orange-600">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-xl">Datos de envío</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="55 1234 5678"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección completa</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Calle, número, colonia, código postal..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones de entrega (opcional)</label>
              <input
                type="text"
                name="instrucciones"
                value={formData.instrucciones}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Tocar timbre, dejar en recepción, etc."
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6 text-orange-600">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard size={24} />
            </div>
            <h3 className="font-bold text-xl">Método de pago</h3>
          </div>
          
          <div className="space-y-4">
            <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              formData.metodoPago === 'efectivo' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="metodoPago"
                value="efectivo"
                checked={formData.metodoPago === 'efectivo'}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600"
              />
              <div className="flex-1">
                <p className="font-bold text-gray-900">Efectivo al recibir</p>
                <p className="text-sm text-gray-500">Paga cuando recibas tu pedido</p>
              </div>
              <span className="text-3xl">💵</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-900 text-xl mb-4">Resumen del pedido</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatearPrecio(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className={envio === 0 ? 'text-green-600 font-bold' : ''}>
                {envio === 0 ? '¡Gratis!' : formatearPrecio(envio)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-400 text-lg">Total a pagar</span>
            <span className="text-4xl font-bold text-orange-400">{formatearPrecio(total)}</span>
          </div>
          <button 
            type="submit"
            disabled={procesando}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {procesando ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Shield size={24} />
                Pagar ahora
              </>
            )}
          </button>
          <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
            <Shield size={16} />
            Pago seguro encriptado SSL
          </p>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;