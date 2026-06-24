const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
    if (match) {
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function run() {
  console.log("=== WEDDING INFO ===");
  const { data: info, error: infoErr } = await supabase.from('wedding_info').select('*');
  if (infoErr) console.error(infoErr);
  else console.log(JSON.stringify(info, null, 2));

  console.log("\n=== BRIDE GROOM ===");
  const { data: bg, error: bgErr } = await supabase.from('bride_groom').select('*');
  if (bgErr) console.error(bgErr);
  else console.log(JSON.stringify(bg, null, 2));

  console.log("\n=== FAMILIES ===");
  const { data: fam, error: famErr } = await supabase.from('families').select('*');
  if (famErr) console.error(famErr);
  else console.log(JSON.stringify(fam, null, 2));
}

run();
