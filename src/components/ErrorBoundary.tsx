"use client";

import Link from "next/link";
import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can connect this to your logging/monitoring here
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleRetry = () => {
    // Reset state and try rendering children again
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 flex flex-col items-center justify-center text-center gap-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-gray-500 max-w-prose">
            An unexpected error occurred. You can try again or go back to the homepage.
          </p>
          <div className="flex items-center gap-2">
            <button className="bg-black text-white rounded px-3 py-2" onClick={this.handleRetry}>Retry</button>
            <Link href="/" className="underline px-3 py-2">Go home</Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
