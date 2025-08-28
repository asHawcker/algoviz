import React, { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 50; // in ms

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => 
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

const BubbleSort: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(20);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [loopI, setLoopI] = useState<number>(0);
  const [loopJ, setLoopJ] = useState<number>(0);

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(true);
    setComparingIndices([]);
    setSortedIndices([]);
    setLoopI(0);
    setLoopJ(0);
    setArray(generateRandomArray(arraySize));
  }, [arraySize]);

  useEffect(() => {
    resetArray();
  }, [resetArray]);
  
  const performStep = useCallback(() => {
    if (isSorted || loopI >= array.length - 1) {
      if (!isSorted) {
        setSortedIndices(Array.from(Array(array.length).keys()));
        setIsSorted(true);
        setIsSorting(false);
        setIsPaused(true);
        setComparingIndices([]);
      }
      return;
    }

    let arr = [...array];
    let n = arr.length;
    let i = loopI;
    let j = loopJ;
   
    if (i < n - 1) {
      if (j < n - i - 1) {
        setComparingIndices([j, j + 1]);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray(arr);
        }
        setLoopJ(j + 1);
      } else {
        setSortedIndices(prev => [...prev, n - 1 - i]);
        setLoopI(i + 1);
        setLoopJ(0);
      }
    }
  }, [array, loopI, loopJ, isSorted]);

  useEffect(() => {
    let timerId: number | undefined;
    if (isSorting && !isPaused && !isSorted) {
      timerId = window.setTimeout(performStep, speed);
    }
    return () => clearTimeout(timerId);
  }, [isSorting, isPaused, isSorted, performStep, speed]);

  const handlePlay = () => {
    if (isSorted) {
      resetArray();
      setTimeout(() => {
        setIsSorting(true);
        setIsPaused(false);
      }, 50);
    } else {
      setIsSorting(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => setIsPaused(true);

  const handleNextStep = () => {
    setIsPaused(true);
    if (!isSorting) {
      setIsSorting(true);
    }
    performStep();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
        <div className="flex items-center space-x-4">
          <button onClick={resetArray} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
            New Array
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm whitespace-nowrap">Array Size</span>
                <input
                    type="range"
                    min="5"
                    max="40"
                    value={arraySize}
                    onChange={(e) => setArraySize(Number(e.target.value))}
                    disabled={isSorting}
                    className="w-24 md:w-32 cursor-pointer"
                />
                 <span className="text-gray-300 text-sm w-4">{arraySize}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Speed</span>
                <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={510 - speed}
                onChange={(e) => setSpeed(510 - Number(e.target.value))}
                disabled={isSorting && !isPaused}
                className="w-24 md:w-32 cursor-pointer"
                />
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handlePlay} disabled={isSorting && !isPaused} title={isSorted ? "Play Again" : "Play"} className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPlay size={20} /></button>
                <button onClick={handlePause} disabled={!isSorting || isPaused || isSorted} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPause size={20} /></button>
                <button onClick={handleNextStep} disabled={isSorted} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiSkipForward size={20} /></button>
            </div>
        </div>
      </div>
      
      {/* Visualization */}
      <div className="flex-grow flex items-end justify-center space-x-1 bg-gray-900 p-4 rounded-md min-h-[400px]">
        {array.map((value, idx) => {
          const isComparing = comparingIndices.includes(idx);
          const isSortedIdx = sortedIndices.includes(idx);
          let bgColor = 'bg-gray-500'; // Default bar color
          if (isComparing) bgColor = 'bg-yellow-400';
          if (isSortedIdx) bgColor = 'bg-green-500';
          if (isSorted) bgColor = 'bg-green-500'; // All green when done

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[2.5rem]">
              <div 
                className={`w-full rounded-t-sm transition-all duration-200 ${bgColor}`}
                style={{ height: `${value * 3}px` }}
                title={value.toString()}
              ></div>
              <span className="text-xs mt-1 text-gray-400 hidden sm:inline">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BubbleSort;
