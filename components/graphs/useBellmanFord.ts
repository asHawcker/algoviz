import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSortingTimer } from '../../hooks/useSortingTimer';
import { calculateFruchtermanReingoldLayout } from './graphLayout';
import type { Graph, GraphNode } from './useDijkstra';

// --- TYPES ---
type BellmanFordPhase = 'IDLE' | 'ITERATING' | 'CHECKING_CYCLES' | 'DONE';
type Edge = { u: string; v: string; weight: number };

interface AnimationState {
    distances: Map<string, number>;
    predecessors: Map<string, string | null>;
    iteration: number;
    edgeIndex: number;
    edgeToHighlight: [string, string] | null;
    negativeCyclePath: string[];
    statusText: string;
    phase: BellmanFordPhase;
}

// --- CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_SPEED = 400;

// --- HELPERS ---
const generateNodeId = (i: number) => String.fromCharCode(65 + i);

const generateGraphWithNegativeWeights = (numNodes: number, extraEdges: number): Graph => {
    const graph: Graph = new Map();
    const nodes: GraphNode[] = [];

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
    if (numNodes <= 1) return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

    const connected = new Set<string>([nodes[0].id]);
    const unconnected = new Set<string>(nodes.slice(1).map(n => n.id));
    while (unconnected.size > 0) {
        const uNodeId = Array.from(unconnected)[0];
        const vNodeId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
        const weight = Math.floor(Math.random() * 15) + 1;
        graph.get(uNodeId)!.edges.set(vNodeId, weight);
        graph.get(vNodeId)!.edges.set(uNodeId, weight);
        connected.add(uNodeId);
        unconnected.delete(uNodeId);
    }

    const edgesToAdd = Math.min(extraEdges, (numNodes * (numNodes - 1) / 2) - (numNodes - 1));
    for (let i = 0; i < edgesToAdd; i++) {
        let n1, n2;
        do {
            n1 = nodes[Math.floor(Math.random() * nodes.length)];
            n2 = nodes[Math.floor(Math.random() * nodes.length)];
        } while (n1.id === n2.id || n1.edges.has(n2.id));
        const weight = Math.floor(Math.random() * 26) - 10; // -10 to 15
        n1.edges.set(n2.id, weight);
        n2.edges.set(n1.id, weight);
    }

    return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
};

const useBellmanFord = () => {
    const [numNodes, setNumNodes] = useState(8);
    const [numEdges, setNumEdges] = useState(4);
    const [graph, setGraph] = useState<Graph>(() => generateGraphWithNegativeWeights(numNodes, numEdges));
    const [nodesList, setNodesList] = useState<string[]>([]);
    const [startNode, setStartNode] = useState<string | null>(null);
    const [animation, setAnimation] = useState<AnimationState>({
        distances: new Map(),
        predecessors: new Map(),
        iteration: 0,
        edgeIndex: 0,
        edgeToHighlight: null,
        negativeCyclePath: [],
        statusText: 'Select a start node.',
        phase: 'IDLE',
    });
    const [isFinding, setIsFinding] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [speed, setSpeed] = useState(DEFAULT_SPEED);

    const allEdges = useMemo(() => {
        const edges: Edge[] = [];
        graph.forEach((node, u) => {
            node.edges.forEach((weight, v) => {
                edges.push({ u, v, weight });
            });
        });
        return edges;
    }, [graph]);

    const resetAlgorithmState = useCallback(() => {
        setIsFinding(false); setIsPaused(true); setIsFinished(false);
        setAnimation({
            distances: new Map(nodesList.map(id => [id, Infinity])),
            predecessors: new Map(nodesList.map(id => [id, null])),
            iteration: 0,
            edgeIndex: 0,
            edgeToHighlight: null,
            negativeCyclePath: [],
            statusText: 'Select a start node, then press play.',
            phase: 'IDLE',
        });
    }, [nodesList]);

    const reset = useCallback(() => {
        const newGraph = generateGraphWithNegativeWeights(numNodes, numEdges);
        const newNodeList = Array.from(newGraph.keys()).sort();
        setGraph(newGraph);
        setNodesList(newNodeList);
        setStartNode(newNodeList[0] || null);
    }, [numNodes, numEdges]);

    useEffect(() => reset(), [reset]);
    useEffect(() => resetAlgorithmState(), [startNode, graph, resetAlgorithmState]);

    const performStep = useCallback(() => {
        const prev = animation;
        const state: AnimationState = { ...JSON.parse(JSON.stringify(prev)) };
        state.distances = new Map(prev.distances);
        state.predecessors = new Map(prev.predecessors);
        state.edgeToHighlight = null;

        if (state.phase === 'IDLE') {
            if (startNode) {
                state.phase = 'ITERATING';
                state.iteration = 1;
                state.edgeIndex = 0;
                state.distances.set(startNode, 0);
                state.statusText = `Starting. Iteration ${state.iteration}.`;
            }
            setAnimation(state);
            return;
        }

        if (state.phase === 'ITERATING' || state.phase === 'CHECKING_CYCLES') {
            if (state.edgeIndex >= allEdges.length) {
                state.edgeIndex = 0;
                if (state.phase === 'ITERATING') {
                    state.iteration++;
                    if (state.iteration >= nodesList.length) {
                        state.phase = 'CHECKING_CYCLES';
                        state.statusText = 'Checking for negative-weight cycles.';
                    } else {
                        state.statusText = `Starting Iteration ${state.iteration}.`;
                    }
                } else { // Finished checking cycles
                    state.phase = 'DONE';
                    state.statusText = 'Finished. Shortest paths are found.';
                    setIsFinding(false);
                    setIsFinished(true);
                }
                setAnimation(state);
                return;
            }

            const { u, v, weight } = allEdges[state.edgeIndex];
            state.edgeToHighlight = [u, v];
            state.statusText = `Relaxing edge ${u} -> ${v} (weight ${weight}).`;

            const distU = state.distances.get(u) ?? Infinity;
            if (distU !== Infinity && distU + weight < (state.distances.get(v) ?? Infinity)) {
                if (state.phase === 'CHECKING_CYCLES') {
                    state.statusText = `Negative cycle detected at edge ${u} -> ${v}!`;
                    let cycleNode = v;
                    for(let i = 0; i < nodesList.length; i++){
                        cycleNode = state.predecessors.get(cycleNode)!;
                    }

                    let pathNode = cycleNode;
                    while(true) {
                        state.negativeCyclePath.push(pathNode);
                        pathNode = state.predecessors.get(pathNode)!;
                        if(pathNode === cycleNode || state.negativeCyclePath.includes(pathNode)) break;
                    }
                    state.negativeCyclePath.push(cycleNode);
                    state.negativeCyclePath.reverse();
                    
                    state.phase = 'DONE';
                    setIsFinding(false);
                    setIsFinished(true);
                    setAnimation(state);
                    return;
                }
                
                state.distances.set(v, distU + weight);
                state.predecessors.set(v, u);
                state.statusText = `Updated distance to ${v}: ${distU + weight}`;
            }
            
            state.edgeIndex++;
            setAnimation(state);
            return;
        }
        
        setAnimation(state);
    }, [animation, startNode, allEdges, nodesList.length, setIsFinding, setIsFinished]);

    useSortingTimer({ isSorting: isFinding, isPaused, isFinished, speed, performStep });
    
    const handlePlay = () => {
        if (!startNode) return;
        if (isFinished) resetAlgorithmState();
        setIsFinding(true); setIsPaused(false);
    };
    const handlePause = () => setIsPaused(true);
    const handleNextStep = () => {
        if (isFinished || !startNode) return;
        setIsPaused(true);
        if(!isFinding) setIsFinding(true);
        performStep();
    };

    return {
        graph, nodesList, startNode, setStartNode, animation,
        isFinding, isPaused, isFinished, speed, setSpeed,
        handlePlay, handlePause, handleNextStep, reset,
        numNodes, setNumNodes, numEdges, setNumEdges,
    };
};

export default useBellmanFord;