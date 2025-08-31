import React from 'react';

interface SortControlsProps {
  // State
  isSorting: boolean;
  isPaused: boolean;
  isFinished: boolean;
  arraySize: number;
  speed: number;
  // Handlers
  onReset: () => void;
  onPlay: () => void;
  onPause: () => void;
  onNextStep: () => void;
  onSizeChange: (size: number) => void;
  onSpeedChange: (speed: number) => void;
  // Options
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  speedStep?: number;
  children?: React.ReactNode;
}

const SortControls: React.FC<SortControlsProps> = ({
  isSorting, isPaused, isFinished, arraySize, speed,
  onReset, onPlay, onPause, onNextStep, onSizeChange, onSpeedChange,
  minSize = 5, maxSize = 40,
  minSpeed = 10, maxSpeed = 500, speedStep = 10,
  children
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
      <div className="flex items-center space-x-4">
        <button onClick={onReset} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
          New Array
        </button>
        {children}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm whitespace-nowrap">Array Size</span>
          <input
            type="range"
            min={minSize}
            max={maxSize}
            value={arraySize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            disabled={isSorting}
            className="w-24 md:w-32 cursor-pointer"
          />
          <span className="text-gray-300 text-sm w-4">{arraySize}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm">Speed</span>
          <input
            type="range"
            min={minSpeed}
            max={maxSpeed}
            step={speedStep}
            value={maxSpeed + minSpeed - speed}
            onChange={(e) => onSpeedChange(maxSpeed + minSpeed - Number(e.target.value))}
            disabled={isSorting && !isPaused}
            className="w-24 md:w-32 cursor-pointer"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onPlay} disabled={isSorting && !isPaused} title={isFinished ? "Play Again" : "Play"} className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button onClick={onPause} disabled={!isSorting || isPaused || isFinished} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          </button>
          <button onClick={onNextStep} disabled={isFinished} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortControls;