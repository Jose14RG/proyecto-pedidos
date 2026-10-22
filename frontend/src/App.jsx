import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Clock, Store, Utensils, CheckCircle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSel, setEmpresaSel] = useState(null);
  const [menus, setMenus] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [horario, setHorario] = useState('12:00');
  const [pedidoExito, setPedidoExito] = useState(false);
  const [verAdmin, setVerAdmin] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/empresas')
      .then(res => setEmpresas(res.data))
      .catch(err => console.error(err));
  }, []);

  const seleccionarEmpresa = (emp) => {
    setEmpresaSel(emp);
    setCarrito([]);
    axios.get(`http://localhost:5000/api/menus/${emp.id}`)
      .then(res => setMenus(res.data))
      .catch(err => console.error(err));
  };

  const agregarAlCarrito = (item) => {
    setCarrito([...carrito, item]);
  };

  const total = carrito.reduce((acc, item) => acc + parseFloat(item.precio), 0);

  const enviarPedido = () => {
    if (carrito.length === 0) return alert('El carrito está vacío');

    axios.post('http://localhost:5000/api/pedidos', {
      usuario_id: 1,
      empresa_id: empresaSel.id,
      horario_recogida: horario,
      total: total
    })
    .then(res => {
      setPedidoExito(true);
      setCarrito([]);
    })
    .catch(err => alert('Error al enviar el pedido'));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2>🍔 Pedidos de Comida Express</h2>
        <button onClick={() => setVerAdmin(!verAdmin)} style={{ padding: '8px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {verAdmin ? 'Modo Cliente' : 'Vista Soporte/Admin'}
        </button>
      </header>

      {!verAdmin ? (
        <div>
          <h3>1. Selecciona un Establecimiento</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {empresas.map(emp => (
              <button 
                key={emp.id} 
                onClick={() => seleccionarEmpresa(emp)}
                style={{
                  padding: '12px',
                  background: empresaSel?.id === emp.id ? '#007bff' : '#f0f0f0',
                  color: empresaSel?.id === emp.id ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Store size={16} /> {emp.nombre}
              </button>
            ))}
          </div>

          {empresaSel && (
            <div>
              <h3>2. Menú de {empresaSel.nombre}</h3>
              <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                {menus.map(menu => (
                  <div key={menu.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{menu.nombre_platillo}</strong> - Q{menu.precio}
                      <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>{menu.descripcion}</p>
                    </div>
                    <button onClick={() => agregarAlCarrito(menu)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      + Agregar
                    </button>
                  </div>
                ))}
              </div>

              <h3>3. Horario de Recogida y Confirmación</h3>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                <p><Clock size={16} /> Horario programado:</p>
                <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} style={{ padding: '8px', fontSize: '16px' }} />
                
                <p><strong>Total en Carrito: Q{total.toFixed(2)}</strong> ({carrito.length} ítems)</p>
                <button onClick={enviarPedido} style={{ background: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
                  <ShoppingBag size={18} /> Confirmar Pedido
                </button>
              </div>
            </div>
          )}

          {pedidoExito && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '6px' }}>
              <CheckCircle size={20} /> ¡Pedido realizado con éxito! Tu comida estará lista a las {horario}.
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h3><ShieldAlert size={20} /> Panel de Administración y Registros</h3>
          <p>Módulo para monitorear incidencias del sistema y errores de conexión.</p>
          <div style={{ background: '#fff3cd', padding: '15px', border: '1px solid #ffeeba', borderRadius: '6px' }}>
            <strong>Estado de Servicios:</strong>
            <ul>
              <li>Base de datos MariaDB: Conectada</li>
              <li>Servidor Backend (Port 5000): Activo</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}