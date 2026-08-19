# Chess Tracker

Application web statique pour suivre des parties d'echecs, visualiser les classements et consulter des statistiques joueurs dynamiques.

## Apercu

Chess Tracker permet de:

- enregistrer des parties;
- suivre un classement par score et un classement Elo;
- analyser l'historique global et recent;
- consulter une page joueur dynamique avec statistiques detaillees;
- pousser les donnees JSON sur GitHub via token.

## Fonctionnalites

- Tableau de bord d'accueil avec top 3 et historique recent trie.
- Historique complet trie du plus recent au plus ancien.
- Classement par victoires et classement Elo.
- Page joueur dynamique `joueur.html?name=<player>`:
	- stats globales (V/N/D, score, Elo);
	- stats par couleur;
	- stats par ouverture;
	- stats par adversaire;
	- 5 dernieres parties.
- Ajout de partie depuis l'interface:
	- commit automatique de `assets/data/matches.json` via API GitHub;
	- option d'ajout auto des joueurs manquants dans `assets/data/players.json`.
- Affichage de la variation Elo par partie dans:
	- l'historique complet;
	- l'historique recent de l'accueil;
	- les dernieres parties sur la page joueur.

## Tech Stack

- HTML
- CSS
- JavaScript (vanilla)
- Bootstrap 5

## Demarrage local

1. Cloner le repository.
2. Ouvrir le dossier dans VS Code.
3. Lancer un serveur statique (exemple avec l'extension Live Server).
4. Ouvrir `index.html`.

Note: les donnees sont lues depuis des JSON heberges sur GitHub (`raw.githubusercontent.com`) via `core/config.js`.

## Utilisation: ajout d'une partie via token GitHub

1. Ouvrir la page `Ajouter une partie` depuis la navbar.
2. Renseigner les infos de la partie.
3. Fournir un token GitHub avec permissions minimales `Contents: Read and write`.
4. Verifier `owner`, `repo`, `branch` et le chemin JSON cible.
5. Valider pour creer le commit.

## Securite

- Le token est saisi cote navigateur et utilise pour appeler l'API GitHub Contents.
- Le token n'est pas persiste par l'application.
- Pour un environnement production, preferer un backend proxy pour ne pas exposer ce flux cote client.

## Structure du projet

```
.
|- index.html
|- classement.html
|- historique.html
|- matelo.html
|- joueur.html
|- ajouter-partie.html
|- style.css
|- assets/
|  |- data/
|     |- matches.json
|     |- players.json
|- core/
	 |- config.js
	 |- nav.js
	 |- index.js
	 |- classement.js
	 |- classement-elo.js
	 |- historique.js
	 |- player-page.js
	 |- player-details.js
	 |- add-match.js
	 |- elo-utils.js
```

## Conventions de donnees

### players.json

```json
{
	"players": [
		{ "name": "Mathieu", "elo": 1399 }
	]
}
```

### matches.json

```json
{
	"matches": [
		{
			"white": { "name": "Mathieu" },
			"black": { "name": "Claude" },
			"winner": "white",
			"date": "12/08/2026",
			"opening": "Viennoise"
		}
	]
}
```

`winner` accepte `white`, `black` ou `Draw`.

## Captures

### Classement

![Ranking](https://user-images.githubusercontent.com/72201530/193772493-386a7228-d240-47fc-9d99-20654ba0752a.png)

### Historique

![History](https://user-images.githubusercontent.com/72201530/193772535-1448bde8-feee-4fca-b82a-b1384a3bb677.png)

### Accueil

![Home](https://user-images.githubusercontent.com/72201530/193772565-b33b7478-edf9-4c99-9e18-d98b9e85e261.png)

## Auteur

- [Knackie](https://github.com/Knackie)
