// api/print.js
// Vercel serverless function — receives base64 PNG strip and sends to printer
// On the machine running this (Pi or local), the printer must be set up via CUPS.

const { execSync, exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageData, printerName, copies = 1 } = req.body;

    if (!imageData) return res.status(400).json({ error: 'No image data provided' });

    // Strip base64 header if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Write to temp file
    const tmpFile = path.join(os.tmpdir(), `picme-strip-${Date.now()}.png`);
    fs.writeFileSync(tmpFile, buffer);

    // Get available printers
    let printer = printerName;
    if (!printer) {
      try {
        // Try to get the default printer from CUPS
        const defaultPrinter = execSync('lpstat -d 2>/dev/null').toString().trim();
        if (defaultPrinter.includes(':')) {
          printer = defaultPrinter.split(':')[1].trim();
        }
      } catch (e) {
        // fallback — lp will use default
        printer = null;
      }
    }

    // Build lp command
    // -o fit-to-page scales to paper
    // -o media=w288h432 = 4x6 inch in points (288pt x 432pt)
    const printerFlag = printer ? `-d "${printer}"` : '';
    const cmd = `lp ${printerFlag} -n ${copies} -o fit-to-page -o media=w288h432 "${tmpFile}"`;

    exec(cmd, (err, stdout, stderr) => {
      // Clean up temp file
      try { fs.unlinkSync(tmpFile); } catch (_) {}

      if (err) {
        console.error('Print error:', stderr);
        return res.status(500).json({ error: 'Print failed', details: stderr });
      }

      const jobId = stdout.trim();
      return res.status(200).json({ success: true, jobId, message: 'Sent to printer' });
    });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
