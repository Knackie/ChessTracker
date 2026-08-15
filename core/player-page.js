const getJson = (url) => fetch(url).then((result) => result.json());

const getPlayerNameFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("name") || "";
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toComparableDate = (dateText) => {
  const parts = String(dateText).split("/").map(Number);
  if (parts.length < 2) return 0;

  const day = parts[0] || 1;
  const month = parts[1] || 1;
  const year = parts[2] || new Date().getFullYear();

  return new Date(year, month - 1, day).getTime();
};

const createStats = () => ({ played: 0, won: 0, draw: 0, lost: 0, score: 0 });

const withMatchResult = (stats, result) => {
  stats.played += 1;

  if (result === "won") {
    stats.won += 1;
    stats.score += 1;
  } else if (result === "draw") {
    stats.draw += 1;
    stats.score += 0.5;
  } else {
    stats.lost += 1;
  }

  return stats;
};

const resolveResult = (match, playerName) => {
  const winner = String(match.winner || "").toLowerCase();
  if (winner === "draw") return "draw";

  const winnerPlayer = match[winner] && match[winner].name;
  return winnerPlayer === playerName ? "won" : "lost";
};

const renderSummaryCard = (label, value, muted) => `
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body">
        <div class="small text-muted">${label}</div>
        <div class="h4 mb-0">${value}</div>
        ${muted ? `<div class="small text-muted mt-1">${muted}</div>` : ""}
      </div>
    </div>
  </div>
`;

const renderTableRows = (rowsTarget, entries) => {
  if (!entries.length) {
    rowsTarget.innerHTML = `<tr><td colspan="6" class="text-muted">Aucune donnée</td></tr>`;
    return;
  }

  rowsTarget.innerHTML = entries
    .map(([name, stats]) => {
      const ratio = stats.played ? ((stats.score / stats.played) * 100).toFixed(1) : "0.0";

      return `
        <tr>
          <td>${escapeHtml(name)}</td>
          <td>${stats.played}</td>
          <td>${stats.won}</td>
          <td>${stats.draw}</td>
          <td>${stats.lost}</td>
          <td>${stats.score} (${ratio}%)</td>
        </tr>
      `;
    })
    .join("");
};

const renderRecentMatches = (target, playerName, matchEntries, deltasByMatchIndex) => {
  if (!matchEntries.length) {
    target.innerHTML = `<div class="text-muted">Aucune partie trouvée pour ce joueur.</div>`;
    return;
  }

  const formatDelta = (delta) => {
    const rounded = Math.round(delta);
    return `${rounded >= 0 ? "+" : ""}${rounded}`;
  };

  target.innerHTML = matchEntries
    .map((entry) => {
      const match = entry.match;
      const result = resolveResult(match, playerName);
      const label =
        result === "won"
          ? "Victoire"
          : result === "draw"
          ? "Nulle"
          : "Défaite";

      const badgeClass =
        result === "won"
          ? "bg-success"
          : result === "draw"
          ? "bg-secondary"
          : "bg-danger";

      const asWhite = match.white.name === playerName;
      const opponent = asWhite ? match.black.name : match.white.name;
      const color = asWhite ? "Blancs" : "Noirs";
      const deltas = deltasByMatchIndex.get(entry.index);
      const playerDelta = deltas
        ? asWhite
          ? deltas.whiteDelta
          : deltas.blackDelta
        : null;

      return `
        <div class="card border-0 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-start gap-3">
            <div>
              <div class="fw-bold">${escapeHtml(playerName)} vs ${escapeHtml(opponent)}</div>
              <div class="text-muted small">${escapeHtml(match.date || "Date inconnue")} • ${escapeHtml(match.opening || "Ouverture inconnue")} • ${color}</div>
              ${playerDelta !== null ? `<div class="small text-muted mt-1">Variation Elo: ${formatDelta(playerDelta)}</div>` : ""}
            </div>
            <span class="badge ${badgeClass}">${label}</span>
          </div>
        </div>
      `;
    })
    .join("");
};

Promise.all([getJson(config.sources.matches), getJson(config.sources.players)])
  .then(([matchesData, playersData]) => {
    const playerName = getPlayerNameFromUrl();

    if (!playerName) {
      throw new Error("Aucun joueur spécifié dans l'URL.");
    }

    const allMatches = Array.isArray(matchesData.matches) ? matchesData.matches : [];
    const allPlayers = Array.isArray(playersData.players) ? playersData.players : [];

    const eloResult = EloUtils.computeEloDeltas(
      allPlayers,
      allMatches,
      { kFactor: 20 }
    );
    const eloDeltasByMatchIndex = eloResult.deltasByMatchIndex;
    const finalRatings = eloResult.finalRatings;

    const indexedPlayerMatches = allMatches
      .map((match, index) => ({ match, index }))
      .filter(
        (entry) =>
          entry.match.white &&
          entry.match.black &&
          (entry.match.white.name === playerName || entry.match.black.name === playerName)
    );

    if (!indexedPlayerMatches.length) {
      throw new Error("Aucune partie trouvée pour ce joueur.");
    }

    const playerFromList = allPlayers.find((player) => player.name === playerName);

    const total = createStats();
    const asWhite = createStats();
    const asBlack = createStats();

    const openings = new Map();
    const opponents = new Map();

    indexedPlayerMatches.forEach((entry) => {
      const match = entry.match;
      const result = resolveResult(match, playerName);
      const playedAsWhite = match.white.name === playerName;
      const openingName = match.opening || "Inconnue";
      const opponentName = playedAsWhite ? match.black.name : match.white.name;

      withMatchResult(total, result);
      withMatchResult(playedAsWhite ? asWhite : asBlack, result);

      if (!openings.has(openingName)) {
        openings.set(openingName, createStats());
      }
      withMatchResult(openings.get(openingName), result);

      if (!opponents.has(opponentName)) {
        opponents.set(opponentName, createStats());
      }
      withMatchResult(opponents.get(opponentName), result);
    });

    const scorePct = total.played ? ((total.score / total.played) * 100).toFixed(1) : "0.0";

    document.title = `♟️ Chess Tracker - ${playerName}`;
    document.getElementById("playerTitle").innerText = playerName;
    const subtitleEl = document.getElementById("playerSubtitle");
    if (subtitleEl) {
      subtitleEl.innerHTML = `${total.played} parties • ` +
        `<span class="d-inline-flex align-items-center gap-1 stat-row">` +
        `<span class="stat-pill green" title="Victoires">${total.won}V</span>` +
        `<span class="stat-pill gray" title="Nulles">${total.draw}N</span>` +
        `<span class="stat-pill red" title="Défaites">${total.lost}D</span>` +
        `</span>`;
    }

    const summaryTarget = document.getElementById("playerSummary");
    const computedElo = finalRatings && finalRatings.has(playerName) ? Math.round(finalRatings.get(playerName)) : (playerFromList ? Number(playerFromList.elo) : 'N/A');
    summaryTarget.innerHTML =
      renderSummaryCard("Parties", total.played) +
      renderSummaryCard("Score", total.score, `${scorePct}%`) +
      renderSummaryCard("Victoires", total.won) +
      renderSummaryCard("Elo actuel", computedElo);

    const colorTarget = document.getElementById("statsByColor");
    // Render color stats with colored squares and V/D/N badges
    if (colorTarget) {
      colorTarget.innerHTML = `
        <div class="row g-3">
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <span class="color-square" style="background:#ffffff;border-color:#cfcfcf"></span>
                  <div>
                    <div class="small text-muted">Blancs</div>
                    <div class="h5 mb-0">${asWhite.played}</div>
                  </div>
                </div>
                <div class="d-flex gap-1 stat-row">
                  <span class="stat-pill green" title="Victoires">${asWhite.won}V</span>
                  <span class="stat-pill gray" title="Nulles">${asWhite.draw}N</span>
                  <span class="stat-pill red" title="Défaites">${asWhite.lost}D</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <span class="color-square" style="background:#000;border-color:#000"></span>
                  <div>
                    <div class="small text-muted">Noirs</div>
                    <div class="h5 mb-0">${asBlack.played}</div>
                  </div>
                </div>
                <div class="d-flex gap-1 stat-row">
                  <span class="stat-pill green" title="Victoires">${asBlack.won}V</span>
                  <span class="stat-pill gray" title="Nulles">${asBlack.draw}N</span>
                  <span class="stat-pill red" title="Défaites">${asBlack.lost}D</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const openingEntries = [...openings.entries()].sort((a, b) => b[1].played - a[1].played);
    const opponentEntries = [...opponents.entries()].sort((a, b) => b[1].played - a[1].played);

    renderTableRows(document.getElementById("openingRows"), openingEntries);
    renderTableRows(document.getElementById("opponentRows"), opponentEntries);

    const recentMatches = [...indexedPlayerMatches]
      .sort((a, b) => {
        const dateDelta = toComparableDate(b.match.date) - toComparableDate(a.match.date);
        if (dateDelta !== 0) return dateDelta;
        return b.index - a.index;
      })
      .slice(0, 5);

    renderRecentMatches(
      document.getElementById("recentMatches"),
      playerName,
      recentMatches,
      eloDeltasByMatchIndex
    );

    // Render Elo progression chart for this player
    try {
      const ordered = EloUtils.sortMatchesWithIndex(allMatches, 'asc');
      const labels = [];
      const values = [];
      // determine starting Elo: take the 'before' value from the first match involving player
      let startingElo = null;
      for (const entry of ordered) {
        const match = entry.match;
        const idx = entry.index;
        if (!match || !match.white || !match.black) continue;
        if (match.white.name === playerName || match.black.name === playerName) {
          const deltas = eloDeltasByMatchIndex.get(idx);
          if (deltas) {
            startingElo = match.white.name === playerName ? Math.round(deltas.whiteBefore) : Math.round(deltas.blackBefore);
            break;
          }
        }
      }
      if (startingElo === null) {
        startingElo = playerFromList ? Number(playerFromList.elo) : 1399;
      }

      labels.push('Début');
      values.push(Math.round(startingElo));

      ordered.forEach((entry) => {
        const match = entry.match;
        const idx = entry.index;
        if (!match || !match.white || !match.black) return;
        if (match.white.name === playerName || match.black.name === playerName) {
          const deltas = eloDeltasByMatchIndex.get(idx);
          if (deltas) {
            const after = match.white.name === playerName ? deltas.whiteAfter : deltas.blackAfter;
            labels.push(match.date || '—');
            values.push(Math.round(after));
          }
        }
      });

      const ctx = document.getElementById('eloChart');
      if (ctx) {
        if (window.Chart) {
          const cfg = {
            type: 'line',
            data: { labels, datasets: [{ label: 'Elo', data: values, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', tension: 0.2, fill: true, pointRadius: 3 }] },
            options: { scales: { y: { beginAtZero: false } }, plugins: { legend: { display: false } } }
          };
          // clean previous canvas if chart exists
          if (ctx._chartInstance) {
            ctx._chartInstance.destroy();
            ctx._chartInstance = null;
          }
          ctx._chartInstance = new Chart(ctx.getContext('2d'), cfg);
        } else {
          ctx.parentElement.innerHTML = '<div class="text-muted">Chart.js non chargé.</div>';
        }
      }
    } catch (e) {
      // ignore chart errors
      console.warn('Elo chart error', e);
    }
  })
  .catch((error) => {
    const title = document.getElementById("playerTitle");
    const subtitle = document.getElementById("playerSubtitle");

    title.innerText = "Profil joueur";
    subtitle.innerText = error.message || "Erreur de chargement.";

    document.getElementById("playerSummary").innerHTML = "";
    document.getElementById("statsByColor").innerHTML = "";
    document.getElementById("openingRows").innerHTML = "<tr><td colspan='6' class='text-muted'>Aucune donnée</td></tr>";
    document.getElementById("opponentRows").innerHTML = "<tr><td colspan='6' class='text-muted'>Aucune donnée</td></tr>";
    document.getElementById("recentMatches").innerHTML = "";
  });
