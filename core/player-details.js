const navigateToPlayerDetails = (el, getNameFrom) => {
  const playerName = getNameFrom(el);

  history.pushState({}, "", `#${playerName}`);
  document.title = `♟️ Chess Tracker - ${playerName}`;

  showPlayerDetails(playerName);
};

const showPlayerDetails = (playerName) => {
  const detailsTemplate = `
    <div class="details">
      <h1>${playerName}</h1>
      <a href="classement">Voir le classement complet</a>
    </div>
    `;

  replaceBodyWith(detailsTemplate);
};

const replaceBodyWith = (template) => {
  const navbarTemplate = `
    <div class="w3-bar w3-green">
      <a href="/ChessTracker" class="w3-bar-item w3-button">Accueil</a>
      <a href="classement" class="w3-bar-item w3-button">Classement</a>
      <a href="historique" class="w3-bar-item w3-button">Historique</a>
      <a
        href="https://github.com/Knackie/ChessTracker"
        class="w3-bar-item w3-button"
        >Github</a
      >
    </div>
    `;

  document.body.innerHTML = navbarTemplate + template;
};
