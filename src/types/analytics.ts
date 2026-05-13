export interface SectionAnalytics {
  sectionKey: string;
  sectionLabel: string;
  timeSpentSeconds: number;
  viewCount: number;
  lastViewedAt: string;
}

export interface ProposalAnalytics {
  proposalId: string;
  shareToken: string;
  totalTimeSpentSeconds: number;
  maxScrollDepth: number; // 0-100 percentage
  sections: SectionAnalytics[];
  viewedAt: string;
  lastUpdatedAt: string;
}

// Server API types (matching the backend response format)
export interface ServerAnalyticsSection {
  name: string;
  views: number;
  timeSpent: number;
  _id: string;
  id: string;
}

export interface ServerProposalAnalytics {
  maxScrollDepth: number;
  proposalId: string;
  shareToken: string;
  totalTimeSpent: number;
  lastViewedAt: string;
  sections: ServerAnalyticsSection[];
  createdAt: string;
  id: string;
}

export interface AnalyticsPayload {
  maxScrollDepth: any;
  proposalId: string;
  shareToken: string;
  totalTimeSpent: number;
  lastViewedAt: string;
  sections: Omit<ServerAnalyticsSection, '_id' | 'id'>[];
}
