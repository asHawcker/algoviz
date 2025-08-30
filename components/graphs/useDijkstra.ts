import { useState, useCallback, useEffect } from 'react';
import { useSortingTimer } from '../../hooks/useSortingTimer';

// --- TYPES ---
interface GraphNode {
    id: string;
    x: number;
    y: number;
    edges: Map<string, number>; // Map<neighborId, weight>
}
type Graph = Map<string, GraphNode>;

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
const NUM_NODES = 10;
const EXTRA_EDGES = 4;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_SPEED = 400;

// --- HELPERS ---
const generateNodeId = (i: number) => String.fromCharCode(65 + i);

const generateGraph = (): Graph => {
    const graph: Graph = new Map();
    const nodes: GraphNode[] = [];

    // 1. Create nodes with initial positions
    for (let i = 0; i < NUM_NODES; i++) {
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
    
    // 2. Simple force-directed layout for better spacing
    for (let iter = 0; iter < 30; iter++) {
        for(let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const idealDist = 150;
                if (dist < idealDist) {
                    const force = 0.1 * (idealDist - dist);
                    n1.x += (dx / dist) * force;
                    n1.y += (dy / dist) * force;
                    n2.x -= (dx / dist) * force;
                    n2.y -= (dy / dist) * force;
                }
            }
        }
    }
    // Clamp positions within bounds
    nodes.forEach(n => {
        n.x = Math.max(50, Math.min(CANVAS_WIDTH - 50, n.x));
        n.y = Math.max(50, Math.min(CANVAS_HEIGHT - 50, n.y));
    });

    // 3. Create a connected graph (spanning tree)
    const connected = new Set<string>([nodes[0].id]);
    const unconnected = new Set<string>(nodes.slice(1).map(n => n.id));
    while(unconnected.size > 0) {
        const uNodeId = Array.from(unconnected)[0];
        const vNodeId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
        const weight = Math.floor(Math.random() * 15) + 1;
        graph.get(uNodeId)!.edges.set(vNodeId, weight);
        graph.get(vNodeId)!.edges.set(uNodeId, weight);
        connected.add(uNodeId);
        unconnected.delete(uNodeId);
    }

    // 4. Add some extra edges to create cycles
    for (let i = 0; i < EXTRA_EDGES; i++) {
        let n1, n2;
        do {
            n1 = nodes[Math.floor(Math.random() * nodes.length)];
            n2 = nodes[Math.floor(Math.random() * nodes.length)];
        } while (n1.id === n2.id || n1.edges.has(n2.id));
        const weight = Math.floor(Math.random() * 20) + 1;
        n1.edges.set(n2.id, weight);
        n2.edges.set(n1.id, weight);
    }

    return graph;
};


// --- THE HOOK ---
const useDijkstra = () => {
    const [graph, setGraph] = useState<Graph>(() => generateGraph());
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
        const newGraph = generateGraph();
        const newNodeList = Array.from(newGraph.keys()).sort();
        setGraph(newGraph);
        setNodesList(newNodeList);
        setStartNode(newNodeList[0]);
        setEndNode(newNodeList[newNodeList.length - 1]);
    }, []);

    useEffect(() => {
        reset();
    }, []);

    useEffect(() => {
        resetAlgorithmState();
    }, [startNode, endNode, graph, resetAlgorithmState]);

    const performStep = useCallback(() => {
        setAnimation(prev => {
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
                        state.statusText = `Finished. ${endNode} is not reachable.`;
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
                        let currentPathNode = endNode;
                        while (currentPathNode) {
                            state.path.unshift(currentPathNode);
                            currentPathNode = state.previous.get(currentPathNode)!;
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

            return state;
        });
    }, [graph, startNode, endNode]);

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
    };
};

export default useDijkstra;