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
        elo : "1200",
      });
    console.log(playerStatistics);
    });

  const leaderboard = new Map(
    [...playerStatistics.entries()].sort((a, b) => {
      return b[1].won - a[1].won;
    })
  );

  let rank = 0;
  let rankMap = [];
  for (const [player, statistics] of leaderboard.entries()) {
    const { played, won } = statistics;
    rankMap.push("element-"+rank);
    createRankEl(rank++, player, played, won, playerStatistics.elo);
  }
  console.log(rankMap)
  console.log("rankMap")
});

const getStatisticsOn = (matches) => {
  return function (playerName) {
    return matches
      .filter(
        (match) =>
          match.black.name === playerName || match.white.name === playerName
      )
      .reduce(
        (statistics, match) => {
          const winner = match.winner;

          const isDraw = winner.toLowerCase() === "draw";
          if (isDraw) {
            return {
              ...statistics,
              played: statistics.played + 1,
              draw: statistics.draw + 1,
            };
          }

          const isWon = match[winner].name === playerName;
          return isWon
            ? {
                ...statistics,
                played: statistics.played + 1,
                won: statistics.won + 1,
              }
            : {
                ...statistics,
                played: statistics.played + 1,
              };
        },
        { played: 0, won: 0, draw: 0 }
      );
  };
};

const getIconFor = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  else return (++rank).toString();
};

const createRankEl = (rank, playerName, gamesPlayed, gamesWon, elo) => {
  const rankingText = `${getIconFor(
    rank
  )} ${playerName} ${gamesWon} / ${gamesPlayed} - ${elo}`;
  const text = document.createTextNode(rankingText);
  const tag = document.createElement("div");
  tag.id = "classement-" + rank;
  tag.classList.add("shadow");
  tag.onclick = () => navigateToPlayerDetailsScoreboard(tag, playerName);
  tag.style = "cursor: pointer";
  tag.appendChild(text);

  const element = document.getElementById("Classement-elo");
  element.appendChild(tag);

};
