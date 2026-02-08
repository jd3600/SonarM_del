const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des chemins vers tes sous-dossiers
// Cela permet au serveur de lire dans les dossiers Audio et Video même s'il est à la racine
const paths = {
    front: path.join(__dirname, 'SonarFrontEnd', 'SONAR-PROJECT', 'public'),
    audio: path.join(__dirname, 'SonarAudio'),
    video: path.join(__dirname, 'SonarVideo')
};

// 1. Servir le Dashboard Principal (FrontEnd)
app.use(express.static(paths.front));

// 2. Rendre les dossiers Audio et Video accessibles via le serveur (si besoin de lire des logs/json)
app.use('/data-audio', express.static(paths.audio));
app.use('/data-video', express.static(paths.video));

// Route par défaut : Envoie l'index.html du FrontEnd
app.get('/', (req, res) => {
    const indexPath = path.join(paths.front, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Erreur : index.html non trouvé dans SonarFrontEnd/SONAR-PROJECT/public");
    }
});

// Routes spécifiques pour tes dashboards audio/video
app.get('/audio', (req, res) => res.sendFile(path.join(paths.front, 'dashboard-audio.html')));
app.get('/video', (req, res) => res.sendFile(path.join(paths.front, 'dashboard-video.html')));

app.listen(PORT, () => {
    console.log(`
    ███████╗ ██████╗ ███╗   ██╗ █████╗ ██████╗ 
    ██╔════╝██╔═══██╗████╗  ██║██╔══██╗██╔══██╗
    ███████╗██║   ██║██╔██╗ ██║███████║██████╔╝
    ╚════██║██║   ██║██║╚██╗██║██╔══██║██╔══██╗
    ███████║╚██████╔╝██║ ╚████║██║  ██║██║  ██║
    ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝
    `);
    console.log(`🚀 SONAR MODEL LIVE: http://localhost:${PORT}`);
    console.log(`📁 Root Directory: ${__dirname}`);
    console.log(`📡 Monitoring: Ready for Devpost Demo`);
});