var player;
fetch(config.sources.players)
  .then((response) => response.json())
  .then((p) => {
    player = p;
    console.log(player);

    fetch(config.sources.matches)
      .then((response) => response.json())
      .then((data) => {
        var won = 0;
        var played = 0;
        var draw = 0;
        const gamesWon = new Map();
        const gamesPlayed = new Map();
        for (let y = 0; y < Object.keys(player.players).length; y++) {
          console.log(player.players[y].name);
          for (let i = 0; i < Object.keys(data.matches).length; i++) {
            if (
              data.matches[i].white.name == player.players[y].name ||
              data.matches[i].black.name == player.players[y].name
            ) {
              played++;

              if (data.matches[i].winner == "Draw") {
                draw++;
              } else if ([data.matches[i].winner] != "Draw") {
                if (
                  data.matches[i][data.matches[i].winner].name ==
                  player.players[y].name
                ) {
                  won++;
                }
              }
            }
          }
          won = won + draw / 2;
          gamesWon.set(player.players[y].name, won);
          gamesPlayed.set(player.players[y].name, played);
          won = 0;
          played = 0;
          draw = 0;
          console.log("draw");
          console.log("gamesPlayed");
          console.log(gamesPlayed);
        }
        const eloDeltasByMatchIndex = EloUtils.computeEloDeltas(
          player.players,
          data.matches
        ).deltasByMatchIndex;

        const formatDelta = (delta) => {
          const rounded = Math.round(delta);
          return `${rounded >= 0 ? "+" : ""}${rounded}`;
        };

        // Trie les matchs du plus récent au plus ancien puis privilégie le dernier ajouté en cas d'égalité
        const recentMatches = EloUtils.sortMatchesWithIndex(data.matches, "desc")
          .slice(0, 3);

        for (let i = 0; i < recentMatches.length; i++) {
          const match = recentMatches[i].match;
          const deltas = eloDeltasByMatchIndex.get(recentMatches[i].index);
          if (match.winner.toLowerCase() !== "draw") {
            var affichageWin = "Victoire de ";
            affichageWin += match[match.winner].name;

            if (match.winner == "white") {
              affichageWin += " avec les blancs contre ";
              affichageWin += match.black.name;
            } else {
              affichageWin += " avec les noirs contre ";
              affichageWin += match.white.name;
            }
          } else {
            var affichageWin = "Égalité de ";
            affichageWin += match.white.name;
            affichageWin += " avec les blancs contre ";
            affichageWin += match.black.name;
          }
          affichageWin += " le ";
          affichageWin += match.date;
          affichageWin += " ouverture : ";
          affichageWin += match.opening;

          if (deltas) {
            affichageWin += ` | Elo: Blancs ${formatDelta(deltas.whiteDelta)} / Noirs ${formatDelta(deltas.blackDelta)}`;
          }

          const container = document.querySelector("#HistoFirst" + i);
          if (container) {
            container.innerHTML = `<div class="card border-0 shadow-sm h-100"><div class="card-body"><p class="mb-0">${affichageWin}</p></div></div>`;
          }
        }

        max = 0;
        const sortedAsc = new Map(
          [...gamesWon.entries()].sort((a, b) => b[1] - a[1])
        );
        console.log(sortedAsc);
        console.log("sortedAsc");

        const firstValue = Array.from(sortedAsc.keys())[0];
        const renderTopCard = (elementId, rankIndex, label) => {
          const container = document.querySelector(elementId);
          if (!container) return;

          const playerName = Array.from(sortedAsc.keys())[rankIndex];
          container.dataset.playerName = playerName;
          const wins = gamesWon.get(playerName);
          const played = gamesPlayed.get(playerName);
          container.innerHTML = `
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 class="h6 mb-1">${label}</h3>
                    <p class="fw-bold mb-1">${playerName}</p>
                    <p class="text-muted mb-0">${wins} victoires / ${played} parties</p>
                  </div>
                  <span class="badge bg-primary rounded-pill">#${rankIndex + 1}</span>
                </div>
              </div>
            </div>
          `;
        };

        renderTopCard("#First", 0, "🥇 Premier");
        renderTopCard("#Second", 1, "🥈 Deuxième");
        renderTopCard("#Third", 2, "🥉 Troisième");
        console.log(data);

        registerIndexListeners();
      });
  });
