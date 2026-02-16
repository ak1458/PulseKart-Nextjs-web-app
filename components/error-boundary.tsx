'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from '@/lib/icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });

        // Log to error tracking service (e.g., Sentry) in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to error tracking service
        }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-gray-400 mb-6">
                            We apologize for the inconvenience. Please try refreshing the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 text-left">
                                <details className="bg-black/30 rounded-lg p-4">
                                    <summary className="text-red-400 font-mono text-sm cursor-pointer">
                                        Error Details
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-300 font-mono overflow-auto max-h-40">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="btn-gradient text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
    return (error: Error) => {
        console.error('Error caught by handler:', error);
        // Could also show toast notification here
    };
}
