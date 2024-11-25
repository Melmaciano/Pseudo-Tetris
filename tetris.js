// GENERAL FUNCTIONS
const makeLine = (length, char = "~") => Array.from({ length }, _ => char);      // Call twice to make grid
const random = () => Math.trunc(Math.random() * figures.length);

// FIGURE
class Figure {
    constructor({ name, coords:[ square1, square2, square3, square4 ] }) {
        this.name = name;
        this.coords = {
            square1: {
                positionX: square1[0],
                positionY: square1[1],
            },
            square2: {
                positionX: square2[0],
                positionY: square2[1],
            },
            square3: {
                positionX: square3[0],
                positionY: square3[1],
            },
            square4: {
                positionX: square4[0],
                positionY: square4[1],
            },
        }
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
        const timerID = setInterval(() => {
            let bool = this.updateGrid(figure);
            if (bool) clearInterval(timerID);
            DOM.printDOM(this.grid);
        }, this.ms);
    }

    horizontalDisplacement(key) {
        if (key === "ArrowLeft" && !Figure.checkOutsideBoard(figure, "left")) this.updateGrid(figure, true, "left");
        else if (key === "ArrowRight" && !Figure.checkOutsideBoard(figure, "right")) this.updateGrid(figure, true, "right");

        // const timerID = setInterval(() => {
        //     if (moveLeft && !Figure.checkOutsideBoard(figure, "left")) this.updateGrid(figure, true, "left");
        //     else if (moveRight && !Figure.checkOutsideBoard(figure, "right")) this.updateGrid(figure, true, "right");
        //     else clearInterval(timerID);
        // }, 1000);
    }

    updateGrid({ coords: { square1, square2, square3, square4 } }, horizontal = false, direction) {
        const squares = [square1, square2, square3, square4];

        for (const square of squares) {
            if(this.checkCollision(square)) {
                squares.forEach(square => this.updateCell(square, "#"));
                return true;
            };
        }
    
        squares.forEach(square => this.updateCell(square, "~"));
        squares.forEach(square => { 
            if (horizontal && direction === "right") Figure.moveRight(square);
            else if (horizontal && direction === "left") Figure.moveLeft(square);
            else Figure.updatePosition(square);
            this.updateCell(square, "*");
        });
    }

    updateCell({ positionX, positionY }, char) {
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
let moveLeft = false, moveRight = false;

addEventListener("keydown", (e) => {
    game.horizontalDisplacement(e.key)
    
    if(e.key === "ArrowLeft") {
        moveLeft = true;
    } else if (e.key === "ArrowRight") {
        moveRight = true;
    }
});
addEventListener("keyup", (e) => {

    if(e.key === "ArrowLeft") {
        moveLeft = false;
    } else if (e.key === "ArrowRight") {
        moveRight = false;
    }
});

const figures = [
    {
        name: "square",
        coords: [[2,0], [3,0], [2,1], [3,1]],
    },
    {
        name: "name",
        coords: [[2,0], [2,1], [2,2], [3,2]],
    },
];
