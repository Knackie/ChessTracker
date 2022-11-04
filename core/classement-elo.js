var player;
fetch(config.sources.players)
  .then((response) => response.json())
  .then((p) => {
    player = p;
    console.log(player);

	fetch(config.sources.matches)
	  .then((response) => response.json())
	  .then((data) => {
		var beginClassement;
		var whiteIndex;
		var blackIndex;
		var blackElo;
		var whiteElo;

		for (let i = 0; i < Object.keys(data.matches).length; i++) {
			console.log(player);
			for (let j = 0; j <  Object.keys(player.players).length; j++)
				if (player.players[j].name == data.matches[i].white.name) 
				{
					whiteIndex = j;
					console.log(whiteIndex);
					console.log("whiteIndex");
					whiteElo = player.players[whiteIndex].elo;
					console.log("whiteElo");
					console.log(whiteElo);
				}
				else if (player.players[j].name == data.matches[i].black.name) 
				{
					blackIndex = j;
					console.log(blackIndex);
					console.log("blackIndex");
					blackElo = player.players[j].elo;
					console.log(blackElo);
				}
			
			var odds = Math.pow(10, (whiteElo - blackElo)/400);
			console.log(odds);
			var oddsBlack = 1/(1+odds);
			var oddsWhite = 1 - oddsBlack;
			console.log(oddsBlack);
			console.log(oddsWhite);
		  if (data.matches[i].winner == "Draw") {
			beginClassement = "Égalité de <a href='players/";
			beginClassement += data.matches[i].white.name;
			beginClassement += "'>";
			beginClassement += data.matches[i].white.name;
			beginClassement += "</a>";
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
		  var divId = "div" + i;
		  var tag = document.createElement(divId);

		  var text = document.createTextNode("joueur1");

		  var refJoueur1 = document.createTextNode("joueur1");
		  var beginClassementRef = document.createTextNode(beginClassement);

		  tag.appendChild(beginClassementRef);

		  tag.classList.add("shadow");
		  var element = document.getElementById("Classement-elo");
		  element.appendChild(tag);
		  document.querySelector(divId).innerHTML = beginClassement;
		}
	  });
  });
