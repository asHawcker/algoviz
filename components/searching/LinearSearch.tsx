import React, { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiSkipForward } from 'react-icons/fi';

const MIN_VALUE = 1;
const MAX_VALUE = 99;
const DEFAULT_SPEED = 200; // in ms

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => 
    Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
  );
};

const LinearSearch: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState<number>(15);
  const [target, setTarget] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);

  const isSearchOver = foundIndex !== null || notFound;

  const reset = useCallback(() => {
    setIsSearching(false);
    setIsPaused(true);
    setCurrentIndex(null);
    setFoundIndex(null);
    setNotFound(false);
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
    setTarget(String(newArray[Math.floor(Math.random() * newArray.length)]));
  }, [arraySize]);
  
  useEffect(() => {
    reset();
  }, [reset]);

  const performStep = useCallback(() => {
    if (isSearchOver) return;

    const numTarget = parseInt(target, 10);
    const nextIndex = currentIndex === null ? 0 : currentIndex + 1;

    if (nextIndex >= array.length) {
      setNotFound(true);
      setIsSearching(false);
      setIsPaused(true);
      setCurrentIndex(null);
      return;
    }

    setCurrentIndex(nextIndex);

    if (array[nextIndex] === numTarget) {
      setFoundIndex(nextIndex);
      setIsSearching(false);
      setIsPaused(true);
    }
  }, [array, currentIndex, target, isSearchOver]);

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
      alert("Please enter a valid number.");
      return;
    }
    
    if (isSearchOver) {
        setCurrentIndex(null);
        setFoundIndex(null);
        setNotFound(false);
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
            alert("Please enter a valid number.");
            return;
        }
        setIsSearching(true);
        setCurrentIndex(null);
        setFoundIndex(null);
        setNotFound(false);
    }
    performStep();
  };


  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 p-2 bg-gray-700 rounded-md flex-wrap">
        <div className="flex items-center space-x-4 flex-wrap justify-center">
          <button onClick={reset} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors">
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
                    min="50"
                    max="1000"
                    step="50"
                    value={1050-speed}
                    onChange={(e) => setSpeed(1050 - Number(e.target.value))}
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
      <div className="flex-grow flex flex-wrap items-center justify-center gap-2 bg-gray-900 p-4 rounded-md min-h-[200px]">
        {array.map((value, idx) => {
          const isCurrent = currentIndex === idx;
          const isFound = foundIndex === idx;
          let bgColor = 'bg-gray-600';
          let textColor = 'text-white';
          if (isCurrent) bgColor = 'bg-yellow-400';
          if (isFound) bgColor = 'bg-green-500';
          if(isCurrent || isFound) textColor = 'text-black'

          return (
            <div 
              key={idx} 
              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-lg font-bold rounded-md transition-all duration-200 ${bgColor} ${textColor}`}
            >
              {value}
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      <div className="mt-4 text-center text-lg h-8">
        {isSearching && currentIndex !== null && <p className="text-yellow-400 animate-pulse">Searching... Comparing with {array[currentIndex]}</p>}
        {foundIndex !== null && <p className="text-green-400">Found {target} at index {foundIndex}!</p>}
        {notFound && <p className="text-red-500">{target} not found in the array.</p>}
      </div>
    </div>
  );
};

export default LinearSearch;
