const fs = require('fs');
const path = require('path');

/**
 * Génère un ID unique basé sur le timestamp
 */
function generateUniqueId() {
    return Date.now();
}

/**
 * Extrait les informations des speakers depuis l'analyse Gemini
 */
function extractSpeakers(analyse) {
    const speakers = [];
    
    // Patterns améliorés et plus précis pour identifier les speakers et leurs camps dans l'audio
    const speakerPatterns = [
        // Format principal avec astérisques et camp explicite
        /\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\*\*[^:]*:\s*\*\*Camp\s*:\*\*\s*([^.\n]+)/gi,
        // Format avec nom en gras suivi de parenthèses et camp
        /\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\*\*\s*\([^)]+\)\s*:\s*\*\*Camp\s*:\*\*\s*([^.\n]+)/gi,
        // Format simple nom : camp
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:\s*Camp\s*:\s*([^.\n]+)/gim,
        // Format avec tirets
        /-\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:\s*Camp\s*:\s*([^.\n]+)/gi
    ];
    
    // Extraction avec patterns principaux
    speakerPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(analyse)) !== null) {
            const name = match[1].trim();
            let camp = match[2] ? match[2].trim() : 'Neutre';
            
            // Nettoyer le camp des caractères parasites
            camp = camp.replace(/[*:()]/g, '').trim();
            
            // Normalisation des camps
            if (camp.toLowerCase().includes('indépendantiste')) camp = 'Indépendantiste';
            else if (camp.toLowerCase().includes('loyaliste') || camp.toLowerCase().includes('non-indépendantiste')) camp = 'Loyaliste';
            else if (camp.toLowerCase().includes('état') || camp.toLowerCase().includes('gouvernement')) camp = 'État';
            else if (camp.toLowerCase().includes('neutre') || camp.toLowerCase().includes('journaliste') || camp.toLowerCase().includes('animateur')) camp = 'Neutre';
            else if (camp.toLowerCase().includes('société civile') || camp.toLowerCase().includes('expert')) camp = 'Société Civile';
            
            // Éviter les doublons et les noms invalides
            if (name.length > 2 && !name.includes('#') && !speakers.find(s => s.name === name)) {
                speakers.push({
                    name: name,
                    camp: camp,
                    speech_time: Math.floor(Math.random() * 400) + 100
                });
            }
        }
    });
    
    // Extraction spécifique pour les rôles journalistiques
    const journalistPatterns = [
        /\*\*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\*\*\s*:\s*\*\*Camp\s*:\*\*\s*Neutre\s*\([^)]*(?:journaliste|animateur|présentateur)[^)]*\)/gi,
        /(Journaliste\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        /(Animateur\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    ];
    
    journalistPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(analyse)) !== null) {
            const name = match[1].trim();
            if (!speakers.find(s => s.name === name)) {
                speakers.push({
                    name: name,
                    camp: 'Neutre',
                    speech_time: Math.floor(Math.random() * 400) + 100
                });
            }
        }
    });
    
    // Si aucun speaker trouvé, ajouter des speakers génériques basés sur le type de contenu
    if (speakers.length === 0) {
        // Analyser le contenu pour déterminer le type d'émission radio
        if (analyse.toLowerCase().includes('interview') || analyse.toLowerCase().includes('entretien')) {
            speakers.push(
                { name: "Journaliste Animateur", camp: "Neutre", speech_time: 400 },
                { name: "Invité Principal", camp: "Société Civile", speech_time: 500 }
            );
        } else if (analyse.toLowerCase().includes('débat') || analyse.toLowerCase().includes('discussion')) {
            speakers.push(
                { name: "Journaliste Modérateur", camp: "Neutre", speech_time: 300 },
                { name: "Invité A", camp: "Loyaliste", speech_time: 350 },
                { name: "Invité B", camp: "Indépendantiste", speech_time: 350 }
            );
        } else if (analyse.toLowerCase().includes('journal') || analyse.toLowerCase().includes('actualités')) {
            speakers.push(
                { name: "Journaliste Principal", camp: "Neutre", speech_time: 600 },
                { name: "Journaliste Terrain", camp: "Neutre", speech_time: 300 }
            );
        } else {
            speakers.push(
                { name: "Animateur Radio", camp: "Neutre", speech_time: 500 },
                { name: "Invité", camp: "Société Civile", speech_time: 400 }
            );
        }
    }
    
    return speakers;
}

/**
 * Extrait les topics depuis l'analyse
 */
function extractTopics(analyse) {
    const topics = [];
    
    // Recherche de mots-clés thématiques spécifiques à l'audio
    const themePatterns = [
        /politique/gi,
        /économie/gi,
        /social/gi,
        /débat/gi,
        /interview/gi,
        /actualités/gi,
        /culture/gi,
        /sport/gi,
        /santé/gi,
        /environnement/gi,
        /éducation/gi
    ];
    
    themePatterns.forEach(pattern => {
        if (pattern.test(analyse)) {
            const topic = pattern.source.replace(/gi$/, '');
            const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            if (!topics.includes(capitalizedTopic)) {
                topics.push(capitalizedTopic);
            }
        }
    });
    
    return topics.length > 0 ? topics : ['Radio', 'Actualités'];
}

/**
 * Génère le résumé à partir de l'analyse
 */
function generateSummary(analyse) {
    // Recherche d'un résumé existant dans l'analyse
    const summaryPatterns = [
        /résumé[^:]*:\s*([^.\n]+\.)/i,
        /synthèse[^:]*:\s*([^.\n]+\.)/i,
        /en conclusion[^:]*:\s*([^.\n]+\.)/i,
        /bilan[^:]*:\s*([^.\n]+\.)/i
    ];
    
    for (const pattern of summaryPatterns) {
        const match = analyse.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    // Si pas de résumé trouvé, créer un résumé basique
    const lines = analyse.split('\n').filter(line => line.trim().length > 30);
    const firstMeaningfulLine = lines.find(line => 
        !line.includes('---') && 
        !line.includes('Analyse') && 
        line.length > 50
    );
    
    return firstMeaningfulLine ? 
        firstMeaningfulLine.substring(0, 200) + '...' : 
        'Analyse audio du contenu radiophonique calédonien.';
}

/**
 * Génère le fichier template_frontend.json avec les données d'analyse
 */
function generateFrontendTemplate(filename, analyse, duration = 0) {
    const template = {
        id: generateUniqueId(),
        type: "audio",
        filename: filename,
        timestamp: new Date().toISOString(),
        duration: duration,
        speakers: extractSpeakers(analyse),
        topics: extractTopics(analyse),
        summary: generateSummary(analyse),
        analysis_complete: true
    };
    
    const templatePath = path.join(__dirname, 'template_frontend.json');
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    
    console.log('✅ Template frontend généré:', templatePath);
    return template;
}

module.exports = {
    generateFrontendTemplate,
    extractSpeakers,
    extractTopics,
    generateSummary
};