'use client';

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

interface AssistantProps {
    prescription: any;
}

export default function PharmacistAssistant({ prescription }: AssistantProps) {
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/prescriptions/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prescription)
            });
            const data = await res.json();
            setAnalysis(data);
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setLoading(false);
        }
    };

    if (!analysis && !loading) {
        return (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900 text-sm">AI Copilot Available</h3>
                        <p className="text-xs text-indigo-700">Check for interactions and dosage risks.</p>
                    </div>
                </div>
                <button
                    onClick={runAnalysis}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Run Analysis
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse flex flex-col items-center gap-3 text-center">
                <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-gray-500">Analyzing prescription safety...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className={`p-4 border-b ${analysis.riskLevel === 'high' ? 'bg-red-50 border-red-100' :
                    analysis.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                        'bg-green-50 border-green-100'
                }`}>
                <div className="flex items-center gap-3">
                    {analysis.riskLevel === 'high' && <XCircle className="w-6 h-6 text-red-600" />}
                    {analysis.riskLevel === 'medium' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                    {analysis.riskLevel === 'low' && <CheckCircle className="w-6 h-6 text-green-600" />}

                    <div>
                        <h3 className={`font-bold text-sm ${analysis.riskLevel === 'high' ? 'text-red-900' :
                                analysis.riskLevel === 'medium' ? 'text-yellow-900' :
                                    'text-green-900'
                            }`}>
                            Risk Level: {analysis.riskLevel.toUpperCase()}
                        </h3>
                        <p className="text-xs opacity-80">Recommendation: {analysis.recommendation}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {analysis.interactions.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Drug Interactions</h4>
                        <ul className="space-y-2">
                            {analysis.interactions.map((msg: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-red-50 p-2 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {analysis.dosageWarnings.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dosage Warnings</h4>
                        <ul className="space-y-2">
                            {analysis.dosageWarnings.map((msg: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-yellow-50 p-2 rounded-lg">
                                    <Activity className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {analysis.riskLevel === 'low' && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No significant issues detected. Safe to approve.
                    </div>
                )}
            </div>
        </div>
    );
}
