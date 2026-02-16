'use client';

import React, { useState, useEffect } from 'react';
import { Map, Zap, Layers, Navigation } from '@/lib/icons';

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
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setHeatmap(data);
                    return;
                }
            }
            throw new Error('API not available');
        } catch (error) {
            console.log('API not available, using empty heatmap');
            setHeatmap([]);
        } finally {
            setLoading(false);
        }
    };

    const calculatePath = async () => {
        try {
            const res = await fetch('/api/v1/warehouse/path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ binIds: ['A1', 'B2'] })
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPath(data);
                    return;
                }
            }
            throw new Error('API not available');
        } catch (error) {
            console.log('API not available, using empty path');
            setPath([]);
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
                        className={`w-8 h-8 flex items-center justify-center text-[8px] border border-white/5 rounded-sm transition-all duration-300 ${isPath ? 'bg-teal-500 text-white scale-110 shadow-[0_0_10px_rgba(20,184,166,0.5)] z-10' :
                            isShelf ? 'bg-white/10' :
                                heat ? `bg-red-500` :
                                    'bg-black/20'
                            }`}
                        style={heat ? { opacity: Math.min(heat.value / 100, 1) } : {}}
                    >
                        {isPath && <Navigation className="w-3 h-3" />}
                    </div>
                );
            }
        }
        return grid;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Warehouse AI</h1>
                    <p className="text-gray-400">Real-time optimization and analytics.</p>
                </div>
                <button
                    onClick={calculatePath}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all font-medium font-bold"
                >
                    <Zap className="w-4 h-4" />
                    Optimize Picking Route
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Visualization */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h2 className="font-bold text-white flex items-center gap-2">
                            <Map className="w-5 h-5 text-teal-400" />
                            Floor Map (Zone A)
                        </h2>
                        <div className="flex gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-white/10 border border-white/10 rounded-sm"></span> Shelf</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-500 rounded-sm shadow-[0_0_5px_rgba(20,184,166,0.5)]"></span> Path</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span> Hotspot</div>
                        </div>
                    </div>

                    <div className="flex justify-center relative z-10">
                        <div className="grid grid-cols-10 gap-1 p-4 bg-black/40 rounded-xl border border-white/10 shadow-inner">
                            {renderGrid()}
                        </div>
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl border border-white/10">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-400" />
                            Efficiency Metrics
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Picking Speed</span>
                                    <span className="font-bold text-white">120 items/hr</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 w-[80%] shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Space Utilization</span>
                                    <span className="font-bold text-white">85%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[85%] shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl text-white shadow-lg border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors"></div>
                        <h3 className="font-bold mb-2 relative z-10 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            AI Insight
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed relative z-10">
                            Zone B is experiencing high congestion. Recommend moving <span className="text-white font-bold">20%</span> of fast-moving inventory to Zone A to balance traffic.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

