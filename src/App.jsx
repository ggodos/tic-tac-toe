import { useState, Component } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import crossImg from './assets/x4.png'
import circleImg from './assets/c1.png'

function reverseKeyValues(obj)
{
  return Object.fromEntries(
    Object
      .entries(obj)
      .map(([key, value]) => [value, key])
  )
}

const playerFigureMap = {
  first: 'circle',
  second: 'cross'
}
const figurePlayerMap = reverseKeyValues(playerFigureMap)

function getFigure(player)
{
  return playerFigureMap[player]
}
function getPlayer(figure)
{
  return figurePlayerMap[figure]
}


const imageSize = 32;
const imageMap = {
  'circle': circleImg,
  'cross': crossImg,
}

function Cell(props)
{
  return (
    <div id={props.cellId} className='cell' onClick={props.onClick}>
      <img src={props.imageSource} alt="" min-width={imageSize} />
    </div>
  )
}

class Board extends Component
{
  renderCell(i)
  {
    const cells = this.props.cells
    return <Cell
      cellId={`cell-${i}`}
      imageSource={cells[i].imageSource}
      onClick={() => this.props.onClick(i)} />
  }

  render()
  {
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
    )
  }
}



class App extends Component
{
  constructor(props)
  {
    super(props)
    const gameCells = Array(9).fill().map((v, i) => ({
      value: null,
      used: false,
      imageSource: ''
    }))

    this.state = {
      cells: gameCells,
      current: null,
      turn: 0,
      gameStarted: false
    }
  }
  startGame(settings)
  {
    const { figure } = settings;
    document.getElementById('cross-button').disabled = true
    document.getElementById('circle-button').disabled = true
    this.setState(state => ({
      current: figure,
      turn: state.turn + 1,
      gameStarted: true
    }))
  }


  cellClickHandle(i)
  {
    const { cells, current } = this.state;
    if (cells[i].used)
    {
      return
    }
    const newCells = cells.slice()

    newCells[i] = {
      value: current,
      imageSource: imageMap[current],
      used: true
    }
    const newCurrent = current == getFigure('first') ? getFigure('second') : getFigure('first')

    this.setState({
      cells: newCells,
      current: newCurrent
    })

    const { winner, winCombination } = this.chooseWinner(newCells)
    if (winner)
    {
      this.win(winner, winCombination)
    }
  }

  win(winner, winCombination)
  {
    this.setState({
      gameStarted: false
    })
    console.log(`Winner is ${winner}`);
    console.log(winCombination);
    console.log(this.state.cells);
    winCombination.forEach(v =>
    {
      const el = document.getElementById(`cell-${v}`)
      el.style.backgroundColor = "limegreen"
    })
  }

  chooseWinner(cells)
  {
    const winCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [6, 4, 2]
    ]

    let winner = undefined
    let winCombination = undefined
    winCombinations.forEach(combination =>
    {
      const firstCombinationFigure = cells[combination[0]].value
      const winValid = combination.every((cellNumber) =>
      {
        const cellFigure = cells[cellNumber].value
        // console.log(...combination, ...(combination.map(v => cells[v].value)));
        if (cellFigure == null)
        {
          return false
        }
        return cellFigure == firstCombinationFigure
      })
      if (winValid)
      {
        winner = getPlayer(firstCombinationFigure)
        winCombination = combination
      }
    })
    return { winner, winCombination }
  }


  render()
  {
    const { gameStarted } = this.state
    const handleFunction = gameStarted ? i => this.cellClickHandle(i) : () => { }
    return (
      <div className="App">
        <p>Выбери за кого играть</p>
        <input type="image"
          src={circleImg}
          id='circle-button'
          className='choose-button'
          width={imageSize}
          onClick={() => this.startGame({ figure: "circle" })} />
        <input type="image"
          src={crossImg}
          id='cross-button'
          className='choose-button'
          width={imageSize}
          onClick={() => this.startGame({ figure: "cross" })} />
        <Board cells={this.state.cells} onClick={handleFunction}></Board>
      </div >
    )
  }
}

export default App