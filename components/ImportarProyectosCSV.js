
import React, { useRef } from 'react';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Definir los campos válidos para cada tabla
const camposClientes = ['cliente'];
const camposProyectos = ['nombre_proyecto', 'costo_proyecto', 'fecha_iniciacion', 'cliente'];
const camposMateriales = ['materiales_comprados', 'cantidad', 'costo_mat', 'proveedor', 'fecha_compra', 'nombre_proyecto'];
const camposSubcontratos = ['subcontratos', 'nombre_proyecto'];
const camposPagos = ['pagos_cliente', 'fecha_pago', 'nombre_proyecto'];

export default function ImportarProyectosCSV({ onImport }) {
  const fileInputRef = useRef();

  // Utilidad: filtra un objeto dejando solo las claves válidas
  const filtrarCampos = (obj, camposValidos) => {
    const limpio = {};
    for (const key of camposValidos) {
      if (obj[key] !== undefined && obj[key] !== "") limpio[key] = obj[key];
    }
    return limpio;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        for (const row of rows) {
          // CLIENTES
          const clienteData = filtrarCampos(row, camposClientes);
          if (clienteData.cliente) {
            await supabase.from('clientes').upsert([clienteData], { onConflict: ['cliente'] });
          }

          // PROYECTOS
          const proyectoData = filtrarCampos(row, camposProyectos);
          if (proyectoData.nombre_proyecto) {
            // Relacionar cliente
            if (clienteData.cliente) proyectoData.cliente = clienteData.cliente;
            await supabase.from('proyectos').upsert([proyectoData], { onConflict: ['nombre_proyecto'] });
          }

          // MATERIALES
          const materialData = filtrarCampos(row, camposMateriales);
          if (materialData.materiales_comprados) {
            materialData.proyecto = row.nombre_proyecto;
            await supabase.from('materiales').insert([materialData]);
          }

          // SUBCONTRATOS
          const subcontratoData = filtrarCampos(row, camposSubcontratos);
          if (subcontratoData.subcontratos) {
            subcontratoData.proyecto = row.nombre_proyecto;
            await supabase.from('subcontratos').insert([subcontratoData]);
          }

          // PAGOS
          const pagoData = filtrarCampos(row, camposPagos);
          if (pagoData.pagos_cliente) {
            pagoData.proyecto = row.nombre_proyecto;
            await supabase.from('pagos').insert([pagoData]);
          }
        }
        if (onImport) onImport(rows);
        alert('Importación completada. Solo se guardaron los campos válidos.');
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
