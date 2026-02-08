require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
// On utilise le nouveau SDK pour la série 3
const { GoogleGenAI } = require("@google/genai");
// Import du générateur de template frontend
const { generateFrontendTemplate } = require('./frontend_generator');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Initialisation de l'API Gemini 3
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const UPLOADS_DIR = path.join(__dirname, 'uploads_video');
const RESULTS_FILE = path.join(__dirname, 'resultats_sonar.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// 2. Fonction d'analyse optimisée pour Gemini 3.0 Flash
async function analyserAvecGemini3(videoPath) {
    console.log(`\n🚀 Analyse Gemini 3.0 Flash lancée pour : ${path.basename(videoPath)}`);
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Utilisation du modèle série 3
            contents: [
                {
                    parts: [
                        { text: "Tu es l'expert SONAR. Analyse ce JT de Nouvelle-Calédonie : identifie les politiciens présents, leur camp politique, et résume les temps forts." },
                        {
                            inlineData: {
                                mimeType: "video/mp4",
                                data: fs.readFileSync(videoPath).toString("base64"),
                            },
                            // Paramètre Gemini 3 : Haute résolution pour ne rater aucun détail
                            mediaResolution: { level: "media_resolution_high" }
                        }
                    ]
                }
            ],
            config: {
                // Paramètre Gemini 3 : On règle la réflexion sur 'medium' 
                // pour avoir un bon équilibre vitesse/intelligence
                thinkingConfig: {
                    thinkingLevel: "medium", 
                }
            },
        });

        return response.text;
    } catch (error) {
        console.error("❌ Erreur Gemini 3.0 :", error.message);
        throw error;
    }
}

// 3. Surveillance du dossier (Watcher)
const watcher = chokidar.watch(UPLOADS_DIR, { 
    persistent: true, 
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 3000, pollInterval: 100 }
});

watcher.on('add', async (filePath) => {
    if (filePath.endsWith('.mp4')) {
        console.log(`✨ Nouveau fichier prêt : ${path.basename(filePath)}`);
        
        try {
            const analyse = await analyserAvecGemini3(filePath);
            
            const result = {
                horodatage: new Date().toLocaleString('fr-FR', { timeZone: 'Pacific/Noumea' }),
                fichier: path.basename(filePath),
                analyse: analyse
            };

            fs.appendFileSync(RESULTS_FILE, JSON.stringify(result, null, 2) + ",\n");
            
            // 🆕 Génération automatique du template frontend
            try {
                generateFrontendTemplate(path.basename(filePath), analyse, 0);
                console.log("📋 Template frontend mis à jour automatiquement !");
            } catch (templateError) {
                console.error("⚠️ Erreur génération template:", templateError.message);
            }
            
            console.log("✅ Analyse terminée avec succès !");
            console.log("------------------------------------------");
            console.log(analyse);
            console.log("------------------------------------------");

        } catch (err) {
            console.error("Erreur automate:", err.message);
        }
    }
});

app.listen(PORT, () => {
    console.log(`----------------------------------------------------`);
    console.log(`📡 SONAR VIDEO - ENGINE: GEMINI 3.0 FLASH`);
    console.log(`📁 Dossier surveillé : ${UPLOADS_DIR}`);
    console.log(`----------------------------------------------------`);
});