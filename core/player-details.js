const navigateToPlayerDetails = (el, getNameFrom) => {
  const playerName = getNameFrom(el);

  history.pushState({}, "", `#${playerName}`);
  document.title = `♟️ Chess Tracker - ${playerName}`;
};
