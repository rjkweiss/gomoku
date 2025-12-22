// stone color
export type StoneColor  = "B" | "W";

// position (row, col)
export type Position = [row: number, col: number];

// position or null
export type PositionOrNull = [row: number, col: number] | null;

// direction
export type Direction = [dRow: number, dCol: number];

// direction pairs
export type DirectionPair = [Direction, Direction];

// count results
export type CountResults = [count: number, isOpen: boolean];

// intersection / board state
export type BoardState = (StoneColor | null)[][];

// game status
export type GameStatus = "Playing" | "Won" | "Draw"

// winner result
export type Winner = StoneColor | null;

// AI move result
export type AIMove = Position | null;
