// Test básico para detectar errores de renderizado en Next.js
const fs = require('fs');

try {
  // Verifica si el archivo index.js existe y es válido
  const indexPath = './pages/index.js';
  if (!fs.existsSync(indexPath)) {
    throw new Error('El archivo pages/index.js no existe.');
  }
  const code = fs.readFileSync(indexPath, 'utf-8');
  if (!code.includes('export default')) {
    throw new Error('El archivo pages/index.js no exporta un componente por defecto.');
  }
  if (!code.includes('return (')) {
    throw new Error('El componente principal no tiene un return JSX.');
  }
  console.log('pages/index.js parece estar correctamente estructurado.');
} catch (err) {
  console.error('Error de estructura en index.js:', err.message);
  process.exit(1);
}

// Verifica si las variables de entorno de Supabase están presentes
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Faltan variables de entorno de Supabase. Verifica tu archivo .env.local');
  process.exit(1);
}

console.log('Variables de entorno de Supabase presentes.');

// Si todo pasa
console.log('Estructura básica y entorno verificados. Si la página sigue en blanco, revisa errores en consola del navegador y en el log del servidor.');
