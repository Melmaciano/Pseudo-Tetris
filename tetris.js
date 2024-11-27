// GENERAL FUNCTIONS
const makeLine = (length, char = "~") => Array.from({ length }, _ => char);      // Call twice to make grid
const random = (num) => Math.trunc(Math.random() * num);
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
        this.currentPosition.forEach(square => square[1] += distanceFromBorder);
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
    }

    start() {
        figure = new Figure(figures[random(figures.length)], Math.trunc(this.col / 2));      

        const timerID = setInterval(() => {           //  INTERVAL FOR THE RHYTHM OF GAME, ENSURE PIECES GO DOWN
            let bool = this.updateGrid(figure);
            if (bool) {                               // WHEN A COLLISION IS DETECTED INTERVAL ENDS AND A NEW PIECE
                clearInterval(timerID);               // ENTER
                this.start() 
            };
            DOM.printDOM(this.grid);
        }, this.ms);
    }

    executeAction(key) {
        switch (key) {
            case "ArrowLeft":
                this.updateGrid(figure, "left");
                break;
            case "ArrowRight":
                this.updateGrid(figure, "right");
                break;
            case "ArrowUp":
                this.updateGrid(figure, "up");
                break;
        }
    }

    // KEY FUNCTION, ENSURE RHYTHM OF GAME AND UPDATE POSITION OF PIECES, EITHER VERTICAL OR HORIZONTAL
    updateGrid(figure, direction) {
        this.checkFullRow();
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
                this.placeFigure(figure.currentPosition); 
                return true; 
            } else {
                return false;
            }
        } else {
            oldCoords.forEach(square => this.updateCell(square, "~"));
            newCoords.forEach(square => this.updateCell(square, "*"));
        }
    }

    checkCollision(figure) {
        for (const square of figure.currentPosition) {
            if (this.grid?.[square[1]]?.[square[0]] === "#" ||
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
        this.grid[positionX][positionY] = char;
    }

    placeFigure(arrOfSquares) {
        arrOfSquares.forEach(square => this.updateCell(square, "#"));
    }

    // REMOVE FULL ROWS
    checkFullRow() {
        for (let i = this.grid.length - 1; i >= 0; i--) {
            if (this.checkRow(this.grid[i])) this.shiftAllRows(i);
        }
        console.log(true)
    }

    checkRow(row) {
        return row.every(elem => elem === "#") ? true : false;
    }

    shiftAllRows(pos) {
        for (col of this.grid) {
            for (let row = pos; row > 0; row--) {
                if (col[row] !== "*" && col[row - 1] !== "*") col[row] = col[row - 1];
            }
        }
    }
}

// DOM
class DOMmanipulator {
    constructor() {
        this.startBtn = document.createElement("button");
        this.startBtn.classList.add("btn");
        this.startBtn.textContent = "start";
        this.startBtn.addEventListener("click", this.startGame);
        document.querySelector("body").appendChild(this.startBtn);

        this.gridDOM = document.createElement("div");
        this.gridDOM.classList.add("grid");
        document.querySelector("body").appendChild(this.gridDOM);
    }

    startGame() {
        const rows = 10, cols = 10, ms = 500;
        game = new Game(ms, rows, cols);
        game.start();
    }

    printDOM(grid) {
        let formattedString = "";
        const colLength = grid[0].length

        for(let row = 0; row < colLength; row++) {

            for(let col of grid) {
                formattedString += col[row];
            }

            formattedString += "\n";
        }

        this.gridDOM.textContent = formattedString;
    }
}

// GLOBAL VARIABLES 
const DOM = new DOMmanipulator;
let game, figure;
let timerKey, arrowKeyPressed;

// ENSURE AT LEAST KEY IS PRESSED AT LEAST ONE TIME, THEN IF THE KEY
// IS PRESSED, THE INTERVAL CALL FUNCTION EVERY MS TIME
addEventListener("keydown", (e) => {
    if (!arrowKeyPressed && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { 
        game.executeAction(e.key);

        timerKey = setInterval(() => {
            game.executeAction(e.key);
        }, 300);

        arrowKeyPressed = true;
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
