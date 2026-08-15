const K_FACTOR = 20;

Promise.all([
	fetch(config.sources.players).then((response) => response.json()),
	fetch(config.sources.matches).then((response) => response.json()),
]).then(([playersData, matchesData]) => {
  const matches = Array.isArray(matchesData.matches) ? matchesData.matches : [];
  const playedCountByPlayer = new Map();

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const whiteName = match && match.white && match.white.name;
    const blackName = match && match.black && match.black.name;

    if (whiteName) {
      playedCountByPlayer.set(whiteName, (playedCountByPlayer.get(whiteName) || 0) + 1);
    }
    if (blackName) {
      playedCountByPlayer.set(blackName, (playedCountByPlayer.get(blackName) || 0) + 1);
    }
  }

  // Recalculate Elo starting from default initial Elo for all players
  // (ignore stored ratings in players.json to ensure consistent recomputation)
  const ratings = EloUtils.computeEloDeltas(
    [],
      matches,
    { kFactor: K_FACTOR }
  ).finalRatings;

	const sortedRatings = new Map(
    [...ratings.entries()]
      .filter(([playerName]) => (playedCountByPlayer.get(playerName) || 0) > 0)
      .sort((a, b) => b[1] - a[1])
	);

	let rank = 0;
	for (const [playerName, elo] of sortedRatings.entries()) {
		createRankEl(rank++, playerName, Math.round(elo));
	}
});



const getIconFor = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  else return (++rank).toString();
};

const createRankEl = (rank, playerName, elo) => {
  const tag = document.createElement("div");
  tag.id = "classement-" + rank;
  tag.classList.add("card", "border-0", "shadow-sm", "p-3", "mb-3", "cursor-pointer");
  tag.onclick = () => navigateToPlayerDetailsScoreboard(tag, playerName);
  tag.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <div>
        <div class="fw-bold">${getIconFor(rank)} ${playerName}</div>
        <div class="text-muted small">Elo : ${elo}</div>
      </div>
      <span class="badge bg-success rounded-pill">#${rank + 1}</span>
    </div>
  `;

  const element = document.getElementById("Classement-elo");
  element.appendChild(tag);
	
};

