import { useEffect } from 'react';
import { useStore } from '../state/store';

/** Reflects the theme setting onto the document root for CSS variable scoping. */
export function useTheme(): void {
  const theme = useStore((s) => s.settings.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
