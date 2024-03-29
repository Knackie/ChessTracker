function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue) return key;
  }
}
var player;
fetch(
  "https://raw.githubusercontent.com/Knackie/ChessTracker/main/assets/data/players.json"
)
  .then((response) => response.json())
  .then((p) => {
    player = p;
    console.log(player);

    fetch(
      "https://raw.githubusercontent.com/Knackie/ChessTracker/main/assets/data/matches.json"
    )
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
        for (let i = 0; i < 3; i++) {
          if ([data.matches[i].winner] != "Draw") {
            var affichageWin = "Victoire de ";
            affichageWin += data.matches[i][data.matches[i].winner].name;

            if (data.matches[i].winner == "white") {
              affichageWin += " avec les blancs contre ";
              affichageWin += data.matches[i].black.name;
            } else {
              affichageWin += " avec les noirs contre ";
              affichageWin += data.matches[i].white.name;
            }
          } else {
            var affichageWin = "Égalité de ";
            affichageWin += data.matches[i].white.name;
            affichageWin += " avec les blancs contre ";
            affichageWin += data.matches[i].black.name;
          }
          affichageWin += " le ";
          affichageWin += data.matches[i].date;
          affichageWin += " ouverture : ";
          affichageWin += data.matches[i].opening;
          document.querySelector("#HistoFirst" + i).innerText = affichageWin;
        }

        max = 0;
        const sortedAsc = new Map(
          [...gamesWon.entries()].sort((a, b) => b[1] - a[1])
        );
        console.log(sortedAsc);
        console.log("sortedAsc");

        const firstValue = Array.from(sortedAsc.keys())[0];
        document.querySelector("#First").innerText += firstValue;

        var pourcent = " " + gamesWon.get(Array.from(sortedAsc.keys())[0]);
        pourcent += " / ";
        pourcent += gamesPlayed.get(Array.from(sortedAsc.keys())[0]);
        document.querySelector("#First").innerText += pourcent;
        document.querySelector("#Second").innerText += Array.from(
          sortedAsc.keys()
        )[1];
        pourcent = " " + gamesWon.get(Array.from(sortedAsc.keys())[1]);
        pourcent += " / ";
        pourcent += gamesPlayed.get(Array.from(sortedAsc.keys())[1]);

        document.querySelector("#Second").innerText += pourcent;
        document.querySelector("#Third").innerText += Array.from(
          sortedAsc.keys()
        )[2];
        pourcent = " " + gamesWon.get(Array.from(sortedAsc.keys())[2]);
        pourcent += " / ";
        pourcent += gamesPlayed.get(Array.from(sortedAsc.keys())[2]);

        document.querySelector("#Third").innerText += pourcent;
        console.log(data);
      });
  });
