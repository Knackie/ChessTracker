var player;
fetch(config.sources.players)
  .then((response) => response.json())
  .then((p) => {
    player = p;
    console.log(player);

    fetch(config.sources.matches)
      .then((response) => response.json())
      .then((data) => {
        const gamesWon = new Map();
        const gamesPlayed = new Map();
        const playerStats = new Map(
          player.players.map((entry) => [entry.name, { played: 0, won: 0, draw: 0 }])
        );

        const matches = Array.isArray(data.matches) ? data.matches : [];
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const whiteName = match.white && match.white.name;
          const blackName = match.black && match.black.name;

          if (whiteName && playerStats.has(whiteName)) {
            playerStats.get(whiteName).played += 1;
          }
          if (blackName && playerStats.has(blackName)) {
            playerStats.get(blackName).played += 1;
          }

          const winner = String(match.winner || "").toLowerCase();
          if (winner === "draw") {
            if (whiteName && playerStats.has(whiteName)) {
              playerStats.get(whiteName).draw += 1;
            }
            if (blackName && playerStats.has(blackName)) {
              playerStats.get(blackName).draw += 1;
            }
          } else if ((winner === "white" || winner === "black") && match[winner] && match[winner].name) {
            const winnerName = match[winner].name;
            if (playerStats.has(winnerName)) {
              playerStats.get(winnerName).won += 1;
            }
          }
        }

        for (const [playerName, stats] of playerStats.entries()) {
          gamesWon.set(playerName, stats.won + stats.draw / 2);
          gamesPlayed.set(playerName, stats.played);
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
          [...gamesWon.entries()]
            .filter(([playerName]) => (gamesPlayed.get(playerName) || 0) > 0)
            .sort((a, b) => b[1] - a[1])
        );
        console.log(sortedAsc);
        console.log("sortedAsc");

        const renderTopCard = (elementId, rankIndex, label) => {
          const container = document.querySelector(elementId);
          if (!container) return;

          const playerName = Array.from(sortedAsc.keys())[rankIndex];
          if (!playerName) {
            container.innerHTML = `
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <h3 class="h6 mb-1">${label}</h3>
                  <p class="text-muted mb-0">Aucune partie jouee</p>
                </div>
              </div>
            `;
            return;
          }

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
