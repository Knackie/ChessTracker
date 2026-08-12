const getPlayerPageUrl = (playerName) =>
  `joueur.html?name=${encodeURIComponent(playerName)}`;

const getPlayerNameFromCard = (el) => {
  if (!el) return "";

  if (el.dataset && el.dataset.playerName) {
    return el.dataset.playerName.trim();
  }

  const highlightedName = el.querySelector(".fw-bold");
  if (highlightedName && highlightedName.textContent) {
    return highlightedName.textContent.trim();
  }

  const text = (el.textContent || "").trim();
  return text.split("\n")[0].replace(/[🥇🥈🥉]/g, "").replace(/^\d+\s*/, "").trim();
};

const registerIndexListeners = () => {
  ["First", "Second", "Third"]
  .map((id) => document.getElementById(id))
 
  .forEach((el) => {
    if (!el) return;
    const getName = () => getPlayerNameFromCard(el);
    el.onclick = () => navigateToPlayerDetails(el, getName);
  });
}

const navigateToPlayerDetails = (el, getNameFrom) => {
  const playerName = getNameFrom(el);
  window.location.href = getPlayerPageUrl(playerName);
};

const navigateToPlayerDetailsScoreboard = (el, playerName) => {
  window.location.href = getPlayerPageUrl(playerName);
};
