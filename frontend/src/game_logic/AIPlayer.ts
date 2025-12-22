import type { AIMove, DirectionPair, Position, PositionOrNull, StoneColor } from "../types/Types";
import { Board } from "./Board";

export class AIPlayer {
    gomokuBoard: Board;
    depth: number = 3;

    readonly stoneColor: StoneColor= "W";
    readonly opponentColor: StoneColor = "B";

    directions: DirectionPair[] = [
        [[-1, 0], [1, 0]],
        [[0, -1], [0, 1]],
        [[-1, -1], [1, 1]],
        [[-1, 1], [1, -1]],
    ];

    constructor(gomokuBoard: Board, depth: number) {
        this.gomokuBoard = gomokuBoard;
        this.depth = depth;
    }

    public findBestMove(): AIMove {
        // keep track of best move and score
        let bestScore: number = -Infinity;
        let bestMove: PositionOrNull = null;

        // initialize alpha and beta values for pruning
        let alpha: number = -Infinity;
        let beta: number = Infinity;

        // get moves
        const moves = this.getPossibleMoves();

        // sort the moves
        this.getRankedMoves(moves);

        for (const[row, col] of moves) {
            // make move
            this.gomokuBoard.makeMove(row, col, this.stoneColor);

            //  check if there is a win
            if (this.gomokuBoard.checkWin(row, col)) {
                this.gomokuBoard.undoMove(row, col);
                return [row, col];
            }

            //  get a score
            const score = this.minimax(this.depth, false, alpha, beta);

            // undo move
            this.gomokuBoard.undoMove(row, col);

            // check if we found the best move
            if (score > bestScore) {
                bestScore = score;
                bestMove = [row, col];
            }

            // update alpha score
            alpha = Math.max(alpha, score);
        }

        return bestMove;
    }

    private minimax(depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
        // if depth is 0, return the score for current move
        if (depth === 0) return this.heuristic();

        //  get all possible moves (all empty cells on board)
        const moves = this.getPossibleMoves();
        if (moves.length <= 0) return this.heuristic();

        // sort moves, so we can prioritize the best move first
        this.getRankedMoves(moves);

        // logic for maximizer
        if (isMaximizing) {
            let bestScore: number = -Infinity;

            for (const [row, col] of moves) {
                // make move on the board
                this.gomokuBoard.makeMove(row, col, this.stoneColor);

                // check if there is a win
                if (this.gomokuBoard.checkWin(row, col)) {
                    // undo move
                    this.gomokuBoard.undoMove(row, col);
                    // return a score
                    return 1000;
                }

                //  keep score, recursive
                const score = this.minimax(depth - 1, false, alpha, beta);

                // undo move
                this.gomokuBoard.undoMove(row, col);

                // update best score that we have seen so far
                bestScore = Math.max(bestScore, score);

                // update the alpha value
                alpha = Math.max(alpha, score);

                // prune if needed
                if (beta <= alpha) break;
            }

            return bestScore;

        } else {
            // logic for minimizer
            let bestScore: number = Infinity;

            for (const [row, col] of moves) {
                // make move
                this.gomokuBoard.makeMove(row, col, this.opponentColor);

                // check for a win
                if (this.gomokuBoard.checkWin(row, col)) {
                    this.gomokuBoard.undoMove(row, col);
                    return -1000;
                }

                // track score from current move
                const score = this.minimax(depth - 1, true, alpha, beta);

                // undo move
                this.gomokuBoard.undoMove(row, col);

                // update the best score we have seen so far
                bestScore = Math.min(bestScore, score);

                // update beta
                beta = Math.min(beta, score);

                // prune if needed
                if (beta <= alpha) break;
            }

            return bestScore;
        }
    }

    private getRankedMoves(moves: Position[]): void{
        moves.sort((moveA, moveB) => {
            const scoreA = this.scoreMove(moveA[0], moveA[1]);
            const scoreB = this.scoreMove(moveB[0], moveB[1]);

            if (scoreB > scoreA) return 1;
            if (scoreB < scoreA) return -1;

            return 0;
        });
    }

    private getPossibleMoves(): Position[] {
        // use set to avoid duplicates
        const nextMoves: Set<string> = new Set();

        // track if we found stones
        let foundStone: boolean = false;

        for (let row = 0; row < this.gomokuBoard.board_size; row++) {
            for (let col = 0; col < this.gomokuBoard.board_size; col++) {
                // optimize around intersections that already have stones
                if (!this.gomokuBoard.isValidPosition(row, col)) {
                    foundStone = true;

                    // only check the 8 immediate neighbors of each intersection
                    for (let dRow = -1; dRow < 2; dRow++) {
                        for (let dCol = -1; dCol < 2; dCol++) {
                            const nextRow: number = row + dRow;
                            const nextCol: number = col + dCol;

                            // check that intersections are valid
                            if (
                                !this.gomokuBoard.isCoordOutofBounds(nextRow, nextCol) &&
                                this.gomokuBoard.isValidPosition(nextRow, nextCol)
                            ) {
                                nextMoves.add(`${nextRow},${nextCol}`)
                            }
                        }
                    }
                }
            }
        }

        // if we did not find any stones (first move), choose the center
        if (!foundStone) {
            const center = Math.floor(this.gomokuBoard.board_size / 2)
            return [[center, center]]
        }


        const emptyIntersections: Position[] = [];

        // return intersections found
        if (nextMoves.size > 0) {
            // need to process
            for (const coords of nextMoves) {
                const [row, col] = coords.split(",");
                emptyIntersections.push([Number(row), Number(col)]);
            }

            return emptyIntersections;
        }

        // Fall back when we are at the edges of the board

        for (let row = 0; row < this.gomokuBoard.board_size; row++) {
            for (let col = 0; col < this.gomokuBoard.board_size; col++) {
                if (this.gomokuBoard.isValidPosition(row, col)) {
                    emptyIntersections.push([row, col]);
                }
            }
        }

        return emptyIntersections;
    }

    private heuristic(): number {
        // keep track of the ai score and human / opponent score
        let aiScore = 0;
        let opponentScore = 0;

        for (let row = 0; row < this.gomokuBoard.board_size; row++) {
            for (let col = 0; col < this.gomokuBoard.board_size; col++) {
                // count AI score
                if (this.gomokuBoard.getIntersectionValue(row, col) === this.stoneColor) {
                    aiScore += this.calculatePlayerScore(row, col);

                } else if (this.gomokuBoard.getIntersectionValue(row, col) === this.opponentColor) {
                    opponentScore += this.calculatePlayerScore(row, col);
                }
            }
        }

        return aiScore - opponentScore;
    }

    private calculatePlayerScore(row: number, col: number): number {
        let score: number = 0

        for (const dirPair of this.directions) {
            // count in one direction
            const [count1, isOpen1] = this.gomokuBoard.countInDirection(row, col, dirPair[0]);

            // count in second direction
            const [count2, isOpen2] = this.gomokuBoard.countInDirection(row, col, dirPair[1]);

            const totalCount = count1 + 1 + count2;
            const totalOpenEnds = (isOpen1 ? 1 : 0) + (isOpen2 ? 1 : 0);

            score += this.gameStateScore(totalCount, totalOpenEnds);
        }

        return score;
    }

    private scoreMove(row: number, col: number): number {

        // AI player offensive game max Score
        const maxAIThreat = this.offensiveGameScore(row, col, this.stoneColor);

        // Human Player (Opponent) offensive game max Score
        const maxOpponentThreat = this.offensiveGameScore(row, col, this.opponentColor);

        return maxAIThreat + maxOpponentThreat;
    }

    private offensiveGameScore(row: number, col: number, playerColor: StoneColor): number {
        // make move at row, col
        this.gomokuBoard.makeMove(row, col, playerColor);

        // initialize threat score
        let threatScore: number = 0;

        // calculate the maximum player threat in the 4 planes demarcated by directions
        // (horizontal, vertical, main diagonal, secondary diagonal)
        for (const dirPair of this.directions) {
            // count in direction 1
            const [count1, isOpen1] = this.gomokuBoard.countInDirection(row, col, dirPair[0]);

            // count in direction 2
            const [count2, isOpen2] = this.gomokuBoard.countInDirection(row, col, dirPair[1]);

            const totalCount: number = count1 + 1 + count2;
            const totalOpenEnds: number = (isOpen1 ? 1: 0) + (isOpen2 ? 1: 0);

            // score of current move
            const currentScore: number = this.gameStateScore(totalCount, totalOpenEnds);

            // update threatScore
            threatScore = Math.max(threatScore, currentScore);
        }

        // undo move
        this.gomokuBoard.undoMove(row, col);

        return threatScore;
    }

    private gameStateScore(count: number, openEnds: number): number {
        // if we have 5 or more stones of same color in sequence, game over
        if (count >= 5) return 50000;

        // for the rest of stones, we have to score based on number of stones in
        // sequence and number of open ends -- 2 open ends are dangerous
        if (count === 4) {
            // if there are 2 open ends, guaranteed win
            if (openEnds === 2) {
                // guaranteed win in next move, can't stop
                return 5000;
            } else if (openEnds == 1) {
                // must block the open end
                return 1000;
            } else {
                // dead end
                return 0;
            }

        }
        // 3 stones are very threatening and need to block
        if (count === 3) {
            if (openEnds === 2) {
                return 500;
            } else if (openEnds === 1) {
                return 100;
            } else {
                return 0;
            }
        }

        // 2 stones are not a problem at all
        if (count === 2) {
            if (openEnds === 2) {
                return 50;
            } else if (openEnds === 1) {
                return 10;
            } else {
                return 0;
            }
        }

        // 1 stone is not threatening and shouldn't place a lot of value to just 1 stone
        return 1;
    }
}
