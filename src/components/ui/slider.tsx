// src/components/ui/slider.tsx
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, value, onChange, min = 0, max = 100, step = 1, ...props },
    ref
  ) => {
    const [localValue, setLocalValue] = useState<number>(value || min);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);

    // Update local value when prop value changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Calculate percentage for styling
    const percentage = ((localValue - min) / (max - min)) * 100;

    // Handle slider click and drag
    const updateValue = (clientX: number) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      const offsetX = clientX - rect.left;

      // Calculate new value based on position
      let newPercentage = Math.max(
        0,
        Math.min(100, (offsetX / trackWidth) * 100)
      );
      let newValue = min + (newPercentage / 100) * (max - min);

      // Apply step if provided
      if (step > 0) {
        newValue = Math.round(newValue / step) * step;
      }

      // Ensure value is within bounds
      newValue = Math.max(min, Math.min(max, newValue));

      setLocalValue(newValue);
      onChange?.(newValue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      updateValue(e.clientX);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        updateValue(e.clientX);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTrackClick = (e: React.MouseEvent) => {
      updateValue(e.clientX);
    };

    // Clean up event listeners
    useEffect(() => {
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    return (
      <div className={cn('relative w-full h-6 flex items-center', className)}>
        <div
          ref={trackRef}
          className="absolute h-2 w-full rounded-full bg-gray-200 cursor-pointer"
          onClick={handleTrackClick}
        >
          <div
            className="absolute h-full rounded-full bg-gray-900"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          ref={thumbRef}
          className="absolute h-4 w-4 rounded-full bg-gray-900 shadow-md cursor-grab hover:bg-black focus:outline-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
          onMouseDown={handleMouseDown}
          tabIndex={0}
          role="slider"
          aria-valuenow={localValue}
          aria-valuemin={min}
          aria-valuemax={max}
          {...props}
        />
        <input
          type="hidden"
          ref={ref}
          value={localValue}
          min={min}
          max={max}
          step={step}
        />
      </div>
    );
  }
);
