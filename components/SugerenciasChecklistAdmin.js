import React, { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);


export default function SugerenciasChecklistAdmin() {
  const [sugerencias, setSugerencias] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proyectoSel, setProyectoSel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marcando, setMarcando] = useState(null);

  // Cargar proyectos
  useEffect(() => {
    async function fetchProyectos() {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre');
      if (!error) setProyectos(data || []);
    }
    fetchProyectos();
  }, []);

  // Cargar sugerencias filtradas
  useEffect(() => {
    async function fetchSugerencias() {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('checklist_sugerencias')
        .select('id, sugerencia, fecha, leida, usuario_id, proyecto_id, usuarios(nombre)')
        .order('fecha', { ascending: false });
      if (proyectoSel) query = query.eq('proyecto_id', proyectoSel);
      const { data, error } = await query;
      if (error) setError(error.message);
      else setSugerencias(data || []);
      setLoading(false);
    }
    fetchSugerencias();
  }, [proyectoSel]);

  const marcarLeida = async (id) => {
    setMarcando(id);
    const { error } = await supabase
      .from('checklist_sugerencias')
      .update({ leida: true })
      .eq('id', id);
    if (!error) setSugerencias(sugs => sugs.map(s => s.id === id ? { ...s, leida: true } : s));
    setMarcando(null);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mt-8">
      <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2"><AlertTriangle className="text-yellow-500"/> Sugerencias de Supervisores</h2>
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-700 mb-1">Filtrar por proyecto:</label>
        <select
          className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-700"
          value={proyectoSel}
          onChange={e => setProyectoSel(e.target.value)}
        >
          <option value="">-- Todos los proyectos --</option>
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre || p.id}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin"/> Cargando sugerencias...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : sugerencias.length === 0 ? (
        <div className="text-slate-400">No hay sugerencias registradas.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sugerencias.map(s => (
            <li key={s.id} className={`py-4 flex flex-col md:flex-row md:items-center md:justify-between ${s.leida ? 'opacity-60' : ''}`}>
              <div>
                <p className="text-slate-700 text-sm font-bold mb-1">{s.sugerencia}</p>
                <p className="text-[10px] text-slate-400">{new Date(s.fecha).toLocaleString()} | Proyecto: {s.proyecto_id} | Usuario: {s.usuarios?.nombre || s.usuario_id}</p>
              </div>
              <div className="mt-2 md:mt-0 flex items-center gap-2">
                {s.leida ? (
                  <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={16}/> Leída</span>
                ) : (
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-lg flex items-center gap-2 disabled:opacity-60"
                    onClick={() => marcarLeida(s.id)}
                    disabled={marcando === s.id}
                  >
                    {marcando === s.id ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={16}/>} Marcar como leída
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
