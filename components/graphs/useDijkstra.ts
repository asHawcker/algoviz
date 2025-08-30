import { useState, useCallback, useEffect } from 'react';
import { useSortingTimer } from '../../hooks/useSortingTimer';
import { calculateFruchtermanReingoldLayout } from './graphLayout';

// --- TYPES ---
export interface GraphNode {
    id: string;
    x: number;
    y: number;
    edges: Map<string, number>; // Map<neighborId, weight>
}
export type Graph = Map<string, GraphNode>;

type DijkstraPhase = 'IDLE' | 'DEQUEUE' | 'RELAX_EDGE' | 'FINISHED_NODE' | 'DONE';

interface AnimationState {
    distances: Map<string, number>;
    priorityQueue: [string, number][];
    visited: Set<string>;
    previous: Map<string, string | null>;
    currentNode: string | null;
    currentNeighbors: string[];
    currentNeighborIndex: number;
    edgeToHighlight: [string, string] | null;
    path: string[];
    statusText: string;
    phase: DijkstraPhase;
}

// --- CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_SPEED = 400;

// --- HELPERS ---
const generateNodeId = (i: number) => String.fromCharCode(65 + i);

const generateGraph = (numNodes: number, extraEdges: number): Graph => {
    const graph: Graph = new Map();
    const nodes: GraphNode[] = [];

    // 1. Create nodes with initial random positions
    for (let i = 0; i < numNodes; i++) {
        const id = generateNodeId(i);
        const node: GraphNode = {
            id,
            x: Math.random() * (CANVAS_WIDTH - 100) + 50,
            y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
            edges: new Map(),
        };
        nodes.push(node);
        graph.set(id, node);
    }

    if (numNodes <= 1) {
        return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    }

    // 2. Create a connected graph (spanning tree) to ensure reachability
    const connected = new Set<string>([nodes[0].id]);
    const unconnected = new Set<string>(nodes.slice(1).map(n => n.id));
    while (unconnected.size > 0) {
        // Pick a random unconnected node
        const uNodeId = Array.from(unconnected)[Math.floor(Math.random() * unconnected.size)];
        // Pick a random connected node
        const vNodeId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
        
        const weight = Math.floor(Math.random() * 15) + 1;
        graph.get(uNodeId)!.edges.set(vNodeId, weight);
        graph.get(vNodeId)!.edges.set(uNodeId, weight);
        
        connected.add(uNodeId);
        unconnected.delete(uNodeId);
    }

    // 3. Add some extra edges to create cycles
    const maxPossibleExtraEdges = (numNodes * (numNodes - 1) / 2) - (numNodes - 1);
    const edgesToAdd = Math.min(extraEdges, maxPossibleExtraEdges);

    for (let i = 0; i < edgesToAdd; i++) {
        let n1, n2;
        let tries = 0;
        do {
            n1 = nodes[Math.floor(Math.random() * nodes.length)];
            n2 = nodes[Math.floor(Math.random() * nodes.length)];
            if (++tries > numNodes * 5) break; // Safety break
        } while (n1.id === n2.id || n1.edges.has(n2.id));

        if (n1.id !== n2.id && !n1.edges.has(n2.id)) {
            const weight = Math.floor(Math.random() * 20) + 1;
            n1.edges.set(n2.id, weight);
            n2.edges.set(n1.id, weight);
        }
    }

    // 4. Calculate final node positions using the layout algorithm
    return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
};


// --- THE HOOK ---
const useDijkstra = () => {
    const [numNodes, setNumNodes] = useState(10);
    const [numEdges, setNumEdges] = useState(4);

    const [graph, setGraph] = useState<Graph>(() => generateGraph(numNodes, numEdges));
    const [nodesList, setNodesList] = useState<string[]>([]);
    const [startNode, setStartNode] = useState<string | null>(null);
    const [endNode, setEndNode] = useState<string | null>(null);
    
    const [animation, setAnimation] = useState<AnimationState>({
        distances: new Map(),
        priorityQueue: [],
        visited: new Set(),
        previous: new Map(),
        currentNode: null,
        currentNeighbors: [],
        currentNeighborIndex: 0,
        edgeToHighlight: null,
        path: [],
        statusText: 'Select a start and end node.',
        phase: 'IDLE',
    });

    const [isFinding, setIsFinding] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [speed, setSpeed] = useState(DEFAULT_SPEED);

    const resetAlgorithmState = useCallback(() => {
        setIsFinding(false);
        setIsPaused(true);
        setIsFinished(false);
        setAnimation({
            distances: new Map(nodesList.map(id => [id, Infinity])),
            priorityQueue: [],
            visited: new Set(),
            previous: new Map(nodesList.map(id => [id, null])),
            currentNode: null,
            currentNeighbors: [],
            currentNeighborIndex: 0,
            edgeToHighlight: null,
            path: [],
            statusText: 'Select a start and end node, then press play.',
            phase: 'IDLE',
        });
    }, [nodesList]);

    const reset = useCallback(() => {
        const newGraph = generateGraph(numNodes, numEdges);
        const newNodeList = Array.from(newGraph.keys()).sort();
        setGraph(newGraph);
        setNodesList(newNodeList);
        const newStart = newNodeList[0] || null;
        const newEnd = newNodeList.length > 1 ? newNodeList[newNodeList.length - 1] : null;
        setStartNode(newStart);
        setEndNode(newEnd);
    }, [numNodes, numEdges]);

    useEffect(() => {
        reset();
    }, [reset]);

    useEffect(() => {
        resetAlgorithmState();
    }, [startNode, endNode, graph, resetAlgorithmState]);

    const performStep = useCallback(() => {
        const prev = animation;
        const state: AnimationState = {
            ...prev,
            distances: new Map(prev.distances),
            visited: new Set(prev.visited),
            previous: new Map(prev.previous),
            priorityQueue: [...prev.priorityQueue],
            edgeToHighlight: null, // Clear highlight each step
        };

        switch (state.phase) {
            case 'IDLE':
                if (startNode) {
                    state.phase = 'DEQUEUE';
                    state.distances.set(startNode, 0);
                    state.priorityQueue = [[startNode, 0]];
                    state.statusText = `Ready! Start node ${startNode} has distance 0.`;
                }
                break;

            case 'DEQUEUE': {
                if (state.priorityQueue.length === 0) {
                    state.phase = 'DONE';
                    state.statusText = endNode ? `Finished. ${endNode} is not reachable.` : 'Finished. No path to find.';
                    setIsFinding(false); setIsFinished(true);
                    break;
                }

                state.priorityQueue.sort((a, b) => a[1] - b[1]);
                const [currentId] = state.priorityQueue.shift()!;

                if (state.visited.has(currentId)) {
                    state.statusText = `Node ${currentId} already finalized. Dequeuing next.`;
                    break; // Stay in DEQUEUE phase
                }

                state.currentNode = currentId;

                if (currentId === endNode) {
                    state.statusText = `Reached destination ${endNode}! Reconstructing path.`;
                    let currentPathNode: string | null = endNode;
                    while (currentPathNode) {
                        state.path.unshift(currentPathNode);
                        currentPathNode = state.previous.get(currentPathNode) ?? null;
                    }
                    state.phase = 'DONE';
                    setIsFinding(false); setIsFinished(true);
                    break;
                }
                
                state.currentNeighbors = Array.from(graph.get(currentId)!.edges.keys());
                state.currentNeighborIndex = 0;
                state.phase = 'RELAX_EDGE';
                state.statusText = `Dequeued ${currentId}. Visiting its neighbors.`;
                break;
            }
            
            case 'RELAX_EDGE': {
                const node = state.currentNode!;
                const neighbors = state.currentNeighbors;

                if (state.currentNeighborIndex >= neighbors.length) {
                    state.phase = 'FINISHED_NODE';
                    break;
                }

                const neighborId = neighbors[state.currentNeighborIndex];
                if (!state.visited.has(neighborId)) {
                    state.edgeToHighlight = [node, neighborId];
                    const weight = graph.get(node)!.edges.get(neighborId)!;
                    const currentDist = state.distances.get(node)!;
                    const newDist = currentDist + weight;
                    const neighborCurrentDist = state.distances.get(neighborId) ?? Infinity;

                    if (newDist < neighborCurrentDist) {
                        state.distances.set(neighborId, newDist);
                        state.previous.set(neighborId, node);
                        state.priorityQueue = state.priorityQueue.filter(p => p[0] !== neighborId);
                        state.priorityQueue.push([neighborId, newDist]);
                        state.statusText = `Shorter path to ${neighborId} found! New distance: ${newDist}.`;
                    } else {
                        state.statusText = `Path to ${neighborId} via ${node} (${newDist}) is not shorter.`;
                    }
                }

                state.currentNeighborIndex++;
                if (state.currentNeighborIndex >= neighbors.length) {
                    state.phase = 'FINISHED_NODE';
                    state.statusText = `Finished checking neighbors of ${node}.`;
                }
                break;
            }
            
            case 'FINISHED_NODE':
                state.visited.add(state.currentNode!);
                state.currentNode = null;
                state.phase = 'DEQUEUE';
                break;
            
            case 'DONE':
                setIsFinding(false);
                setIsFinished(true);
                break;
        }

        setAnimation(state);
    }, [graph, startNode, endNode, animation, setIsFinding, setIsFinished]);

    useSortingTimer({ isSorting: isFinding, isPaused, isFinished, speed, performStep });

    const handlePlay = () => {
        if (!startNode || !endNode) return;
        if (isFinished) {
            resetAlgorithmState();
        }
        setIsFinding(true);
        setIsPaused(false);
    };

    const handlePause = () => setIsPaused(true);
    
    const handleNextStep = () => {
        if (isFinished) return;
        setIsPaused(true);
        if(!isFinding) setIsFinding(true);
        performStep();
    };


    return {
        graph,
        nodesList,
        startNode,
        endNode,
        setStartNode,
        setEndNode,
        animation,
        isFinding,
        isPaused,
        isFinished,
        speed,
        setSpeed,
        handlePlay,
        handlePause,
        handleNextStep,
        reset,
        numNodes,
        setNumNodes,
        numEdges,
        setNumEdges,
    };
};

export default useDijkstra;