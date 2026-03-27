import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuzzleProvider } from '../providers/useProviders';
import { usePageTitle } from '../hooks/usePageTitle';
import { createPuzzleFromImage, createPuzzleFromGrid } from '../engine/pixelizer';
import { deriveRowClues, deriveColClues } from '../engine/clues';
import { isLogicSolvable } from '../engine/solver';
import type { GridSize } from '../engine/types';
import styles from '../styles/CreatorPage.module.css';

type CreatorTab = 'photo' | 'manual';

export default function CreatorPage() {
  usePageTitle('Create Puzzle — Nonogram');
  const navigate = useNavigate();
  const puzzleProvider = usePuzzleProvider();
  const [tab, setTab] = useState<CreatorTab>('photo');
  const [title, setTitle] = useState('');
  const [size, setSize] = useState<GridSize>(10);
  const [threshold, setThreshold] = useState(128);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewGrid, setPreviewGrid] = useState<number[] | null>(null);
  const [manualGrid, setManualGrid] = useState<number[]>(() => new Array(100).fill(0));
  const [solvability, setSolvability] = useState<'idle' | 'checking' | 'solvable' | 'unsolvable'>('idle');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePreview = useCallback((img: HTMLImageElement, sz: GridSize, thresh: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = sz;
    canvas.height = sz;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, sz, sz);
    const imageData = ctx.getImageData(0, 0, sz, sz);
    const pixels = imageData.data;
    const grid: number[] = [];
    for (let i = 0; i < sz * sz; i++) {
      const offset = i * 4;
      const gray = 0.299 * pixels[offset] + 0.587 * pixels[offset + 1] + 0.114 * pixels[offset + 2];
      grid.push(gray < thresh ? 1 : 0);
    }
    setPreviewGrid(grid);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      updatePreview(img, size, threshold);
    };
    img.src = url;
  };

  const handleSizeChange = (newSize: GridSize) => {
    setSize(newSize);
    if (tab === 'photo' && imageRef.current) {
      updatePreview(imageRef.current, newSize, threshold);
    }
    if (tab === 'manual') {
      setManualGrid(new Array(newSize * newSize).fill(0));
      setPreviewGrid(null);
    }
  };

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    if (imageRef.current) {
      updatePreview(imageRef.current, size, newThreshold);
    }
  };

  const toggleManualCell = (index: number) => {
    setManualGrid(prev => {
      const next = [...prev];
      next[index] = next[index] === 1 ? 0 : 1;
      return next;
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('Please enter a puzzle title');
      return;
    }

    let puzzle;
    if (tab === 'photo') {
      if (!imageRef.current) {
        alert('Please upload an image first');
        return;
      }
      puzzle = createPuzzleFromImage(imageRef.current, size, title.trim(), threshold);
    } else {
      puzzle = createPuzzleFromGrid(manualGrid, size, title.trim());
    }

    if (puzzleProvider.savePuzzle) {
      await puzzleProvider.savePuzzle(puzzle);
    }
    navigate(`/play/${puzzle.id}`);
  };

  const activeGrid = tab === 'photo' ? previewGrid : manualGrid;
  const isGridEmpty = !activeGrid || activeGrid.every(c => c === 0);

  // Synchronous state adjustment on dependency change (React-recommended pattern)
  const [prevActiveGrid, setPrevActiveGrid] = useState<number[] | null>(null);
  const [prevSolverSize, setPrevSolverSize] = useState(size);

  if (activeGrid !== prevActiveGrid || size !== prevSolverSize) {
    setPrevActiveGrid(activeGrid);
    setPrevSolverSize(size);
    setSolvability(isGridEmpty ? 'idle' : 'checking');
  }

  // Debounced logic-solvability check (async callback in setTimeout is fine)
  useEffect(() => {
    if (isGridEmpty) return;

    const timerId = setTimeout(() => {
      const rowClues = deriveRowClues(activeGrid!, size);
      const colClues = deriveColClues(activeGrid!, size);
      const result = isLogicSolvable(size, rowClues, colClues);
      setSolvability(result ? 'solvable' : 'unsolvable');
    }, 500);

    return () => clearTimeout(timerId);
  }, [activeGrid, size, isGridEmpty]);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>★ Create Puzzle ★</h1>

      <div className={styles.tabSelector}>
        <button
          className={`${styles.tab} ${tab === 'photo' ? styles.activeTab : ''}`}
          onClick={() => setTab('photo')}
        >
          From Photo
        </button>
        <button
          className={`${styles.tab} ${tab === 'manual' ? styles.activeTab : ''}`}
          onClick={() => setTab('manual')}
        >
          Draw Manually
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="puzzle-title" className={styles.label}>Puzzle Title</label>
          <input
            id="puzzle-title"
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="My Awesome Puzzle"
          />
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.label} id="grid-size-label">Grid Size</span>
          <div className={styles.sizeSelector} role="radiogroup" aria-labelledby="grid-size-label">
            {([5, 10, 15] as GridSize[]).map(s => (
              <button
                key={s}
                className={`${styles.sizeOption} ${size === s ? styles.activeSize : ''}`}
                onClick={() => handleSizeChange(s)}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        </div>

        {tab === 'photo' && (
          <>
            <div className={styles.controlGroup}>
              <label htmlFor="upload-image" className={styles.label}>Upload Image</label>
              <div
                className={styles.uploadArea}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && fileInputRef.current) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInputRef.current.files = dt.files;
                    fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className={styles.imagePreview} />
                ) : (
                  <p>Click or drag an image here</p>
                )}
                <input
                  id="upload-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label htmlFor="threshold" className={styles.label}>
                Threshold: {threshold}
              </label>
              <input
                id="threshold"
                type="range"
                min="0"
                max="255"
                value={threshold}
                onChange={e => handleThresholdChange(Number(e.target.value))}
                className={styles.thresholdSlider}
              />
            </div>
          </>
        )}
      </div>

      {/* Grid preview */}
      <div className={styles.previewSection}>
        <h2 className={styles.previewTitle}>
          {tab === 'photo' ? 'Preview' : 'Draw Your Puzzle'}
        </h2>
        <div
          className={styles.gridPreview}
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            maxWidth: `${size * 32}px`,
          }}
        >
          {Array.from({ length: size * size }).map((_, i) => (
            <div
              key={i}
              className={`${styles.previewCell} ${
                (activeGrid?.[i] ?? 0) === 1 ? styles.previewFilled : ''
              }`}
              role={tab === 'manual' ? 'button' : undefined}
              tabIndex={tab === 'manual' ? 0 : undefined}
              onClick={tab === 'manual' ? () => toggleManualCell(i) : undefined}
              onKeyDown={tab === 'manual' ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleManualCell(i); } } : undefined}
              style={tab === 'manual' ? { cursor: 'pointer' } : undefined}
            />
          ))}
        </div>
      </div>

      {solvability !== 'idle' && (
        <div className={`${styles.solvabilityBadge} ${
          solvability === 'solvable' ? styles.solvable :
          solvability === 'unsolvable' ? styles.unsolvable : ''
        }`}>
          {solvability === 'checking' && '⏳ Checking solvability…'}
          {solvability === 'solvable' && '✅ Logic-solvable'}
          {solvability === 'unsolvable' && '⚠️ May require guessing'}
        </div>
      )}

      {solvability === 'unsolvable' && (
        <p className={styles.solvabilityWarning}>
          This puzzle may require guessing. Consider adjusting the design for a pure-logic solution.
        </p>
      )}

      <button className={styles.createButton} onClick={handleCreate}>
        Create Puzzle
      </button>
    </div>
  );
}
