import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 75;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type SortPhase = 'SCANNING' | 'SWAPPING';

const SelectionSort: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(20);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  
  // Algorithm-specific state
  const [phase, setPhase] = useState<SortPhase>('SCANNING');
  const [i, setI] = useState<number>(0); // Outer loop index, marks sorted boundary
  const [j, setJ] = useState<number>(1); // Inner loop index, scanner
  const [minIndex, setMinIndex] = useState<number>(0); // Index of min element in unsorted part
  const [swapIndices, setSwapIndices] = useState<number[] | null>(null);

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(true);
    setPhase('SCANNING');
    setI(0);
    setJ(1);
    setMinIndex(0);
    setSwapIndices(null);
    setArray(generateRandomArray(arraySize));
  }, [arraySize]);

  useEffect(() => {
    resetArray();
  }, [resetArray]);

  const performStep = useCallback(() => {
    setSwapIndices(null); // Clear swap highlight at the start of each step

    if (i >= array.length - 1) {
      setIsSorted(true);
      setIsSorting(false);
      setIsPaused(true);
      return;
    }

    let currentArray = [...array];
    
    if (phase === 'SCANNING') {
      if (j >= currentArray.length) {
        setPhase('SWAPPING');
      } else {
        if (currentArray[j] < currentArray[minIndex]) {
          setMinIndex(j);
        }
        setJ(j + 1);
      }
    } else if (phase === 'SWAPPING') {
      setSwapIndices([i, minIndex]);
      [currentArray[i], currentArray[minIndex]] = [currentArray[minIndex], currentArray[i]];
      setArray(currentArray);
      
      const newI = i + 1;
      setI(newI);
      setJ(newI + 1);
      setMinIndex(newI);
      setPhase('SCANNING');
    }
  }, [array, i, j, minIndex, phase]);

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
    if (!isSorting) setIsSorting(true);
    performStep();
  };
  
  const getBarColor = (idx: number) => {
    if (isSorted || idx < i) return 'bg-green-500';
    if (swapIndices?.includes(idx)) return 'bg-red-500';
    if (idx === minIndex) return 'bg-purple-500'; // Current minimum
    if (idx === j) return 'bg-yellow-400'; // Scanner
    if (idx === i) return 'bg-cyan-600'; // Boundary of sorted/unsorted
    return 'bg-gray-500';
  };

  return (
    <div className="flex flex-col h-full">
      <SortControls
        isSorting={isSorting} isPaused={isPaused} isFinished={isSorted}
        arraySize={arraySize} speed={speed}
        onReset={resetArray} onPlay={handlePlay} onPause={handlePause}
        onNextStep={handleNextStep} onSizeChange={setArraySize} onSpeedChange={setSpeed}
        maxSize={40}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-gray-300 p-2 bg-gray-900 rounded-md">
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center">
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-cyan-600 mr-2"></div>Boundary</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-yellow-400 mr-2"></div>Scanner</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-purple-500 mr-2"></div>Min Element</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-red-500 mr-2"></div>Swapping</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>Sorted</div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Side Panel for Current Minimum */}
        <div className="w-full lg:w-48 flex-shrink-0 bg-gray-900 p-2 rounded-md flex flex-col">
            <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">Current Minimum
                <span className="text-xs font-normal block">(In unsorted part)</span>
            </h3>
            <div className="flex-grow flex items-center justify-center p-2 min-h-[7rem] lg:min-h-0">
                {(isSorting && !isSorted && array[minIndex] !== undefined) && (
                    <div className="flex flex-col items-center" style={{width: '3rem'}}>
                        <div
                            className={`w-full rounded-t-sm transition-all duration-200 bg-purple-500`}
                            style={{ height: `${array[minIndex] * 3}px` }}
                            title={array[minIndex].toString()}
                        ></div>
                        <span className="text-sm mt-1 text-gray-300 font-bold">{array[minIndex]}</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Main Visualization */}
        <div className="flex-grow flex items-end justify-center space-x-1 bg-gray-900 p-4 rounded-md">
            {array.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[2.5rem]">
                <div
                className={`w-full rounded-t-sm transition-all duration-200 ${getBarColor(idx)}`}
                style={{ height: `${value * 3}px` }}
                title={value.toString()}
                ></div>
                <span className="text-xs mt-1 text-gray-400 hidden sm:inline">{value}</span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SelectionSort;