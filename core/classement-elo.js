const K_FACTOR = 20;

Promise.all([
	fetch(config.sources.players).then((response) => response.json()),
	fetch(config.sources.matches).then((response) => response.json()),
]).then(([playersData, matchesData]) => {
	const ratings = EloUtils.computeEloDeltas(
		playersData.players,
		matchesData.matches,
		{ kFactor: K_FACTOR }
	).finalRatings;

	const sortedRatings = new Map(
		[...ratings.entries()].sort((a, b) => b[1] - a[1])
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

