import { useState, useCallback, useEffect } from 'react';
import { useSortingTimer } from '../../hooks/useSortingTimer';
import { calculateFruchtermanReingoldLayout } from './graphLayout';
import type { Graph, GraphNode } from './useDijkstra';

// --- TYPES ---
type TopoSortPhase = 'IDLE' | 'INIT_INDEGREES' | 'INIT_QUEUE' | 'PROCESSING_NODE' | 'DONE';

interface AnimationState {
    inDegrees: Map<string, number>;
    queue: string[];
    sortedResult: string[];
    currentNode: string | null;
    edgeToHighlight: [string, string] | null;
    cycleNodes: string[];
    statusText: string;
    phase: TopoSortPhase;
}

// --- CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_SPEED = 500;

// --- HELPERS ---
const generateNodeId = (i: number) => String.fromCharCode(65 + i);

const generateDAG = (numNodes: number, extraEdges: number): Graph => {
    const graph: Graph = new Map();
    const nodes: GraphNode[] = [];

    // 1. Create nodes
    for (let i = 0; i < numNodes; i++) {
        const id = generateNodeId(i);
        const node: GraphNode = {
            id,
            x: Math.random() * (CANVAS_WIDTH - 100) + 50,
            y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
            edges: new Map()
        };
        nodes.push(node);
        graph.set(id, node);
    }

    if (numNodes <= 1) return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

    // 2. Add edges, ensuring they only go from a lower index to a higher index node to guarantee it's a DAG
    const edgesToAdd = numNodes - 1 + extraEdges;
    let addedEdges = 0;

    // Ensure connectivity
    for(let i = 0; i < numNodes - 1; i++) {
        const u = nodes[i];
        const vIndex = i + 1 + Math.floor(Math.random() * (numNodes - 1 - i));
        const v = nodes[vIndex];
        if (!u.edges.has(v.id)) {
            u.edges.set(v.id, 1); // weight doesn't matter
            addedEdges++;
        }
    }

    // Add extra edges
    while(addedEdges < edgesToAdd) {
        const uIndex = Math.floor(Math.random() * (numNodes - 1));
        const vIndex = uIndex + 1 + Math.floor(Math.random() * (numNodes - 1 - uIndex));
        
        if (vIndex < numNodes) {
            const u = nodes[uIndex];
            const v = nodes[vIndex];
            if (!u.edges.has(v.id)) {
                u.edges.set(v.id, 1);
                addedEdges++;
            }
        }
    }

    return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
};

const generateGraphWithCycle = (numNodes: number, extraEdges: number): Graph => {
    // 1. Generate a base DAG.
    const graph = generateDAG(numNodes, extraEdges);
    if (numNodes < 3) {
        // Not possible to create a cycle of 3+ nodes, just return the DAG
        return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    }

    let cycleCreated = false;
    const allNodeIds = Array.from(graph.keys()).sort(() => 0.5 - Math.random()); // Shuffle for randomness

    // Try to find a path of length 2 (3 nodes, e.g., A -> B -> C) and add a back-edge (C -> A)
    for (const startNodeId of allNodeIds) {
        if (cycleCreated) break;

        const startNode = graph.get(startNodeId)!;
        const neighborsOfStart = Array.from(startNode.edges.keys()).sort(() => 0.5 - Math.random());

        if (neighborsOfStart.length === 0) continue;

        for (const midNodeId of neighborsOfStart) {
            if (cycleCreated) break;

            const midNode = graph.get(midNodeId)!;
            const neighborsOfMid = Array.from(midNode.edges.keys());

            if (neighborsOfMid.length > 0) {
                const endNodeId = neighborsOfMid[Math.floor(Math.random() * neighborsOfMid.length)];
                
                // Avoid creating a 2-node cycle if the path is just A -> B -> A
                if (endNodeId === startNodeId) continue;
                
                const endNode = graph.get(endNodeId)!;

                // Add the back-edge from endNode to startNode, if it doesn't already exist
                if (!endNode.edges.has(startNodeId)) {
                    endNode.edges.set(startNodeId, 1);
                    cycleCreated = true;
                }
            }
        }
    }
    
    // Fallback: If no path of length 2 was found (very unlikely), use the old 2-node cycle method.
    if (!cycleCreated) {
        const allEdges: { from: GraphNode, to: GraphNode }[] = [];
        graph.forEach(fromNode => {
            fromNode.edges.forEach((_, toId) => {
                allEdges.push({ from: fromNode, to: graph.get(toId)! });
            });
        });

        if (allEdges.length > 0) {
            const randomEdge = allEdges[Math.floor(Math.random() * allEdges.length)];
            const fromNode = randomEdge.from;
            const toNode = randomEdge.to;
            if (!toNode.edges.has(fromNode.id)) {
                toNode.edges.set(fromNode.id, 1);
            }
        }
    }
    
    // Recalculate layout in case the new edge makes it weird
    return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
};


// --- THE HOOK ---
const useTopologicalSort = () => {
    const [numNodes, setNumNodes] = useState(10);
    const [numEdges, setNumEdges] = useState(3);
    const [graph, setGraph] = useState<Graph>(() => generateDAG(numNodes, numEdges));
    const [nodesList, setNodesList] = useState<string[]>([]);
    
    const [animation, setAnimation] = useState<AnimationState>({
        inDegrees: new Map(),
        queue: [],
        sortedResult: [],
        currentNode: null,
        edgeToHighlight: null,
        cycleNodes: [],
        statusText: 'Ready to find topological order.',
        phase: 'IDLE',
    });

    const [isFinding, setIsFinding] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [speed, setSpeed] = useState(DEFAULT_SPEED);

    const resetAlgorithmState = useCallback(() => {
        setIsFinding(false); setIsPaused(true); setIsFinished(false);
        setAnimation({
            inDegrees: new Map(),
            queue: [],
            sortedResult: [],
            currentNode: null,
            edgeToHighlight: null,
            cycleNodes: [],
            statusText: 'Ready to find topological order. Press play.',
            phase: 'IDLE',
        });
    }, []);

    const reset = useCallback(() => {
        const newGraph = generateDAG(numNodes, numEdges);
        const newNodeList = Array.from(newGraph.keys()).sort();
        setGraph(newGraph);
        setNodesList(newNodeList);
    }, [numNodes, numEdges]);

    const handleGenerateCyclicGraph = useCallback(() => {
        const newGraph = generateGraphWithCycle(numNodes, numEdges);
        const newNodeList = Array.from(newGraph.keys()).sort();
        setGraph(newGraph);
        setNodesList(newNodeList);
    }, [numNodes, numEdges]);

    useEffect(() => reset(), [reset]);
    useEffect(() => resetAlgorithmState(), [graph, resetAlgorithmState]);

    const performStep = useCallback(() => {
        const state: AnimationState = { ...JSON.parse(JSON.stringify(animation)) };
        state.inDegrees = new Map(animation.inDegrees);
        state.edgeToHighlight = null;

        switch (state.phase) {
            case 'IDLE':
                state.phase = 'INIT_INDEGREES';
                state.statusText = 'Calculating in-degrees for all nodes.';
                break;

            case 'INIT_INDEGREES':
                nodesList.forEach(nodeId => state.inDegrees.set(nodeId, 0));
                graph.forEach(node => {
                    node.edges.forEach((_, neighborId) => {
                        state.inDegrees.set(neighborId, (state.inDegrees.get(neighborId) || 0) + 1);
                    });
                });
                state.phase = 'INIT_QUEUE';
                state.statusText = 'Finding starting nodes (in-degree 0).';
                break;

            case 'INIT_QUEUE':
                nodesList.forEach(nodeId => {
                    if (state.inDegrees.get(nodeId) === 0) {
                        state.queue.push(nodeId);
                    }
                });
                state.phase = 'PROCESSING_NODE';
                state.statusText = 'Queue initialized. Ready to process.';
                break;
            
            case 'PROCESSING_NODE':
                if (state.queue.length === 0) {
                    state.phase = 'DONE';
                    if (state.sortedResult.length < nodesList.length) {
                        state.statusText = 'Cycle detected! Topological sort not possible.';
                        state.cycleNodes = nodesList.filter(n => !state.sortedResult.includes(n));
                    } else {
                        state.statusText = 'Topological sort complete!';
                    }
                    break;
                }
                
                const u = state.queue.shift()!;
                state.currentNode = u;
                state.sortedResult.push(u);
                
                const neighbors = Array.from(graph.get(u)!.edges.keys());
                for (const v of neighbors) {
                    const newDegree = (state.inDegrees.get(v) || 0) - 1;
                    state.inDegrees.set(v, newDegree);
                    if (newDegree === 0) {
                        state.queue.push(v);
                    }
                }
                state.statusText = `Processed node ${u}, updated its neighbors' in-degrees.`;
                break;

            case 'DONE':
                setIsFinding(false);
                setIsFinished(true);
                break;
        }
        setAnimation(state);
    }, [animation, graph, nodesList]);
    
    useSortingTimer({ isSorting: isFinding, isPaused, isFinished, speed, performStep });

    const handlePlay = () => {
        if (isFinished) resetAlgorithmState();
        setIsFinding(true); setIsPaused(false);
    };
    const handlePause = () => setIsPaused(true);
    const handleNextStep = () => {
        if (isFinished) return;
        setIsPaused(true);
        if(!isFinding) setIsFinding(true);
        performStep();
    };

    return {
        graph, nodesList, animation, isFinding, isPaused, isFinished,
        speed, setSpeed, handlePlay, handlePause, handleNextStep, reset,
        handleGenerateCyclicGraph,
        numNodes, setNumNodes, numEdges, setNumEdges,
    };
};

export default useTopologicalSort;