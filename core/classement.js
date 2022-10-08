const getJson = (url) => fetch(url).then((result) => result.json());

Promise.all([
  getJson(config.sources.matches),
  getJson(config.sources.players),
]).then(([matches, players]) => {
  const getStatisticsFor = getStatisticsOn(matches.matches);

  const playerStatistics = new Map();

  players.players
    .map((player) => player.name)
    .forEach((playerName) => {
      const statistics = getStatisticsFor(playerName);
      playerStatistics.set(playerName, {
        played: statistics.played,
        won: statistics.won + statistics.draw / 2,
      });
    });

  const leaderboard = new Map(
    [...playerStatistics.entries()].sort((a, b) => b[1] - a[1])
  );

  let rank = 0;
  for (const [player, statistics] of leaderboard.entries()) {
    const { played, won } = statistics;
    createRankEl(rank++, player, played, won);
  }
});

const getStatisticsOn = (matches) => {
  return function (playerName) {
    return matches.reduce(
      (statistics, match) => {
        const winner = match.winner;

        const isDraw = winner.toLowerCase() === "draw";
        if (isDraw) {
          return { ...statistics, draw: statistics.draw + 1 };
        }

        const isWon = match[winner].name === playerName;
        return isWon
          ? { ...statistics, won: statistics.won + 1 }
          : { ...statistics };
      },
      { played: matches.length, won: 0, draw: 0 }
    );
  };
};

const getIconFor = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 0) return "🥈";
  if (rank === 0) return "🥉";
  else return (++rank).toString();
};

const createRankEl = (rank, playerName, gamesPlayed, gamesWon) => {
  const rankingText = `${getIconFor(
    rank
  )} ${playerName} ${gamesWon} / ${gamesPlayed}`;
  const text = document.createTextNode(rankingText);

  const tag = document.createElement("div");
  tag.classList.add("shadow");
  tag.appendChild(text);

  const element = document.getElementById("Classement");
  element.appendChild(tag);
};
