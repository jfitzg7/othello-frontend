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
let currentBoard = JSON.parse(JSON.stringify(startingBoard));
let whosTurn = BLACK_DISK;

function addPiece(e) {
    console.time("addPiece execution time");
    const validMovesList = getValidMoves(currentBoard, whosTurn);
    const squareNum = e.srcElement.id.substring(6);
    if (validMovesList.includes(squareNum)) {
        if (whosTurn === BLACK_DISK) {
            updateBoard(squareNum, BLACK_DISK);
            whosTurn = WHITE_DISK;
        }
        else {
            updateBoard(squareNum, WHITE_DISK);
            whosTurn = BLACK_DISK;
        }
    }
    console.timeEnd("addPiece execution time")
}

function getValidMoves(board, player) {
    let validMovesList = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (
                getNumKilledEnemy(board, player, i, j, 1, 1) ||
                getNumKilledEnemy(board, player, i, j, 1, 0) ||
                getNumKilledEnemy(board, player, i, j, 1, -1) ||
                getNumKilledEnemy(board, player, i, j, -1, 1) ||
                getNumKilledEnemy(board, player, i, j, -1, 0) ||
                getNumKilledEnemy(board, player, i, j, -1, -1) ||
                getNumKilledEnemy(board, player, i, j, 0, 1) ||
                getNumKilledEnemy(board, player, i, j, 0, -1)
            ) {
                validMovesList.push((i * 8 + j) + "");
            }
        }
    }
    return validMovesList;
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
                    updateSquareElement((x + dx) * 8 + y + dy, player);
                }
            }
        }
    }
    currentBoard[x][y] = player;
    updateSquareElement(x * 8 + y, player);
}

function updateSquareElement(squareNum, player) {
    const square = document.querySelector(`#square${squareNum}`);
    const piece = document.createElement("div")
    piece.id = "piece" + squareNum;
    if (player == BLACK_DISK) {
        piece.classList.add("black-piece")
    }
    else {
        piece.classList.add("white-piece")
    }

    square.innerHTML = "";
    square.appendChild(piece);
}

function startNewGame(e) {
    currentBoard = JSON.parse(JSON.stringify(startingBoard));
    whosTurn = BLACK_DISK
    resetSquareElements();
}

function resetSquareElements() {
    squaresList.forEach(square => {
        square.innerHTML = "";
        const squareNum = square.id.substring(6);
        const piece = document.createElement("div");
        piece.id = "piece" + squareNum;
        if (squareNum == 28 || squareNum == 35) {
            piece.classList.add("black-piece");
        }
        else if (squareNum == 27 || squareNum == 36) {
            piece.classList.add("white-piece");
        }
        square.appendChild(piece);
    });
}

const squaresList = document.querySelectorAll(".square")

squaresList.forEach(square => {
    square.addEventListener('click', addPiece)
});

const newGameBtn = document.querySelector("#new-game-btn");

newGameBtn.addEventListener('click', startNewGame);
