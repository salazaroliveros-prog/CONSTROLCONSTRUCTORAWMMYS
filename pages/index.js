  // --- NOTIFICACIONES DE ALERTA ---
  // Simulación: sobrecosto en Proyecto B y retraso en Proyecto A
  const alertas = [];
  // Ejemplo: sobrecosto
  if (gastoProyectoB > presupuestoProyectoB * 0.95) {
    alertas.push({
      tipo: 'financiero',
      mensaje: '¡Alerta! Proyecto B está por superar el presupuesto asignado.'
    });
  }
  // Ejemplo: retraso (renglón no completado con ponderación alta)
  if (renglones.some(r => r.proyecto === 'Proyecto A' && !r.completado && r.ponderacion >= 50)) {
    alertas.push({
      tipo: 'retraso',
      mensaje: '¡Atención! Proyecto A tiene actividades críticas sin completar.'
    });
  }
import GanttBarChart from '../components/GanttBarChart';
import SugerenciasChecklistAdmin from '../components/SugerenciasChecklistAdmin';
import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { 
  HardHat, ShieldCheck, ShoppingCart, Users, 
  MessageSquare, LogOut, ClipboardList, Send, 
  Wallet, CheckCircle2, X, TrendingUp, Activity, Layers, 
  DollarSign, Plus, Trash2, Loader2, Save, FileText, Download, Camera, Image as ImageIcon
} from "lucide-react";
import ImportarProyectosCSV from '../components/ImportarProyectosCSV';
import DashboardModuleContainer from '../components/DashboardModuleContainer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { generarReportePDF } from '../utils/generarReportePDF';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- CONFIGURACIÓN SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function App() {
  // --- ESTADO PARA SUGERENCIAS NO LEÍDAS ---
  const [sugerenciasNoLeidas, setSugerenciasNoLeidas] = useState([]);
  const [usuarioRol, setUsuarioRol] = useState(null);

  // Obtener usuario actual y rol (ajusta según tu auth)
  useEffect(() => {
    async function fetchSugerencias() {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Obtener rol del usuario
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();
      setUsuarioRol(usuarioData?.rol || null);
      // Si es admin, buscar sugerencias no leídas
      if (usuarioData?.rol === 'admin') {
        const { data: sugerencias } = await supabase
          .from('checklist_sugerencias')
          .select('*')
          .eq('leida', false);
        setSugerenciasNoLeidas(sugerencias || []);
      }
    }
    fetchSugerencias();
  }, []);
  // --- ESTADOS ---
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFlipped, setIsFlipped] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanActive, setScanActive] = useState(true);

  // --- ESTADOS DE DATOS ---
  const [renglones, setRenglones] = useState([
    // Proyecto 1: Va a la mitad
    { id: 1, actividad: "Excavación y Terracería - Proyecto A", ponderacion: 50, completado: false, proyecto: "Proyecto A" },
    { id: 2, actividad: "Cimentación - Proyecto A", ponderacion: 20, completado: false, proyecto: "Proyecto A" },
    { id: 3, actividad: "Estructura - Proyecto A", ponderacion: 30, completado: false, proyecto: "Proyecto A" },
    // Proyecto 2: Va al 90%
    { id: 4, actividad: "Obra Gris - Proyecto B", ponderacion: 60, completado: true, proyecto: "Proyecto B" },
    { id: 5, actividad: "Acabados - Proyecto B", ponderacion: 30, completado: true, proyecto: "Proyecto B" },
    { id: 6, actividad: "Instalaciones - Proyecto B", ponderacion: 10, completado: false, proyecto: "Proyecto B" }
  ]);
  const [fotos, setFotos] = useState([
    { id: 1, url: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=400", fecha: "10/01/2026", etiqueta: "Cimentación" },
    { id: 2, url: "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?w=400", fecha: "09/01/2026", etiqueta: "Armado de vigas" }
  ]);
  const [inventario, setInventario] = useState([
    { id: 1, nombre: "Rotomartillo Hilti TE-70", cant: 3, estado: "OPERATIVO", proyecto: "Proyecto A" },
    { id: 2, nombre: "Mezcladora de Concreto", cant: 1, estado: "MANTTO", proyecto: "Proyecto A" },
    { id: 3, nombre: "Andamios Tubulares", cant: 10, estado: "OPERATIVO", proyecto: "Proyecto B" },
    { id: 4, nombre: "Cortadora de Piso", cant: 2, estado: "OPERATIVO", proyecto: "Proyecto B" }
  ]);
  const [personal, setPersonal] = useState([
    { id: 1, nombre: "Juan Pérez", puesto: "Maestro de Obra", pagoDia: 250, proyecto: "Proyecto A" },
    { id: 2, nombre: "Carlos Ruiz", puesto: "Albañil A", pagoDia: 175, proyecto: "Proyecto A" },
    { id: 3, nombre: "Luis Gomez", puesto: "Ayudante", pagoDia: 125, proyecto: "Proyecto B" },
    { id: 4, nombre: "Ana Torres", puesto: "Arquitecta", pagoDia: 300, proyecto: "Proyecto B" }
  ]);
    // --- DATOS FINANCIEROS DE PRUEBA PARA DASHBOARD ---
    const avanceProyectoA = 50; // %
    const avanceProyectoB = 90; // %
    const gastoProyectoA = 120000; // Q
    const gastoProyectoB = 295000; // Q
    const presupuestoProyectoA = 200000; // Q
    const presupuestoProyectoB = 300000; // Q

    // --- FUNCIÓN DE REPORTES PDF ---
    const generarPDF = (tipo) => {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString();

      // Encabezado
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(234, 179, 8);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SOFTCON-MYS-CONSTRU-WM", 15, 20);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('"CONSTRUYENDO TU FUTURO"', 15, 30);
      doc.text(`REPORTE: ${tipo.toUpperCase()} - ${fecha}`, 130, 30);

      if (tipo === 'inventario') {
        const data = inventario.map(i => [i.nombre, i.cant, i.estado]);
        doc.autoTable({ startY: 50, head: [['HERRAMIENTA', 'CANT', 'ESTADO']], body: data, headStyles: {fillColor: [15, 23, 42]} });
      } else if (tipo === 'planilla') {
        const data = personal.map(p => [p.nombre, p.puesto, `Q${p.pagoDia}`, `Q${p.pagoDia * 6}`]);
        doc.autoTable({ startY: 50, head: [['NOMBRE', 'PUESTO', 'PAGO DIA', 'SUBTOTAL SEMANAL']], body: data, headStyles: {fillColor: [15, 23, 42]} });
      } else {
        const data = renglones.map(r => [r.actividad, `${r.ponderacion}%`, r.completado ? 'SI' : 'NO']);
        doc.autoTable({ startY: 50, head: [['ACTIVIDAD', 'POND.', 'COMPLETADO']], body: data, headStyles: {fillColor: [15, 23, 42]} });
      }
      doc.save(`SOFTCON_MYS_${tipo}.pdf`);
    };
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ nombre: '', cant: '', estado: 'OPERATIVO' });

  // --- DATOS GRÁFICO ---
  const dataGrafico = [
    { name: 'Sem 1', v: 4000 },
    { name: 'Sem 2', v: 3000 },
    { name: 'Sem 3', v: 5500 },
    { name: 'Sem 4', v: 4800 },
  ];

  // --- CARGA INICIAL ---
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const { data } = await supabase.from('renglones').select('*');
        if (data && data.length > 0) {
          setRenglones(data);
        } else {
          setRenglones([
            { id: 1, actividad: "Movimiento de Tierras", ponderacion: 10, completado: true },
            { id: 2, actividad: "Cimentación Reforzada", ponderacion: 25, completado: false },
            { id: 3, actividad: "Instalación Eléctrica Base", ponderacion: 15, completado: false }
          ]);
        }
      } catch (e) { console.error(e); }
      setLoadingData(false);
    };
    fetchData();
  }, []);

  // --- LÓGICA INVENTARIO ---
  const agregarItem = () => {
    if(!newItem.nombre || !newItem.cant) return;
    const item = { ...newItem, id: Date.now() };
    setInventario([...inventario, item]);
    setNewItem({ nombre: '', cant: '', estado: 'OPERATIVO' });
    setShowModal(false);
  };

  const eliminarItem = (id) => {
    setInventario(inventario.filter(i => i.id !== id));
  };

  // --- VISTA: LOGIN ---
  if (view === 'login') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#010204] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070" className="w-full h-full object-cover" alt="bg" />
        </div>
        <div className="relative z-10 w-full max-w-[420px]" style={{ perspective: '1500px' }}>
          <div className={`relative transition-all duration-1000 shadow-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
            {/* FRONT */}
            <div className="bg-slate-900/95 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 [backface-visibility:hidden] flex flex-col items-center">
               <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20"><HardHat size={32} /></div>
               <h1 className="text-yellow-500 text-3xl font-black italic tracking-tighter uppercase">SOFTCON-MYS</h1>
               <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase italic mb-8">"CONSTRUYENDO TU FUTURO"</p>
               
               <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); setView('main'); }}>
                  <input required type="text" placeholder="ID OPERADOR" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-yellow-500 transition-all font-bold" />
                  <input required type="password" placeholder="PASSWORD" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-yellow-500 transition-all font-bold" />
                  <button className="w-full bg-yellow-500 hover:bg-yellow-400 py-4 rounded-2xl text-slate-900 font-black text-xs uppercase tracking-widest mt-4 shadow-xl">INGRESAR AL SISTEMA</button>
               </form>
               <button onClick={() => setIsFlipped(true)} className="mt-8 text-[10px] text-white/30 hover:text-yellow-500 font-bold uppercase tracking-widest">Panel Administrativo →</button>
            </div>
            {/* BACK */}
            <div className="absolute inset-0 bg-yellow-600 p-10 rounded-[40px] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center text-center">
               <ShieldCheck size={60} className="text-slate-900 mb-4" />
               <h2 className="font-black text-2xl text-slate-900 uppercase italic">ADMINISTRACIÓN</h2>
               <p className="text-slate-900/70 text-sm font-bold mt-2 mb-8">Acceso a costos y planillas maestras.</p>
               <button onClick={() => setView('main')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase">VALIDAR CREDENCIALES</button>
               <button onClick={() => setIsFlipped(false)} className="mt-4 text-xs font-black underline text-slate-900 uppercase">Volver</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA: MAIN APP ---
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-slate-900">
      {/* HEADER */}
      <nav className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-[100] border-b border-yellow-500/30">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-xl text-slate-900"><HardHat size={20}/></div>
          <div>
            <h2 className="font-black text-lg tracking-tighter italic uppercase leading-none">SOFTCON-MYS</h2>
            <p className="text-[8px] text-yellow-500 font-bold uppercase tracking-[0.2em] italic">"CONSTRUYENDO TU FUTURO"</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setChatOpen(true)} className="p-3 rounded-xl bg-white/5 hover:bg-yellow-500 hover:text-slate-900 transition-all"><MessageSquare size={18}/></button>
          <button onClick={() => setView('login')} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><LogOut size={18}/></button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-20 md:w-64 bg-white border-r flex flex-col p-4 gap-2 shadow-sm">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <Activity size={20}/> },
            { id: 'bitacora', name: 'Bitácora', icon: <ClipboardList size={20}/> },
            { id: 'fotos', name: 'Evidencias', icon: <Camera size={20}/> },
            { id: 'inventario', name: 'Inventario', icon: <ShoppingCart size={20}/> },
            { id: 'planilla', name: 'Planilla', icon: <Wallet size={20}/> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-slate-900 text-yellow-500 shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
              {tab.icon} <span className="hidden md:block text-[10px] font-black uppercase italic tracking-widest">{tab.name}</span>
            </button>
          ))}
        </aside>
       {activeTab === 'fotos' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xl italic uppercase tracking-tighter">Galería de Evidencias M&S</h3>
            <button className="bg-slate-900 text-yellow-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Camera size={16}/> Subir Captura</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {fotos.map(f => (
              <div key={f.id} className="bg-white p-3 rounded-[30px] shadow-sm border border-slate-100 group overflow-hidden">
                <img src={f.url} className="w-full h-40 object-cover rounded-[20px] mb-3 group-hover:scale-105 transition-all" alt="evidencia" />
                <p className="text-[10px] font-black italic text-slate-700 uppercase">{f.etiqueta}</p>
                <p className="text-[8px] font-bold text-slate-400">{f.fecha}</p>
              </div>
            ))}
          </div>
        </div>
       )}

        {/* CONTENIDO */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Notificación de sugerencias para el administrador */}
              {usuarioRol === 'admin' && sugerenciasNoLeidas.length > 0 && (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
                  <AlertTriangle size={20} className="text-yellow-700" />
                  <span className="font-bold">Tienes {sugerenciasNoLeidas.length} sugerencia(s) nueva(s) de supervisores para revisar en el checklist.</span>
                </div>
              )}
              {usuarioRol === 'admin' && (
                <SugerenciasChecklistAdmin />
              )}
              {alertas.length > 0 && (
                <div className="space-y-2">
                  {alertas.map((a, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-xs shadow-lg ${a.tipo === 'financiero' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                      {a.tipo === 'financiero' ? <DollarSign size={18}/> : <AlertTriangle size={18}/>}
                      {a.mensaje}
                    </div>
                  ))}
                </div>
              )}
              <DashboardModuleContainer
                title="Importar Proyectos CSV"
                actions={
                  <button 
                    onClick={() => generarPDF('dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                  >
                    <Download size={14}/> Exportar PDF
                  </button>
                }
              >
                <ImportarProyectosCSV />
              </DashboardModuleContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase italic">Avance Global</p><h3 className="text-3xl font-black italic text-slate-900">74.2%</h3></div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase italic">Caja Semanal</p><h3 className="text-3xl font-black italic text-slate-900">Q 42,800</h3></div>
                <div className="bg-white p-6 rounded-[32px] shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase italic">Equipos Operativos</p><h3 className="text-3xl font-black italic text-slate-900">12/12</h3></div>
              </div>
              {/* Gantt por proyecto */}
              <GanttBarChart renglones={renglones} proyecto="Proyecto A" />
              <GanttBarChart renglones={renglones} proyecto="Proyecto B" />
              <div className="bg-white p-10 rounded-[40px] h-[400px]">
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-6 flex justify-between items-center">Rendimiento Semanal <TrendingUp size={16}/></h3>
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={[{n:'L',v:10},{n:'M',v:15},{n:'M',v:12},{n:'J',v:18},{n:'V',v:25}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="n" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="v" fill="#0f172a" radius={[10, 10, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'bitacora' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl italic uppercase tracking-tighter text-slate-900">Control de Renglones</h3>
                  <button onClick={() => generarPDF('bitacora')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Download size={16}/> Exportar PDF</button>
                </div>
                {renglones.map(r => (
                  <div key={r.id} className={`bg-white p-6 rounded-3xl flex items-center justify-between border-2 transition-all ${r.completado ? 'border-green-500 shadow-green-100 shadow-xl' : 'border-transparent shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setRenglones(renglones.map(it => it.id === r.id ? {...it, completado: !it.completado} : it))} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${r.completado ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-300'}`}><CheckCircle2 size={24}/></button>
                      <div><h4 className="font-black uppercase text-xs italic text-slate-700">{r.actividad}</h4><p className="text-[9px] font-bold text-slate-400">{r.completado ? 'FASE FINALIZADA' : 'FASE EN PROCESO'}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black italic text-slate-900">{r.ponderacion}%</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Nuevo módulo: CheckList de Control detallado */}
              <div className="mt-10">
                <CheckListDeControl />
              </div>
            import CheckListDeControl from '../components/CheckListDeControl';
            </div>
          )}

          {activeTab === 'inventario' && (
            <div className="bg-white rounded-[40px] shadow-sm overflow-hidden animate-in slide-in-from-right-4">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-xl uppercase italic tracking-tighter">Inventario M&S</h3>
                <div className="flex gap-2">
                  <button onClick={() => generarPDF('inventario')} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2"><FileText size={16}/> PDF</button>
                  <button onClick={() => setShowModal(true)} className="bg-slate-900 text-yellow-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Plus size={16}/> Nuevo</button>
                </div>
              </div>
              <div className="p-4">
                <table className="w-full text-left text-[11px] font-bold">
                  <thead><tr className="text-slate-400 uppercase tracking-widest border-b"><th className="p-4 italic">Herramienta</th><th className="p-4 italic">Cant.</th><th className="p-4 italic">Estado</th><th className="p-4"></th></tr></thead>
                  <tbody>
                    {inventario.map(item => (
                      <tr key={item.id} className="border-b border-slate-50 group">
                        <td className="p-4 italic text-slate-700">{item.nombre}</td>
                        <td className="p-4 text-slate-500">{item.cant} UND</td>
                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-[8px] font-black ${item.estado === 'OPERATIVO' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{item.estado}</span></td>
                        <td className="p-4 text-right"><button onClick={() => eliminarItem(item.id)} className="text-red-300 hover:text-red-600"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
       {activeTab === 'planilla' && (
         <div className="animate-in fade-in duration-500">
           <div className="bg-slate-900 rounded-[45px] p-10 text-white shadow-2xl relative overflow-hidden mb-10">
             <div className="relative z-10">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter">Planilla Digital M&S</h3>
               <p className="text-yellow-500 font-bold text-xs tracking-widest mt-2 uppercase">"CONSTRUYENDO TU FUTURO" - Cálculo de Nómina</p>
               <button onClick={() => generarPDF('planilla')} className="mt-8 bg-yellow-500 text-slate-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3"><Download size={18}/> Descargar Planilla Semanal</button>
             </div>
             <Wallet size={200} className="absolute right-[-40px] top-[-40px] text-white opacity-5" />
           </div>
                
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {personal.map(p => (
               <div key={p.id} className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 hover:scale-105 transition-all">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400"><Users size={24}/></div>
                 <h4 className="font-black text-slate-900 uppercase italic text-sm">{p.nombre}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.puesto}</p>
                 <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-end">
                   <div><p className="text-[9px] font-black text-slate-400 uppercase italic">Sueldo Semanal</p><p className="text-xl font-black text-slate-900">Q {p.pagoDia * 6}</p></div>
                   <span className="text-green-500 font-black text-[10px] italic underline">PAGAR</span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

          {activeTab === 'planilla' && (
             <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="w-24 h-24 bg-slate-900 rounded-[35px] flex items-center justify-center mx-auto mb-6 text-yellow-500 shadow-2xl rotate-3"><Wallet size={40}/></div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Módulo de Planillas</h3>
                <p className="text-slate-500 font-medium mt-4 mb-10">Cálculo automático de jornales, horas extras y retenciones M&S. Listo para conexión con Supabase.</p>
                <button className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-yellow-500/10 transition-all">Generar Nómina Semanal</button>
             </div>
          )}
        </main>
      </div>

      {/* MODAL INVENTARIO */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl">
              <h3 className="text-xl font-black italic uppercase mb-6">Nuevo Equipo</h3>
              <div className="space-y-4">
                 <input type="text" placeholder="NOMBRE DEL EQUIPO" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-yellow-500" value={newItem.nombre} onChange={e => setNewItem({...newItem, nombre: e.target.value})} />
                 <input type="number" placeholder="CANTIDAD" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-yellow-500" value={newItem.cant} onChange={e => setNewItem({...newItem, cant: e.target.value})} />
                 <div className="flex gap-4">
                    <button onClick={agregarItem} className="flex-1 bg-slate-900 text-yellow-500 py-4 rounded-2xl font-black text-[10px] uppercase">Guardar</button>
                    <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* CHAT */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-[150] w-[350px] h-[500px] bg-white rounded-[40px] shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
           <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <span className="font-black text-[10px] uppercase italic tracking-widest text-yellow-500">Enlace M&S</span>
              <button onClick={() => setChatOpen(false)}><X size={20}/></button>
           </div>
           <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-4">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm text-[11px] font-bold text-slate-600">Bienvenido al sistema **SOFTCON-MYS**. ¿En qué podemos ayudarle hoy?</div>
           </div>
           <div className="p-4 border-t flex gap-2">
              <input className="flex-1 bg-slate-100 rounded-2xl p-4 text-[11px] font-bold outline-none border-none focus:ring-1 focus:ring-yellow-500" placeholder="Escribir..." />
              <button className="bg-slate-900 text-yellow-500 p-4 rounded-2xl"><Send size={18}/></button>
           </div>
        </div>
      )}
    </div>
  );
}