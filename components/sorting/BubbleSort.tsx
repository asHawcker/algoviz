import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

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

  useSortingTimer({ isSorting, isPaused, isFinished: isSorted, speed, performStep });

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
      <SortControls
        isSorting={isSorting}
        isPaused={isPaused}
        isFinished={isSorted}
        arraySize={arraySize}
        speed={speed}
        onReset={resetArray}
        onPlay={handlePlay}
        onPause={handlePause}
        onNextStep={handleNextStep}
        onSizeChange={setArraySize}
        onSpeedChange={setSpeed}
        maxSize={40}
      />
      
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