import { Component } from "react";
import { flushSync } from "react-dom";
import "./App.css";
import crossImg from "./assets/x4.png";
import circleImg from "./assets/c1.png";
import { makeAITurn, getWinCombination } from "./AIBrain";

const Figure = {
  circle: "circle",
  cross: "cross",
};

const AITurnDelay = 150;

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
    return (
      <div id="game-related">
        <p>
          <span id="current-layer">{props.winMessage}</span>
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
      winMessage: "лол",
      turn: 1,
    };
  }

  render() {
    const { gameStarted, gameEnded, isHumanTurn, cells, winMessage } =
      this.state;

    let handleFunction = (_) => {};
    if (isHumanTurn) {
      handleFunction = (i) => this.cellClickHandle(i);
    }

    return (
      <div className="App">
        <GameRelated
          circleHandler={() => this.startGame({ isHumanTurn: false })}
          crossHandler={() => this.startGame({ isHumanTurn: true })}
          cells={cells}
          gameStarted={gameStarted}
          gameEnded={gameEnded}
          isHumanTurn={isHumanTurn}
          winMessage={winMessage}
          handleFunction={handleFunction}
        ></GameRelated>
      </div>
    );
  }

  startGame(settings) {
    const { isHumanTurn } = settings;

    if (isHumanTurn) {
      this.setState({
        humanFigure: Figure.cross,
        AIFigure: Figure.circle,
        isHumanTurn: true,
        gameStarted: true,
      });
    } else {
      flushSync(() => {
        this.setState({
          humanFigure: Figure.circle,
          AIFigure: Figure.cross,
          isHumanTurn: false,
          gameStarted: true,
        });
      });
      this.AITurn();
    }
  }

  setupHumanTurn() {
    flushSync(() => {
      this.setState({
        isHumanTurn: true,
      });
    });
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
    const { cells, humanFigure, turn } = this.state;
    if (cells[i].used) {
      return;
    }

    const newCells = this.makeTurn(i, humanFigure);

    const winCombination = getWinCombination(
      newCells.map((item) => item.value)
    );
    flushSync(() => {
      this.setState({
        cells: newCells,
        isHumanTurn: false,
        turn: turn + 1,
      });
    });
    if (winCombination) {
      const winner = newCells[winCombination[0]];
      // flushSync(() => {
      //   this.setState({
      //     cells: newCells,
      //     turn: turn + 1,
      //   });
      // });
      this.win(winner, winCombination);
    } else if (
      newCells.every((cell) => {
        return cell.value != null;
      })
    ) {
      // ничья
      this.tie();
    } else {
      // не победил
      // flushSync(() => {
      //   this.setState({
      //     cells: newCells,
      //     isHumanTurn: false,
      //     turn: turn + 1,
      //   });
      // });
      // setTimeout(() => this.AITurn(), 250);
      this.AITurn();
      console.log("ИИ сходил");
    }
  }

  AITurn() {
    const { cells, turn, AIFigure, humanFigure } = this.state;

    let newCells = [];
    console.log(cells);
    let i = makeAITurn(
      cells.map((item) => item.value),
      AIFigure,
      humanFigure,
      AIFigure
    );
    console.log(i);
    newCells = this.makeTurn(i, AIFigure);
    flushSync(() => {
      this.setState({
        cells: newCells,
        isHumanTurn: true,
        turn: turn + 1,
      });
    });

    const winCombination = getWinCombination(
      newCells.map((item) => item.value)
    );
    if (winCombination) {
      const winner = newCells[winCombination[0]];
      this.win(winner, winCombination);
    }
  }

  tie() {
    console.log("случился прикол");
  }

  win(winner, winCombination) {
    flushSync(() => {
      this.setState({
        gameStarted: false,
        gameEnded: true,
        winMessage: `Победил {winner}`,
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
