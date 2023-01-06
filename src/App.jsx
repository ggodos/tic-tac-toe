import { Component } from "react";
import { flushSync } from "react-dom";
import "./App.css";
import crossImg from "./assets/x4.png";
import circleImg from "./assets/c1.png";

const Figure = {
  circle: "circle",
  cross: "cross",
};

const imageSize = 48;
const selectButtonSize = 32;
const imageMap = {
  circle: circleImg,
  cross: crossImg,
};

function Cell(props) {
  return (
    <div id={props.cellId} className="cell" onClick={props.onClick}>
      <img src={props.imageSource} alt="" min-width={imageSize} />
    </div>
  );
}

class Board extends Component {
  renderCell(i) {
    const cells = this.props.cells;
    return (
      <Cell
        cellId={`cell-${i}`}
        imageSource={cells[i].imageSource}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div id="board">
        <div className="board-row">
          {this.renderCell(0)}
          {this.renderCell(1)}
          {this.renderCell(2)}
        </div>
        <div className="board-row">
          {this.renderCell(3)}
          {this.renderCell(4)}
          {this.renderCell(5)}
        </div>
        <div className="board-row">
          {this.renderCell(6)}
          {this.renderCell(7)}
          {this.renderCell(8)}
        </div>
      </div>
    );
  }
}

function GameRelated(props) {
  if (props.gameStarted) {
    const playerName = props.isHumanTurn ? "Ваш ход:" : "Ход ИИ:";
    return (
      <div id="game-related">
        <p>
          <span id="current-layer">{playerName}</span>
        </p>
        <Board cells={props.cells} onClick={props.handleFunction}></Board>
      </div>
    );
  } else if (props.gameEnded) {
    const playerName = props.isHumanTurn ? "Вы победили!" : "ИИ победил!";
    return (
      <div id="game-related">
        <p>
          <span id="current-layer">{playerName}</span>
        </p>
        <Board cells={props.cells} onClick={() => {}}></Board>
      </div>
    );
  } else {
    return (
      <div id="game-related">
        <p>Выберите за кого играть:</p>
        <input
          type="image"
          src={circleImg}
          id="circle-button"
          className="choose-button"
          width={selectButtonSize}
          onClick={props.circleHandler}
        />
        <input
          type="image"
          src={crossImg}
          id="cross-button"
          className="choose-button"
          width={selectButtonSize}
          onClick={props.crossHandler}
        />
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    const gameCells = Array(9)
      .fill()
      .map(() => ({
        value: null, // фигура для проверки победы
        imageSource: "", // путь для отрисовки фигуры
        used: false, // была ли выбрана
      }));

    this.state = {
      cells: gameCells,
      humanFigure: "",
      AIFigure: "",
      isHumanTurn: false,
      gameStarted: false,
      gameEnded: false,
    };
  }

  render() {
    const { gameStarted, gameEnded, isHumanTurn, cells } = this.state;

    let handleFunction = (_) => {};
    if (isHumanTurn) {
      handleFunction = (i) => this.cellClickHandle(i);
    }

    return (
      <div className="App">
        <GameRelated
          circleHandler={() => this.startGame({ isHumanTurn: true })}
          crossHandler={() => this.startGame({ isHumanTurn: false })}
          cells={cells}
          gameStarted={gameStarted}
          gameEnded={gameEnded}
          isHumanTurn={isHumanTurn}
          handleFunction={handleFunction}
        ></GameRelated>
      </div>
    );
  }

  startGame(settings) {
    const { isHumanTurn } = settings;

    if (isHumanTurn) {
      this.setState({
        humanFigure: Figure.circle,
        AIFigure: Figure.cross,
        isHumanTurn: true,
        gameStarted: true,
      });
    } else {
      this.setState(
        {
          humanFigure: Figure.cross,
          AIFigure: Figure.circle,
          isHumanTurn: false,
          gameStarted: true,
        },
        () => this.AITurn()
      );
    }
  }

  makeTurn(i, figure) {
    const newCells = this.state.cells.slice();
    newCells[i] = {
      value: figure,
      imageSource: imageMap[figure],
      used: true,
    };
    return newCells;
  }

  cellClickHandle(i) {
    const { cells, humanFigure } = this.state;
    if (cells[i].used) {
      return;
    }

    const newCells = this.makeTurn(i, humanFigure);

    const { winner, winCombination } = this.chooseWinner(newCells, humanFigure);
    if (winner) {
      flushSync(() => {
        this.setState({
          cells: newCells,
        });
      });
      this.win(winner, winCombination);
    } else if (
      newCells.every((cell) => {
        return cell.value != null;
      })
    ) {
      // ничья
    } else {
      flushSync(() => {
        this.setState({
          cells: newCells,
          isHumanTurn: false,
        });
      });
      this.AITurn();
    }
  }

  AITurn() {
    const { AIFigure, cells } = this.state;

    let newCells = [];

    console.log(cells);
    if (cells.every((cell) => cell.value == null)) {
      newCells = this.makeTurn(4, AIFigure);
    } else {
      console.log("not empty");
      newCells = cells;
    }
    flushSync(() => {
      this.setState({
        cells: newCells,
        isHumanTurn: true,
      });
    });

    const { winner, winCombination } = this.chooseWinner(newCells, AIFigure);
    if (winner) {
      this.win(winner, winCombination);
    }
  }

  chooseWinner(cells, figure) {
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

    let winner = undefined;
    let winCombination = undefined;
    winCombinations.forEach((combination) => {
      const firstCombinationFigure = cells[combination[0]].value;
      const winValid = combination.every((cellNumber) => {
        const cellFigure = cells[cellNumber].value;
        if (cellFigure == null) {
          return false;
        }
        return cellFigure == firstCombinationFigure;
      });
      if (winValid) {
        winner = figure == firstCombinationFigure ? "human" : "AI";
        winCombination = combination;
      }
    });
    return { winner, winCombination };
  }

  win(winner, winCombination) {
    flushSync(() => {
      this.setState({
        gameStarted: false,
        gameEnded: true,
      });
    });

    console.log(`Winner is ${winner}`);
    console.log(winCombination);
    console.log(this.state.cells);
    winCombination.forEach((v) => {
      const el = document.getElementById(`cell-${v}`);
      el.style.backgroundColor = "limegreen";
    });
  }
}

export default App;
