// api/printers.js
// Returns list of available CUPS printers on the host machine

const { execSync } = require('child_process');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // lpstat -a lists all accepting printers
    const output = execSync('lpstat -a 2>/dev/null').toString();
    const printers = output
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split(' ')[0].trim())
      .filter(Boolean);

    // Get default
    let defaultPrinter = null;
    try {
      const def = execSync('lpstat -d 2>/dev/null').toString();
      if (def.includes(':')) defaultPrinter = def.split(':')[1].trim();
    } catch (_) {}

    return res.status(200).json({ printers, defaultPrinter });
  } catch (err) {
    // On Vercel cloud (no CUPS), return empty — print button will use browser print
    return res.status(200).json({ printers: [], defaultPrinter: null, cloudMode: true });
  }
}
