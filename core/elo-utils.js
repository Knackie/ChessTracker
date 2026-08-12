(function () {
  const DEFAULT_INITIAL_ELO = 1399;
  const DEFAULT_K_FACTOR = 20;

  const toComparableDate = (dateText) => {
    if (!dateText) return 0;

    const [day, month, year] = String(dateText).split("/").map(Number);
    if (!day || !month) return 0;

    const resolvedYear = year || new Date().getFullYear();
    return new Date(resolvedYear, month - 1, day).getTime();
  };

  const sortMatchesWithIndex = (matches, direction) => {
    const safeMatches = Array.isArray(matches) ? matches : [];
    const sign = direction === "asc" ? 1 : -1;

    return safeMatches
      .map((match, index) => ({ match, index }))
      .sort((a, b) => {
        const dateDelta = toComparableDate(a.match.date) - toComparableDate(b.match.date);
        if (dateDelta !== 0) {
          return sign * dateDelta;
        }

        // Stable order for same day: oldest first in asc, newest first in desc.
        return sign * (a.index - b.index);
      });
  };

  const computeEloDeltas = (players, matches, options) => {
    const kFactor = (options && Number(options.kFactor)) || DEFAULT_K_FACTOR;
    const defaultInitialElo =
      (options && Number(options.defaultInitialElo)) || DEFAULT_INITIAL_ELO;

    const ratings = new Map(
      (Array.isArray(players) ? players : []).map((player) => [
        player.name,
        Number(player.elo),
      ])
    );

    const deltasByMatchIndex = new Map();
    const orderedAsc = sortMatchesWithIndex(matches, "asc");

    for (let i = 0; i < orderedAsc.length; i++) {
      const entry = orderedAsc[i];
      const match = entry.match;
      const whiteName = match && match.white && match.white.name;
      const blackName = match && match.black && match.black.name;

      if (!whiteName || !blackName) {
        continue;
      }

      if (!ratings.has(whiteName)) {
        ratings.set(whiteName, defaultInitialElo);
      }
      if (!ratings.has(blackName)) {
        ratings.set(blackName, defaultInitialElo);
      }

      const whiteBefore = ratings.get(whiteName);
      const blackBefore = ratings.get(blackName);

      const expectedWhite = 1 / (1 + Math.pow(10, (blackBefore - whiteBefore) / 400));
      const expectedBlack = 1 - expectedWhite;

      const winner = String(match.winner || "").toLowerCase();
      let scoreWhite = 0;
      let scoreBlack = 0;

      if (winner === "draw") {
        scoreWhite = 0.5;
        scoreBlack = 0.5;
      } else if (winner === "white") {
        scoreWhite = 1;
        scoreBlack = 0;
      } else if (winner === "black") {
        scoreWhite = 0;
        scoreBlack = 1;
      } else {
        continue;
      }

      const whiteDelta = kFactor * (scoreWhite - expectedWhite);
      const blackDelta = kFactor * (scoreBlack - expectedBlack);

      const whiteAfter = whiteBefore + whiteDelta;
      const blackAfter = blackBefore + blackDelta;

      ratings.set(whiteName, whiteAfter);
      ratings.set(blackName, blackAfter);

      deltasByMatchIndex.set(entry.index, {
        whiteDelta,
        blackDelta,
        whiteBefore,
        blackBefore,
        whiteAfter,
        blackAfter,
      });
    }

    return {
      deltasByMatchIndex,
      finalRatings: ratings,
    };
  };

  window.EloUtils = {
    toComparableDate,
    sortMatchesWithIndex,
    computeEloDeltas,
  };
})();
