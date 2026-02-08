const fs = require('fs');
const path = require('path');

/**
 * Script de gestion centralisée des templates frontend
 */

function showStatus() {
    console.log('📊 STATUT DES TEMPLATES FRONTEND\n');
    
    const backends = ['SonarVideo', 'SonarAudio'];
    
    backends.forEach(backend => {
        const templatePath = path.join(__dirname, backend, 'template_frontend.json');
        
        console.log(`🔹 ${backend}:`);
        
        if (fs.existsSync(templatePath)) {
            try {
                const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
                console.log(`   ✅ Template présent`);
                console.log(`   📁 Fichier: ${template.filename}`);
                console.log(`   🆔 ID: ${template.id}`);
                console.log(`   ⏰ Timestamp: ${template.timestamp}`);
                console.log(`   👥 Speakers: ${template.speakers.length}`);
                console.log(`   🏷️ Topics: ${template.topics.join(', ')}`);
            } catch (error) {
                console.log(`   ❌ Template corrompu: ${error.message}`);
            }
        } else {
            console.log(`   ⚠️ Aucun template trouvé`);
        }
        console.log('');
    });
}

function copyAllToFrontend() {
    console.log('📤 COPIE VERS LE FRONTEND\n');
    
    const frontendPath = path.join(__dirname, 'SonarFrontEnd', 'SONAR-PROJECT', 'public', 'resultats_sonar.json');
    const backends = ['SonarVideo', 'SonarAudio'];
    
    // Lire le fichier frontend existant
    let frontendData = [];
    if (fs.existsSync(frontendPath)) {
        try {
            const frontendContent = fs.readFileSync(frontendPath, 'utf8');
            frontendData = JSON.parse(frontendContent);
        } catch (error) {
            console.log('⚠️ Erreur lecture frontend, création d\'un nouveau fichier');
        }
    }
    
    let addedCount = 0;
    
    backends.forEach(backend => {
        const templatePath = path.join(__dirname, backend, 'template_frontend.json');
        
        if (fs.existsSync(templatePath)) {
            try {
                const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
                
                // Vérifier si l'ID existe déjà
                const exists = frontendData.find(item => item.id === template.id);
                
                if (!exists) {
                    frontendData.push(template);
                    addedCount++;
                    console.log(`✅ ${backend}: ${template.filename} ajouté (ID: ${template.id})`);
                } else {
                    console.log(`⚠️ ${backend}: ${template.filename} déjà présent (ID: ${template.id})`);
                }
            } catch (error) {
                console.log(`❌ ${backend}: Erreur lecture template - ${error.message}`);
            }
        } else {
            console.log(`⚠️ ${backend}: Aucun template trouvé`);
        }
    });
    
    if (addedCount > 0) {
        try {
            fs.writeFileSync(frontendPath, JSON.stringify(frontendData, null, 2));
            console.log(`\n🎉 ${addedCount} nouveau(x) élément(s) ajouté(s) au frontend !`);
        } catch (error) {
            console.log(`❌ Erreur écriture frontend: ${error.message}`);
        }
    } else {
        console.log('\n📋 Aucun nouvel élément à ajouter');
    }
}

function resetTemplates() {
    console.log('🔄 RESET DES TEMPLATES\n');
    
    const backends = ['SonarVideo', 'SonarAudio'];
    
    backends.forEach(backend => {
        const templatePath = path.join(__dirname, backend, 'template_frontend.json');
        
        const emptyTemplate = {
            id: null,
            type: backend === 'SonarVideo' ? 'video' : 'audio',
            filename: '',
            timestamp: '',
            duration: 0,
            speakers: [],
            topics: [],
            summary: '',
            analysis_complete: false
        };
        
        try {
            fs.writeFileSync(templatePath, JSON.stringify(emptyTemplate, null, 2));
            console.log(`✅ ${backend}: Template réinitialisé`);
        } catch (error) {
            console.log(`❌ ${backend}: Erreur reset - ${error.message}`);
        }
    });
}

// Interface en ligne de commande
const command = process.argv[2];

switch (command) {
    case 'status':
        showStatus();
        break;
    case 'copy':
        copyAllToFrontend();
        break;
    case 'reset':
        resetTemplates();
        break;
    default:
        console.log(`
🛠️ GESTIONNAIRE DE TEMPLATES FRONTEND

Usage: node manage_templates.js [command]

Commandes disponibles:
  status    Afficher le statut des templates
  copy      Copier tous les templates vers le frontend
  reset     Réinitialiser tous les templates

Exemples:
  node manage_templates.js status
  node manage_templates.js copy
  node manage_templates.js reset
        `);
}

module.exports = {
    showStatus,
    copyAllToFrontend,
    resetTemplates
};