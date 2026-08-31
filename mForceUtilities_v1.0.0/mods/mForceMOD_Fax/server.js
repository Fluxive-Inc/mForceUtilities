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
app.use(cors());
app.use(express.json());

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
