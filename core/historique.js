fetch(config.sources.matches)
  .then((response) => response.json())
  .then((data) => {
    var beginClassement;

    for (let i = 0; i < Object.keys(data.matches).length; i++) {
      var joueur1;
      var joueur2;
      if (data.matches[i].winner == "Draw") {
        beginClassement = "Égalité de <a href='players/";
        beginClassement += data.matches[i].white.name;
        beginClassement += "'>";
        beginClassement += data.matches[i].white.name;
        beginClassement += "</a>";
        console.log(joueur1);
        beginClassement += " avec les blancs contre <a href='players/";
        beginClassement += data.matches[i].black.name;
        beginClassement += "'>";
        beginClassement += data.matches[i].black.name;
        beginClassement += "</a>";
      } else if ([data.matches[i].winner] != "Draw") {
        if (data.matches[i].winner == "white") {
          beginClassement = "Victoire de <a href='players/";
          beginClassement += data.matches[i].white.name;
          beginClassement += "'>";
          beginClassement += data.matches[i].white.name;
          beginClassement += "</a> avec les blancs contre <a href='players/";
          beginClassement += data.matches[i].black.name;
          beginClassement += "'>";
          beginClassement += data.matches[i].black.name;
          beginClassement += "</a>";
        } else {
          beginClassement = "Victoire de <a href='players/";
          beginClassement += data.matches[i].black.name;
          beginClassement += "'>";
          beginClassement += data.matches[i].black.name;
          beginClassement += "</a> avec les noirs contre <a href='players/";
          beginClassement += data.matches[i].white.name;
          beginClassement += "'>";
          beginClassement += data.matches[i].white.name;
          beginClassement += "</a>";
        }
      }
      beginClassement += " le ";
      beginClassement += data.matches[i].date;
      beginClassement += " ouverture : ";
      beginClassement += data.matches[i].opening;

      var divId = "div" + i;
      console.log(joueur1);
      var divId = "div" + i;
      var tag = document.createElement(divId);

      var text = document.createTextNode(joueur1);

      var refJoueur1 = document.createTextNode(joueur1);
      var beginClassementRef = document.createTextNode(beginClassement);

      tag.appendChild(beginClassementRef);

      tag.classList.add("shadow");
      var element = document.getElementById("Classement");
      element.appendChild(tag);
      document.querySelector(divId).innerHTML = beginClassement;
    }
  });
