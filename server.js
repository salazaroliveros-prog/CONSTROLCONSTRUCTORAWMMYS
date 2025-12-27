const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuración del correo (Usa Gmail o Outlook)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función que envía el aviso
const enviarCorreoAlerta = (mensaje) => {
  const mailOptions = {
    from: 'Cerebro WM <alertas@tuconstructora.com>',
    to: 'director@tuconstructora.com',
    subject: '⚠️ ALERTA DE SUMINISTROS WM',
    text: mensaje
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log("Error envío:", error);
    else console.log("Alerta enviada: " + info.response);
  });
};

// Ruta para registrar entrega de materiales
app.post('/registrar-entrega', express.json(), async (req, res) => {
  const { sku, cantidad, proyectoId } = req.body;
  if (!sku || !cantidad || !proyectoId) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }
  try {
    const { error } = await supabase.from('registros_compras').insert({
      codigo_sku: sku,
      cantidad_ingresada: Number(cantidad),
      proyecto_id: proyectoId
    });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ mensaje: 'Entrega registrada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// RUTA PARA PROCESAR PRESUPUESTOS CSV
app.post('/importar-presupuesto', upload.single('archivo'), (req, res) => {
  const resultados = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      try {
      const { error } = await supabase.from('presupuesto_detalle').insert(resultados);
      if (error) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json(error);
      }
      // Notificar éxito al Admin (Supabase y Correo)
      const mensaje = `Nuevo presupuesto cargado: ${resultados.length} partidas procesadas.`;
      await supabase.from('notificaciones').insert({
        mensaje,
        tipo: 'exito'
      });
      enviarCorreoAlerta(mensaje);
      fs.unlinkSync(req.file.path); // Borrar archivo temporal
      res.json({ mensaje: "Presupuesto desglosado correctamente" });
      } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error procesando el archivo CSV.' });
      }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cerebro WM corriendo en puerto ${PORT}`));