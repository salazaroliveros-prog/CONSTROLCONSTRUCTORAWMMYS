import React, { useRef } from 'react';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ImportarProyectosCSV({ onImport }) {
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const proyectos = results.data.filter(row => row.nombre_proyecto);
        for (const proyecto of proyectos) {
          // Crea la tabla si no existe (solo la primera vez)
          await supabase.rpc('crear_tabla_proyectos_si_no_existe');
          // Inserta el proyecto
          await supabase.from('proyectos').insert([
            {
              nombre: proyecto.nombre_proyecto,
              cliente: proyecto.cliente,
              monto: proyecto.monto,
              fecha_registro: proyecto.fecha_registro,
              materiales: proyecto.materiales,
              subcontratos: proyecto.subcontratos,
              pagos_cliente: proyecto.pagos_cliente,
              fecha_finalizacion: proyecto.fecha_finalizacion,
              utilidad: proyecto.utilidad
            }
          ]);
        }
        if (onImport) onImport(proyectos);
        alert('Importación completada.');
      },
      error: () => alert('Error al leer el archivo CSV')
    });
  };

  return (
    <div className="mb-6">
      <label className="block text-xs font-bold mb-2">Importar Proyectos (CSV):</label>
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-xs px-4 py-3 rounded-xl bg-orange-400 text-white font-black cursor-pointer hover:bg-orange-500 transition-all" />
    </div>
  );
}
