const fs = require('fs');
const path = require('path');

/**
 * Script pour copier le contenu du template_frontend.json vers le frontend
 */
function copyToFrontend() {
    const templatePath = path.join(__dirname, 'template_frontend.json');
    const frontendPath = path.join(__dirname, '..', 'SonarFrontEnd', 'SONAR-PROJECT', 'public', 'resultats_sonar.json');
    
    try {
        // Lire le template
        if (!fs.existsSync(templatePath)) {
            console.error('❌ Aucun template_frontend.json trouvé');
            return;
        }
        
        const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
        
        // Lire le fichier frontend existant
        let frontendData = [];
        if (fs.existsSync(frontendPath)) {
            const frontendContent = fs.readFileSync(frontendPath, 'utf8');
            frontendData = JSON.parse(frontendContent);
        }
        
        // Vérifier si l'ID existe déjà
        const exists = frontendData.find(item => item.id === templateData.id);
        if (exists) {
            console.log('⚠️ Élément déjà présent dans le frontend (ID: ' + templateData.id + ')');
            return;
        }
        
        // Ajouter la nouvelle entrée
        frontendData.push(templateData);
        
        // Sauvegarder
        fs.writeFileSync(frontendPath, JSON.stringify(frontendData, null, 2));
        
        console.log('✅ Données copiées vers le frontend !');
        console.log(`📁 Fichier: ${frontendPath}`);
        console.log(`🆔 ID ajouté: ${templateData.id}`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la copie:', error.message);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    copyToFrontend();
}

module.exports = { copyToFrontend };