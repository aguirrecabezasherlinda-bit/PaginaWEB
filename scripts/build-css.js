const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const cssDir = path.join(projectRoot, 'css');
const inputFile = path.join(projectRoot, 'src', 'input.css');
const outputFile = path.join(cssDir, 'styles.css');
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');

fs.mkdirSync(cssDir, { recursive: true });

try {
  const command = `npx @tailwindcss/cli -i "${inputFile}" -o "${outputFile}" ${watchMode ? '--watch' : '--minify'}`;
  execSync(command, { stdio: 'inherit', shell: true });
  console.log(`CSS generado correctamente en ${outputFile}`);
} catch (error) {
  console.error('Error al generar Tailwind CSS:', error.message);
  process.exit(1);
}
