// These are global variables
const gameBoard = document.querySelector("#gameboard");
const informationDisplay = document.getElementById("information");
const startCells = ["", "", "", "", "", "", "", "", ""];

// let the circle go first
let turn =  "circle";
informationDisplay.innerText = "Circle goes first";
informationDisplay.style.fontSize = "x-large";

// track status of reset
let restart = false;
let confettiLayer = null;
let confettiTimer = null;
function clearConfetti() {
  clearTimeout(confettiTimer);
  confettiLayer?.remove();
  confettiLayer = null;
}
function celebrateWin() {
  clearConfetti();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confettiLayer = document.createElement('div');
  confettiLayer.className = 'confetti-layer';
  confettiLayer.setAttribute('aria-hidden', 'true');
  const colors = ['#ffcc00', '#00d8bb', '#ff5277', '#7aa7ff', '#ffffff'];
  for (let i = 0; i < 85; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.setProperty('--drift', (Math.random() - 0.5) * 220 + 'px');
    piece.style.setProperty('--spin', (Math.random() - 0.5) * 1400 + 'deg');
    piece.style.animationDuration = 2.4 + Math.random() * 1.2 + 's';
    piece.style.animationDelay = Math.random() * 0.65 + 's';
    confettiLayer.append(piece);
  }
  document.body.append(confettiLayer);
  confettiTimer = setTimeout(clearConfetti, 4400);
}
document.getElementById('tictac-exitbutton').addEventListener('click', clearConfetti);
document.getElementById('tictac-container').addEventListener('keydown', event => {
  if (event.key === 'Escape') clearConfetti();
});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', clearConfetti);

// This sets up the gameboard
function createGameBoard() {
  gameBoard.replaceChildren();
  // this will make the restart button invisible
  document.getElementById("restart").style.display = "none";
  // this builds 9 squares and adss them to the gameboard
  startCells.forEach((cell, index) => {
    const cellElement = document.createElement("button");
    cellElement.type = 'button';
    cellElement.setAttribute('aria-label', 'Square ' + (index + 1) + ', empty');
    cellElement.classList.add("square");
    cellElement.id = index;
    // this adds a click event to each square
    cellElement.addEventListener("click", takeTurn);
    gameBoard.append(cellElement);
  });
}

createGameBoard();
informationDisplay.setAttribute('role', 'status');
document.getElementById('restart').addEventListener('click', () => {
  clearConfetti();
  startCells.fill('');
  turn = 'circle';
  restart = false;
  informationDisplay.innerText = 'Circle goes first';
  createGameBoard();
  gameBoard.firstElementChild.focus();
});

function takeTurn(event) {
  const newSquare = document.createElement("div");
  const target = event.currentTarget;
  // Checks to see if a valid square is clicked
  if (!restart && checkItem(target, turn)) {
    newSquare.classList.add(turn);
    newSquare.setAttribute('aria-hidden', 'true');
    target.append(newSquare);
    target.setAttribute('aria-label', 'Square ' + (Number(target.id) + 1) + ', ' + turn);
    // Checks to se if we have a winner
    if (checkState(turn)) {
      informationDisplay.innerText = (turn === 'circle' ? 'O' : 'X') + ' wins!';
      celebrateWin();
      restart = true;
      document.getElementById("restart").style.display = "inline";
    } else if (checkTieGame()) {
        informationDisplay.innerText = "It is a tie game, please retry!!";
        restart = true;
        document.getElementById("restart").style.display = "inline";
    }
    else{
        if(turn == "circle"){
            turn = "x";
        }
        else{
            turn = "circle";
            
        }
        informationDisplay.innerText = 'It is now ' + turn + "'s turn";
    }
  }
}

// can a square be selected
function checkItem(target, turn) {
  let id = target.id;
  if (startCells[id] == "") {
    startCells[id] = turn;
    return true;
  }
  return false;
}

// Checks for a winner
function checkState(turn) {
  let retValue = false;
  let checkArray = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  checkArray.forEach(function (a) {
    if (
      startCells[a[0]] == turn &&
      startCells[a[1]] == turn &&
      startCells[a[2]] == turn
    ) {
      
      retValue = true;
    }
  });

  return retValue;
}



function checkTieGame() {
  for (let i = 0; i < startCells.length; i++) {
    if (startCells[i] == "") {
      return false;
    }
  }
  return true;
}




