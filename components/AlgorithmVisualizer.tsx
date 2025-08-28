import React from 'react';
import { ALGORITHM_KEYS, ALGORITHMS } from '../constants';
import BubbleSort from './sorting/BubbleSort';
import QuickSort from './sorting/QuickSort';
import MergeSort from './sorting/MergeSort';
import LinearSearch from './searching/LinearSearch';
import BinarySearch from './searching/BinarySearch';
import InorderTraversal from './trees/InorderTraversal';
import PreorderTraversal from './trees/PreorderTraversal';
import PostorderTraversal from './trees/PostorderTraversal';
import Bfs from './trees/Bfs';
import Dfs from './trees/Dfs';


interface AlgorithmVisualizerProps {
  algorithmKey: string;
}

const getAlgorithmName = (key: string): string => {
    for (const category of Object.values(ALGORITHMS)) {
        if (category.algorithms[key]) {
            return category.algorithms[key].name;
        }
    }
    return "Algorithm";
}

const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({ algorithmKey }) => {
    
    const renderVisualizer = () => {
        switch (algorithmKey) {
            case ALGORITHM_KEYS.BUBBLE_SORT:
                return <BubbleSort />;
            case ALGORITHM_KEYS.QUICK_SORT:
                return <QuickSort />;
            case ALGORITHM_KEYS.MERGE_SORT:
                return <MergeSort />;
            case ALGORITHM_KEYS.LINEAR_SEARCH:
                return <LinearSearch />;
            case ALGORITHM_KEYS.BINARY_SEARCH:
                return <BinarySearch />;
            case ALGORITHM_KEYS.INORDER_TRAVERSAL:
                return <InorderTraversal />;
            case ALGORITHM_KEYS.PREORDER_TRAVERSAL:
                return <PreorderTraversal />;
            case ALGORITHM_KEYS.POSTORDER_TRAVERSAL:
                return <PostorderTraversal />;
            case ALGORITHM_KEYS.BFS:
                return <Bfs />;
            case ALGORITHM_KEYS.DFS:
                return <Dfs />;
            default:
                return <div className="text-center text-gray-500">Please select an algorithm.</div>;
        }
    }

    return (
        <div className="w-full h-full bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-6 pb-4 border-b-2 border-gray-700">
                {getAlgorithmName(algorithmKey)}
            </h2>
            <div className="flex-grow">
                {renderVisualizer()}
            </div>
        </div>
    );
};

export default AlgorithmVisualizer;