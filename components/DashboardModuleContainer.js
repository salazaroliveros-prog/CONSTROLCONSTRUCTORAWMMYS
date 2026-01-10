// Patron de integración de módulos para el dashboard principal
// Cada módulo debe ser un componente React independiente y exportado por default
// Ejemplo: import MiModulo from '../components/MiModulo';

import React from 'react';

/**
 * Componente contenedor para módulos del dashboard.
 * Aplica estilos y layout consistentes con el diseño maestro.
 * Cada módulo se inyecta como children y mantiene su propia lógica y UI interna.
 */
export default function DashboardModuleContainer({ title, children, actions }) {
  return (
    <section className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 mb-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <h3 className="font-black text-lg uppercase italic tracking-tighter text-slate-900">{title}</h3>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}

// USO EN EL DASHBOARD PRINCIPAL:
// <DashboardModuleContainer title="Importar Proyectos CSV" actions={<BotonExtra />}> <ImportarProyectosCSV /> </DashboardModuleContainer>
// <DashboardModuleContainer title="Exportar PDF"> <BotonExportarPDF /> </DashboardModuleContainer>
// ...
