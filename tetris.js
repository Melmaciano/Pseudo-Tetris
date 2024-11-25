const makeLine = (length) => Array.from({ length }, _ => "~");      // Call twice to make grid
// const grid = makeLine(8).map(_ => makeLine(8));

const figures = {
    square: {
        name: "square",
        coords: [[2,0], [3,0], [2,1], [3,1]],
    },
    ele: {
        name: "name",
        coords: [[2,0], [2,1], [2,2], [3,2]],
    },
}

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
}

class Game {
    constructor(ms, col, row) {
        this.grid = makeLine(col).map(_ => makeLine(row));
        this.timerID = ms;
        this.grid[5][2] = "#";
    }

    start(figure) {
        this.print(this.grid);
        this.timerID = setInterval(() => {
            let bool = this.updateGrid(figure);
            if (bool) clearInterval(this.timerID);
            this.print(this.grid);
        }, 1000);
    }

    print() {
        this.grid.forEach(row => console.log(row.join(" ").toString(), "\n"));
    }

    updateGrid({ coords:{ square1, square2, square3, square4 } }) {
        const squares = [square1, square2, square3, square4];
    
        for (const square of squares) {
            if(this.checkCollision(square)) {
                squares.forEach(square => this.updateCell(square, "#"));
                return true;
            };
        }
    
        squares.forEach(square => this.updateCell(square, "~"));
        squares.forEach(square => { Figure.updatePosition(square); this.updateCell(square, "*"); });
    }

    updateCell({ positionX, positionY }, char) {
        this.grid[positionY][positionX] = char;
    }

    checkCollision({ positionX, positionY }) {
        return this.grid[positionY + 1][positionX] === "#";
    }

    placeFigure(arrOfSquares) {
        arrOfSquares.forEach(square => this.updateCell(square, "#"));
    }
}

const figure = new Figure(figures.square);
new Game(1000, 8, 8).start(figure);

// const timerId = setInterval(() => {
//     let bool = updateGrid(figure);
//     if (bool) clearInterval(timerId);
//     print(grid);
// }, 1000);

// function print(grid) {
//     grid.forEach(row => console.log(row.join(" ").toString(), "\n"));
// }

// function updatePosition(obj) {
//     return obj.positionY++;
// }

// function updateGrid({ coords:{ square1, square2, square3, square4 } }) {
//     const squares = [square1, square2, square3, square4];

//     for (const square of squares) {
//         if(checkCollision(square)) {
//             squares.forEach(square => updateCell(square, "#"));
//             return true;
//         };
//     }

//     squares.forEach(square => updateCell(square, "~"));
//     squares.forEach(square => { updatePosition(square); updateCell(square, "*"); });
// }

// function updateCell({ positionX, positionY }, char) {
//     grid[positionY][positionX] = char;
// }

// function checkCollision({ positionX, positionY }) {
//     return grid[positionY + 1][positionX] === "#";
// }

// function placeFigure(arrOfSquares) {
//     arrOfSquares.forEach(square => updateCell(square, "#"));
// }

// class DOMmanage {
//     gridDOM = document.createElement("div");
//     static {
//         this.gridDOM.classList.add("grid");
        
//     }
    
// }
