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

function addPiece(e) {
    if (!e.srcElement.classList.contains("square") || gameOver) {
        return
    }

    const validMovesList = getValidMoves(currentBoard, whosTurn);
    const opponentValidMovesList = getValidMoves(currentBoard, -whosTurn);
    const squareNum = Number(e.srcElement.id.substring(6));
    console.log(validMovesList);
    console.log(`Whos Turn: ${whosTurn}`);

    if (validMovesList.length == 0 && opponentValidMovesList.length == 0) {
        // determine the game winner
        gameOver = true;
        let counts = new Map();
        for (let i = 0; i < currentBoard.length; i++) {
            for (let j = 0; j < currentBoard.length; j++) {
                if (counts.has(currentBoard[i][j])) {
                    counts[currentBoard[i][j]] = counts[currentBoard[i][j]] + 1;
                }
                else {
                    counts[currentBoard[i][j]] = 1;
                }
            }
        }
        console.log("Game Over!");
        console.log(counts);
    }

    else if (validMovesList.length == 0) {
        console.log(`Player ${whosTurn} must pass their turn`);
        whosTurn = -whosTurn;
    }

    else if (validMovesList.includes(squareNum)) {
        if (whosTurn === BLACK_DISK) {
            updateBoard(squareNum, BLACK_DISK);
        }
        else {
            updateBoard(squareNum, WHITE_DISK);
        }
        whosTurn = -whosTurn;
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
    resetSquareElements();
}

function resetSquareElements() {
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

const squaresList = document.querySelectorAll(".square")

squaresList.forEach(square => {
    square.addEventListener('click', addPiece)
});

const newGameBtn = document.querySelector("#new-game-btn");

newGameBtn.addEventListener('click', startNewGame);
