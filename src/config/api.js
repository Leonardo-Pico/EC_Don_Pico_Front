const API_URL = import.meta.env.VITE_API_URL;
console.log("ENV TEST:", import.meta.env);
console.log("API_URL:", API_URL);

export const api = {
    getProducts: async (categoria = '', busqueda = '') => {
        const params = new URLSearchParams();
        if (categoria && categoria !== 'Todos') params.append('categoria', categoria);
        if (busqueda) params.append('busqueda', busqueda);

        const response = await fetch(`${API_URL}/api/products?${params}`);
        if (!response.ok) throw new Error('Error cargando productos');
        return response.json();
    },

    createOrder: async (orderData) => {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Error creando orden');
        return response.json();
    }
};

export default api;