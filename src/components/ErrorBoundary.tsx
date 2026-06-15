import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props { children: ReactNode }
interface State { error: Error | null }

/** Evita el white-screen: si un módulo lanza, muestra un fallback con reintento. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('Module error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-xl mx-auto px-5 py-16 text-center text-gray-500">
          <p className="font-display font-bold text-lg text-gray-800">Algo salió mal aquí</p>
          <p className="text-sm mt-1">Esta sección tuvo un problema. Puedes reintentar.</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brasil-green text-white font-display font-bold text-sm px-4 py-2.5 cursor-pointer transition-opacity duration-200 hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4" aria-hidden /> Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
