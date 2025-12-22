import type { BoardState, CountResults, Direction, DirectionPair, Position, PositionOrNull, StoneColor } from "../types/Types";

export class Board {
    readonly board_size: number = 15;
    cell_size: number;
    margin: number;

    // board element
    board: BoardState;

    constructor(N: number, cell_size: number, margin: number) {
        this.board_size = N;
        this.cell_size = cell_size;
        this.margin = margin;

        // render a board of given size as a list
        this.board = Array.from(
            { length: this.board_size },
            () => new Array(this.board_size).fill(null)
        );
    }

    public getIntersectionValue(row: number, col: number): StoneColor | null {
        return this.board[row][col];
    }

    public isValidPosition(row: number, col: number): boolean {
        return this.board[row][col] === null;
    }

    public makeMove(row: number, col: number, color: StoneColor): void {
        this.board[row][col] = color;
    }

    public undoMove(row: number, col: number): void {
        this.board[row][col] = null;
    }

    public isBoardFull(): boolean {
        return this.board.every( row => {
            return row.every(cell => cell != null)
        });
    }

    public ConvertBoardCoordsToPixels(row: number, col: number): Position {
        const xPixel = col * this.cell_size + this.margin
        const yPixel = row * this.cell_size + this.margin

        return [xPixel, yPixel]
    }

    public convertPixelCoordsToBoard(xPixel: number, yPixel: number): PositionOrNull {
        let minDist = Infinity;

        let closestRow: number = -1;
        let closestCol: number = -1;

        // for every intersection, let's find the one that is closest
        // to the click
        for (let row = 0; row < this.board_size; row++) {
            for (let col = 0; col < this.board_size; col++) {
                const intersectionX = col * this.cell_size + this.margin;
                const intersectionY = row * this.cell_size + this.margin;

                // calculate Euclidean distance
                const dist = (
                    (xPixel - intersectionX) ** 2 + (yPixel - intersectionY) ** 2
                ) ** 0.5;

                if (dist < minDist) {
                    minDist = dist;
                    closestRow = row;
                    closestCol = col;
                }
            }
        }

        // allow 30% tolerance, so an intersection is matched
        // if a click is within 30% distance from any intersection
        const maxAllowedDist = 0.3 * this.cell_size;

        if (minDist <= maxAllowedDist) {
            return [closestRow, closestCol];
        }

        return null;
    }

    public checkWin(row: number, col: number): StoneColor | null {
        // directions that we will explore
        const directions: DirectionPair[] = [
            [[1, 0], [-1, 0]],
            [[0, 1], [0, -1]],
            [[1, 1], [-1, -1]],
            [[-1, 1], [1, -1]]
        ];

        const player = this.board[row][col];

        // go over the directions one pair at a time and count wins
        for (const dirPair of directions) {
            const total = (
                this.countInDirection(row, col, dirPair[0])[0] +
                1 +
                this.countInDirection(row, col, dirPair[1])[0]
            );

            if (total >= 5) return player;
        }

        return null;
    }

    // -------------------- Helper functions --------------------------- //

    public isCoordOutofBounds(row: number, col: number): boolean {
        if ((row < 0 || row >= this.board_size) || (col < 0 || col >= this.board_size)) {
            return true;
        }
        return false;
    }

    public countInDirection(row: number, col: number, direction: Direction): CountResults {
        let numOfSameStones = 0;
        const [dRow, dCol] = direction;

        // get next row and next col
        let nextRow = row + dRow;
        let nextCol = col + dCol;

        // count the number of stones for current player
        while (!this.isCoordOutofBounds(nextRow, nextCol)) {
            if (this.board[nextRow][nextCol] === this.board[row][col]) {
                numOfSameStones++;

                nextRow += dRow;
                nextCol += dCol;
            } else {
                break;
            }
        }

        // count number of open ends
        let isOpen: boolean = false;

        if (
            !this.isCoordOutofBounds(nextRow, nextCol) &&
            this.board[nextRow][nextCol] === null
        ) {
            isOpen = true;
        }

        return [numOfSameStones, isOpen];
    }



}
