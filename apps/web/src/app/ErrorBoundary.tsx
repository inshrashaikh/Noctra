import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-noctra-bg p-8">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold text-noctra-text">
              Something went wrong
            </h1>
            <p className="mb-6 text-noctra-muted">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-noctra-accent px-6 py-2 font-semibold text-noctra-bg transition-colors hover:bg-noctra-accent-hover"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
