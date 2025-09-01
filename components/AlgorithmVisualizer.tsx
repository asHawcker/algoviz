import React, { useState } from 'react';
import { ALGORITHM_KEYS, ALGORITHMS } from '../constants';
import BubbleSort from './sorting/BubbleSort';
import InsertionSort from './sorting/InsertionSort';
import SelectionSort from './sorting/SelectionSort';
import QuickSort from './sorting/QuickSort';
import MergeSort from './sorting/MergeSort';
import ThreeWayMergeSort from './sorting/ThreeWayMergeSort';
import HeapSort from './sorting/HeapSort';
import CountSort from './sorting/CountSort';
import RadixSort from './sorting/RadixSort';
import LinearSearch from './searching/LinearSearch';
import BinarySearch from './searching/BinarySearch';
import InorderTraversal from './trees/InorderTraversal';
import PreorderTraversal from './trees/PreorderTraversal';
import PostorderTraversal from './trees/PostorderTraversal';
import Bfs from './trees/Bfs';
import Dfs from './trees/Dfs';
import MinHeap from './heaps/MinHeap';
import MaxHeap from './heaps/MaxHeap';
import Dijkstra from './graphs/Dijkstra';
import BellmanFord from './graphs/BellmanFord';
import Kruskal from './graphs/Kruskal';
import TopologicalSort from './graphs/TopologicalSort';

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ALGO_INFO = {
    [ALGORITHM_KEYS.DIJKSTRA]: {
        title: "Dijkstra's Algorithm",
        purpose: "Finds the shortest paths from a single source node to all other nodes in a weighted graph with non-negative edge weights.",
        howItWorks: [
            "It maintains a set of visited nodes and a priority queue of nodes to visit, prioritized by distance.",
            "It starts at the source node (distance 0) and iteratively selects the unvisited node with the smallest known distance.",
            "Once a node is selected, it's marked as visited, and the algorithm updates the distances of its unvisited neighbors if a shorter path is found."
        ],
        complexity: "O(E log V)",
        keyDataStructures: "Priority Queue, Distances Map/Array."
    },
    [ALGORITHM_KEYS.BELLMAN_FORD]: {
        title: "Bellman-Ford Algorithm",
        purpose: "Finds the shortest paths from a single source to all other nodes in a weighted graph. It is more versatile as it can handle graphs with negative edge weights.",
        howItWorks: [
            "It repeatedly 'relaxes' all edges in the graph.",
            "This process is repeated V-1 times, where V is the number of vertices. Each iteration finds shortest paths of at most a certain length.",
            "After V-1 iterations, a final pass over all edges is done. If any distance can still be improved, it indicates a negative-weight cycle is reachable from the source."
        ],
        complexity: "O(V * E)",
        keyDataStructures: "Distances and Predecessors Maps/Arrays."
    },
    [ALGORITHM_KEYS.KRUSKAL]: {
        title: "Kruskal's Algorithm",
        purpose: "Finds a Minimum Spanning Tree (MST) for a connected, undirected graph. An MST connects all vertices with the minimum possible total edge weight, without forming cycles.",
        howItWorks: [
            "It's a greedy algorithm that first sorts all edges by weight in non-decreasing order.",
            "It iterates through the sorted edges.",
            "For each edge, it checks if adding it to the current MST-in-progress would form a cycle. If not, the edge is added."
        ],
        complexity: "O(E log E)",
        keyDataStructures: "Disjoint Set Union (DSU) to efficiently detect cycles."
    },
    [ALGORITHM_KEYS.TOPOLOGICAL_SORT]: {
        title: "Topological Sort",
        purpose: "Produces a linear ordering of the nodes in a Directed Acyclic Graph (DAG), where for every directed edge from node A to node B, node A comes before node B in the ordering. It's often used for scheduling tasks with dependencies.",
        howItWorks: [
            "It first calculates the 'in-degree' (number of incoming edges) for every node.",
            "It initializes a queue with all nodes that have an in-degree of 0.",
            "While the queue is not empty, it dequeues a node, adds it to the final sorted list, and then for each of its neighbors, it decrements their in-degree.",
            "If a neighbor's in-degree becomes 0, it is added to the queue."
        ],
        complexity: "O(V + E)",
        keyDataStructures: "Queue, In-degree Map/Array."
    }
};


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
    const [showInfo, setShowInfo] = useState(false);

    const isGraphAlgo = [
        ALGORITHM_KEYS.DIJKSTRA,
        ALGORITHM_KEYS.BELLMAN_FORD,
        ALGORITHM_KEYS.KRUSKAL,
        ALGORITHM_KEYS.TOPOLOGICAL_SORT,
    ].includes(algorithmKey);
    
    const renderVisualizer = () => {
        switch (algorithmKey) {
            case ALGORITHM_KEYS.BUBBLE_SORT:
                return <BubbleSort />;
            case ALGORITHM_KEYS.INSERTION_SORT:
                return <InsertionSort />;
            case ALGORITHM_KEYS.SELECTION_SORT:
                return <SelectionSort />;
            case ALGORITHM_KEYS.QUICK_SORT:
                return <QuickSort />;
            case ALGORITHM_KEYS.MERGE_SORT:
                return <MergeSort />;
            case ALGORITHM_KEYS.THREE_WAY_MERGE_SORT:
                return <ThreeWayMergeSort />;
            case ALGORITHM_KEYS.HEAP_SORT:
                return <HeapSort />;
            case ALGORITHM_KEYS.COUNT_SORT:
                return <CountSort />;
            case ALGORITHM_KEYS.RADIX_SORT:
                return <RadixSort />;
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
            case ALGORITHM_KEYS.MIN_HEAP:
                return <MinHeap />;
            case ALGORITHM_KEYS.MAX_HEAP:
                return <MaxHeap />;
            case ALGORITHM_KEYS.DIJKSTRA:
                return <Dijkstra />;
            case ALGORITHM_KEYS.BELLMAN_FORD:
                return <BellmanFord />;
            case ALGORITHM_KEYS.KRUSKAL:
                return <Kruskal />;
            case ALGORITHM_KEYS.TOPOLOGICAL_SORT:
                return <TopologicalSort />;
            default:
                return <div className="text-center text-gray-500">Please select an algorithm.</div>;
        }
    }

    const infoContent = isGraphAlgo ? ALGO_INFO[algorithmKey as keyof typeof ALGO_INFO] : null;

    return (
        <div className="w-full h-full bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-gray-700">
                <h2 className="text-3xl font-bold text-white flex-grow">
                    {getAlgorithmName(algorithmKey)}
                </h2>
                {isGraphAlgo && (
                    <button 
                        onClick={() => setShowInfo(!showInfo)} 
                        className="text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0" 
                        title="Toggle algorithm info"
                        aria-expanded={showInfo}
                        aria-controls="algo-info-panel"
                    >
                        <InfoIcon />
                    </button>
                )}
            </div>

            {isGraphAlgo && showInfo && infoContent && (
                <div id="algo-info-panel" className="relative bg-gray-900 border border-gray-700 p-4 rounded-lg mb-4 text-gray-300 text-sm animate-fade-in flex-shrink-0">
                    <button onClick={() => setShowInfo(false)} className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors" aria-label="Close details">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h4 className="font-bold text-lg text-cyan-400 mb-2">{infoContent.title}</h4>
                    <p className="mb-3"><strong className="text-gray-100">Purpose:</strong> {infoContent.purpose}</p>
                    <p className="mb-2"><strong className="text-gray-100">How it works:</strong></p>
                    <ul className="list-disc list-inside space-y-1 mb-3 pl-2">
                        {infoContent.howItWorks.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                        <div><strong className="text-gray-100">Time Complexity:</strong> <span className="font-mono bg-gray-700 px-1 py-0.5 rounded">{infoContent.complexity}</span></div>
                        <div><strong className="text-gray-100">Key Data Structures:</strong> {infoContent.keyDataStructures}</div>
                    </div>
                </div>
            )}
            
            <div className="flex-grow min-h-0">
                {renderVisualizer()}
            </div>
        </div>
    );
};

export default AlgorithmVisualizer;