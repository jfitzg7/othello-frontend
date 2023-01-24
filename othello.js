const squaresList = document.querySelectorAll(".square");
const newGameBtn = document.querySelector("#new-game-btn");
const scoreBoard = document.querySelector(".scoreboard");

const WHITE_DISK = 1;
const BLACK_DISK = -1;
const NO_DISK = 0;
const startingBoard = [[0, 0, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 1, -1, 0, 0, 0],
                     [0, 0, 0, -1, 1, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0, 0, 0, 0]];

// Use a trick to deep clone the startingBoard
// https://dev.to/samanthaming/how-to-deep-clone-an-array-in-javascript-3cig
let currentBoard = JSON.parse(JSON.stringify(startingBoard));;
let whosTurn = BLACK_DISK;
let gameOver = false;
let scores = {WHITE_DISK: 2, BLACK_DISK: 2};

function handleMove(e) {
    if (!e.srcElement.classList.contains("square") || gameOver) {
        return;
    }

    const validMovesList = getValidMoves(currentBoard, whosTurn);
    const opponentValidMovesList = getValidMoves(currentBoard, -whosTurn);
    const squareNum = Number(e.srcElement.id.substring(6));
    console.log(validMovesList);
    console.log(`Whos Turn: ${whosTurn}`);

    if (validMovesList.includes(squareNum)) {
        if (whosTurn === BLACK_DISK) {
            updateBoard(squareNum, BLACK_DISK);
        }
        else {
            updateBoard(squareNum, WHITE_DISK);
        }
        scores = updateScores();
        whosTurn = -whosTurn;
    }

    if (validMovesList.length == 0 && opponentValidMovesList.length == 0) {
        handleGameOver(currentBoard);
        return;
    }

    else if (validMovesList.length == 0) {
        console.log(`Player ${whosTurn} must pass their turn`);
        whosTurn = -whosTurn
    }
}

function getValidMoves(board, player) {
    let validMovesList = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j] == 0 && canTrapEnemyPieces(board, player, i, j)) {
                validMovesList.push((i * 8 + j));
            }
        }
    }
    return validMovesList;
}

function handleGameOver(currentBoard) {
    gameOver = true;
    let counts = {};
    for (let i = 0; i < currentBoard.length; i++) {
        for (let j = 0; j < currentBoard.length; j++) {
            const squareVal = currentBoard[i][j];
            counts[squareVal] = counts[squareVal] ? counts[squareVal] + 1 : 1;
        }
    }
    console.log("Game Over!");
    console.log(counts);
}

function canTrapEnemyPieces(board, player, i, j) {
    return getNumKilledEnemy(board, player, i, j, 1, 1) ||
        getNumKilledEnemy(board, player, i, j, 1, 0) ||
        getNumKilledEnemy(board, player, i, j, 1, -1) ||
        getNumKilledEnemy(board, player, i, j, -1, 1) ||
        getNumKilledEnemy(board, player, i, j, -1, 0) ||
        getNumKilledEnemy(board, player, i, j, -1, -1) ||
        getNumKilledEnemy(board, player, i, j, 0, 1) ||
        getNumKilledEnemy(board, player, i, j, 0, -1);
}

function getNumKilledEnemy(board, player, x, y, deltaX, deltaY) {
    const FRIENDLY = player;
    const ENEMY = -FRIENDLY;

    let nextX = x + deltaX;
    let nextY = y + deltaY;

    if (
        isOutOfBounds(nextX, board.length) ||
        isOutOfBounds(nextY, board.length) ||
        board[nextX][nextY] != ENEMY 
    ) {
        return 0;
    }

    let count = 0;

    while (
        !isOutOfBounds(nextX, board.length) &&
        !isOutOfBounds(nextY, board.length) &&
        board[nextX][nextY] == ENEMY
    ) {
        nextX += deltaX;
        nextY += deltaY;
        count++;
    }

    if (
        isOutOfBounds(nextX, board.length) ||
        isOutOfBounds(nextY, board.length) ||
        board[nextX][nextY] != FRIENDLY
    ) {
        return 0;
    } 
    else {
        return count;
    }

}

function isOutOfBounds(coordinate, boardLength) {
    return coordinate < 0 || coordinate >= boardLength;
}

function updateBoard(action, player) {
    x = Math.floor(action / currentBoard.length);
    y = action % currentBoard.length;
    for (let delta_x = -1; delta_x < 2; delta_x++) {
        for (let delta_y = -1; delta_y < 2; delta_y++) {
            if (!(delta_x == 0 && delta_y == 0)) {
                killCount = getNumKilledEnemy(currentBoard, player, x, y, delta_x, delta_y);
                for (let i = 1; i <= killCount; i++) {
                    dx = i * delta_x;
                    dy = i * delta_y;
                    currentBoard[x + dx][y + dy] = player;
                    addPieceToSquareElement((x + dx) * 8 + y + dy, player);
                }
            }
        }
    }
    currentBoard[x][y] = player;
    addPieceToSquareElement(x * 8 + y, player);
}

function addPieceToSquareElement(squareNum, color) {
    const square = document.querySelector(`#square${squareNum}`);
    const piece = document.createElement("div");
    piece.id = "piece" + squareNum;
    if (color == BLACK_DISK) {
        piece.classList.add("black-piece");
    }
    else if (color == WHITE_DISK) {
        piece.classList.add("white-piece");
    }
    square.innerHTML = "";
    square.appendChild(piece);
}

function startNewGame() {
    currentBoard = JSON.parse(JSON.stringify(startingBoard));
    whosTurn = BLACK_DISK;
    gameOver = false;
    resetSquareElementsToStartingPosition();
}

function resetSquareElementsToStartingPosition() {
    squaresList.forEach(square => {
        square.innerHTML = "";
        const squareNum = square.id.substring(6);
        if (squareNum == 28 || squareNum == 35) {
            addPieceToSquareElement(squareNum, BLACK_DISK);
        }
        else if (squareNum == 27 || squareNum == 36) {
            addPieceToSquareElement(squareNum, WHITE_DISK);
        }
    });
}

function updateScores() {
    let counts = {};
    for (let i = 0; i < currentBoard.length; i++) {
        for (let j = 0; j < currentBoard.length; j++) {
            const squareVal = currentBoard[i][j];
            counts[squareVal] = counts[squareVal] ? counts[squareVal] + 1 : 1;
        }
    }
    const whiteScore = scoreBoard.querySelector("#white-score");
    const blackScore = scoreBoard.querySelector("#black-score");
    whiteScore.textContent = counts[WHITE_DISK]
    blackScore.textContent = counts[BLACK_DISK]
    return counts
}

squaresList.forEach(square => {
    square.addEventListener('click', handleMove)
});

newGameBtn.addEventListener('click', startNewGame);


