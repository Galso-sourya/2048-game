import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)//new tile will be created on game board
grid.randomEmptyCell().tile = new Tile(gameBoard)//this is written 2 times because when we open the 
//game, only 2 tiles appers. one is of 2 and another is of 4.
setupInput()

function setupInput() {
  window.addEventListener("keydown", handleInput, { once: true })//this tells once the animation is finished,
  //then only we can type the below arrow key.
}
//async await must be used to finish the arrow functions before the animation and merging effect.
//we are using promise for the same purpose
async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput()
        return
      }
      await moveUp()
      break
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput()
        return
      }
      await moveDown()
      break
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput()
        return
      }
      await moveLeft()
      break
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput()
        return
      }
      await moveRight()
      break
    default:
      setupInput()//if we are not typing any of the arrow keys, or  //any other keys, the game is waiting 
      //to take the input from user and return it immediately(the function)
      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      alert("You lose")
    })
    return
  }

  setupInput()
}

function moveUp() {
  //slideTiles is a helper function
  return slideTiles(grid.cellsByColumn)//when we are typing the up keys, the cells moves by the column,
  //not by rows. 
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
  return slideTiles(grid.cellsByRow)
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}
//row by row or column by column movement when we press arrow keys
function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {//here group represents a columns
      const promises = []
      for (let i = 1; i < group.length; i++) {
        const cell = group[i]
        if (cell.tile == null) continue
        let lastValidCell
        for (let j = i - 1; j >= 0; j--) {//checking the remaining cells above the column. whether we 
          //can move a tile above if it is vacant
          const moveToCell = group[j]//moveToCell is just the above cell(immediate)
          if (!moveToCell.canAccept(cell.tile)) break//if we can not move the tile by 1 unit also,
          //we should break it. because we can not cross it.
          lastValidCell = moveToCell
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }
          cell.tile = null//now the tile is finally moved from the previous position
        }
      }
      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}
//if any condition returns true, the function will return true as a whole
function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false//uppermost cells can not be moved above further
      if (cell.tile == null) return false//if the cell is empty also, do not move
      const moveToCell = group[index - 1]//check just immediate above cell
      return moveToCell.canAccept(cell.tile)
    })
  })
}
