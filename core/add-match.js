const form = document.getElementById("match-form");
const statusContainer = document.getElementById("status");
const submitButton = document.getElementById("submitButton");

const whitePlayerSelect = document.getElementById("whitePlayer");
const blackPlayerSelect = document.getElementById("blackPlayer");
const winnerSelect = document.getElementById("winner");
const dateInput = document.getElementById("date");
const openingInput = document.getElementById("opening");
const autoAddPlayersInput = document.getElementById("autoAddPlayers");
const newPlayerEloInput = document.getElementById("newPlayerElo");

const tokenInput = document.getElementById("token");
const ownerInput = document.getElementById("owner");
const repoInput = document.getElementById("repo");
const branchInput = document.getElementById("branch");
const pathInput = document.getElementById("path");
const playersPath = "assets/data/players.json";

const formatToday = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const showStatus = (message, type) => {
  statusContainer.innerHTML = `<div class="alert alert-${type} mb-0" role="alert">${message}</div>`;
};

const encodeBase64Utf8 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeBase64Utf8 = (base64Value) => {
  const sanitized = base64Value.replace(/\n/g, "");
  const binary = atob(sanitized);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
};

const githubHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

const fetchPlayers = async () => {
  const response = await fetch(config.sources.players);
  if (!response.ok) {
    throw new Error("Impossible de charger la liste des joueurs.");
  }

  const data = await response.json();
  return data.players.map((player) => player.name);
};

const populatePlayers = (players) => {
  const options = players
    .map((playerName) => `<option value="${escapeHtml(playerName)}">${escapeHtml(playerName)}</option>`)
    .join("");

  whitePlayerSelect.innerHTML = options;
  blackPlayerSelect.innerHTML = options;

  if (players.length > 1) {
    blackPlayerSelect.selectedIndex = 1;
  }
};

const validateFormData = ({ whitePlayer, blackPlayer, date, opening }) => {
  if (!whitePlayer || !blackPlayer) {
    throw new Error("Les deux joueurs sont obligatoires.");
  }

  if (whitePlayer === blackPlayer) {
    throw new Error("Le joueur blanc et le joueur noir doivent être différents.");
  }

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    throw new Error("La date doit être au format JJ/MM/AAAA.");
  }

  if (!opening.trim()) {
    throw new Error("Le nom de l'ouverture est obligatoire.");
  }
};

const ensurePlayerExistsInGithubFile = async ({
  owner,
  repo,
  branch,
  token,
  playerNames,
  initialElo,
}) => {
  const file = await getFileFromGithub({
    owner,
    repo,
    path: playersPath,
    branch,
    token,
  });

  const decoded = decodeBase64Utf8(file.content);
  const parsed = JSON.parse(decoded);

  if (!Array.isArray(parsed.players)) {
    throw new Error("Le fichier players.json est invalide.");
  }

  const existingNames = new Set(parsed.players.map((player) => player.name));
  const missingPlayers = playerNames.filter((name) => !existingNames.has(name));

  if (!missingPlayers.length) {
    return { addedPlayers: [] };
  }

  missingPlayers.forEach((name) => {
    parsed.players.push({ name, elo: initialElo });
  });

  const content = encodeBase64Utf8(JSON.stringify(parsed, null, 2));
  await updateFileOnGithub({
    owner,
    repo,
    path: playersPath,
    branch,
    token,
    sha: file.sha,
    content,
    message: `chore(players): add ${missingPlayers.join(", ")}`,
  });

  return { addedPlayers: missingPlayers };
};

const getFileFromGithub = async ({ owner, repo, path, branch, token }) => {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: githubHeaders(token),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "Erreur lors de la lecture du fichier cible sur GitHub.");
  }

  return response.json();
};

const updateFileOnGithub = async ({ owner, repo, path, branch, token, sha, content, message }) => {
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content,
      sha,
      branch,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || "Erreur lors de l'écriture sur GitHub.");
  }

  return response.json();
};

const setupDefaults = () => {
  dateInput.value = formatToday();
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = tokenInput.value.trim();
  const owner = ownerInput.value.trim();
  const repo = repoInput.value.trim();
  const branch = branchInput.value.trim();
  const path = pathInput.value.trim();

  const whitePlayer = whitePlayerSelect.value;
  const blackPlayer = blackPlayerSelect.value;
  const winner = winnerSelect.value;
  const date = dateInput.value.trim();
  const opening = openingInput.value.trim();
  const autoAddPlayers = autoAddPlayersInput.checked;
  const initialElo = Number(newPlayerEloInput.value);

  try {
    if (!token || !owner || !repo || !branch || !path) {
      throw new Error("Tous les champs GitHub sont obligatoires.");
    }

    validateFormData({ whitePlayer, blackPlayer, date, opening });

    if (autoAddPlayers && (!Number.isInteger(initialElo) || initialElo < 100 || initialElo > 4000)) {
      throw new Error("L'Elo initial doit être un nombre entier entre 100 et 4000.");
    }

    submitButton.disabled = true;

    let addedPlayers = [];
    if (autoAddPlayers) {
      showStatus("Vérification des joueurs dans players.json...", "info");
      const playersResult = await ensurePlayerExistsInGithubFile({
        owner,
        repo,
        branch,
        token,
        playerNames: [whitePlayer, blackPlayer],
        initialElo,
      });
      addedPlayers = playersResult.addedPlayers;
    }

    showStatus("Lecture du fichier actuel sur GitHub...", "info");

    const currentFile = await getFileFromGithub({
      owner,
      repo,
      path,
      branch,
      token,
    });

    const fileContent = decodeBase64Utf8(currentFile.content);
    const parsedContent = JSON.parse(fileContent);

    if (!parsedContent.matches || !Array.isArray(parsedContent.matches)) {
      throw new Error("Le fichier JSON cible ne contient pas de tableau 'matches'.");
    }

    const newMatch = {
      white: { name: whitePlayer },
      black: { name: blackPlayer },
      winner,
      date,
      opening,
    };

    parsedContent.matches.push(newMatch);

    const nextContent = JSON.stringify(parsedContent, null, 2);
    const encodedContent = encodeBase64Utf8(nextContent);

    showStatus("Création du commit GitHub...", "warning");

    const commitMessage = `chore(matches): add ${whitePlayer} vs ${blackPlayer} (${date})`;
    const updateResponse = await updateFileOnGithub({
      owner,
      repo,
      path,
      branch,
      token,
      sha: currentFile.sha,
      content: encodedContent,
      message: commitMessage,
    });

    const commitUrl = updateResponse.commit && updateResponse.commit.html_url
      ? updateResponse.commit.html_url
      : `https://github.com/${owner}/${repo}`;

    const playersAddedText = addedPlayers.length
      ? ` Nouveaux joueurs ajoutés: ${addedPlayers.join(", ")}.`
      : "";

    showStatus(
      `Partie ajoutée et commit créé avec succès.${playersAddedText} <a href="${escapeHtml(commitUrl)}" target="_blank" rel="noreferrer">Voir le commit</a>.`,
      "success"
    );

    tokenInput.value = "";
    openingInput.value = "";
  } catch (error) {
    showStatus(escapeHtml(error.message || "Erreur inconnue."), "danger");
  } finally {
    submitButton.disabled = false;
  }
});

(async () => {
  setupDefaults();

  try {
    const players = await fetchPlayers();
    if (!players.length) {
      throw new Error("Aucun joueur trouvé.");
    }

    populatePlayers(players);
  } catch (error) {
    showStatus(escapeHtml(error.message || "Erreur de chargement des joueurs."), "danger");
    submitButton.disabled = true;
  }
})();
