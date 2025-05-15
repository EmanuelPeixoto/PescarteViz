import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chart-error">
          <p>Não foi possível renderizar este gráfico.</p>
          <small>{this.state.error?.message}</small>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;