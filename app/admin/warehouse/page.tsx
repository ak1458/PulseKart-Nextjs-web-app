'use client';

import React, { useState, useEffect } from 'react';
import { Map, Zap, Layers, Navigation } from 'lucide-react';

export default function WarehouseDashboard() {
    const [heatmap, setHeatmap] = useState<any[]>([]);
    const [path, setPath] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeatmap();
    }, []);

    const fetchHeatmap = async () => {
        try {
            const res = await fetch('/api/v1/warehouse/heatmap');
            const data = await res.json();
            setHeatmap(data);
        } catch (error) {
            console.error('Failed to fetch heatmap', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePath = async () => {
        try {
            const res = await fetch('/api/v1/warehouse/path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ binIds: ['A1', 'B2'] }) // Mock bins
            });
            const data = await res.json();
            setPath(data);
        } catch (error) {
            console.error('Failed to calculate path', error);
        }
    };

    // Render Grid (10x10)
    const renderGrid = () => {
        const grid = [];
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const isShelf = (y === 1 || y === 2 || y === 4 || y === 5) && (x !== 2 && x !== 5 && x !== 8 && x !== 9);
                const isPath = path.some(p => p.x === x && p.y === y);
                const heat = heatmap.find(h => h.x === x && h.y === y);

                grid.push(
                    <div
                        key={`${x}-${y}`}
                        className={`w-8 h-8 flex items-center justify-center text-[8px] border border-gray-100 rounded-sm transition-all duration-300 ${isPath ? 'bg-teal-500 text-white scale-110 shadow-lg z-10' :
                                isShelf ? 'bg-gray-800' :
                                    heat ? `bg-red-500 opacity-${Math.min(heat.value / 100, 1) * 100}` :
                                        'bg-gray-50'
                            }`}
                    >
                        {isPath && <Navigation className="w-3 h-3" />}
                    </div>
                );
            }
        }
        return grid;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Warehouse AI</h1>
                    <p className="text-gray-500">Real-time optimization and analytics.</p>
                </div>
                <button
                    onClick={calculatePath}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
                >
                    <Zap className="w-4 h-4" />
                    Optimize Picking Route
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Visualization */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <Map className="w-5 h-5 text-teal-600" />
                            Floor Map (Zone A)
                        </h2>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-800 rounded-sm"></span> Shelf</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-500 rounded-sm"></span> Path</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Hotspot</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="grid grid-cols-10 gap-1 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            {renderGrid()}
                        </div>
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            Efficiency Metrics
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Picking Speed</span>
                                    <span className="font-bold text-gray-900">120 items/hr</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[80%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Space Utilization</span>
                                    <span className="font-bold text-gray-900">85%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[85%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-white shadow-lg">
                        <h3 className="font-bold mb-2">AI Insight</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Zone B is experiencing high congestion. Recommend moving 20% of fast-moving inventory to Zone A to balance traffic.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
