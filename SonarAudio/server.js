require('dd-trace').init();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');
const cheerio = require('cheerio');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');
// Import du générateur de template frontend
const { generateFrontendTemplate } = require('./frontend_generator');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = 3000;
const API_KEY = "AIzaSyCjbmNsPZagNAHuKEaL6sy1I6KPCdRZxfw"; 

const LIVE_STREAMS = [
    { name: "NRJ_NC", url: "https://testradio01.ice.infomaniak.ch/testradio01-192.mp3" },
    { name: "RRB", url: "https://webradio.lagoon.nc/rrb" }
];

const DEPOT_DIR = './depot_audio';
const PROCESSED_DIR = './depot_audio/processed';
const RECORDINGS_DIR = './recordings';

if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR);
if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });

function getAIInstance() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

async function analyserAudio(filePath) {
    const fileName = path.basename(filePath);
    try {
        const model = getAIInstance();
        const audioBuffer = fs.readFileSync(filePath);
        const audioBase64 = audioBuffer.toString('base64');

        console.log(`[🤖 Gemini] Analyse en cours : ${fileName}...`);

        const result = await model.generateContent([
            { inlineData: { mimeType: "audio/mp3", data: audioBase64 } },
            { text: "Analyse le pluralisme politique de cet extrait radio calédonien. Liste les thèmes et les personnalités. RÉPONDS OBLIGATOIREMENT EN FRANÇAIS." },
        ]);

        const analyse = result.response.text();
        console.log(`\n--- RÉSULTAT ---\n${analyse}\n----------------\n`);

        const dataPath = './dashboard_data.json';
        let dashboardData = [];
        if (fs.existsSync(dataPath)) {
            const content = fs.readFileSync(dataPath, 'utf8');
            dashboardData = content ? JSON.parse(content) : [];
        }
        dashboardData.push({ timestamp: new Date().toISOString(), source: fileName, analyse: analyse });
        fs.writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2));

        // 🆕 Génération automatique du template frontend
        try {
            generateFrontendTemplate(fileName, analyse, 600); // 600s par défaut pour audio
            console.log("📋 Template frontend mis à jour automatiquement !");
        } catch (templateError) {
            console.error("⚠️ Erreur génération template:", templateError.message);
        }

        return analyse;
    } catch (error) {
        console.error(`❌ Erreur Gemini sur ${fileName}:`, error.message);
        return null;
    }
}

function captureRadio(radio, duration = 600) {
    const fileName = `${radio.name}_${Date.now()}.mp3`;
    const outputPath = path.join(RECORDINGS_DIR, fileName);
    console.log(`[DIRECT] 🎙️ Capture en cours : ${radio.name}`);
    const cmd = `ffmpeg -i ${radio.url} -t ${duration} -acodec copy "${outputPath}"`;
    
    exec(cmd, async (err) => {
        if (err) console.error(`❌ Erreur capture ${radio.name}:`, err);
        else {
            console.log(`✅ Terminé : ${fileName}`);
            await analyserAudio(outputPath);
        }
    });
}

cron.schedule('30,40 17 * * *', () => {
    console.log("🚀 Lancement des enregistrements programmés...");
    LIVE_STREAMS.forEach(radio => captureRadio(radio));
});

const watcher = chokidar.watch(DEPOT_DIR, { 
    ignored: /(^|[\/\\])\../, 
    persistent: true, 
    depth: 0,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
});

watcher.on('add', async (filePath) => {
    if (path.extname(filePath).toLowerCase() === '.mp3') {
        const fileName = path.basename(filePath);
        console.log(`[MANUEL] 📂 Fichier détecté : ${fileName}`);
        await analyserAudio(filePath);
        fs.rename(filePath, path.join(PROCESSED_DIR, fileName), (err) => {
            if (!err) console.log(`📦 Déplacé vers /processed`);
        });
    }
});

// Servir les fichiers statiques du dossier SonarProject
app.use(express.static('SonarProject'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'SonarProject', 'index.html'));
});

app.post('/analyser', async (req, res) => {
    try {
        const url = req.body.url;
        let texte = "";
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const transcript = await YoutubeTranscript.fetchTranscript(url);
            texte = transcript.map(t => t.text).join(' ');
        } else {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            texte = $('p').text();
        }
        const model = getAIInstance();
        const result = await model.generateContent(`Analyse le pluralisme politique de ce contenu. RÉPONDS OBLIGATOIREMENT EN FRANÇAIS : ${texte.substring(0, 20000)}`);
        res.send(`<body style="font-family:sans-serif; background:#0e1117; color:white; padding:20px;">
            <div style="background:#1a1c23; padding:20px; border-radius:10px; border-left: 5px solid #00d4ff;">${result.response.text().replace(/\n/g, '<br>')}</div>
            <br><a href="/" style="color:#00d4ff;">← Retour</a></body>`);
    } catch (e) { res.status(500).send("Erreur : " + e.message); }
});

// API pour le dashboard
app.post('/api/trigger-scan', (req, res) => {
    console.log("🚀 Scan manuel déclenché...");
    LIVE_STREAMS.forEach(radio => captureRadio(radio, 30)); // 30 secondes pour test
    res.json({ message: "Scan lancé avec succès !" });
});

app.get('/api/data', (req, res) => {
    const dataPath = './dashboard_data.json';
    if (fs.existsSync(dataPath)) {
        const content = fs.readFileSync(dataPath, 'utf8');
        const data = content ? JSON.parse(content) : [];
        res.json(data);
    } else {
        res.json([]);
    }
});

app.listen(PORT, () => console.log(`🛰️ SONAR actif sur http://localhost:${PORT}`));