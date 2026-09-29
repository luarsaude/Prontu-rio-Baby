import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  Move,
} from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  title = 'Visualização do Documento',
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Touch pinch zoom state
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double tap / double click to toggle 2.5x zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers (Drag & Pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      // Double-tap detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleClick();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // Pan start if zoomed
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const factor = dist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(touchStartScaleRef.current * factor, 1), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-90 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar */}
      <div className="w-full px-4 py-3 flex items-center justify-between text-white bg-black/60 backdrop-blur-xs border-b border-white/10 z-20">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="text-base font-bold text-slate-100 truncate">
            {title}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-slate-200 font-semibold shrink-0">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white transition cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Interactive Image Stage */}
      <div
        ref={imageContainerRef}
        className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative touch-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={imageUrl}
          alt={title}
          draggable={false}
          className="max-w-[95%] max-h-[85vh] object-contain transition-transform duration-75 select-none pointer-events-auto"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        />

        {scale > 1 && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none shadow-md">
            <Move className="w-3.5 h-3.5" />
            <span>Arraste para mover</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="w-full pb-6 pt-3 px-4 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/20 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className={`p-2.5 rounded-full transition cursor-pointer ${
              scale <= 1 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20 active:scale-95'
            }`}
            title="Diminuir Zoom (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Scale Preset Badges */}
          <button
            type="button"
            onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              scale === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-white/15'
            }`}
          >
            1x
          </button>

          <button
            type="button"
            onClick={() => { setScale(2); }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              scale === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-white/15'
            }`}
          >
            2x
          </button>

          <button
            type="button"
            onClick={() => { setScale(3); }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              scale === 3 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-white/15'
            }`}
          >
            3x
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className={`p-2.5 rounded-full transition cursor-pointer ${
              scale >= 4 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:bg-white/20 active:scale-95'
            }`}
            title="Aumentar Zoom (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/20 active:scale-95 transition cursor-pointer border-l border-white/20 pl-3"
            title="Resetar Zoom (0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-400 text-[11px] font-medium tracking-wide">
          Dica: Use pinça com os dedos, duplo toque ou roda do mouse para ampliar
        </p>
      </div>
    </div>
  );
};
