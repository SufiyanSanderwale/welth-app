"use client";
import React from "react";

export default function ErrorBoundary({ children, fallback = null }) {
  return (
    <InnerErrorBoundary fallback={fallback}>
      {children}
    </InnerErrorBoundary>
  );
}

class InnerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Avoid Next.js dev overlay by not using console.error
    // eslint-disable-next-line no-console
    console.debug("Dashboard widget error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}


