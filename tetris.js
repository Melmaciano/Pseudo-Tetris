// GENERAL FUNCTIONS
const makeLine = (length, char = "~") => Array.from({ length }, _ => char);      // Call twice to make grid
const random = () => Math.trunc(Math.random() * figures.length);

// FIGURE
class Figure {
    constructor({ id, coords:[ square1, square2, square3, square4 ] }) {
        this.id = id;
        this.coords = {
            square1: {
                id: 0,
                positionX: square1[0] + 2,
                positionY: square1[1],
            },
            square2: {
                id: 1,
                positionX: square2[0] + 2,
                positionY: square2[1],
            },
            square3: {
                id: 2,
                positionX: square3[0] + 2,
                positionY: square3[1],
            },
            square4: {
                id: 3,
                positionX: square4[0] + 2,
                positionY: square4[1],
            },
        },
        this.position = true;     // STANDARD/FLIPPED
    }

    static updatePosition(square) {
        square.positionY++;
    }

    static moveRight(square) {
        square.positionX++;
    }

    static moveLeft(square) {
        square.positionX--;
    }

    static spin(square) { 
        // WITH THE ID I CAN SELECT THE CORRECT FIGURE, ID MATCHES THE POSITION IN THE ARRAY
        const squareCoords = figures[figure.id].coords[square.id];
        const alternativeSquareCoords = figures[figure.id].alternative[square.id];
        const differenceX = alternativeSquareCoords[0] - squareCoords[0];
        const differenceY = alternativeSquareCoords[1] - squareCoords[1];

        // CALCULATES THE NEW POSITION
        if (figure.position) {
            square.positionX += differenceX;
            square.positionY += differenceY;
        } else {
            square.positionX -= differenceX;
            square.positionY -= differenceY;
        }
    }

    // CHECK IF THE FIGURE IS NOT OUTSIDE THE BOARD
    static checkOutsideBoard({ coords: { square1: { positionX: a }, square2: { positionX: b }, 
                                         square3: { positionX: c }, square4: { positionX: d } } }, dir) {
        if (dir === "left") {
            return Math.min(a, b, c, d) - 1 < 0;
        } else {
            return Math.max(a, b, c, d) + 1 > game.grid[0].length - 1;
        }
    }
}

// GAME
class Game {
    constructor(ms, row, col) {
        this.grid = makeLine(row).map(_ => makeLine(col));
        this.ms = ms;
    }

    start() {
        figure = new Figure(figures[random()]);      

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
        if (key === "ArrowLeft" && !Figure.checkOutsideBoard(figure, "left")) {
            this.updateGrid(figure, "left");
        } else if (key === "ArrowRight" && !Figure.checkOutsideBoard(figure, "right")) {
            this.updateGrid(figure, "right");
        } else if (key === "ArrowUp") {
            this.updateGrid(figure, "up");
            figure.position = !figure.position;
        }
    }

    // KEY FUNCTION, ENSURE RHYTHM OF GAME AND UPDATE POSITION OF PIECES, EITHER VERTICAL OR HORIZONTAL
    updateGrid({ coords: { square1, square2, square3, square4 } }, direction) {
        const squares = [square1, square2, square3, square4];

        for (const square of squares) {
            //IF COLLISION OCCUR, FIGURE IS INTEGRATED TO BOARD
            if(this.checkCollision(square)) {
                squares.forEach(square => this.updateCell(square, "#"));
                return true;
            } else if (direction === "up") {    // IF FIGURE IT IS IN A CORNER O NEAR OF ANOTHER FIGURE, RETURN
                const squareCopy = {};
                Object.assign(squareCopy, square);
                Figure.spin(squareCopy);
                if (!this.grid?.[squareCopy.positionY][squareCopy.positionX] === "~" ||
                    !this.grid?.[squareCopy.positionY]?.[squareCopy.positionX]) {       //RETURN UNDEFINED IF DOES
                    return;                                                             // NOT EXIST
                }
            }
        }
    
        squares.forEach(square => this.updateCell(square, "~"));
        squares.forEach(square => {                                 // IMPORTANT, ALL THE ACTIONS ARE HERE
            if (direction === "right") Figure.moveRight(square);
            else if (direction === "left") Figure.moveLeft(square);
            else if (direction === "up") Figure.spin(square);
            else Figure.updatePosition(square);
            this.updateCell(square, "*");
        });
    }

    updateCell({ positionX, positionY }, char) {
        if (positionY < 0) return;
        this.grid[positionY][positionX] = char;
    }

    checkCollision({ positionX, positionY }) {
        return this.grid?.[positionY + 1]?.[positionX] === "#" || positionY + 1 === this.grid.length;
    }

    placeFigure(arrOfSquares) {
        arrOfSquares.forEach(square => this.updateCell(square, "#"));
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
        const rows = 15, cols = 10, ms = 500;
        game = new Game(ms, rows, cols);
        game.start();
    }

    printDOM(grid) {
        this.gridDOM.textContent = grid.reduce((acc, row) => acc + (row.join(" ") + "\n"), "");
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

const figures = [
    {
        id: 0,
        name: "square",
        coords: [[0,0], [1,0], [0,1], [1,1]],
    },
    {
        id: 1,
        name: "ele",
        coords: [[0,0], [1,0], [0,1], [0,2]],
        alternative: [[0,0], [0,1], [1,1], [2,1]],
    },
    {
        id: 2,
        name: "stick",
        coords: [[0,0], [0,1], [0,2], [0,3]],
        alternative: [[-1,1], [0,1], [1,1], [2,1]],
    },
    {
        id: 3,
        name: "zeta",
        coords: [[0,1], [1,1], [1, 0], [2,0]],
        alternative: [[0,0], [0,1], [1,1], [1,2]],
    },
    {
        id: 4,
        name: "clover",
        coords: [[0,1], [1,1], [1,0], [2,1]],
        alternative: [[1,0], [1,1], [1,2], [2,1]],
    }
];
