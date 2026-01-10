// Archivo temporal para probar conexión a Supabase (CommonJS)
// Puedes eliminar este archivo después de la prueba

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tablas = ['usuarios', 'alertas_sistema'];

async function testTablas() {
  for (const tabla of tablas) {
    try {
      const { data, error } = await supabase.from(tabla).select('*').limit(1);
      if (error) {
        console.error(`Tabla '${tabla}':`, error.message);
      } else {
        console.log(`Tabla '${tabla}': OK, ejemplo:`, data);
      }
    } catch (e) {
      console.error(`Tabla '${tabla}':`, e);
    }
  }
}

testTablas();
