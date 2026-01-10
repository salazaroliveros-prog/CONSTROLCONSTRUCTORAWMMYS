

import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function CheckListDeControl({ proyecto_id, usuario_id }) {
  const [actividadesProyecto, setActividadesProyecto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sugerencia, setSugerencia] = useState("");
  const [sugGuardando, setSugGuardando] = useState(false);
  const [sugGuardada, setSugGuardada] = useState(false);

  // Cargar checklist desde Supabase
  useEffect(() => {
    async function fetchChecklist() {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('checklist_control')
        .select('*')
        .order('fase', { ascending: true })
        .order('tarea', { ascending: true });
      if (proyecto_id) query = query.eq('proyecto_id', proyecto_id);
      if (usuario_id) query = query.eq('usuario_id', usuario_id);
      const { data, error } = await query;
      if (error) setError(error.message);
      else setActividadesProyecto(data || []);
      setLoading(false);
    }
    fetchChecklist();
  }, [proyecto_id, usuario_id]);

  // Calcular avance total
  const calcularAvanceTotal = () => {
    return actividadesProyecto
      .filter(a => a.check)
      .reduce((sum, current) => sum + Number(current.ponderacion || current.pond || 0), 0)
      .toFixed(2);
  };

  // Guardar sugerencia en tabla checklist_sugerencias
  const guardarSugerencia = async () => {
    setSugGuardando(true);
    setSugGuardada(false);
    const { error } = await supabase
      .from('checklist_sugerencias')
      .insert({
        proyecto_id,
        usuario_id,
        sugerencia,
        fecha: new Date().toISOString()
      });
    setSugGuardando(false);
    setSugGuardada(!error);
    if (error) setError(error.message);
    else setSugerencia("");
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
      <div className="p-8 bg-slate-900 flex justify-between items-end">
        <div>
          <h3 className="text-yellow-500 font-black text-2xl italic">CHECK-LIST DE CONTROL</h3>
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Supervisor: Control de Avance Crítico</p>
        </div>
        <div className="text-right">
          <p className="text-yellow-500 text-4xl font-black italic">{calcularAvanceTotal()}%</p>
          <p className="text-white/40 text-[9px] font-bold uppercase">Avance Real Consolidado</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Cargando checklist...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">Error: {error}</div>
      ) : actividadesProyecto.length === 0 ? (
        <div className="p-8 text-center text-slate-400">Checklist aún no generado para este proyecto.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                <th className="p-5">Status</th>
                <th className="p-5">Fase de Obra</th>
                <th className="p-5">Actividad Desglosada</th>
                <th className="p-5 text-center">Ponderación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {actividadesProyecto.map(act => (
                <tr key={act.id} className={`hover:bg-yellow-50/30 transition-colors ${act.check ? 'bg-green-50/20' : ''}`}>
                  <td className="p-5 text-center">
                    <input
                      type="checkbox"
                      checked={!!act.check}
                      readOnly
                      className="w-6 h-6 rounded-lg border-2 border-slate-300 text-yellow-500 cursor-not-allowed bg-slate-100"
                      tabIndex={-1}
                    />
                  </td>
                  <td className="p-5 font-black text-[10px] text-slate-400 italic">{act.fase}</td>
                  <td className="p-5 font-bold text-slate-700 text-xs">{act.tarea}</td>
                  <td className="p-5 text-center font-black text-slate-900 text-xs">{act.ponderacion || act.pond}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campo de sugerencias */}
      <div className="p-8 border-t border-slate-100 bg-slate-50">
        <h4 className="font-black text-xs text-slate-700 mb-2 uppercase">Sugerencias para el administrador</h4>
        <textarea
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-700 focus:ring-2 focus:ring-yellow-400"
          rows={3}
          placeholder="Escribe aquí sugerencias o cambios detectados en obra..."
          value={sugerencia}
          onChange={e => setSugerencia(e.target.value)}
          disabled={sugGuardando}
        />
        <button
          className="mt-2 bg-yellow-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg disabled:opacity-60"
          onClick={guardarSugerencia}
          disabled={sugGuardando || !sugerencia.trim()}
        >
          {sugGuardando ? 'Enviando...' : 'Enviar sugerencia'}
        </button>
        {sugGuardada && <span className="ml-4 text-green-600 text-xs font-bold">¡Sugerencia enviada!</span>}
      </div>
    </div>
  );
}
