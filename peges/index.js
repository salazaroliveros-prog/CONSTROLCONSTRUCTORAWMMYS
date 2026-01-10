import React, { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import { 
  HardHat, ShieldCheck, ArrowRight, MapPin, Camera, ShoppingCart, Users, 
  MessageSquare, LogOut, ClipboardList, Send, Calculator, 
  Wallet, CheckCircle2, X, TrendingUp, Activity, Layers, Mail, Lock, 
  Briefcase, Clock, DollarSign, Plus, Save, Trash2, Tool, ChevronRight
} from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
// Nota: Asegúrate que estos componentes existan en tu carpeta de proyecto
import ImportarProyectosCSV from '../components/ImportarProyectosCSV'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SoftconMasterApp() {
  // --- 1. ESTADOS DE NAVEGACIÓN Y UI (CORREGIDOS) ---
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFlipped, setIsFlipped] = useState(false);
  const sigCanvas = useRef({});
  const [chatOpen, setChatOpen] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);

  // --- 2. ESTADOS DE DATOS ---
  const [proyectos, setProyectos] = useState([
    { id: 'p1', nombre: 'Edificio Central M&S', presupuesto: 500000, gastado: 120500 },
    { id: 'p2', nombre: 'Residencial Los Olivos', presupuesto: 350000, gastado: 45000 }
  ]);
  const [renglones, setRenglones] = useState([
    { id: 1, actividad: "Cimentación y Zapata", ponderacion: 15, completado: false, proyectoId: 'p1' },
    { id: 2, actividad: "Levantado de Muros 1er Nivel", ponderacion: 25, completado: false, proyectoId: 'p1' },
    { id: 3, actividad: "Instalaciones Hidráulicas", ponderacion: 10, completado: false, proyectoId: 'p1' },
  ]);

  // --- 3. ESTADOS DE FORMULARIOS ---
  const [formOnboarding, setFormOnboarding] = useState({ 
    nombre: "", dpi: "", sueldo: "", puesto: "", horario: "", proyectoId: "" 
  });
  const [formUsuario, setFormUsuario] = useState({ nombre: "", email: "", proyectoId: "" });
  const [formIngreso, setFormIngreso] = useState({ monto: '', fecha: '', descripcion: '', tipo_ingreso: '', proyecto_id: '', cliente_id: '' });
  const [formGasto, setFormGasto] = useState({ monto: '', fecha: '', descripcion: '', tipo_gasto: '', proyecto_id: '' });
  
  // --- 4. ESTADOS DE FINANZAS Y FILTROS ---
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [finanzas, setFinanzas] = useState({ ingresos: 0, egresos: 0 });
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  // --- 5. EFECTOS (SUPABASE) ---
  useEffect(() => {
    const fetchData = async () => {
      // Cargar Usuarios
      const { data: users } = await supabase.from('usuarios').select('*');
      setUsuarios(users || []);

      // Cargar Finanzas
      const { data: ingresosData } = await supabase.from('ingresos').select('*');
      const { data: gastosData } = await supabase.from('proyectos').select('gasto, tipo_gasto, id, nombre');
      
      setIngresos(ingresosData || []);
      const gastosValidos = (gastosData || []).filter(g => g.gasto);
      setGastos(gastosValidos);
      
      setFinanzas({
        ingresos: (ingresosData || []).reduce((acc, i) => acc + (Number(i.monto) || 0), 0),
        egresos: (gastosValidos).reduce((acc, g) => acc + (Number(g.gasto) || 0), 0)
      });
    };
    fetchData();
  }, []);

  // --- 6. FUNCIONES DE LÓGICA ---
  const calcularAvanceTotal = () => {
    return renglones.reduce((acc, r) => acc + (r.completado ? r.ponderacion : 0), 0);
  };

  const handleAgregarIngreso = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('ingresos').insert([formIngreso]);
    if (!error) {
      setFormIngreso({ monto: '', fecha: '', descripcion: '', tipo_ingreso: '', proyecto_id: '', cliente_id: '' });
      // Recarga local o fetch aquí
    }
  };

  const handleAgregarGasto = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('proyectos').update({
      gasto: formGasto.monto,
      tipo_gasto: formGasto.tipo_gasto
    }).eq('id', formGasto.proyecto_id);
    if (!error) setFormGasto({ monto: '', fecha: '', descripcion: '', tipo_gasto: '', proyecto_id: '' });
  };

  // --- VISTAS ---

  if (view === 'login') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#010204] relative overflow-hidden font-sans">
        <div className="absolute inset-0 opacity-40"><img src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070" className="w-full h-full object-cover" alt="obra" /></div>
        <div className={`relative z-10 w-full max-w-[420px] h-[600px] transition-all duration-1000 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* LADO FRONTAL: REGISTRO USUARIO */}
          <div className="absolute inset-0 w-full h-full bg-slate-900/90 backdrop-blur-3xl p-10 rounded-[50px] border border-white/10 [backface-visibility:hidden] flex flex-col items-center justify-center shadow-2xl">
            <div className="w-20 h-20 bg-yellow-900 rounded-[30px] flex items-center justify-center mb-6">
              <HardHat size={40} className="text-yellow-500" />
            </div>
            <h1 className="text-yellow-300 text-3xl font-black tracking-tighter uppercase italic">SOFTCON-MYS</h1>
            <p className="text-yellow-500 text-[9px] font-black tracking-[0.4em] uppercase mb-10 italic">"CONSTRUYENDO TU FUTURO"</p>
            
            <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); setView('main'); }}>
              <input value={formUsuario.nombre} onChange={e=>setFormUsuario(f=>({...f, nombre:e.target.value}))} placeholder="Nombre completo" className="w-full bg-white/80 border border-yellow-900/80 rounded-2xl py-4 px-6 text-xs font-bold text-yellow-900 outline-none" />
              <input value={formUsuario.email} onChange={e=>setFormUsuario(f=>({...f, email:e.target.value}))} placeholder="Email" className="w-full bg-white/80 border border-yellow-900/80 rounded-2xl py-4 px-6 text-xs font-bold text-yellow-900 outline-none" />
              <button type="submit" className="w-full bg-yellow-900 py-4 rounded-2xl text-yellow-100 font-black text-xs uppercase tracking-widest shadow-lg">ACCEDER AL TERMINAL</button>
            </form>
            <button onClick={() => setIsFlipped(true)} className="mt-10 text-[10px] text-yellow-600 font-bold uppercase tracking-widest italic">CONFIGURACIÓN MAESTRA →</button>
          </div>

          {/* LADO POSTERIOR: ADMIN */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-yellow-900/80 via-yellow-700/40 to-black/80 backdrop-blur-2xl rounded-[50px] p-10 border border-yellow-500/30 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center">
             <ShieldCheck size={70} className="text-yellow-500 mb-6" />
             <h2 className="text-yellow-100 font-black text-2xl mb-8 uppercase">CENTRAL ENGINE</h2>
             <input type="password" placeholder="CLAVE MAESTRA" className="w-full bg-black/50 border border-yellow-900/80 rounded-2xl py-4 px-6 text-yellow-100 text-xs mb-4 outline-none" />
             <button onClick={() => setView('main')} className="w-full bg-yellow-500 py-4 rounded-2xl text-black font-black text-[10px] uppercase tracking-widest">VALIDAR</button>
             <button onClick={() => setIsFlipped(false)} className="mt-8 text-yellow-900 text-[10px] uppercase font-bold underline">Volver</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'main') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <nav className="bg-yellow-900 text-yellow-100 p-6 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
          <div><h2 className="font-black text-2xl tracking-tighter italic uppercase">SOFTCON-MYS</h2><p className="text-[9px] text-yellow-400 font-bold uppercase tracking-widest italic">"CONSTRUYENDO TU FUTURO"</p></div>
          <div className="flex gap-4">
            <button onClick={() => setChatOpen(true)} className="bg-white/10 p-3 rounded-2xl hover:bg-blue-600"><MessageSquare size={20}/></button>
            <button onClick={() => setView('login')} className="bg-red-500/10 p-3 rounded-2xl text-red-400"><LogOut size={20}/></button>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-24 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-2">
            {[
              { id: 'dashboard', name: 'Dashboard BI', icon: <Layers/> },
              { id: 'bitacora', name: 'Bitácora Campo', icon: <ClipboardList/> },
              { id: 'inventario', name: 'Inventario', icon: <ShoppingCart/> },
              { id: 'planilla', name: 'Finanzas/Planilla', icon: <Wallet/> }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                {tab.icon} <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">{tab.name}</span>
              </button>
            ))}
          </aside>

          <main className="flex-1 overflow-y-auto p-8 bg-slate-100">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Gráficos de Finanzas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-[35px] shadow-sm">
                    <h4 className="font-black text-blue-600 text-xs uppercase mb-4">Flujo de Ingresos</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={ingresos}>
                        <XAxis dataKey="tipo_ingreso" fontSize={10} />
                        <YAxis fontSize={10}/>
                        <Tooltip />
                        <Bar dataKey="monto" fill="#2563eb" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white p-6 rounded-[35px] shadow-sm">
                    <h4 className="font-black text-red-600 text-xs uppercase mb-4">Distribución de Gastos</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={gastos} dataKey="gasto" nameKey="nombre" cx="50%" cy="50%" outerRadius={80}>
                          {gastos.map((entry, index) => <Cell key={index} fill={['#ef4444', '#f59e0b', '#3b82f6'][index % 3]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
                  <h4 className="font-black text-[10px] uppercase text-slate-400 mb-6">Personal en Proyecto</h4>
                  <table className="w-full text-xs">
                    <thead><tr className="text-left border-b border-slate-100"><th className="pb-4">Nombre</th><th className="pb-4">Email</th><th className="pb-4">ID Proyecto</th></tr></thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id} className="border-b border-slate-50"><td className="py-4 font-bold">{u.nombre}</td><td className="py-4 text-slate-500">{u.email}</td><td className="py-4">{u.proyecto_id}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'bitacora' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-900 p-10 rounded-[45px] text-white">
                  <h3 className="text-2xl font-black italic uppercase">Control de Avance</h3>
                  <div className="mt-6">
                    <div className="flex justify-between text-[10px] font-black mb-2"><span>PROGRESO TOTAL</span><span>{calcularAvanceTotal()}%</span></div>
                    <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${calcularAvanceTotal()}%` }} />
                    </div>
                  </div>
                </div>
                {renglones.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-3xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setRenglones(renglones.map(r => r.id === item.id ? {...r, completado: !r.completado} : r))} className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.completado ? 'bg-green-500 text-white' : 'bg-slate-100'}`}><CheckCircle2/></button>
                      <span className="font-black text-xs uppercase">{item.actividad}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{item.ponderacion}%</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inventario' && (
              <div className="bg-white p-10 rounded-[45px] shadow-sm">
                <h3 className="font-black text-xl uppercase italic mb-8">Maquinaria y Herramientas</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <input placeholder="Herramienta" className="bg-slate-50 p-4 rounded-2xl text-xs font-bold col-span-2" />
                  <input type="number" placeholder="Stock" className="bg-slate-50 p-4 rounded-2xl text-xs font-bold" />
                  <button className="bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase">Registrar</button>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 uppercase tracking-widest"><tr className="border-b"><th className="p-4">Item</th><th className="p-4">Cant.</th><th className="p-4">Estado</th></tr></thead>
                  <tbody><tr className="border-b"><td className="p-4 italic">Vibrador de Concreto</td><td className="p-4">2</td><td className="p-4 text-green-500">Operativo</td></tr></tbody>
                </table>
              </div>
            )}
          </main>
        </div>

        {chatOpen && (
          <div className="fixed bottom-10 right-10 z-[100] w-[350px] h-[500px] bg-white rounded-[40px] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
             <div className="bg-yellow-900 p-6 flex justify-between items-center text-white font-black text-[10px] uppercase italic">Chat SOFTCON-MYS <button onClick={() => setChatOpen(false)}><X/></button></div>
             <div className="flex-1 p-6 bg-slate-50 overflow-y-auto italic text-[11px] text-slate-400">Iniciando comunicación segura...</div>
             <div className="p-4 border-t flex gap-2"><input className="flex-1 bg-slate-100 rounded-2xl p-4 text-[11px]" placeholder="Escribir..." /><button className="bg-blue-600 text-white p-4 rounded-2xl"><Send size={18}/></button></div>
          </div>
        )}
      </div>
    );
  }

  return null;
}