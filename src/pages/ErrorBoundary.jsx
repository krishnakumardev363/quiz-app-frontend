import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// ============ ERROR BOUNDARY ============
// Catches render-time crashes anywhere below it in the tree (e.g. a null
// reference from a deleted/missing document) and shows a recoverable
// screen instead of letting React unmount the entire app to a white screen.
// This does NOT fix root causes - it's a last-resort safety net so a single
// bad card/row can never take down the whole page for every user.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Logged for debugging - swap for a real error-reporting service later.
    console.error("ErrorBoundary caught a render crash:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
          <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h1 className="font-display text-lg font-bold text-gray-900 mb-1">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 mb-5">
              This page hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold rounded-xl py-3 hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={15} /> Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
