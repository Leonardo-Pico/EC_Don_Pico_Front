import { useState, useEffect } from 'react';
import { Bell, Package, Check, DollarSign, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [nuevosPedidos, setNuevosPedidos] = useState(0);
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  // Sonido de notificación
  const reproducirSonido = () => {
    audio.play().catch(e => console.log('Audio no pudo reproducirse:', e));
  };

  // Verificar nuevos pedidos cada 10 segundos
  useEffect(() => {
    const verificarPedidos = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/notificaciones`);
        const data = await response.json();
        
        if (data.nuevosPedidos > nuevosPedidos) {
          reproducirSonido();
          // Mostrar notificación del navegador
          if (Notification.permission === 'granted') {
            new Notification('¡Nuevo pedido en Don Pico!', {
              body: `Pedido #${data.pedidos[0]?.numeroOrden} - $${data.pedidos[0]?.total}`,
              icon: '🛒'
            });
          }
        }
        
        setNuevosPedidos(data.nuevosPedidos);
        setPedidos(data.pedidos);
      } catch (error) {
        console.error('Error verificando pedidos:', error);
      }
    };

    // Solicitar permiso de notificaciones
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    verificarPedidos();
    const interval = setInterval(verificarPedidos, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, [nuevosPedidos, audio]);

  const marcarVisto = async (id) => {
    await fetch(`${API_URL}/admin/notificaciones/visto/${id}`, { method: 'POST' });
    setPedidos(prev => prev.filter(p => p.id !== id));
    setNuevosPedidos(prev => prev - 1);
  };

  const marcarTodosVistos = () => {
    pedidos.forEach(p => marcarVisto(p.id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-xl">
                <Bell className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Don Pico - Autoservicio</p>
              </div>
            </div>
            {nuevosPedidos > 0 && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold animate-pulse">
                {nuevosPedidos} nuevos pedidos
              </div>
            )}
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No hay pedidos pendientes</p>
            <p className="text-gray-400 text-sm mt-2">Los nuevos pedidos aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Pedidos por preparar</h2>
              <button 
                onClick={marcarTodosVistos}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Check size={20} />
                Marcar todos como preparados
              </button>
            </div>

            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 animate-in slide-in-from-right">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                        #{pedido.numeroOrden}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(pedido.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Nuevo pedido recibido</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-2xl font-bold text-orange-600">
                      <DollarSign size={24} />
                      {pedido.total?.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Productos:</h4>
                  <ul className="space-y-1">
                    {pedido.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span className="text-gray-600">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => marcarVisto(pedido.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Marcar como preparado
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    🖨️ Imprimir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;