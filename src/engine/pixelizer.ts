import type { PuzzleDefinition, GridSize } from './types';
import { deriveRowClues, deriveColClues } from './clues';

/**
 * Convert an image to a binary nonogram grid by downscaling
 * and applying a brightness threshold.
 *
 * Uses a canvas to resize the image to the target grid size,
 * then converts each pixel to grayscale and thresholds it.
 */
export function pixelizeImage(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  size: GridSize,
  threshold = 128,
): number[] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Draw image scaled to grid size
  ctx.drawImage(imageSource, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels = imageData.data;
  const grid: number[] = [];

  for (let i = 0; i < size * size; i++) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    // Standard luminance formula
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grid.push(gray < threshold ? 1 : 0);
  }

  return grid;
}

/**
 * Create a complete PuzzleDefinition from an image.
 */
export function createPuzzleFromImage(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  size: GridSize,
  title: string,
  threshold = 128,
): PuzzleDefinition {
  const solution = pixelizeImage(imageSource, size, threshold);
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    size,
    solution,
    rowClues: deriveRowClues(solution, size),
    colClues: deriveColClues(solution, size),
    source: 'user-created',
  };
}

/**
 * Create a PuzzleDefinition from a raw solution grid (for manual editor).
 */
export function createPuzzleFromGrid(
  solution: number[],
  size: GridSize,
  title: string,
): PuzzleDefinition {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    size,
    solution,
    rowClues: deriveRowClues(solution, size),
    colClues: deriveColClues(solution, size),
    source: 'user-created',
  };
}
