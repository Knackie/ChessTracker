const htmlBodyHistory = [];

onpopstate = (_event) => {
  const previousPage = htmlBodyHistory.pop();

  if (previousPage) {
    document.body.innerHTML = previousPage;
    registerIndexListeners();
  }
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
    <div class="w3-bar w3-green">
      <a href="/ChessTracker" class="w3-bar-item w3-button">Accueil</a>
      <a href="classement" class="w3-bar-item w3-button">Classement</a>
      <a href="historique" class="w3-bar-item w3-button">Historique</a>
      <a href="classement par mat-élo" class="w3-bar-item w3-button">Matelo</a>
      <a
        href="https://github.com/Knackie/ChessTracker"
        class="w3-bar-item w3-button"
        >Github</a
      >
    </div>
  `;

  document.body.innerHTML = navbarTemplate + template;
};
