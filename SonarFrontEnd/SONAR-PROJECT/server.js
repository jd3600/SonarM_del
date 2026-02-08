const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur SONAR Frontend démarré sur http://localhost:${PORT}`);
    console.log(`📊 Dashboard Audio: http://localhost:${PORT}/dashboard-audio.html`);
    console.log(`📺 Dashboard Vidéo: http://localhost:${PORT}/dashboard-video.html`);
    console.log(`📋 Rapports: http://localhost:${PORT}/rapports.html`);
});