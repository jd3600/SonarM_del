// Gestion de la navigation et des interactions communes

class SonarNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupKeyboardShortcuts();
        this.setupResponsiveMenu();
        this.updateActiveNavLink();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    setupNavigation() {
        // Ajouter des événements aux liens de navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });

        // Gestion du bouton retour du navigateur
        window.addEventListener('popstate', () => {
            this.updateActiveNavLink();
        });
    }

    handleNavClick(event, link) {
        // Ajouter une classe de transition si nécessaire
        document.body.classList.add('page-transition');
        
        // Nettoyer les graphiques avant de changer de page
        if (window.sonarCharts) {
            window.sonarCharts.destroyAllCharts();
        }
        
        // Laisser la navigation normale se faire
        setTimeout(() => {
            document.body.classList.remove('page-transition');
        }, 300);
    }

    updateActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPage = this.getCurrentPage();
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const linkPage = href ? href.replace('.html', '') : '';
            
            if (linkPage === currentPage || 
                (currentPage === 'index' && (linkPage === 'index' || linkPage === ''))) {
                link.classList.add('active');
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + touches pour navigation rapide
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateTo('index.html');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateTo('dashboard-video.html');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateTo('dashboard-audio.html');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateTo('rapports.html');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshCurrentPage();
                        break;
                }
            }
            
            // Échap pour fermer les modales ou réinitialiser les filtres
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    setupResponsiveMenu() {
        // Créer un bouton menu mobile si nécessaire
        const nav = document.querySelector('.main-nav');
        if (nav && !document.querySelector('.mobile-menu-toggle')) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'mobile-menu-toggle';
            toggleButton.innerHTML = '☰';
            toggleButton.setAttribute('aria-label', 'Menu');
            
            toggleButton.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                toggleButton.classList.toggle('active');
            });
            
            nav.parentNode.insertBefore(toggleButton, nav);
        }

        // Fermer le menu mobile lors du clic sur un lien
        document.addEventListener('click', (e) => {
            const nav = document.querySelector('.main-nav');
            const toggle = document.querySelector('.mobile-menu-toggle');
            
            if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('mobile-open');
                toggle.classList.remove('active');
            }
        });
    }

    navigateTo(page) {
        window.location.href = page;
    }

    refreshCurrentPage() {
        // Rafraîchir les graphiques si on est sur un dashboard
        if (this.currentPage.includes('dashboard')) {
            if (typeof refreshCharts === 'function') {
                refreshCharts();
            } else if (window.refreshAllCharts) {
                window.refreshAllCharts();
            }
        } else {
            // Recharger la page pour les autres pages
            window.location.reload();
        }
    }

    handleEscapeKey() {
        // Fermer les modales ouvertes
        const modals = document.querySelectorAll('.modal.open, .popup.open');
        modals.forEach(modal => {
            modal.classList.remove('open');
        });

        // Réinitialiser les filtres sur la page rapports
        if (this.currentPage === 'rapports' && typeof clearFilters === 'function') {
            clearFilters();
        }

        // Fermer le menu mobile
        const nav = document.querySelector('.main-nav.mobile-open');
        const toggle = document.querySelector('.mobile-menu-toggle.active');
        if (nav && toggle) {
            nav.classList.remove('mobile-open');
            toggle.classList.remove('active');
        }
    }

    // Utilitaires pour les notifications
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Styles inline pour la notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        // Couleurs selon le type
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Suppression automatique
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Utilitaire pour confirmer les actions
    confirmAction(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }

    // Utilitaire pour formater les dates
    formatDate(dateString, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Date(dateString).toLocaleDateString('fr-FR', formatOptions);
    }

    // Utilitaire pour débouncer les fonctions (utile pour la recherche)
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utilitaire pour copier du texte dans le presse-papiers
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copié dans le presse-papiers', 'success');
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            this.showNotification('Erreur lors de la copie', 'error');
        }
    }

    // Utilitaire pour télécharger des données en JSON
    downloadJSON(data, filename = 'data.json') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
        
        // Nettoyer l'URL
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
}

// Initialiser la navigation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.sonarNav = new SonarNavigation();
});

// Fonctions globales pour compatibilité
window.showNotification = function(message, type, duration) {
    if (window.sonarNav) {
        window.sonarNav.showNotification(message, type, duration);
    }
};

window.confirmAction = function(message, callback) {
    if (window.sonarNav) {
        window.sonarNav.confirmAction(message, callback);
    }
};

// Gestion des erreurs globales avec notifications
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
    if (window.sonarNav) {
        window.sonarNav.showNotification('Une erreur est survenue', 'error');
    }
});

// Gestion des erreurs de réseau
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée:', event.reason);
    if (window.sonarNav && event.reason.message && event.reason.message.includes('fetch')) {
        window.sonarNav.showNotification('Erreur de connexion au serveur', 'error');
    }
});