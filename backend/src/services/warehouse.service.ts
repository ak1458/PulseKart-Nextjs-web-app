
interface Point {
    x: number;
    y: number;
}

interface BinLocation {
    binId: string;
    coordinates: Point;
}

export class WarehouseService {

    // 0 = Walkable, 1 = Shelf
    private static grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
        [1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Packing Area
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // Dispatch
    ];

    static async getOptimalPath(binIds: string[]): Promise<Point[]> {
        const start: Point = { x: 9, y: 5 }; // Packing Area
        let current = start;
        let fullPath: Point[] = [start];

        const binCoords: Record<string, Point> = {
            'A1': { x: 1, y: 1 },
            'A2': { x: 1, y: 4 },
            'B1': { x: 4, y: 1 },
            'B2': { x: 4, y: 4 }
        };

        const targets = binIds.map(id => binCoords[id]).filter(Boolean);
        targets.push(start); // Return to start

        for (const target of targets) {
            const segment = this.findPathBFS(current, target);
            if (segment.length > 0) {
                fullPath = [...fullPath, ...segment.slice(1)]; // Avoid duplicating start point
                current = target;
            }
        }

        return fullPath;
    }

    private static findPathBFS(start: Point, end: Point): Point[] {
        const queue: { point: Point; path: Point[] }[] = [{ point: start, path: [start] }];
        const visited = new Set<string>();
        visited.add(`${start.x},${start.y}`);

        const dirs = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

        while (queue.length > 0) {
            const { point, path } = queue.shift()!;

            if (point.x === end.x && point.y === end.y) {
                return path;
            }

            for (const dir of dirs) {
                const next = { x: point.x + dir.x, y: point.y + dir.y };

                // Check bounds
                if (next.x < 0 || next.x >= 10 || next.y < 0 || next.y >= 10) continue;

                // Check obstacle (unless it's the target bin itself, which might be "in" a shelf)
                // For simplicity, assume bins are accessible from adjacent 0s. 
                // If the target is a 1, we allow stepping on it only if it's the destination.
                if (this.grid[next.y][next.x] === 1 && (next.x !== end.x || next.y !== end.y)) continue;

                const key = `${next.x},${next.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ point: next, path: [...path, next] });
                }
            }
        }
        return []; // No path found
    }

    static async getHeatmapData() {
        // Mock Heatmap: Frequency of picks per zone
        return [
            { x: 1, y: 1, value: 80 }, // High traffic at A1
            { x: 4, y: 4, value: 50 },
            { x: 9, y: 5, value: 100 } // Packing area
        ];
    }
}
