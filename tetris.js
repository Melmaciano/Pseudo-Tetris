// GENERAL FUNCTIONS
const makeLine = (length, char = " ~ ") => Array.from({ length }, _ => char);      // Call twice to make grid
const random = (num) => Math.trunc(Math.random()  *  num);
const deepCopy = (arr) => {
    if (!Array.isArray(arr)) return arr;
    else return arr.map(subArr => deepCopy(subArr));
}

// FIGURES
const figures = [
    {
        id: 0,
        name: "square",
        coords: [
            [[0,0], [1,0], [0,1], [1,1]],
        ]
    },
    {
        id: 1,
        name: "ele",
        coords: [
            [[0,0], [1,0], [0,1], [0,2]],
            [[0,1], [0,0], [1,1], [2,1]],
            [[1,2], [0,2], [1,1], [1,0]],
            [[2,1], [2,2], [1,1], [0,1]],
        ],
    },
    {
        id: 2,
        name: "stick",
        coords: [
            [[0,0], [1,0], [2,0], [3,0]],
            [[1,-1], [1,0], [1,1], [1,2]],
        ],
    },
    {
        id: 3,
        name: "zeta",
        coords: [
            [[1,0], [1,1], [0,1], [0,2]],
            [[0,0], [1,0], [1,1], [2,1]],
        ]
    },
    {
        id: 4,
        name: "clover",
        coords: [
            [[1,0], [1,1], [0,1], [1,2]],
            [[0,1], [1,1], [1,2], [2,1]],
            [[0,0], [0,1], [1,1], [0,2]],
            [[0,1], [1,1], [1,0], [2,1]]
        ]
    }
];

// FIGURE
class Figure {
    constructor({ coords }, distanceFromBorder) {
        this.allCoords = deepCopy(coords);
        this.currentIndexPosition = random(this.allCoords.length);
        this.currentPosition = deepCopy(this.allCoords[this.currentIndexPosition]);
        this.currentPosition.forEach(square => {
            square[1] += distanceFromBorder;
            square[0] -= 3;
        });
    }

    updatePosition() {
        this.currentPosition.forEach(square => square[0]++);
    }

    moveRight() {
        this.currentPosition.forEach(square => square[1]++);
    }

    moveLeft() {
        this.currentPosition.forEach(square => square[1]--);
    }

    spin() { 
        const allCoords = this.allCoords;
        const nextIndexPosition = (this.currentIndexPosition + 1) % (allCoords.length);

        const originalPosition = allCoords[this.currentIndexPosition];
        const nextPosition = allCoords[nextIndexPosition];

        this.currentIndexPosition = nextIndexPosition;

        this.currentPosition.forEach((square, i) => {
            const differenceX = nextPosition[i][0] - originalPosition[i][0];
            const differenceY = nextPosition[i][1] - originalPosition[i][1];
            square[0] += differenceX;
            square[1] += differenceY;
        });
    }
}

// GAME
class Game {
    constructor(ms, row, col) {
        this.row = col;
        this.col = col;
        this.grid = makeLine(row).map(_ => makeLine(col));
        this.ms = ms;
        this.points = 0;
        this.currentFIgure;
        this.timerID;
    }

    start() {
        DOM.updatePoints(this.points);
        this.currentFIgure = new Figure(figures[random(figures.length)], Math.trunc(this.col / 2));      

        this.timerID = setInterval(() => {           //  INTERVAL FOR THE RHYTHM OF GAME, ENSURE PIECES GO DOWN
            DOM.printDOM(this.grid);
            let value = this.updateGrid(this.currentFIgure);
            if (value === 1) {                               // WHEN A COLLISION IS DETECTED INTERVAL ENDS AND A NEW PIECE
                clearInterval(this.timerID);                      // ENTER
                this.start() 
            } else if (value === 2) {
                this.points = 0;
                clearInterval(this.timerID);
                DOM.gameOver();
            }
        }, this.ms);
    }

    executeAction(key) {
        switch (key) {
            case "ArrowLeft":
                this.updateGrid(this.currentFIgure, "left");
                break;
            case "ArrowRight":
                this.updateGrid(this.currentFIgure, "right");
                break;
            case "ArrowUp":
                this.updateGrid(this.currentFIgure, "up");
                break;
        }
    }

    // KEY FUNCTION, ENSURE RHYTHM OF GAME AND UPDATE POSITION OF PIECES, EITHER VERTICAL OR HORIZONTAL
    updateGrid(figure, direction) {
        const oldCoords = deepCopy(figure.currentPosition); 

        switch (direction) {
            case "right":
                figure.moveRight();
                break;
            case "left":
                figure.moveLeft();
                break;
            case "up":
                figure.spin();
                break;
            default:
                figure.updatePosition();
                break;
        }

        const newCoords = deepCopy(figure.currentPosition);

        if (this.checkCollision(figure)) {
            figure.currentPosition = oldCoords;

            if (!direction) { 
                if (this.checkGameOver(figure)) return 2;   // GAME OVER
                this.placeFigure(figure)
                this.checkFullRow();
                return 1;                                   // NEW FIGURE
            } else {
                return 0;                                   // NEXT FRAME
            }
        } else {
            oldCoords.forEach(square => this.updateCell(square, " ~ "));
            newCoords.forEach(square => this.updateCell(square, " $ "));
        }
    }

    checkCollision(figure) {
        for (const square of figure.currentPosition) {
            if (this.grid?.[square[0]]?.[square[1]] === " # " ||
                square[1] < 0                               ||
                square[1] > this.grid[0].length - 1         ||
                square[0] === this.grid.length)
            {
                return true;
            }
        }
        return false;
    }

    updateCell([ positionY, positionX ], char) {
        if (positionY < 0) return;
        this.grid[positionY][positionX] = char;
    }

    placeFigure(figure) {
        figure.currentPosition.forEach(square => this.updateCell(square, " # "));
    }

    // REMOVE FULL ROWS

    shiftAllRows(pos) {
        for (let row = pos; row > 0; row--) {
            this.grid[row] = this.grid[row - 1];
            this.grid[0] = makeLine(this.row);
        }
    }

    checkRow(row) {
        return row.every(elem => elem === " # ") ? true : false;
    }

    checkFullRow() {
        for (let i = this.grid.length - 1; i >= 0; i--) {
            if (this.checkRow(this.grid[i])) { 
                this.shiftAllRows(i); 
                i++;
                this.addPoints();
            }
        }
    }

    // POINTS
    addPoints() {
        this.points += 100;
        DOM.updatePoints(this.points);
    }

    // GAME OVER
    checkGameOver(figure) {
        return figure.currentPosition.some(square => (square[0] < 0) || (square[1] < 0));
    }
}

// DOM
class DOMmanipulator {
    constructor() {
        const body = document.querySelector("body");

        this.colsInput = document.createElement("input");
        this.cols = document.createElement("p");
        this.cols.textContent = "Columns: ";
        this.cols.appendChild(this.colsInput);
        this.colsInput.value = 15;
        this.colsInput.setAttribute("type", "number");

        this.rowsInput = document.createElement("input");
        this.rows = document.createElement("p");
        this.rows.textContent = "Rows: ";
        this.rows.appendChild(this.rowsInput);
        this.rowsInput.value = 10;
        this.rowsInput.setAttribute("type", "number");

        this.options = document.createElement("div");
        this.options.appendChild(this.cols);
        this.options.appendChild(this.rows);
        body.appendChild(this.options);

        this.startBtn = document.createElement("button");
        this.startBtn.classList.add("btn");
        this.startBtn.textContent = "start";
        this.startBtn.addEventListener("click", this.startGame.bind(this));
        body.appendChild(this.startBtn);

        this.pointsPara = document.createElement("p");
        this.pointsWord = document.createTextNode("Points: ");
        this.pointsScore = document.createElement("span");
        this.pointsPara.appendChild(this.pointsWord);
        this.pointsPara.appendChild(this.pointsScore);
        body.appendChild(this.pointsPara);

        this.gridDOM = document.createElement("div");
        this.gridDOM.classList.add("grid");
        body.appendChild(this.gridDOM);

        this.gameOverMsg = document.createElement("p")
        this.gameOverMsg.textContent = "GAME OVER";
        this.gameOverMsg.classList.add("hidden");
        body.appendChild(this.gameOverMsg);
    }

    startGame() {
        if (game) { clearInterval(game.timerID); this.gameOver(); }
        this.gameOverMsg.classList.add("hidden");
        const ms = 400;
        game = new Game(ms, this.colsInput.value, this.rowsInput.value);
        game.start();
    }

    printDOM(grid) {
        this.gridDOM.textContent = grid.reduce((acc, row) => acc + (row.join(" ") + "\n"), "");
    }

    updatePoints(points) {
        this.pointsScore.textContent = points;
    }

    gameOver() {
        this.gridDOM.textContent = "";
        this.gameOverMsg.classList.remove("hidden");
        this.pointsScore.textContent = 0;
        game = "";
    }
}

// GLOBAL VARIABLES 
const DOM = new DOMmanipulator;
let game;
let timerKey, arrowKeyPressed;

// ENSURE A KEY IS PRESSED AT LEAST ONE TIME, THEN IF THE KEY
// IS PRESSED, THE INTERVAL CALL THE FUNCTION EVERY MS TIME
addEventListener("keydown", (e) => {
    if (!arrowKeyPressed && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { 
        game.executeAction(e.key);
        arrowKeyPressed = true;

        timerKey = setInterval(() => {
            game.executeAction(e.key);
        }, 300);
    }
});
addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        clearInterval(timerKey);
        arrowKeyPressed = false;
    } else if (e.key === "ArrowUp") {
        game.executeAction(e.key);
    }
});
