(function () {
  const getCurrentPage = () => window.location.pathname.split('/').pop() || 'index.html';
  const isActive = (page) => getCurrentPage() === page || (getCurrentPage() === '' && page === 'index.html');

  const buildNav = () => `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" href="index.html">♟️ Chess Tracker</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <div class="navbar-nav ms-auto">
            <a class="nav-link ${isActive('index.html') ? 'active' : ''}" href="index.html">Accueil</a>
            <a class="nav-link ${isActive('classement.html') ? 'active' : ''}" href="classement.html">Classement</a>
            <a class="nav-link ${isActive('historique.html') ? 'active' : ''}" href="historique.html">Historique</a>
            <a class="nav-link ${isActive('matelo.html') ? 'active' : ''}" href="matelo.html">Mat-élo</a>
            <a class="nav-link" href="https://github.com/Knackie/ChessTracker" target="_blank" rel="noreferrer">Github</a>
          </div>
        </div>
      </div>
    </nav>
  `;

  const renderNavbar = () => {
    const container = document.getElementById('navbar');
    if (container) {
      container.innerHTML = buildNav();
    }
  };

  renderNavbar();
  window.renderNavbar = renderNavbar;
})();
