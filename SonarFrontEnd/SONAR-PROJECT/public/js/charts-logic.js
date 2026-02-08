// Logique commune pour tous les graphiques SONAR

class SonarChartsLogic {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8',
            secondary: '#6c757d'
        };
    }

    // Récupérer les données depuis l'API
    async fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération des données de ${endpoint}:`, error);
            throw error;
        }
    }

    // Créer un graphique en secteurs (doughnut/pie)
    createPieChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas avec l'ID ${canvasId} non trouvé`);
            return null;
        }

        const defaultOptions = {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.data || [],
                    backgroundColor: data.colors || [
                        this.colors.primary,
                        this.colors.success,
                        this.colors.warning,
                        this.colors.danger,
                        this.colors.info,
                        this.colors.secondary
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                ...options.chartOptions
            }
        };

        this.charts[canvasId] = new Chart(ctx, defaultOptions);
        return this.charts[canvasId];
    }

    // Créer un graphique en barres
    createBarChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas avec l'ID ${canvasId} non trouvé`);
            return null;
        }

        const defaultOptions = {
            type: options.horizontal ? 'horizontalBar' : 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: data.label || 'Données',
                    data: data.data || [],
                    backgroundColor: data.backgroundColor || this.colors.primary,
                    borderColor: data.borderColor || this.colors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    [options.horizontal ? 'x' : 'y']: {
                        beginAtZero: true,
                        ticks: options.stepSize ? { stepSize: options.stepSize } : {}
                    }
                },
                ...options.chartOptions
            }
        };

        this.charts[canvasId] = new Chart(ctx, defaultOptions);
        return this.charts[canvasId];
    }

    // Créer un graphique linéaire
    createLineChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas avec l'ID ${canvasId} non trouvé`);
            return null;
        }

        const defaultOptions = {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: data.label || 'Données',
                    data: data.data || [],
                    borderColor: data.borderColor || this.colors.primary,
                    backgroundColor: data.backgroundColor || `${this.colors.primary}20`,
                    tension: options.tension || 0.4,
                    fill: options.fill !== false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: options.showLegend !== false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: options.stepSize ? { stepSize: options.stepSize } : {}
                    }
                },
                ...options.chartOptions
            }
        };

        this.charts[canvasId] = new Chart(ctx, defaultOptions);
        return this.charts[canvasId];
    }

    // Mettre à jour un graphique existant
    updateChart(canvasId, newData) {
        const chart = this.charts[canvasId];
        if (!chart) {
            console.error(`Graphique ${canvasId} non trouvé`);
            return;
        }

        if (newData.labels) {
            chart.data.labels = newData.labels;
        }
        
        if (newData.data && chart.data.datasets[0]) {
            chart.data.datasets[0].data = newData.data;
        }

        chart.update();
    }

    // Détruire un graphique
    destroyChart(canvasId) {
        const chart = this.charts[canvasId];
        if (chart) {
            chart.destroy();
            delete this.charts[canvasId];
        }
    }

    // Détruire tous les graphiques
    destroyAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }

    // Utilitaires pour formater les données
    formatTime(seconds) {
        if (!seconds || seconds === 0) return '0min';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    }

    formatDuration(seconds) {
        return this.formatTime(seconds);
    }

    // Convertir les secondes en minutes pour l'affichage
    secondsToMinutes(seconds) {
        return Math.round(seconds / 60);
    }

    // Calculer des pourcentages
    calculatePercentages(data) {
        const total = data.reduce((sum, value) => sum + value, 0);
        return data.map(value => total > 0 ? Math.round((value / total) * 100) : 0);
    }

    // Générer des couleurs automatiquement
    generateColors(count) {
        const baseColors = [
            this.colors.primary,
            this.colors.success,
            this.colors.warning,
            this.colors.danger,
            this.colors.info,
            this.colors.secondary
        ];

        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    // Trier les données par valeur décroissante
    sortDataDescending(labels, data) {
        const combined = labels.map((label, index) => ({
            label,
            value: data[index]
        }));

        combined.sort((a, b) => b.value - a.value);

        return {
            labels: combined.map(item => item.label),
            data: combined.map(item => item.value)
        };
    }

    // Limiter le nombre d'éléments affichés (top N)
    limitData(labels, data, limit = 10) {
        if (labels.length <= limit) {
            return { labels, data };
        }

        const sorted = this.sortDataDescending(labels, data);
        return {
            labels: sorted.labels.slice(0, limit),
            data: sorted.data.slice(0, limit)
        };
    }

    // Ajouter des animations personnalisées
    addAnimation(chartOptions, animationType = 'default') {
        const animations = {
            default: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            bounce: {
                duration: 1500,
                easing: 'easeOutBounce'
            },
            fade: {
                duration: 800,
                easing: 'easeInOutCubic'
            }
        };

        return {
            ...chartOptions,
            animation: animations[animationType] || animations.default
        };
    }
}

// Instance globale pour utilisation dans les autres scripts
window.sonarCharts = new SonarChartsLogic();

// Fonction utilitaire pour rafraîchir tous les graphiques
window.refreshAllCharts = async function() {
    try {
        // Cette fonction sera appelée par les pages individuelles
        console.log('Rafraîchissement des graphiques...');
        
        // Émettre un événement personnalisé pour que les pages puissent réagir
        window.dispatchEvent(new CustomEvent('refreshCharts'));
        
    } catch (error) {
        console.error('Erreur lors du rafraîchissement des graphiques:', error);
    }
};

// Fonction pour exporter un graphique en image
window.exportChart = function(canvasId, filename = 'chart') {
    const chart = window.sonarCharts.charts[canvasId];
    if (!chart) {
        console.error(`Graphique ${canvasId} non trouvé`);
        return;
    }

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = chart.toBase64Image();
    link.click();
};

// Gestion des erreurs globales pour les graphiques
window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('Chart')) {
        console.error('Erreur Chart.js détectée:', event.error);
        // Optionnel: afficher un message d'erreur à l'utilisateur
    }
});