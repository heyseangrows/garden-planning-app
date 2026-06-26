import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const result = execSync('grep -rl EXPAND-ME src/data/vegetables/ --include="*.ts"', { encoding: 'utf-8' });
const files = result.trim().split('\n').filter(Boolean);

let total = 0;
for (const f of files) {
  let content = readFileSync(f, 'utf-8');
  const count = (content.match(/EXPAND-ME/g) || []).length;
  // Remove EXPAND-ME markers and any following text up to a period or end of string
  content = content.replace(/EXPAND-ME:\s*[^.]*\./g, '');
  content = content.replace(/EXPAND-ME[^'",]*/g, '');
  // Clean up double spaces and trailing spaces before closing quotes
  content = content.replace(/  +/g, ' ');
  content = content.replace(/ \.'/g, ".'");
  writeFileSync(f, content);
  total += count;
}
console.log(`Cleaned up ${total} remaining EXPAND-ME markers in ${files.length} files`);
