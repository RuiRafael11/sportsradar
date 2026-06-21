const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checkedExtensions = new Set(['.js', '.json']);
const forbiddenPatterns = [
  { pattern: /192\.168\./, label: 'hardcoded LAN IP' },
  { pattern: /pk_test_[A-Za-z0-9]{20,}/, label: 'committed Stripe publishable key' },
  { pattern: /sk_test_[A-Za-z0-9]{20,}/, label: 'committed Stripe secret key' },
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', '.expo', 'android'].includes(entry.name)) return [];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!checkedExtensions.has(path.extname(entry.name))) return [];
    return [fullPath];
  });
}

const failures = [];

for (const file of walk(root)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(content)) {
      failures.push(`${path.relative(root, file)} contains ${label}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Mobile config check passed.');
