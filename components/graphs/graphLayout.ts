import type { Graph } from './useDijkstra';

interface LayoutOptions {
    width: number;
    height: number;
    iterations?: number;
    k?: number; // optimal distance
}

export const calculateFruchtermanReingoldLayout = (graph: Graph, options: LayoutOptions): Graph => {
    const nodes = Array.from(graph.values());
    const numNodes = nodes.length;
    if (numNodes === 0) return graph;

    const { width, height } = options;
    const iterations = options.iterations ?? 150;
    const area = width * height;
    
    // The optimal distance between nodes
    const k = options.k ?? 0.85 * Math.sqrt(area / numNodes);
    
    // A "temperature" that cools down over time.
    // This limits the total displacement of nodes in a step.
    let temp = width / 10;
    const coolingFactor = 0.97;

    // Store forces for each node
    const forces = new Map<string, { x: number; y: number }>();

    for (let i = 0; i < iterations; i++) {
        // Reset forces for this iteration
        nodes.forEach(node => forces.set(node.id, { x: 0, y: 0 }));

        // 1. Calculate repulsive forces between all pairs of nodes
        for (let j = 0; j < numNodes; j++) {
            for (let l = j + 1; l < numNodes; l++) {
                const node1 = nodes[j];
                const node2 = nodes[l];
                
                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                const repulsiveForce = (k * k) / dist;
                
                const force1 = forces.get(node1.id)!;
                force1.x += (dx / dist) * repulsiveForce;
                force1.y += (dy / dist) * repulsiveForce;
                
                const force2 = forces.get(node2.id)!;
                force2.x -= (dx / dist) * repulsiveForce;
                force2.y -= (dy / dist) * repulsiveForce;
            }
        }

        // 2. Calculate attractive forces for connected nodes (edges)
        for (const node1 of nodes) {
            for (const [neighborId] of node1.edges) {
                if (node1.id < neighborId) {
                    const node2 = graph.get(neighborId)!;
                    
                    const dx = node1.x - node2.x;
                    const dy = node1.y - node2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                    const attractiveForce = (dist * dist) / k;
                    
                    const force1 = forces.get(node1.id)!;
                    force1.x -= (dx / dist) * attractiveForce;
                    force1.y -= (dy / dist) * attractiveForce;
                    
                    const force2 = forces.get(node2.id)!;
                    force2.x += (dx / dist) * attractiveForce;
                    force2.y += (dy / dist) * attractiveForce;
                }
            }
        }

        // 3. Apply forces to update node positions, limited by temperature
        for (const node of nodes) {
            const force = forces.get(node.id)!;
            const displacement = Math.sqrt(force.x * force.x + force.y * force.y);
            if (displacement > 0) {
                const limitedDisplacement = Math.min(displacement, temp);
                node.x += (force.x / displacement) * limitedDisplacement;
                node.y += (force.y / displacement) * limitedDisplacement;
            }
        }

        // 4. Cool down the temperature
        temp *= coolingFactor;
    }

    // 5. Final pass to scale and center the graph to fit the viewport
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
    });

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    // Handle case where graph is a single point or line
    const scaleX = graphWidth > 0 ? (width - 100) / graphWidth : 1;
    const scaleY = graphHeight > 0 ? (height - 100) / graphHeight : 1;
    const scale = Math.min(scaleX, scaleY);

    nodes.forEach(n => {
        n.x = (n.x - minX) * scale + 50;
        n.y = (n.y - minY) * scale + 50;
    });

    // The graph map has been mutated, so we can return it.
    return graph;
};
