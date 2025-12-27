const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Endpoint para procesar el CSV
app.post('/api/importar', upload.single('archivo'), (req, res) => {
  const resultados = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      const { error } = await supabase.from('presupuesto_detalle').insert(resultados);
      fs.unlinkSync(req.file.path);
      if (error) return res.status(500).json({ error: error.message });
      res.json({ mensaje: "Presupuesto cargado exitosamente" });
    });
});

app.post('/ruta', (req, res) => {
  // Lógica para manejar la ruta '/ruta'
  res.json({ mensaje: "Ruta recibida" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend WM activo en puerto ${PORT}`));