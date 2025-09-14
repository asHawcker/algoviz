import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
import { ALGORITHM_KEYS } from './constants';

const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
    <header className="lg:hidden flex items-center justify-between p-4 bg-gray-800 text-white shadow-md z-10">
        <h1 className="text-xl font-bold tracking-wider">AlgoViz</h1>
        <button onClick={onMenuClick} className="p-2 rounded-md hover:bg-gray-700" aria-label="Open menu">
            <MenuIcon />
        </button>
    </header>
);

const App: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectAlgorithm = (key: string) => {
    setSelectedAlgorithm(key);
    setIsSidebarOpen(false); // Close sidebar on selection for mobile
  };

  const welcomeScreenSelect = (key: string) => {
    setSelectedAlgorithm(key);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 min-h-0 relative">
        <Sidebar 
            onSelectAlgorithm={handleSelectAlgorithm} 
            selectedAlgorithm={selectedAlgorithm}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-6 md:p-10 overflow-auto">
            {selectedAlgorithm ? (
            <AlgorithmVisualizer algorithmKey={selectedAlgorithm} />
            ) : (
            <WelcomeScreen onSelectBubbleSort={() => welcomeScreenSelect(ALGORITHM_KEYS.BUBBLE_SORT)} />
            )}
        </main>
      </div>
       {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-20"
            aria-hidden="true"
        />
      )}
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