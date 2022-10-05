function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue) return key;
  }
}
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

        for (let i = 0; i < sortedAsc.size; i++) {
          const firstValue = Array.from(sortedAsc.keys())[i];
          var tag = document.createElement("div");
          var lineClassement;
          if (i == 0) {
            console.log("i 0");
            lineClassement = "🥇 ";
          } else if (i == 1) {
            lineClassement = "🥈 ";
          } else if (i == 2) {
            lineClassement = "🥉 ";
          } else {
            lineClassement = i + 1;
            lineClassement += " ";
          }
          lineClassement += firstValue + " ";
          lineClassement += " " + gamesWon.get(Array.from(sortedAsc.keys())[i]);
          lineClassement += " / ";
          lineClassement += gamesPlayed.get(Array.from(sortedAsc.keys())[i]);
          var text = document.createTextNode(lineClassement);
          tag.appendChild(text);
          tag.classList.add("shadow");
          var element = document.getElementById("Classement");
          element.appendChild(tag);
        }
      });
  });
