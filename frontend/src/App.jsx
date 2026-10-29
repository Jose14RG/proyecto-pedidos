import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Clock, Store, Utensils, CheckCircle, ShieldAlert, User, Phone, MapPin, Search, Lock } from 'lucide-react';

export default function App() {
  // Estados de Usuario (Login Simple Cliente)
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
  
  // Estados de Admin / Empresa
  const [verAdmin, setVerAdmin] = useState(false);
  const [pedidosAdmin, setPedidosAdmin] = useState([]);
  const [empresaAdminSel, setEmpresaAdminSel] = useState(null);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [adminAutenticado, setAdminAutenticado] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://pedidos-backend-a7d0.onrender.com';

  // Cargar empresas
  useEffect(() => {
    axios.get(`${API_URL}/api/empresas`)
      .then(res => setEmpresas(res.data))
      .catch(err => console.error("Error al obtener empresas:", err));
  }, []);

  // Cargar menú al seleccionar empresa cliente
  useEffect(() => {
    if (empresaSel) {
      axios.get(`${API_URL}/api/menus/${empresaSel.id}`)
        .then(res => setMenus(res.data))
        .catch(err => console.error("Error al obtener menús:", err));
    }
  }, [empresaSel]);

  // Cargar pedidos para admin filtrados por la empresa autenticada
  useEffect(() => {
    if (verAdmin && adminAutenticado && empresaAdminSel) {
      axios.get(`${API_URL}/api/pedidos?empresa_id=${empresaAdminSel.id}`)
        .then(res => setPedidosAdmin(res.data))
        .catch(err => console.error("Error al obtener pedidos de la empresa:", err));
    }
  }, [verAdmin, adminAutenticado, empresaAdminSel]);

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

  const buscarEstadoPedido = () => {
    if (!codigoBusqueda) return;
    axios.get(`${API_URL}/api/pedidos/consultar/${codigoBusqueda}`)
      .then(res => setPedidoConsultado(res.data))
      .catch(() => {
        alert("Pedido no encontrado");
        setPedidoConsultado(null);
      });
  };

  // Función para autenticar alianzas/empresas en el panel de cocina
  const verificarAccesoEmpresa = (e) => {
    e.preventDefault();
    if (!empresaAdminSel) return alert("Selecciona tu restaurante");
    
    // Validar código (por defecto '1234' o el que tenga configurado)
    const codigoValido = empresaAdminSel.codigo_acceso || '1234';
    if (codigoIngresado === codigoValido) {
      setAdminAutenticado(true);
    } else {
      alert("Código de acceso incorrecto para este establecimiento.");
    }
  };

  // Cambiar estado del pedido
  const cambiarEstadoPedido = (id, nuevoEstado) => {
    axios.put(`${API_URL}/api/pedidos/${id}/estado`, { estado: nuevoEstado })
      .then(() => {
        setPedidosAdmin(prevPedidos =>
          prevPedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p)
        );
      })
      .catch(() => alert("Error al cambiar el estado del pedido"));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', color: '#e2e8f0', fontFamily: 'sans-serif' }}>
      
      {/* Encabezado */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem' }}>
          🍔 Pedidos de Comida Express
        </h1>
        <button 
          onClick={() => { setVerAdmin(!verAdmin); setAdminAutenticado(false); setCodigoIngresado(''); }}
          style={{ padding: '8px 16px', background: verAdmin ? '#2563eb' : '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {verAdmin ? 'Modo Cliente' : 'Panel de Cocina / Negocios'}
        </button>
      </header>

      {/* VISTA ADMIN / COCINA */}
      {verAdmin ? (
        <section style={{ marginTop: '20px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
          <h2><ShieldAlert size={20} /> Panel de Control para Establecimientos</h2>
          
          {!adminAutenticado ? (
            <div style={{ maxWidth: '400px', margin: '30px auto', background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h3><Lock size={18} /> Iniciar Sesión de Negocio</h3>
              <form onSubmit={verificarAccesoEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Selecciona tu Negocio:</label>
                  <select 
                    onChange={e => setEmpresaAdminSel(empresas.find(emp => emp.id === Number(e.target.value)))}
                    defaultValue=""
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
                  >
                    <option value="" disabled>-- Elige tu restaurante --</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Código Único de Acceso:</label>
                  <input 
                    type="password" 
                    placeholder="Ej. 1234"
                    value={codigoIngresado}
                    onChange={e => setCodigoIngresado(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
                  />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Ingresar a Cocina
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px' }}>
                <span>Restaurante activo: <strong>{empresaAdminSel?.nombre}</strong></span>
                <button 
                  onClick={() => { setAdminAutenticado(false); setCodigoIngresado(''); }}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cerrar Sesión
                </button>
              </div>

              <h3>📦 Pedidos Recibidos para {empresaAdminSel?.nombre} ({pedidosAdmin.length})</h3>
              {pedidosAdmin.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No hay pedidos nuevos para este negocio en este momento.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {pedidosAdmin.map(p => (
                    <li key={p.id} style={{ background: '#0f172a', padding: '15px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #334155' }}>
                      <strong>ID: #{p.id}</strong> | <strong>Cliente:</strong> {p.cliente_nombre} ({p.cliente_telefono}) <br/>
                      <strong>Dirección de entrega:</strong> {p.cliente_direccion} <br/>
                      <strong>Total:</strong> Q{Number(p.total).toFixed(2)} | <strong>Hora:</strong> {p.horario_entrega} <br/>
                      <strong>Estado actual:</strong> <span style={{ color: p.estado === 'Completado' ? '#4ade80' : p.estado === 'En Proceso' ? '#fbbf24' : '#f87171', fontWeight: 'bold' }}>{p.estado || 'Pendiente'}</span>
                      
                      {/* Botones exclusivos para actualizar el estado */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => cambiarEstadoPedido(p.id, 'En Proceso')}
                          style={{ background: '#d97706', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ⏳ En Proceso
                        </button>
                        <button 
                          onClick={() => cambiarEstadoPedido(p.id, 'Completado')}
                          style={{ background: '#16a34a', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✅ Completar
                        </button>
                        <button 
                          onClick={() => cambiarEstadoPedido(p.id, 'Cancelado')}
                          style={{ background: '#dc2626', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      ) : (
        /* VISTA CLIENTE */
        <main style={{ marginTop: '20px' }}>

          {/* COMPROBANTE DE PEDIDO RECIÉN ENVIADO */}
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
            /* PASO 1: LOGIN CLIENTE */
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
            /* PASO 2: SELECCIÓN Y CONSULTA DE ESTADO */
            <div>
              {/* Buscador de Estado de Pedido para el Cliente */}
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
                  <h4>🔍 Estado de tu Pedido #{pedidoConsultado.id}</h4>
                  <p><strong>Negocio:</strong> {pedidoConsultado.empresa_nombre}</p>
                  <p><strong>Total:</strong> Q{Number(pedidoConsultado.total).toFixed(2)}</p>
                  <p><strong>Hora de Entrega:</strong> {pedidoConsultado.horario_entrega}</p>
                  <p><strong>Estado Actual:</strong> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{pedidoConsultado.estado || 'Pendiente'}</span></p>
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