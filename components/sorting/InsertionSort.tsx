import React, { useState, useEffect, useCallback } from 'react';
import SortControls from './SortControls';
import { useSortingTimer } from '../../hooks/useSortingTimer';

const MIN_VALUE = 10;
const MAX_VALUE = 100;
const DEFAULT_SPEED = 150;

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

type SortPhase = 'START_ITERATION' | 'SHIFTING' | 'INSERTING';

const InsertionSort: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(20);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);

  // Algorithm-specific state
  const [phase, setPhase] = useState<SortPhase>('START_ITERATION');
  const [i, setI] = useState<number>(1); // Outer loop index
  const [j, setJ] = useState<number>(0); // Inner loop index
  const [key, setKey] = useState<number | null>(null); // Value being inserted
  const [keyIndex, setKeyIndex] = useState<number | null>(null);

  const resetArray = useCallback(() => {
    setIsSorting(false);
    setIsSorted(false);
    setIsPaused(true);
    setPhase('START_ITERATION');
    setI(1);
    setJ(0);
    setKey(null);
    setKeyIndex(null);
    setArray(generateRandomArray(arraySize));
  }, [arraySize]);

  useEffect(() => {
    resetArray();
  }, [resetArray]);

  const performStep = useCallback(() => {
    if (i >= array.length) {
      setIsSorted(true);
      setIsSorting(false);
      setIsPaused(true);
      setKeyIndex(null);
      setKey(null);
      return;
    }

    let currentArray = [...array];

    if (phase === 'START_ITERATION') {
      const currentKey = currentArray[i];
      setKey(currentKey);
      setKeyIndex(i);
      setJ(i - 1);
      setPhase('SHIFTING');
    } else if (phase === 'SHIFTING') {
      if (j >= 0 && currentArray[j] > key!) {
        currentArray[j + 1] = currentArray[j];
        setArray(currentArray);
        setJ(j - 1);
      } else {
        setPhase('INSERTING');
      }
    } else if (phase === 'INSERTING') {
      currentArray[j + 1] = key!;
      setArray(currentArray);
      setI(i + 1);
      setPhase('START_ITERATION');
    }
  }, [array, i, j, key, phase]);

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
    if (isSorted) return 'bg-green-500';
    if (idx === keyIndex && phase !== 'INSERTING') return 'bg-purple-500';
    if (idx === j) return 'bg-yellow-400'; // Comparison pointer
    if (idx < i) return 'bg-green-500'; // Sorted portion
    return 'bg-gray-500'; // Unsorted portion
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
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-purple-500 mr-2"></div>Key</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-yellow-400 mr-2"></div>Comparing</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-green-500 mr-2"></div>Sorted</div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Side Panel for Key */}
        <div className="w-full lg:w-48 flex-shrink-0 bg-gray-900 p-2 rounded-md flex flex-col">
            <h3 className="text-center text-gray-400 font-bold mb-2 flex-shrink-0">Key
                <span className="text-xs font-normal block">(Element being inserted)</span>
            </h3>
            <div className="flex-grow flex items-center justify-center p-2 min-h-[7rem] lg:min-h-0">
                {key !== null && phase !== 'START_ITERATION' && (
                    <div className="flex flex-col items-center" style={{width: '3rem'}}>
                        <div
                            className={`w-full rounded-t-sm transition-all duration-200 bg-purple-500`}
                            style={{ height: `${key * 3}px` }}
                            title={key.toString()}
                        ></div>
                        <span className="text-sm mt-1 text-gray-300 font-bold">{key}</span>
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

export default InsertionSort;