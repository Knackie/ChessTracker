const rootUrl = "https://raw.githubusercontent.com/Knackie/ChessTracker";

const getAssetsPathFor = (fileName) =>
  `${rootUrl}/main/assets/data/${fileName}.json`;

const config = {
  sources: {
    matches: getAssetsPathFor("matches"),
    players: getAssetsPathFor("players"),
  },
};
