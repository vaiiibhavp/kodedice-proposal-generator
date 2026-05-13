import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ProposalAnalytics,
  ServerProposalAnalytics,
  AnalyticsPayload,
} from '@/types/analytics';
import {
  getProposalAnalyticsAPI,
  addProposalAnalyticsAPI,
} from '@/services/auth_service';
import { CloudCog } from 'lucide-react';
import { log } from 'console';

/* ----------------------------------
   debounce (unchanged)
----------------------------------- */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}

const safeParseFloat = (value: any) => {
  const num = parseFloat(String(value ?? 0));
  return isNaN(num) ? 0 : Math.round(num);
};

export function useProposalAnalytics(proposalId: string, shareToken: string) {
  const [analytics, setAnalytics] = useState<ProposalAnalytics | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('default');

  const analyticsRef = useRef<ProposalAnalytics | null>(null);

  /* ----------------------------------
     TIMER REFS
  ----------------------------------- */

  // 🔥 Timestamp when tracking started
  const trackingStartRef = useRef<number>(Date.now());

  // 🔥 Used for continuous time increment
  const lastTickRef = useRef<number>(Date.now());

  const lastScrollDepth = useRef(0);

  useEffect(() => { 
    analyticsRef.current = analytics;
  }, [analytics]);

  const resetTimeCounters = useCallback(() => {
  setAnalytics(prev =>
    prev
      ? {
          ...prev,
          totalTimeSpentSeconds: 0,
          sections: prev.sections.map(s => ({
            ...s,
            timeSpentSeconds: 0,
            viewCount:0,
          })),
          lastUpdatedAt: new Date().toISOString(),
        }
      : prev
  );

  // 🔥 reset timer baseline
  lastTickRef.current = Date.now();
}, []);


  /* ----------------------------------
     Server → Local mapper
  ----------------------------------- */
  const serverToLocalAnalytics = useCallback(
    (data: ServerProposalAnalytics): ProposalAnalytics => ({
      proposalId: data.proposalId,
      shareToken: data.shareToken,
      totalTimeSpentSeconds: data.totalTimeSpent,
      maxScrollDepth: data.maxScrollDepth,
      sections: data.sections.map(s => ({
        sectionKey: s.name.toLowerCase().replace(/\s+/g, '-'),
        sectionLabel: s.name,
        timeSpentSeconds: s.timeSpent,
        viewCount: s.views,
        lastViewedAt: data.lastViewedAt,
      })),
      viewedAt: data.createdAt,
      lastUpdatedAt: data.lastViewedAt,
    }),
    []
  );

  /* ----------------------------------
     Local → Server mapper
  ----------------------------------- */
  const localToServerAnalytics = useCallback(
    (data: ProposalAnalytics): AnalyticsPayload => ({
      proposalId: data.proposalId,
      shareToken: data.shareToken,
      totalTimeSpent: data.totalTimeSpentSeconds,
      maxScrollDepth: safeParseFloat(data.maxScrollDepth),
      lastViewedAt: new Date().toISOString(),
      sections: data.sections.map(s => ({
        name: s.sectionLabel,
        views: s.viewCount,
        timeSpent: s.timeSpentSeconds,
      })),
    }),
    []
  );

  /* ----------------------------------
     INIT ANALYTICS ON PAGE LOAD
  ----------------------------------- */
  useEffect(() => {
    const initial: ProposalAnalytics = {
      proposalId,
      shareToken,
      totalTimeSpentSeconds: 0,
      maxScrollDepth: 0,
      sections: [
        {
          sectionKey: 'default',
          sectionLabel: 'Main Content',
          timeSpentSeconds: 0,
          viewCount: 1,
          lastViewedAt: new Date().toISOString(),
        },
      ],
      viewedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    setAnalytics(initial);
  }, [proposalId, shareToken]);

  /* ----------------------------------
     ⏱ CONTINUOUS TIMER (1 SECOND)
  ----------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // const diffSeconds = Math.floor((now - lastTickRef.current) / 1000);
      const diffSeconds = now - lastTickRef.current;
      lastTickRef.current = now;


      if (diffSeconds <= 0) return;

      lastTickRef.current = now;

      setAnalytics(prev =>
        prev
          ? {
              ...prev,
              totalTimeSpentSeconds: prev.totalTimeSpentSeconds + diffSeconds,
              sections: prev.sections.map(s =>
                s.sectionKey === currentSection
                  ? {
                      ...s,
                      timeSpentSeconds: s.timeSpentSeconds + diffSeconds,
                      lastViewedAt: new Date().toISOString(),
                    }
                  : s
              ),
              lastUpdatedAt: new Date().toISOString(),
            }
          : prev
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSection]);

  /* ----------------------------------
     SECTION TRACKING (NO TIME LOGIC)
  ----------------------------------- */
  const trackSectionView = useCallback(
    (sectionKey: string, sectionLabel: string) => {
      setCurrentSection(sectionKey);

      setAnalytics(prev =>
        prev
          ? {
              ...prev,
              sections: prev.sections.some(s => s.sectionKey === sectionKey)
                ? prev.sections.map(s =>
                    s.sectionKey === sectionKey
                      ? {
                          ...s,
                          viewCount: s.viewCount + 1,
                          lastViewedAt: new Date().toISOString(),
                        }
                      : s
                  )
                : [
                    ...prev.sections,
                    {
                      sectionKey,
                      sectionLabel,
                      timeSpentSeconds: 0,
                      viewCount: 1,
                      lastViewedAt: new Date().toISOString(),
                    },
                  ],
            }
          : prev
      );
    },
    []
  );

  /* ----------------------------------
     SCROLL TRACKING (NO TIME)
  ----------------------------------- */
  const trackScrollDepth = useCallback((depth: number) => {
    if (depth <= lastScrollDepth.current) return;

    lastScrollDepth.current = depth;

    setAnalytics(prev =>
      prev
        ? {
            ...prev,
            maxScrollDepth: Math.max(prev.maxScrollDepth, depth),
            lastUpdatedAt: new Date().toISOString(),
          }
        : prev
    );
  }, []);

  /* ----------------------------------
     🚀 API SYNC EVERY 5 SECONDS
  ----------------------------------- */
useEffect(() => {
  const sync = setInterval(async () => {
    const data = analyticsRef.current;
    if (!data) return;

    try {
      await addProposalAnalyticsAPI(localToServerAnalytics(data));

      // ✅ RESET TIMERS AFTER SUCCESSFUL SYNC
      resetTimeCounters();
    } catch (err) {
      console.error('Analytics sync failed', err);
    }
  }, 5000);

  return () => clearInterval(sync);
}, [localToServerAnalytics, resetTimeCounters]);

      
  return {
    trackSectionView,
    trackScrollDepth,
  };
}
