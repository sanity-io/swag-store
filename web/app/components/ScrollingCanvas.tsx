'use client';

import {useRef, useEffect} from 'react';
import gsap from 'gsap';

const GRID_SIZE = 8;
const CELL_SIZE = 100;
const GRID_WIDTH = GRID_SIZE * CELL_SIZE;
const GRID_HEIGHT = GRID_WIDTH;

export default function ScrollingCanvas() {
  return <InfiniteGridDrag />;
}

function InfiniteGridDrag() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({x: 0, y: 0});
  const currentPos = useRef({x: 0, y: 0});

  useEffect(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    // Calculate how many grids we need to cover the viewport
    const numGridsX = Math.ceil(window.innerWidth / GRID_WIDTH) + 2;
    const numGridsY = Math.ceil(window.innerHeight / GRID_HEIGHT) + 2;

    // Calculate the offset to center the grids
    const offsetX = -(numGridsX * GRID_WIDTH) / 2;
    const offsetY = -(numGridsY * GRID_HEIGHT) / 2;

    // Create grid cells
    const gridContainer = document.createElement('div');
    gridContainer.style.position = 'absolute';
    gridContainer.style.width = '100%';
    gridContainer.style.height = '100%';

    for (let y = 0; y < numGridsY; y++) {
      for (let x = 0; x < numGridsX; x++) {
        const cell = document.createElement('div');
        cell.style.position = 'absolute';
        cell.style.left = `${offsetX + x * GRID_WIDTH}px`;
        cell.style.top = `${offsetY + y * GRID_HEIGHT}px`;
        cell.style.width = `${GRID_WIDTH}px`;
        cell.style.height = `${GRID_HEIGHT}px`;
        cell.style.backgroundColor = '#FF6B6B';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.color = 'white';
        cell.style.fontSize = '24px';
        cell.style.fontWeight = 'bold';
        cell.textContent = `Grid ${x}, ${y}`;
        gridContainer.appendChild(cell);
      }
    }

    grid.appendChild(gridContainer);

    // GSAP animation setup
    gsap.set(grid, {x: 0, y: 0});

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      startPos.current = {
        x: e.clientX - currentPos.current.x,
        y: e.clientY - currentPos.current.y,
      };
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const newX = e.clientX - startPos.current.x;
      const newY = e.clientY - startPos.current.y;

      currentPos.current = {x: newX, y: newY};
      gsap.to(grid, {
        x: newX,
        y: newY,
        duration: 0,
        ease: 'none',
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      container.style.cursor = 'grab';
    };

    // Event listeners
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden relative cursor-grab"
    >
      <div
        ref={gridRef}
        className="absolute inset-0"
        style={{willChange: 'transform'}}
      />
    </div>
  );
}
