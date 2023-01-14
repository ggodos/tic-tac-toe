let validFigures = [];

export function getWinCombination(cells) {
  const winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2],
  ];
  let winCombination = null;
  winCombinations.forEach((combination) => {
    const firstCombinationValue = cells[combination[0]];
    const isWin = combination.every((cellIdx) => {
      const figure = cells[cellIdx];
      return figure == firstCombinationValue && validFigures.includes(figure);
    });
    if (isWin) {
      winCombination = combination;
    }
  });
  return winCombination;
}

function checkTie(cells) {
  return cells.every((cell) => validFigures.includes(cell));
}

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 *
 * @param {Array<string>} cells: массив фигур, где индекс 0 - первая клетка
 * @param {string} yourFigure
 * @param {string} enemyFigure
 * @param {int} currentFigure
 */
export function makeAITurn(cells, yourFigure, enemyFigure, currentFigure) {
  // const cellsNumberRepresintation = cellsToInt(cells, yourFigure, enemyFigure);
  validFigures = [yourFigure, enemyFigure];
  const anotherFigure = {};
  anotherFigure[yourFigure] = enemyFigure;
  anotherFigure[enemyFigure] = yourFigure;

  if (cells.every((figure) => !validFigures.includes(figure))) {
    return randomItem([0, 2, 4, 6, 8]);
  }

  function minimax(cells, currentFigure, maximazing, depth) {
    let freeCellsIdxs = [];
    cells.forEach((cell, idx) => {
      if (cell != yourFigure && cell != enemyFigure) {
        freeCellsIdxs.push(idx);
      }
    });

    if (depth == 0) {
      let maxCost = { idx: 0, value: -100 };
      freeCellsIdxs.forEach((cellIdx) => {
        // find max
        const newCells = cells.slice();
        newCells[cellIdx] = currentFigure;
        const moveCost = minimax(
          newCells,
          anotherFigure[currentFigure],
          !maximazing,
          depth + 1
        );
        if (moveCost.value > maxCost.value) {
          maxCost = { idx: cellIdx, value: moveCost.value };
        }
      });
      return maxCost;
    }

    const winCombination = getWinCombination(cells, [yourFigure, enemyFigure]);
    if (winCombination) {
      const winFigure = cells[winCombination[0]];
      if (winFigure == yourFigure) {
        return { value: 100 - depth };
      } else if (winFigure == enemyFigure) {
        return { value: -100 + depth };
      }
    }
    const isTie = checkTie(cells);
    if (isTie) {
      return { value: 0 };
    }

    // найти max/min от всех freeCellsIdx
    // depth + 1
    // maximazing = !maximazing
    if (maximazing) {
      let maxCost = { idx: freeCellsIdxs[0], value: -100 };
      // console.log(freeCellsIdxs);
      freeCellsIdxs.forEach((cellIdx) => {
        const newCells = cells.slice();
        newCells[cellIdx] = currentFigure;
        const moveCost = minimax(
          newCells,
          anotherFigure[currentFigure],
          !maximazing,
          depth + 1
        );
        if (moveCost.value > maxCost.value) {
          maxCost = { idx: cellIdx, value: moveCost.value };
        }
      });
      return maxCost;
    } else {
      let minCost = { idx: freeCellsIdxs[0], value: 100 };
      freeCellsIdxs.forEach((cellIdx) => {
        const newCells = cells.slice();
        newCells[cellIdx] = currentFigure;
        const moveCost = minimax(
          newCells,
          anotherFigure[currentFigure],
          !maximazing,
          depth + 1
        );
        if (moveCost.value < minCost.value) {
          minCost = { idx: cellIdx, value: moveCost.value };
        }
      });
      return minCost;
    }
  }

  const { idx } = minimax(cells, currentFigure, true, 0);
  return idx;
}

// let move = makeTurn(Array(9).fill("-"), "O", "X", "X");
let move = makeAITurn(
  ["X", "-", "-", "-", "O", "-", "-", "-", "-"],
  "X",
  "O",
  "X"
);
console.log(move);
