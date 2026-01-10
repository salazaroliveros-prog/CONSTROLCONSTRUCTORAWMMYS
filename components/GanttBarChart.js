import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * GanttBarChart muestra el avance de cada renglón de un proyecto.
 * Props:
 *   renglones: Array de objetos {actividad, ponderacion, completado, proyecto}
 *   proyecto: string (nombre del proyecto a visualizar)
 */
export default function GanttBarChart({ renglones, proyecto }) {
  // Filtrar renglones del proyecto
  const data = renglones.filter(r => r.proyecto === proyecto).map(r => ({
    name: r.actividad,
    avance: r.completado ? 100 : r.ponderacion,
    color: r.completado ? '#22c55e' : '#fbbf24',
  }));

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="font-black text-lg uppercase italic tracking-tighter mb-4 text-slate-900">Avance por Renglón - {proyecto}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
          <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v) => v + '%'} />
          <Bar dataKey="avance" radius={[10, 10, 10, 10]} isAnimationActive fill="#fbbf24">
            {data.map((entry, idx) => (
              <cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
