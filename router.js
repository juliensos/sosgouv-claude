// ============================================
// SOSGOUV - Router System V-2
// Gère le chargement dynamique des pages
// ============================================

class Router {
  constructor() {
    this.container = document.querySelector('._w-body');
    this.routes = {
      'accueil': 'pages/page-accueil-temp.html',
      'connect': 'pages/connect.html',
      'connect-1': 'pages/connect-1.html',
      'connect-2': 'pages/connect-2.html',
      'membres': 'pages/page-liste-membres.html',
      'personnalites': 'pages/page-liste-personalites.html',
      'gouvernements': 'pages/page-gouv-publies.html',
      'faq': 'pages/page-faq.html',
      'apropos': 'pages/page-apropos.html',
      'mon-espace': 'pages/page-mon-espace.html',
      'reglages': 'pages/page-reglages.html'
    };
    this.currentPage = null;
    this.init();
  }

  init() {
    // Gérer les clics sur les liens
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-page]');
      if (link) {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        this.loadPage(page);
      }
    });

    // Gérer le bouton retour du navigateur
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.loadPage(e.state.page, false);
      }
    });

    // Charger la page initiale
    const initialPage = this.getInitialPage();
    this.loadPage(initialPage, true);
  }

  getInitialPage() {
    // Vérifier si une page est demandée dans l'URL
    const hash = window.location.hash.slice(1);
    if (hash && this.routes[hash]) {
      return hash;
    }
    return 'accueil'; // Page par défaut
  }

  async loadPage(pageName, addToHistory = true) {
    if (!this.routes[pageName]) {
      console.error(`Page "${pageName}" non trouvée`);
      return;
    }

    // Afficher un loader
    this.showLoader();

    try {
      const response = await fetch(this.routes[pageName]);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const html = await response.text();
      
      // Injecter le contenu
      this.container.innerHTML = html;
      
      // Mettre à jour l'historique
      if (addToHistory) {
        window.history.pushState(
          { page: pageName },
          '',
          `#${pageName}`
        );
      }

      this.currentPage = pageName;
      
      // Mettre à jour le menu actif
      this.updateActiveMenu(pageName);
      
      // Exécuter les scripts de la page chargée
      this.executePageScripts();
      
      console.log(`✅ Page "${pageName}" chargée avec succès`);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      this.showError(pageName);
    }
  }

  showLoader() {
    this.container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 400px;">
        <div style="text-align: center;">
          <div style="font-size: 14px; color: #aca69a; margin-bottom: 10px;">Chargement...</div>
          <div style="width: 40px; height: 40px; border: 3px solid #f5b800; border-top-color: transparent; border-radius: 50%; margin: 0 auto; animation: spin 0.8s linear infinite;"></div>
        </div>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  showError(pageName) {
    this.container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h3 style="color: #b81515; margin-bottom: 20px;">❌ Erreur de chargement</h3>
        <p style="color: #aca69a; margin-bottom: 20px;">
          Impossible de charger la page "${pageName}"
        </p>
        <a href="#accueil" data-page="accueil" 
           style="background-color: #f5b800; color: #000; padding: 10px 20px; 
                  border-radius: 5px; text-decoration: none; display: inline-block;">
          ← Retour à l'accueil
        </a>
      </div>
    `;
  }

  updateActiveMenu(pageName) {
    // Retirer la classe active de tous les liens
    document.querySelectorAll('[data-page]').forEach(link => {
      link.classList.remove('w--current');
    });

    // Ajouter la classe active au lien correspondant
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('w--current');
    }
  }

  executePageScripts() {
    // Exécuter les scripts inline de la page chargée
    const scripts = this.container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.textContent = script.textContent;
      }
      script.parentNode.replaceChild(newScript, script);
    });
  }

  // Méthode utilitaire pour naviguer depuis le code
  navigateTo(pageName) {
    this.loadPage(pageName);
  }
}

// Initialiser le router quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
  });
} else {
  window.router = new Router();
}
