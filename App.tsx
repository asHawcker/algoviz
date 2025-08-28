
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
import { ALGORITHM_KEYS } from './constants';

const App: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar onSelectAlgorithm={setSelectedAlgorithm} selectedAlgorithm={selectedAlgorithm} />
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {selectedAlgorithm ? (
          <AlgorithmVisualizer algorithmKey={selectedAlgorithm} />
        ) : (
          <WelcomeScreen onSelectBubbleSort={() => setSelectedAlgorithm(ALGORITHM_KEYS.BUBBLE_SORT)} />
        )}
      </main>
    </div>
  );
};

interface WelcomeScreenProps {
    onSelectBubbleSort: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectBubbleSort }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-5xl font-bold text-cyan-400 mb-4">Welcome to Algorithm Visualizer</h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-8">
            Explore the inner workings of classic computer science algorithms. Select a category and an algorithm from the sidebar to begin.
        </p>
        <div className="flex items-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span className="text-xl text-gray-500">Choose an algorithm to start</span>
        </div>
         <button 
            onClick={onSelectBubbleSort}
            className="mt-12 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:bg-cyan-700 transition-transform transform hover:scale-105"
        >
            Or start with Bubble Sort
        </button>
    </div>
);


export default App;
