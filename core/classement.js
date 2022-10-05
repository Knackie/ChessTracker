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

          console.log("gamesPlayed");
          console.log(gamesPlayed);
        }

        const sortedAsc = new Map(
          [...gamesWon.entries()].sort((a, b) => b[1] - a[1])
        );

        for (let rank = 0; rank < sortedAsc.size; rank++) {
          const player = {
            name: Array.from(sortedAsc.keys())[rank],
            gamesPlayed: gamesPlayed.get(Array.from(sortedAsc.keys())[rank]),
            gamesWon: gamesWon.get(Array.from(sortedAsc.keys())[rank]),
          };

          createRankElement(rank, player);
        }
      });
  });

const getIconForRank = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  else return (rank + 1).toString();
};

const createRankElement = (rank, player) => {
  const playerDetails = `${player.name} ${player.gamesWon} / ${player.gamesPlayed}`;
  const rankingText = `${getIconForRank(rank)} ${playerDetails}`;

  const rankElementText = document.createTextNode(rankingText);

  const tag = document.createElement("div");
  tag.classList.add("shadow");
  tag.appendChild(rankElementText);

  const leaderboardEl = document.getElementById("Classement");
  leaderboardEl.appendChild(tag);
};
