import { Component, StrictMode, type ReactNode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './styles.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Duo Relay Lab error', error, info); }
  render() {
    if (this.state.failed) return <main className="auth-shell"><section className="panel auth-card"><h1>Something did not load</h1><p className="muted">Refresh to try again. Unsaved relay text will be cleared.</p><button className="button primary" onClick={() => window.location.reload()}>Refresh</button></section></main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App/><Toaster theme="dark" richColors closeButton position="bottom-right"/></ErrorBoundary></StrictMode>);
