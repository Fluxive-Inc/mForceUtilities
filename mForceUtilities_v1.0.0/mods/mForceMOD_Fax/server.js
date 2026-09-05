import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import FormData from 'form-data';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// AUDIT (G1): lock wide-open cors() to same-origin, and fail CLOSED if served from a
// public host (its own UI is same-origin, so this is non-breaking). (SEC-MOD-GATE)
app.use(cors({ origin: false }));
app.use(express.json());
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') || req.path === '/api/health') return next();
  const h = String(req.hostname || '');
  const isLocal = h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
  if (isLocal) return next();
  const key = process.env.MFORCE_API_KEY;
  if (key && req.get('X-MForce-Auth') === key) return next();
  return res.status(401).json({ error: 'unauthorized', code: 'LOCAL_TOOL_PUBLIC' });
});

// File Upload Configuration (Memory Storage for forwarding)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve Static Files (Vite Build)
app.use(express.static(path.join(__dirname, 'dist')));

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', service: 'mForce Fax Station' });
});

// Send Fax Endpoint
app.post('/api/send-fax', upload.single('document'), async (req, res) => {
    try {
        const { faxNumber, coverSheet } = req.body;
        const file = req.file;

        if (!faxNumber || !file) {
            return res.status(400).json({ error: 'Missing fax number or document.' });
        }

        // Check for Credentials
        const API_KEY = process.env.PHAXIO_API_KEY;
        const API_SECRET = process.env.PHAXIO_API_SECRET;

        // If no keys, return simulation mode (but warned)
        if (!API_KEY || !API_SECRET) {
            console.warn('⚠️ No Phaxio Credentials found. Simulating success.');
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.json({
                success: true,
                message: 'SIMULATION: Fax Queued (No API Keys configured)',
                faxId: 'sim_' + Date.now(),
                isSimulation: true
            });
        }

        // Prepare Payload for Phaxio
        const formData = new FormData();
        formData.append('to', faxNumber);
        
        // 1. Generate Cover Sheet HTML
        if (coverSheet && coverSheet.trim().length > 0) {
            const coverHtml = `
            <html>
            <body style="font-family: sans-serif; padding: 40px;">
                <h1 style="border-bottom: 2px solid #333; padding-bottom: 10px;">Fax Transmission</h1>
                <p><strong>To:</strong> ${faxNumber}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <div style="margin-top: 40px; padding: 20px; border: 1px solid #ccc; background: #f9f9f9;">
                    <p style="white-space: pre-wrap;">${coverSheet}</p>
                </div>
                <p style="margin-top: 50px; font-size: 12px; color: #666;">Sent via mForce Fax Station</p>
            </body>
            </html>
            `;
            // Add cover sheet as the FIRST file
            formData.append('file[]', Buffer.from(coverHtml), { 
                filename: 'cover_sheet.html', 
                contentType: 'text/html' 
            });
        }

        // 2. Add Main Document
        formData.append('file[]', file.buffer, { 
            filename: file.originalname,
            contentType: file.mimetype
        });

        // Authenticate
        formData.append('api_key', API_KEY);
        formData.append('api_secret', API_SECRET);

        console.log(`📠 Sending fax to ${faxNumber} (with cover sheet)...`);

        const response = await axios.post('https://api.phaxio.com/v2.1/faxes', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        if (response.data && response.data.success) {
            console.log('✅ Fax sent successfully:', response.data.data.id);
            res.json({
                success: true,
                message: 'Fax Dispatched successfully',
                faxId: response.data.data.id,
                details: response.data.data
            });
        } else {
            throw new Error(response.data.message || 'Unknown provider error');
        }

    } catch (error) {
        console.error('❌ Fax Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

// Catch all for SPA (Express 5 compatible)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 mForce Fax Server running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
});
