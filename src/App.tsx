import { useStore } from './state/store';
import { useTheme } from './hooks/useTheme';
import { TopBar } from './components/layout/TopBar';
import { SideNav } from './components/layout/SideNav';
import { LiveCountView } from './views/LiveCountView';
import { SystemsBrowserView } from './views/SystemsBrowserView';
import { BetRampEditorView } from './views/BetRampEditorView';
import { SessionHistoryView } from './views/SessionHistoryView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import type { ViewId } from './state/store';

const VIEWS: Record<ViewId, () => JSX.Element> = {
  live: LiveCountView,
  systems: SystemsBrowserView,
  ramps: BetRampEditorView,
  history: SessionHistoryView,
  settings: SettingsView,
  about: AboutView,
};

export function App(): JSX.Element {
  useTheme();
  const view = useStore((s) => s.view);
  const ViewComponent = VIEWS[view];

  return (
    <div className="app">
      <TopBar />
      <div className="body">
        <SideNav />
        <main className="content">
          <ViewComponent />
        </main>
      </div>
    </div>
  );
}
