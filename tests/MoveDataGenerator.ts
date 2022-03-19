import type { MoveData } from '../src/useMove';

interface Coord {
  x: number;
  y: number;
}

export class MoveDataGenerator {
  currentCoord: Coord;

  startCoord: Coord;

  lastCoord: Coord;

  constructor(x: number, y: number) {
    this.currentCoord = { x, y };
    this.startCoord = { x, y };
    this.lastCoord = { x, y };
  }

  next(x: number, y: number): void {
    this.lastCoord = this.currentCoord;
    this.currentCoord = { x, y };
  }

  get(): MoveData {
    const data = {
      type: 'trace' as const,
      movementX: this.currentCoord.x - this.lastCoord.x,
      movementY: this.currentCoord.y - this.lastCoord.y,
      clientX: this.currentCoord.x,
      clientY: this.currentCoord.y,
      startClientX: this.startCoord.x,
      startClientY: this.startCoord.y,
      lastClientX: this.lastCoord.x,
      lastClientY: this.lastCoord.y,
    };
    this.next(this.currentCoord.x, this.currentCoord.y);
    return data;
  }
}
