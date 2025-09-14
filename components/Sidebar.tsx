import React, { useState } from 'react';
import { ALGORITHMS } from '../constants';
import type { Algorithm, AlgorithmCategory } from '../types';
import Footer from './Footer';

interface SidebarProps {
  onSelectAlgorithm: (key: string) => void;
  selectedAlgorithm: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ onSelectAlgorithm, selectedAlgorithm, isOpen, onClose }) => {
  const [openCategories, setOpenCategories] = useState<string[]>(['SORTING']);

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  return (
    <aside className={`w-64 bg-gray-800 flex flex-col shadow-2xl fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 flex-shrink-0">
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-wider">AlgoViz</h1>
                <p className="text-sm text-cyan-400">Visualize Algorithms</p>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-md hover:bg-gray-700" aria-label="Close menu">
                <CloseIcon />
            </button>
        </div>
      </div>
      
      <nav className="flex-grow overflow-y-auto px-4">
        {Object.entries(ALGORITHMS).map(([categoryKey, category]) => (
          <div key={categoryKey} className="mb-4">
            <button 
              onClick={() => toggleCategory(categoryKey)}
              className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <span>{category.name}</span>
              <ChevronDownIcon className={`transition-transform duration-300 ${openCategories.includes(categoryKey) ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${openCategories.includes(categoryKey) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <ul className="overflow-hidden pl-4 mt-2 border-l-2 border-gray-600">
                {Object.values(category.algorithms).map((algo: Algorithm) => (
                  <li key={algo.key}>
                    <button
                      onClick={() => onSelectAlgorithm(algo.key)}
                      className={`w-full text-left py-2 px-3 my-1 rounded-md transition-colors ${
                        selectedAlgorithm === algo.key
                          ? 'bg-cyan-600 text-white font-medium'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                    >
                      {algo.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </nav>
      <Footer />
    </aside>
  );
};

export default Sidebar;