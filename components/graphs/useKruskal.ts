import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSortingTimer } from '../../hooks/useSortingTimer';
import { calculateFruchtermanReingoldLayout } from './graphLayout';
import type { Graph, GraphNode } from './useDijkstra';

// --- TYPES ---
type KruskalPhase = 'IDLE' | 'PROCESSING_EDGE' | 'DONE';
type Edge = { u: string; v: string; weight: number };

interface AnimationState {
    sortedEdges: Edge[];
    mstEdges: Edge[];
    currentEdgeIndex: number;
    parent: Map<string, string>;
    componentColors: Map<string, string>;
    statusText: string;
    phase: KruskalPhase;
}

// --- CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_SPEED = 500;
const COLORS = ['#34d399', '#60a5fa', '#c084fc', '#f87171', '#fbbf24', '#a3e635', '#2dd4bf', '#818cf8', '#f472b6', '#78716c'];

// --- HELPERS ---
const generateNodeId = (i: number) => String.fromCharCode(65 + i);

const generateGraphForKruskal = (numNodes: number, extraEdges: number): Graph => {
    // Reusing a similar graph generation logic, ensuring it's undirected
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
        graph.set(id, node);
        nodes.push(node);
    }
    if (numNodes <= 1) return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

    // 1. Create a connected graph
    const connected = new Set<string>([nodes[0].id]);
    const unconnected = new Set<string>(nodes.slice(1).map(n => n.id));
    while (unconnected.size > 0) {
        const uNodeId = Array.from(unconnected)[0];
        const vNodeId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
        const weight = Math.floor(Math.random() * 20) + 1;
        graph.get(uNodeId)!.edges.set(vNodeId, weight);
        graph.get(vNodeId)!.edges.set(uNodeId, weight);
        connected.add(uNodeId);
        unconnected.delete(uNodeId);
    }

    // 2. Add extra edges
    const maxExtra = (numNodes * (numNodes - 1) / 2) - (numNodes - 1);
    let edgeCount = 0;
    for (let i = 0; i < Math.min(extraEdges, maxExtra); i++) {
        let n1, n2;
        let tries = 0;
        do {
            n1 = nodes[Math.floor(Math.random() * numNodes)];
            n2 = nodes[Math.floor(Math.random() * numNodes)];
            if(++tries > numNodes * 5) break;
        } while (n1.id === n2.id || n1.edges.has(n2.id));
        
        if (n1.id !== n2.id && !n1.edges.has(n2.id)) {
            const weight = Math.floor(Math.random() * 25) + 1;
            n1.edges.set(n2.id, weight);
            n2.edges.set(n1.id, weight);
        }
    }

    return calculateFruchtermanReingoldLayout(graph, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
};

// Disjoint Set Union (DSU) helpers
const find = (parent: Map<string, string>, i: string): string => {
    if (parent.get(i) === i) return i;
    const root = find(parent, parent.get(i)!);
    parent.set(i, root); // Path compression
    return root;
};

const union = (parent: Map<string, string>, i: string, j: string) => {
    const root_i = find(parent, i);
    const root_j = find(parent, j);
    if (root_i !== root_j) {
        parent.set(root_i, root_j);
    }
};

// --- THE HOOK ---
const useKruskal = () => {
    const [numNodes, setNumNodes] = useState(10);
    const [numEdges, setNumEdges] = useState(5);
    const [graph, setGraph] = useState<Graph>(() => generateGraphForKruskal(numNodes, numEdges));
    const [nodesList, setNodesList] = useState<string[]>([]);
    
    const [animation, setAnimation] = useState<AnimationState>({
        sortedEdges: [], mstEdges: [], currentEdgeIndex: 0,
        parent: new Map(), componentColors: new Map(),
        statusText: 'Ready to find the Minimum Spanning Tree.', phase: 'IDLE'
    });
    
    const [isFinding, setIsFinding] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [speed, setSpeed] = useState(DEFAULT_SPEED);

    const resetAlgorithmState = useCallback(() => {
        const edges: Edge[] = [];
        const seenEdges = new Set<string>();
        graph.forEach((node, u) => {
            node.edges.forEach((weight, v) => {
                const edgeKey = [u, v].sort().join('-');
                if (!seenEdges.has(edgeKey)) {
                    edges.push({ u, v, weight });
                    seenEdges.add(edgeKey);
                }
            });
        });
        edges.sort((a, b) => a.weight - b.weight);
        
        const parent = new Map<string, string>();
        const componentColors = new Map<string, string>();
        nodesList.forEach((node, i) => {
            parent.set(node, node);
            componentColors.set(node, COLORS[i % COLORS.length]);
        });

        setIsFinding(false); setIsPaused(true); setIsFinished(false);
        setAnimation({
            sortedEdges: edges,
            mstEdges: [],
            currentEdgeIndex: 0,
            parent,
            componentColors,
            statusText: 'Edges are sorted. Ready to begin.',
            phase: 'IDLE',
        });
    }, [graph, nodesList]);

    const reset = useCallback(() => {
        const newGraph = generateGraphForKruskal(numNodes, numEdges);
        const newNodeList = Array.from(newGraph.keys()).sort();
        setGraph(newGraph);
        setNodesList(newNodeList);
    }, [numNodes, numEdges]);

    useEffect(() => reset(), [reset]);
    useEffect(() => resetAlgorithmState(), [graph, resetAlgorithmState]);
    
    const performStep = useCallback(() => {
        const prev = animation;
        if (prev.phase === 'DONE') {
            setIsFinding(false);
            setIsFinished(true);
            return;
        }

        const state: AnimationState = {
            ...JSON.parse(JSON.stringify(prev)),
            parent: new Map(prev.parent),
            componentColors: new Map(prev.componentColors),
            mstEdges: [...prev.mstEdges]
        };

        if (state.currentEdgeIndex >= state.sortedEdges.length || state.mstEdges.length === nodesList.length - 1) {
            state.phase = 'DONE';
            state.statusText = 'Minimum Spanning Tree found!';
            setIsFinding(false);
            setIsFinished(true);
            setAnimation(state);
            return;
        }

        const edge = state.sortedEdges[state.currentEdgeIndex];
        const { u, v } = edge;

        state.statusText = `Considering edge ${u} ↔ ${v}...`;

        const root_u = find(state.parent, u);
        const root_v = find(state.parent, v);

        if (root_u !== root_v) {
            state.statusText = `Adding edge ${u} ↔ ${v}. Nodes are in different components.`;
            state.mstEdges.push(edge);
            union(state.parent, u, v);

            // Recolor components after union
            const newRoot = find(state.parent, u);
            const newColor = state.componentColors.get(newRoot)!;
            nodesList.forEach(node => {
                if (find(state.parent, node) === newRoot) {
                    state.componentColors.set(node, newColor);
                }
            });

        } else {
            state.statusText = `Discarding edge ${u} ↔ ${v}. It would form a cycle.`;
        }

        state.currentEdgeIndex++;
        setAnimation(state);
    }, [animation, nodesList, setIsFinding, setIsFinished]);

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
        numNodes, setNumNodes, numEdges, setNumEdges
    };
};

export default useKruskal;