# picme — Photobooth Studio

Retro film photobooth. Deploy to Vercel, connect a printer locally.

---

## 🗂 Project Structure

```
picme/
├── public/
│   └── index.html        ← Full app (HTML + CSS + JS)
├── api/
│   ├── print.js          ← Serverless print endpoint (CUPS / lp)
│   └── printers.js       ← Lists available printers
├── vercel.json           ← Vercel routing config
├── package.json
└── README.md
```

---

## 🚀 Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Clone / unzip this folder, then:
```bash
cd picme
vercel login
vercel --prod
```

That's it — your app is live at `https://picme-xxxx.vercel.app`

---

## 🖨️ Printer Setup

### On Raspberry Pi or any Linux machine with a connected printer:

The print API uses the system's `lp` command (CUPS).

#### 1. Install CUPS
```bash
sudo apt update
sudo apt install cups -y
sudo usermod -aG lpadmin $USER
```

#### 2. Add your printer (Canon Selphy example via USB)
```bash
sudo lpadmin -p Selphy -E -v usb://Canon/SELPHY%20CP1500 -m everywhere
sudo lpoptions -d Selphy   # set as default
```

#### 3. Test print
```bash
lp -d Selphy /path/to/test.png
```

#### 4. Run locally with Vercel Dev
```bash
npm install
vercel dev
# → opens on http://localhost:3000
```

This runs both the frontend AND the API endpoints locally,
so the printer detection and printing will work via CUPS.

---

## 🌐 Cloud vs Local mode

| Mode | When | Print behavior |
|------|------|----------------|
| **Local** (Pi/Mac/PC) | Running `vercel dev` locally | Sends to CUPS printer via `lp` |
| **Cloud** (Vercel) | Deployed on vercel.app | Falls back to browser print dialog |

**Why?** Vercel's cloud servers don't have a physical printer attached.
To print physically, run `vercel dev` on the Pi that has the printer connected.

---

## 📷 Features

- Live webcam with real-time filters (Natural, Noir, Fade, Warm, Cool, Matte, Vivid)
- 10 photos per session with 5-second countdown
- User picks which photos go on the strip (1×1 → 5×1 layouts)
- Save strip as PNG download
- Print via CUPS (local) or browser dialog (cloud)
- Gallery of saved strips
- Film grain + vignette + light leak effects
- Space bar shortcut for shutter

---

## 🎨 Tech Stack

- Pure HTML / CSS / JS — zero dependencies on the frontend
- Vercel Serverless Functions (Node.js) for print API
- CUPS (`lp` command) for physical printing
- Canvas API for filters and strip rendering
- MediaDevices API for webcam access

---

## 💡 Tips

- **Best camera:** Logitech C920S or Pi Camera Module v3
- **Best printer:** Canon Selphy CP1500 (USB or WiFi via CUPS)
- **Kiosk mode on Pi:** `chromium-browser --kiosk http://localhost:3000`
- **HTTPS required** for camera access on deployed URL (Vercel handles this automatically)
