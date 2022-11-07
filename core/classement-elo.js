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

		for (let i = Object.keys(data.matches).length - 1; i >= 0; i--) {
			console.log(player);
			for (let j = 0; j <  Object.keys(player.players).length; j++)
				if (player.players[j].name == data.matches[i].white.name) 
				{
					whiteIndex = j;
					console.log(whiteIndex);
					whiteElo = player.players[whiteIndex].elo;
					console.log(whiteElo);
				}
				else if (player.players[j].name == data.matches[i].black.name) 
				{
					blackIndex = j;
					console.log(blackIndex);
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
			player.players[blackIndex].elo = Math.floor(blackElo + 20 * (0.5 - oddsBlack));
			player.players[whiteIndex].elo = Math.floor(whiteElo + 20 * (0.5 - oddsWhite));
			console.log(whiteElo);
			console.log(blackElo);  
		  } else if ([data.matches[i].winner] != "Draw") {
			if (data.matches[i].winner == "white") {
			  player.players[whiteIndex].elo = Math.floor(whiteElo + 20 * (1 - oddsWhite));
			  player.players[blackIndex].elo = Math.floor(blackElo + 20 * (0 - oddsBlack));
			console.log(whiteElo);
			console.log(blackElo); 
			} 
			  else {
			  player.players[blackIndex].elo = Math.floor(blackElo + 20 * (1 - oddsBlack));
			  player.players[whiteIndex].elo = Math.floor(whiteElo + 20 * (0 - oddsWhite));
			console.log(whiteElo);
			console.log(blackElo); 
			}
		  }
		}
			let rank = 0;
  let rankMap = [];
  const currentRank = new Map()
  for (let j = 0; j <  Object.keys(player.players).length; j++) {
	currentRank.set(player.players[j].name, player.players[j].elo)
  }
  const sortNumAsc = new Map([...currentRank.entries()].sort((a, b) => b[1] - a[1]));
  console.log(sortNumAsc);
 for (const [player, elo] of sortNumAsc.entries()) {
    rankMap.push("element-"+rank);
    createRankEl(rank++, player, elo);
  }
 }); 
});



const getIconFor = (rank) => {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  else return (++rank).toString();
};

const createRankEl = (rank, playerName, elo) => {
  const rankingText = `${getIconFor(
    rank
  )} ${playerName} ${elo}`;
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

