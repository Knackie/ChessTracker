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

const renderRecentMatches = (target, playerName, matches) => {
  if (!matches.length) {
    target.innerHTML = `<div class="text-muted">Aucune partie trouvée pour ce joueur.</div>`;
    return;
  }

  target.innerHTML = matches
    .map((match) => {
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

      return `
        <div class="card border-0 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-start gap-3">
            <div>
              <div class="fw-bold">${escapeHtml(playerName)} vs ${escapeHtml(opponent)}</div>
              <div class="text-muted small">${escapeHtml(match.date || "Date inconnue")} • ${escapeHtml(match.opening || "Ouverture inconnue")} • ${color}</div>
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

    const playerMatches = allMatches.filter(
      (match) => match.white && match.black && (match.white.name === playerName || match.black.name === playerName)
    );

    if (!playerMatches.length) {
      throw new Error("Aucune partie trouvée pour ce joueur.");
    }

    const playerFromList = allPlayers.find((player) => player.name === playerName);

    const total = createStats();
    const asWhite = createStats();
    const asBlack = createStats();

    const openings = new Map();
    const opponents = new Map();

    playerMatches.forEach((match) => {
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
    document.getElementById("playerSubtitle").innerText = `${total.played} parties • ${total.won}V ${total.draw}N ${total.lost}D`;

    const summaryTarget = document.getElementById("playerSummary");
    summaryTarget.innerHTML =
      renderSummaryCard("Parties", total.played) +
      renderSummaryCard("Score", total.score, `${scorePct}%`) +
      renderSummaryCard("Victoires", total.won) +
      renderSummaryCard("Elo actuel", playerFromList ? playerFromList.elo : "N/A");

    const colorTarget = document.getElementById("statsByColor");
    colorTarget.innerHTML =
      renderSummaryCard("Blancs", asWhite.played, `${asWhite.won}V ${asWhite.draw}N ${asWhite.lost}D`) +
      renderSummaryCard("Noirs", asBlack.played, `${asBlack.won}V ${asBlack.draw}N ${asBlack.lost}D`);

    const openingEntries = [...openings.entries()].sort((a, b) => b[1].played - a[1].played);
    const opponentEntries = [...opponents.entries()].sort((a, b) => b[1].played - a[1].played);

    renderTableRows(document.getElementById("openingRows"), openingEntries);
    renderTableRows(document.getElementById("opponentRows"), opponentEntries);

    const recentMatches = [...playerMatches]
      .sort((a, b) => toComparableDate(b.date) - toComparableDate(a.date))
      .slice(0, 5);

    renderRecentMatches(document.getElementById("recentMatches"), playerName, recentMatches);
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
