fetch(config.sources.matches)
  .then((response) => response.json())
  .then((data) => {
    var beginClassement;
    const getPlayerLink = (playerName) =>
      `<a href='joueur.html?name=${encodeURIComponent(playerName)}'>${playerName}</a>`;

    for (let i = 0; i < Object.keys(data.matches).length; i++) {
      var joueur1;
      var joueur2;
      if (data.matches[i].winner == "Draw") {
        beginClassement = "Égalité de ";
        beginClassement += getPlayerLink(data.matches[i].white.name);
        console.log(joueur1);
        beginClassement += " avec les blancs contre ";
        beginClassement += getPlayerLink(data.matches[i].black.name);
      } else if ([data.matches[i].winner] != "Draw") {
        if (data.matches[i].winner == "white") {
          beginClassement = "Victoire de ";
          beginClassement += getPlayerLink(data.matches[i].white.name);
          beginClassement += " avec les blancs contre ";
          beginClassement += getPlayerLink(data.matches[i].black.name);
        } else {
          beginClassement = "Victoire de ";
          beginClassement += getPlayerLink(data.matches[i].black.name);
          beginClassement += " avec les noirs contre ";
          beginClassement += getPlayerLink(data.matches[i].white.name);
        }
      }
      beginClassement += " le ";
      beginClassement += data.matches[i].date;
      beginClassement += " ouverture : ";
      beginClassement += data.matches[i].opening;

      var divId = "div" + i;
      console.log(joueur1);
      var divId = "div" + i;
      var tag = document.createElement("div");
      tag.id = divId;
      tag.classList.add("card", "border-0", "shadow-sm", "p-3");
      tag.innerHTML = `<div class="small text-muted mb-2">${data.matches[i].date}</div><div>${beginClassement}</div>`;

      var element = document.getElementById("Classement");
      element.appendChild(tag);
    }
  });
