const htmlBodyHistory = [];

onpopstate = (_event) => {
  window.location.reload();
};

const registerIndexListeners = () => {
  ["First", "Second", "Third"]
  .map((id) => document.getElementById(id))
 
  .forEach((el) => {
    const getName = () => el.innerText.split(" ")[0].substring(2);
    el.onclick = () => navigateToPlayerDetails(el, getName);
  });
}

const navigateToPlayerDetails = (el, getNameFrom) => {
  const playerName = getNameFrom(el);
  console.log(playerName+ " ??????");

  history.pushState({}, "", `#${playerName}`);
  document.title = `♟️ Chess Tracker - ${playerName}`;

  showPlayerDetails(playerName);
};

const navigateToPlayerDetailsScoreboard = (el, playerName) => {
  console.log(playerName+ " ??????");

  history.pushState({}, "", `#${playerName}`);
  document.title = `♟️ Chess Tracker - ${playerName}`;

  showPlayerDetails(playerName);
};



const showPlayerDetails = (playerName) => {
  const detailsTemplate = `
    <div class="details">
      <h1>${playerName}</h1>
    </div>
     <div class="StatisticsColors">
      <h1>Statistiques par couleur</h1>
    </div>
     <div class="StatisticsOpening">
      <h1>Statistiques par ouverture</h1>
    </div>
     <div class="StatistiquesDay">
      <h1>Statistiques par jour</h1>
    </div>
    `;

  replaceBodyWith(detailsTemplate);
};

const replaceBodyWith = (template) => {
  htmlBodyHistory.push(document.body.innerHTML);

  const navbarTemplate = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" href="index.html">♟️ Chess Tracker</a>
        <div class="navbar-nav ms-auto">
          <a class="nav-link" href="index.html">Accueil</a>
          <a class="nav-link" href="classement.html">Classement</a>
          <a class="nav-link" href="historique.html">Historique</a>
          <a class="nav-link" href="matelo.html">Mat-élo</a>
          <a class="nav-link" href="https://github.com/Knackie/ChessTracker" target="_blank" rel="noreferrer">Github</a>
        </div>
      </div>
    </nav>
  `;

  document.body.innerHTML = navbarTemplate + `<main class="container py-4">${template}</main>`;
};
