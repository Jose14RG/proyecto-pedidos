import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Clock, Store, Utensils, CheckCircle, ShieldAlert, User, Phone, MapPin, Search } from 'lucide-react';

export default function App() {
  // Estados de Usuario (Login Simple)
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // Estados de la App
  const [empresas, setEmpresas] = useState([]);
  const [empresaSel, setEmpresaSel] = useState(null);
  const [menus, setMenus] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [horario, setHorario] = useState('12:00');
  
  // Estados de éxito y consulta de pedidos
  const [ultimoPedidoId, setUltimoPedidoId] = useState(null);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [pedidoConsultado, setPedidoConsultado] = useState(null);
  
  const [verAdmin, setVerAdmin] = useState(false);
  const [pedidosAdmin, setPedidosAdmin] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://pedidos-backend-a7d0.onrender.com';

// Cargar empresas
useEffect(() => {
  axios.get(`${API_URL}/api/empresas`)
    .then(res => setEmpresas(res.data))
    .catch(err => console.error("Error al obtener empresas:", err));
}, []);

// Cargar menú al seleccionar empresa
useEffect(() => {
  if (empresaSel) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    axios.get(`${API_URL}/api/menus/${empresaSel.id}`)
      .then(res => setMenus(res.data))
      .catch(err => console.error("Error al obtener menús:", err));
  }
}, [empresaSel]);

  // Cargar pedidos para admin
  useEffect(() => {
    if (verAdmin) {
      axios.get(`${API_URL}/api/pedidos`)
        .then(res => setPedidosAdmin(res.data))
        .catch(err => console.error("Error al obtener pedidos:", err));
    }
  }, [verAdmin]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      return alert("Por favor completa todos tus datos de contacto.");
    }
    setUsuarioRegistrado(true);
  };

  const agregarAlCarrito = (item) => {
    setCarrito([...carrito, item]);
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + parseFloat(item.precio || 0), 0);
  };

  const enviarPedido = () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    
    const datosPedido = {
      empresa_id: empresaSel.id,
      cliente_nombre: nombre,
      cliente_telefono: telefono,
      cliente_direccion: direccion,
      total: calcularTotal(),
      horario_entrega: horario,
      detalles: carrito
    };

axios.post(`${API_URL}/api/pedidos`, datosPedido)
    .then(res => {
      setUltimoPedidoId(res.data.pedidoId);
      setCarrito([]);
      setEmpresaSel(null);
    })
  .catch(err => console.error("Error al enviar pedido:", err));
  };
axios.post
  const buscarEstadoPedido = () => {
    if (!codigoBusqueda) return;
axios.get(`${API_URL}/api/pedidos/consultar/${codigoBusqueda}`)
      .then(res => setPedidoConsultado(res.data))
      .catch(() => {
        alert("Pedido no encontrado");
        setPedidoConsultado(null);
      });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      
      {/* Encabezado */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem' }}>
          🍔 Pedidos de Comida Express
        </h1>
        <button 
          onClick={() => setVerAdmin(!verAdmin)}
          style={{ padding: '8px 16px', background: verAdmin ? '#2563eb' : '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {verAdmin ? 'Modo Cliente' : 'Vista Soporte/Admin'}
        </button>
      </header>

      {/* VISTA ADMIN */}
      {verAdmin ? (
        <section style={{ marginTop: '20px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
          <h2><ShieldAlert size={20} /> Panel de Administración y Registros</h2>
          <h3>📦 Pedidos Recibidos ({pedidosAdmin.length})</h3>
          {pedidosAdmin.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Aún no hay pedidos registrados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {pedidosAdmin.map(p => (
                <li key={p.id} style={{ background: '#0f172a', padding: '12px', marginBottom: '8px', borderRadius: '6px' }}>
                  <strong>ID: #{p.id}</strong> | <strong>Cliente:</strong> {p.cliente_nombre} ({p.cliente_telefono}) <br/>
                  <strong>Dirección:</strong> {p.cliente_direccion} | <strong>Negocio ID:</strong> {p.empresa_id} <br/>
                  <strong>Total:</strong> Q{Number(p.total).toFixed(2)} | <strong>Entrega:</strong> {p.horario_entrega} | <strong>Estado:</strong> {p.estado}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        /* VISTA CLIENTE */
        <main style={{ marginTop: '20px' }}>

          {/* SI ACABA DE ENVIAR UN PEDIDO, MOSTRAR COMPROBANTE */}
          {ultimoPedidoId ? (
            <div style={{ padding: '25px', background: '#166534', color: '#bbf7d0', borderRadius: '8px', textAlign: 'center' }}>
              <CheckCircle size={48} />
              <h2>¡Pedido realizado con éxito!</h2>
              <p style={{ fontSize: '1.2rem' }}>Tu número de pedido único es: <strong>#{ultimoPedidoId}</strong></p>
              <p>Guarda este número para consultar el estado de tu entrega en cualquier momento.</p>
              <button 
                onClick={() => setUltimoPedidoId(null)}
                style={{ marginTop: '15px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hacer otro pedido
              </button>
            </div>
          ) : !usuarioRegistrado ? (
            /* PASO 1: LOGIN SIMPLE DEL CLIENTE */
            <div style={{ maxWidth: '400px', margin: '40px auto', background: '#1e293b', padding: '25px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h2>Identifícate para continuar</h2>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}><User size={16} /> Tu Nombre:</label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    placeholder="Ej. José Pérez"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}><Phone size={16} /> Teléfono:</label>
                  <input 
                    type="text" 
                    value={telefono} 
                    onChange={e => setTelefono(e.target.value)} 
                    placeholder="Ej. 5555-1234"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}><MapPin size={16} /> Dirección de Entrega:</label>
                  <input 
                    type="text" 
                    value={direccion} 
                    onChange={e => setDireccion(e.target.value)} 
                    placeholder="Ej. Zona 1, Casa o Bufete"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
                  />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Continuar a Establecimientos
                </button>
              </form>
            </div>
          ) : (
            /* PASO 2: SELECCIÓN Y CONSULTADOR */
            <div>
              {/* Buscador de Estado de Pedido */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#1e293b', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Search size={20} />
                <input 
                  type="text" 
                  placeholder="Ingresa tu número de pedido (ej. 1)" 
                  value={codigoBusqueda}
                  onChange={e => setCodigoBusqueda(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', flex: 1 }}
                />
                <button onClick={buscarEstadoPedido} style={{ padding: '8px 15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Consultar Estado
                </button>
              </div>

              {pedidoConsultado && (
                <div style={{ marginBottom: '25px', padding: '15px', background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '8px' }}>
                  <h4>🔍 Estado del Pedido #{pedidoConsultado.id}</h4>
                  <p><strong>Negocio:</strong> {pedidoConsultado.empresa_nombre}</p>
                  <p><strong>Total:</strong> Q{Number(pedidoConsultado.total).toFixed(2)}</p>
                  <p><strong>Hora de Entrega:</strong> {pedidoConsultado.horario_entrega}</p>
                  <p><strong>Estado Actual:</strong> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{pedidoConsultado.estado}</span></p>
                </div>
              )}

              {/* 1. Selección de Establecimiento */}
              <section>
                <h2>1. Selecciona un Establecimiento</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {empresas.map((emp) => (
                    <div 
                      key={emp.id} 
                      onClick={() => setEmpresaSel(emp)}
                      style={{ 
                        padding: '15px', 
                        background: empresaSel?.id === emp.id ? '#1e3a8a' : '#1e293b', 
                        border: empresaSel?.id === emp.id ? '2px solid #3b82f6' : '1px solid #334155',
                        borderRadius: '8px', 
                        cursor: 'pointer' 
                      }}
                    >
                      <h3 style={{ margin: '0 0 5px 0' }}><Store size={18} /> {emp.nombre}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Tel: {emp.telefono}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Menú */}
              {empresaSel && (
                <section style={{ marginTop: '30px' }}>
                  <h2>2. Menú disponible en {empresaSel.nombre}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                    {menus.map((m) => (
                      <div key={m.id} style={{ padding: '15px', background: '#1e293b', borderRadius: '8px' }}>
                        <h4><Utensils size={16} /> {m.nombre_platillo}</h4>
                        <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>Q{Number(m.precio).toFixed(2)}</p>
                        <button 
                          onClick={() => agregarAlCarrito(m)}
                          style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Agregar al Carrito
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. Carrito */}
              {carrito.length > 0 && (
                <section style={{ marginTop: '30px', padding: '20px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}>
                  <h2><ShoppingBag /> Tu Carrito de Pedido</h2>
                  <ul>
                    {carrito.map((item, idx) => (
                      <li key={idx}>{item.nombre_platillo} - Q{Number(item.precio).toFixed(2)}</li>
                    ))}
                  </ul>
                  <p><strong>Total:</strong> Q{calcularTotal().toFixed(2)}</p>

                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}><Clock size={16} /> Hora preferida de entrega:</label>
                    <input 
                      type="time" 
                      value={horario} 
                      onChange={(e) => setHorario(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
                    />
                  </div>

                  <button 
                    onClick={enviarPedido}
                    style={{ marginTop: '15px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%' }}
                  >
                    Confirmar y Enviar Pedido
                  </button>
                </section>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}