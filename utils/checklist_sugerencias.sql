CREATE TABLE checklist_sugerencias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id uuid REFERENCES proyectos(id),
    usuario_id uuid REFERENCES usuarios(id),
    sugerencia text NOT NULL,
    fecha timestamptz DEFAULT now(),
    leida boolean NOT NULL DEFAULT false
);

-- Política: Solo el admin puede ver todas, el supervisor solo las suyas
CREATE POLICY "admin_ve_todas_sugerencias"
ON checklist_sugerencias
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
) OR usuario_id = auth.uid());

-- Política: Solo el admin puede marcar como leída
CREATE POLICY "admin_actualiza_leida"
ON checklist_sugerencias
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM usuarios WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
));
