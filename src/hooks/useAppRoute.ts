import { useCallback, useEffect, useState } from 'react';
import {
  hashForTab,
  NAV_ITEM_BY_ID,
  tabFromHash,
  type NavTabId,
} from '../types/navigation';

/**
 * Lightweight hash router for the single-page app shell.
 * Hash routes keep deep links, browser back/forward, and refresh behaviour working
 * without adding a router dependency.
 */
export function useAppRoute() {
  const [activeTab, setActiveTab] = useState<NavTabId>(() =>
    typeof window === 'undefined' ? 'dashboard' : tabFromHash(window.location.hash),
  );

  useEffect(() => {
    // Normalise empty/legacy hashes without creating an extra history entry.
    const canonical = hashForTab(tabFromHash(window.location.hash));
    if (window.location.hash !== canonical) {
      window.history.replaceState(null, '', canonical);
    }

    const syncFromLocation = () => {
      setActiveTab(tabFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, []);

  useEffect(() => {
    document.title = `Finora — ${NAV_ITEM_BY_ID[activeTab].label}`;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab]);

  const navigate = useCallback((tab: NavTabId) => {
    const target = hashForTab(tab);
    if (window.location.hash === target) {
      setActiveTab(tab);
      return;
    }
    // Assigning the hash fires `hashchange`, which keeps state and history in sync.
    window.location.hash = target;
  }, []);

  return { activeTab, navigate };
}
