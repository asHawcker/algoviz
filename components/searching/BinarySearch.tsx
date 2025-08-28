import React, { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';

const MIN_VALUE = 1;
const MAX_VALUE = 99;
const DEFAULT_SPEED = 750; // in ms

const generateSortedArray = (size: number) => {
  const set = new Set<number>();
  while (set.size < size) {
    set.add(Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE);
  }
  return Array.from(set).sort((a, b) => a - b);
};

const BinarySearch: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(17);
  const [target, setTarget] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  
  const [low, setLow] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);
  const [mid, setMid] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');

  const reset = useCallback(() => {
    setIsSearching(false);
    setIsPaused(true);
    setFoundIndex(null);
    setNotFound(false);
    setLow(null);
    setHigh(null);
    setMid(null);
    setStatus('');
    const newArray = generateSortedArray(arraySize);
    setArray(newArray);
    setTarget(String(newArray[Math.floor(Math.random() * newArray.length)]));
  }, [arraySize]);
  
  useEffect(() => {
    reset();
  }, [reset]);
  
  const isSearchOver = foundIndex !== null || notFound;

  const performStep = useCallback(() => {
    if (isSearchOver) return;

    let l = low;
    let h = high;
    
    // Initialize if it's the first step
    if (l === null || h === null) {
      l = 0;
      h = array.length - 1;
    }

    if (l > h) {
      setNotFound(true);
      setStatus(`'${target}' not found in the array.`);
      setIsSearching(false);
      setIsPaused(true);
      return;
    }
    
    // Phase 1: Calculate Mid
    if (mid === null) {
      const m = Math.floor(l + (h - l) / 2);
      setLow(l);
      setHigh(h);
      setMid(m);
      setStatus(`Setting mid at index ${m}. Value: ${array[m]}`);
    } 
    // Phase 2: Compare and Adjust
    else {
      const numTarget = parseInt(target, 10);
      if (array[mid] === numTarget) {
        setFoundIndex(mid);
        setStatus(`Found '${target}' at index ${mid}!`);
        setIsSearching(false);
        setIsPaused(true);
      } else {
        if (array[mid] < numTarget) {
          setStatus(`'${target}' > ${array[mid]}. Searching right half.`);
          setLow(mid + 1);
        } else {
          setStatus(`'${target}' < ${array[mid]}. Searching left half.`);
          setHigh(mid - 1);
        }
        setMid(null);
      }
    }
  }, [array, low, high, mid, target, isSearchOver]);

  useEffect(() => {
    let timerId: number | undefined;
    if (isSearching && !isPaused && !isSearchOver) {
      timerId = window.setTimeout(performStep, speed);
    }
    return () => clearTimeout(timerId);
  }, [isSearching, isPaused, isSearchOver, performStep, speed]);

  const handlePlay = () => {
    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget)) {
      setStatus("Please enter a valid number.");
      return;
    }
    
    if (isSearchOver) {
        setFoundIndex(null);
        setNotFound(false);
        setLow(null);
        setHigh(null);
        setMid(null);
        setStatus('Starting binary search.');
    }
    
    setIsSearching(true);
    setIsPaused(false);
  };
  
  const handlePause = () => setIsPaused(true);

  const handleNextStep = () => {
    if (isSearchOver) return;
    setIsPaused(true);
    if (!isSearching) {
      const numTarget = parseInt(target, 10);
      if (isNaN(numTarget)) {
          setStatus("Please enter a valid number.");
          return;
      }
      setIsSearching(true);
      setFoundIndex(null);
      setNotFound(false);
      setLow(null);
      setHigh(null);
      setMid(null);
      setStatus('Starting binary search.');
    }
    performStep();
  };

  const getCellClass = (idx: number) => {
      if (foundIndex === idx) return 'bg-green-500 text-black scale-110';
      if (mid === idx) return 'bg-yellow-400 text-black scale-110';
      if (low !== null && high !== null && (idx < low || idx > high)) return 'bg-gray-800 text-gray-500';
      return 'bg-gray-600 text-white';
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
        <div className="flex items-center space-x-4 flex-wrap justify-center">
          <button onClick={reset} disabled={isSearching && !isPaused} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
            New Array
          </button>
          <input 
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={isSearching}
            className="w-24 p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Number"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm whitespace-nowrap">Array Size</span>
                <input
                    type="range"
                    min="5"
                    max="25"
                    value={arraySize}
                    onChange={(e) => setArraySize(Number(e.target.value))}
                    disabled={isSearching}
                    className="w-24 md:w-32 cursor-pointer"
                />
                <span className="text-gray-300 text-sm w-4">{arraySize}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Speed</span>
                <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={2100-speed}
                    onChange={(e) => setSpeed(2100 - Number(e.target.value))}
                    disabled={isSearching && !isPaused}
                    className="w-24 md:w-32 cursor-pointer"
                />
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={handlePlay} disabled={!target || (isSearching && !isPaused)} title="Play" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPlay size={20} /></button>
                <button onClick={handlePause} disabled={!isSearching || isPaused || isSearchOver} title="Pause" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiPause size={20} /></button>
                <button onClick={handleNextStep} disabled={isSearchOver} title="Next Step" className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"><FiSkipForward size={20} /></button>
            </div>
        </div>
      </div>
      
      {/* Visualization */}
      <div className="flex-grow flex flex-col justify-center bg-gray-900 p-4 rounded-md min-h-[250px]">
        <div className="relative flex flex-wrap items-start justify-center gap-2">
            {array.map((value, idx) => (
                <div key={idx} className="flex flex-col items-center w-10 md:w-12">
                    <div 
                        className={`w-full h-10 md:h-12 flex items-center justify-center text-lg font-bold rounded-md transition-all duration-300 ${getCellClass(idx)}`}
                    >
                        {value}
                    </div>
                    <div className="h-12 mt-1 flex flex-col items-center justify-start text-sm pt-1">
                        {low === idx && <span className="font-bold text-blue-400">Low</span>}
                        {high === idx && <span className="font-bold text-red-400">High</span>}
                        {mid === idx && <span className="font-bold text-yellow-400 animate-pulse">Mid</span>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 text-center text-lg h-8">
        <p className={`
          ${foundIndex !== null ? 'text-green-400' : ''}
          ${notFound ? 'text-red-500' : ''}
          ${isSearching && !isSearchOver ? 'text-yellow-400' : ''}
        `}>
          {status || 'Enter a number and click play to start.'}
        </p>
      </div>
    </div>
  );
};

export default BinarySearch;
