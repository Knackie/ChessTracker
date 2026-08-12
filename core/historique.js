Promise.all([
  fetch(config.sources.matches).then((response) => response.json()),
  fetch(config.sources.players).then((response) => response.json()),
]).then(([matchesData, playersData]) => {
    var beginClassement;
    const getPlayerLink = (playerName) =>
      `<a href='joueur.html?name=${encodeURIComponent(playerName)}'>${playerName}</a>`;

    const matches = Array.isArray(matchesData.matches) ? matchesData.matches : [];
    const players = Array.isArray(playersData.players) ? playersData.players : [];
    const orderedMatches = EloUtils.sortMatchesWithIndex(matches, "desc");
    const eloDeltasByMatchIndex = EloUtils.computeEloDeltas(players, matches).deltasByMatchIndex;

    const formatDelta = (delta) => {
      const rounded = Math.round(delta);
      return `${rounded >= 0 ? "+" : ""}${rounded}`;
    };

    for (let i = 0; i < orderedMatches.length; i++) {
      const currentEntry = orderedMatches[i];
      const currentMatch = currentEntry.match;
      var joueur1;
      var joueur2;
      if (currentMatch.winner == "Draw") {
        beginClassement = "Égalité de ";
        beginClassement += getPlayerLink(currentMatch.white.name);
        console.log(joueur1);
        beginClassement += " avec les blancs contre ";
        beginClassement += getPlayerLink(currentMatch.black.name);
      } else if ([currentMatch.winner] != "Draw") {
        if (currentMatch.winner == "white") {
          beginClassement = "Victoire de ";
          beginClassement += getPlayerLink(currentMatch.white.name);
          beginClassement += " avec les blancs contre ";
          beginClassement += getPlayerLink(currentMatch.black.name);
        } else {
          beginClassement = "Victoire de ";
          beginClassement += getPlayerLink(currentMatch.black.name);
          beginClassement += " avec les noirs contre ";
          beginClassement += getPlayerLink(currentMatch.white.name);
        }
      }
      beginClassement += " le ";
      beginClassement += currentMatch.date;
      beginClassement += " ouverture : ";
      beginClassement += currentMatch.opening;

      const deltas = eloDeltasByMatchIndex.get(currentEntry.index);
      const eloLine = deltas
        ? `<div class="small text-muted mt-2">Elo: Blancs ${formatDelta(deltas.whiteDelta)} | Noirs ${formatDelta(deltas.blackDelta)}</div>`
        : "";

      var divId = "div" + i;
      console.log(joueur1);
      var divId = "div" + i;
      var tag = document.createElement("div");
      tag.id = divId;
      tag.classList.add("card", "border-0", "shadow-sm", "p-3");
      tag.innerHTML = `<div class="small text-muted mb-2">${currentMatch.date}</div><div>${beginClassement}</div>${eloLine}`;

      var element = document.getElementById("Classement");
      element.appendChild(tag);
    }
  });
