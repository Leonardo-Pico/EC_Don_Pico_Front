import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, MapPin, Clock, Check, ArrowLeft, Store, Search, Menu, X, Truck, Shield, Package } from 'lucide-react';
import { api } from './config/api';
import CheckoutForm from './components/CheckoutForm';

const CATEGORIAS = ["Todos", "Lácteos", "Panadería", "Despensa", "Carnes", "Frutas", "Bebidas", "Higiene"];

// Función para formatear precios (sin .00 innecesarios)
const formatearPrecio = (precio) => {
  if (!precio && precio !== 0) return '$0';
  return `$${precio.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

useEffect(() => {
  api.getProducts()
    .then(data => setProductos(data))
    .catch(err => console.error(err));
}, []);

function App() {
  const [vista, setVista] = useState('tienda');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [ordenConfirmada, setOrdenConfirmada] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, [categoriaActiva, busqueda]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts(categoriaActiva, busqueda);
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('No se pudieron cargar los productos. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto._id);
      if (existente) {
        return prev.map(item => 
          item.id === producto._id 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { 
        id: producto._id, 
        nombre: producto.nombre, 
        precio: Number(producto.precio), 
        imagen: producto.imagen,
        cantidad: 1 
      }];
    });
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id) {
        const nuevaCantidad = Math.max(0, item.cantidad + delta);
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }).filter(item => item.cantidad > 0));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  // Cálculo de totales - Envío solo se calcula aquí, no se muestra en productos
  const subtotal = carrito.reduce((sum, item) => sum + (Number(item.precio) * Number(item.cantidad)), 0);
  const envio = subtotal >= 50000 ? 0 : 6000;
  const total = subtotal + envio;

  const Header = () => (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {menuAbierto ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setVista('tienda')}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-orange-500/30 transition-shadow">
                <Store className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Don Pico
                </h1>
                <p className="text-xs text-gray-500 font-medium">Autoservicio a domicilio</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => setVista('carrito')}
            className="relative p-3 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <ShoppingCart size={24} className="text-gray-700 group-hover:text-orange-600 transition-colors" />
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className={`lg:block ${menuAbierto ? 'block' : 'hidden'} bg-white border-t border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setCategoriaActiva(cat);
                  setMenuAbierto(false);
                }}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                  categoriaActiva === cat
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );

  const Tienda = () => {
    if (loading) return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-6 text-gray-600 text-lg">Cargando productos...</p>
      </div>
    );

    if (error) return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={cargarProductos} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
            Reintentar
          </button>
        </div>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Banner simplificado - sin mención específica de envío para evitar confusiones */}
        <div className="mb-10 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-3">
                ¡Bienvenido!
              </span>
              <h2 className="text-4xl font-bold mb-2">Don Pico</h2>
              <p className="text-xl text-orange-100">Calidad y frescura a tu puerta</p>
              <p className="text-md text-orange-100">Envío gratis en compras mayores o iguales a {formatearPrecio(50000)}</p>
            </div>
            <Truck size={80} className="opacity-80" />
          </div>
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map(producto => (
              <div 
                key={producto._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                  {producto.imagen}
                </div>
                <div className="p-5">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-2">
                    {producto.categoria}
                  </span>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{producto.nombre}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{producto.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{formatearPrecio(producto.precio)}</span>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Carrito = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <button 
        onClick={() => setVista('tienda')}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Volver a la tienda
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">Tu Carrito</h2>

      {carrito.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <ShoppingCart size={80} className="mx-auto mb-6 text-gray-300" />
          <p className="text-gray-500 text-xl mb-6">Tu carrito está vacío</p>
          <button 
            onClick={() => setVista('tienda')}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Ir a comprar
          </button>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 mb-8 lg:mb-0">
            {carrito.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                <div className="text-5xl bg-gradient-to-br from-orange-50 to-red-50 w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.imagen}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{item.nombre}</h3>
                  <p className="text-orange-600 font-bold text-xl mb-3">{formatearPrecio(item.precio)} c/u</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                      <button 
                        onClick={() => actualizarCantidad(item.id, -1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-10 text-center font-bold text-lg">{item.cantidad}</span>
                      <button 
                        onClick={() => actualizarCantidad(item.id, 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN DE COMPRA - Único lugar donde se muestra el envío */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 text-xl mb-6">Resumen de compra</h3>
              
              {/* Lista de productos en el resumen */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {carrito.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate flex-1">{item.nombre} x{item.cantidad}</span>
                    <span className="font-medium ml-2">{formatearPrecio(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatearPrecio(subtotal)}</span>
                </div>
                
                {/* ENVÍO - Solo se muestra aquí en el resumen */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío</span>
                  {envio === 0 ? (
                    <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                      ¡Gratis!
                    </span>
                  ) : (
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{formatearPrecio(envio)}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Gratis en compras ≥ {formatearPrecio(50000)}
                      </p>
                    </div>
                  )}
                </div>

                {envio === 0 && subtotal > 0 && (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <Check size={16} />
                    ¡Has obtenido envío gratis por comprar más de {formatearPrecio(50000)}!
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{formatearPrecio(total)}</span>
                </div>
              </div>

              <button 
                onClick={() => setVista('checkout')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-center block"
              >
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const Confirmacion = () => (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30 animate-bounce">
        <Check size={56} className="text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-3">¡Pedido confirmado!</h2>
      <p className="text-gray-600 text-lg mb-8">Tu orden ha sido recibida y está siendo preparada</p>
      
      {ordenConfirmada && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-8 text-left">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
            <span className="text-gray-500">Número de orden</span>
            <span className="font-bold text-gray-900 text-lg">#{ordenConfirmada.numeroOrden}</span>
          </div>
          
          {/* Detalle del envío en la confirmación */}
          <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatearPrecio(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Envío</span>
              <span className={envio === 0 ? 'text-green-600 font-medium' : 'text-gray-900 font-medium'}>
                {envio === 0 ? 'Gratis' : formatearPrecio(envio)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total pagado</span>
            <span className="text-orange-600">{formatearPrecio(ordenConfirmada.total)}</span>
          </div>
        </div>
      )}
      <button 
        onClick={() => {
          setVista('tienda');
          setOrdenConfirmada(null);
        }}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
      >
        Hacer nuevo pedido
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="pt-2">
        {vista === 'tienda' && <Tienda />}
        {vista === 'carrito' && <Carrito />}
        {vista === 'checkout' && (
          <CheckoutForm 
            total={total}
            subtotal={subtotal}
            envio={envio}
            onSubmit={async (formData) => {
              setProcesandoPago(true);
              try {
                const orderData = {
                  items: carrito.map(item => ({
                    productoId: item.id,
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio: item.precio
                  })),
                  direccionEntrega: {
                    calle: formData.direccion,
                    numero: "",
                    colonia: "",
                    ciudad: "",
                    codigoPostal: "",
                    referencias: formData.instrucciones
                  },
                  contacto: {
                    nombre: formData.nombre,
                    telefono: formData.telefono
                  },
                  metodoPago: formData.metodoPago,
                  totales: { subtotal, envio, total },
                  instrucciones: formData.instrucciones
                };

                const response = await api.createOrder(orderData);

                if (response.success) {
                  setOrdenConfirmada(response.order);
                  setCarrito([]);
                  setVista('confirmacion');
                }
              } catch (error) {
                alert('Error al procesar la compra: ' + error.message);
              } finally {
                setProcesandoPago(false);
              }
            }}
            onBack={() => setVista('carrito')}
          />
        )}
        {vista === 'confirmacion' && <Confirmacion />}
      </main>

      {/* Barra flotante móvil - Solo muestra subtotal, el envío se ve en el resumen */}
      {vista === 'tienda' && carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl lg:hidden">
          <button 
            onClick={() => setVista('carrito')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-between px-6 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Ver carrito
            </span>
            <div className="flex items-center gap-3">
              <span className="bg-white/20 px-3 py-1 rounded-lg">
                {carrito.reduce((sum, item) => sum + item.cantidad, 0)} items
              </span>
              <span className="text-xl">{formatearPrecio(subtotal)}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;