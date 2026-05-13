import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProposals } from '@/hooks/useProposals';
import { getProposalAnalyticsAPI } from '@/services/auth_service';
import { ArrowLeft, Clock, Eye, TrendingUp, BarChart3, FileX, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useProposalAnalytics } from '@/hooks/useProposalAnalytics';

export default function ProposalAnalytics() {
  const { id } = useParams();
  const { getProposal, getShareByProposal, createShare } = useProposals();
  // const { getAnalyticsForProposal } = useProposalAnalytics();
  const [serverAnalytics, setServerAnalytics] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState(null);  
  const [loading, setLoading] = useState(false);

  const proposal = id ? getProposal(id) : null;
  // const localAnalyticsData = id ? getAnalyticsForProposal(id) : [];
  // console.log("propsoal",proposal);
  
  const shares = id ? getShareByProposal(id) : [];

  // Dynamic token selection: use most recent share
  const shareToken = proposal?.shareToken;
  // const shareToken = shares.length > 0 ? shares[0].id : null;

  // Fetch analytics from server
  const fetchServerAnalytics = async () => {
    if (!shareToken) return;

    setLoading(true);
    try {
      // console.log('Fetching analytics for shareToken:', shareToken);
      const response = await getProposalAnalyticsAPI(shareToken);
      // console.log('API response:', response);
      if (response.status === 200 && response.data) {
        setServerAnalytics(response.data);
        toast.success('Analytics loaded successfully');
      } else {
        toast.error('No analytics data found for this share token');
      }
    } catch (error) {
      console.error('Failed to fetch server analytics:', error);
      toast.error('Failed to fetch analytics from server');
    } finally {
      setLoading(false);
    }
  };

  // Create share if none exists
  const ensureShareExists = async () => {
    if (!proposal || shares.length > 0) return;

    try {
      await createShare(proposal.id, 365); // Create share that expires in 1 year
      toast.success('Share link created for analytics');
    } catch (error) {
      console.error('Failed to create share:', error);
      toast.error('Failed to create share link for analytics');
    }
  };

  useEffect(() => {
    // ensureShareExists();
    fetchServerAnalytics();
  }, [proposal, shares.length]);

  useEffect(() => {
    if (shareToken) {
      fetchServerAnalytics();
    }
  }, [shareToken]);

  useEffect(() => {
    // console.log('serverAnalytics', serverAnalytics);
    let analyticsData = serverAnalytics ? [serverAnalytics] : [];
    setAnalyticsData(analyticsData);
  }, [serverAnalytics]);

  // Always use server analytics if available, localStorage only as fallback

  // Debug: Log which data source is being used
  // console.log('Using analytics data source:', serverAnalytics ? 'SERVER' : 'LOCALSTORAGE');
  // console.log('Server analytics:', serverAnalytics);
  // console.log('Local analytics data:', localAnalyticsData);

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <FileX className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">Proposal Not Found</h1>
            <Button asChild className="mt-4">
              <Link to="/proposals">Back to Proposals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aggregate analytics across all views
  const aggregatedSections: Record<string, { label: string; totalTime: number; totalViews: number }> = {};
  let totalTimeSpent = 0;
  let maxScrollDepth = 0;
  let totalViews = analyticsData.length;

  analyticsData.forEach(analytics => {
    const timeSpentMinutes =
      analytics.totalTimeSpent ??
      analytics.totalTimeSpentSeconds ??
      0;

    totalTimeSpent += timeSpentMinutes;

      // ✅ FIX: max scroll depth calculation
    maxScrollDepth = Math.max(
      maxScrollDepth,
      analytics.maxScrollDepth ?? 0
    );

    const sections = analytics.sections || [];
    sections.forEach(section => {
      // Handle both server and local section formats
      const sectionKey = section.sectionKey || section.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
      const sectionLabel = section.sectionLabel || section.name || 'Unknown Section';
      // const sectionTimeSpent = section.timeSpent || section.timeSpentSeconds || 0;
      const sectionTimeSpent =
        section.timeSpent ??
        section.timeSpentSeconds ??
        0;

      const sectionViews = section.views || section.viewCount || 0;

      if (!aggregatedSections[sectionKey]) {
        aggregatedSections[sectionKey] = {
          label: sectionLabel,
          totalTime: 0,
          totalViews: 0,
        };
      }
      aggregatedSections[sectionKey].totalTime += sectionTimeSpent;
      aggregatedSections[sectionKey].totalViews += sectionViews;
    });
  });

  const sectionsArray = Object.entries(aggregatedSections)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => b.totalTime - a.totalTime);

  const maxTime = Math.max(...sectionsArray.map(s => s.totalTime), 1);

  // const normalizeSeconds = (value: number = 0) => {
  //   // if value looks too big for seconds, treat as milliseconds
  //   return value > 1000 ? value / 1000 : value;
  // };

  const formatTime = (minutes: number = 0) => {
    if (minutes <= 0) return '0m';

    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s`;
    }

    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;

    return `${mins}m`;
  };



  const getTotalTime = (analytics?: any) => {
    return (
      analytics?.totalTimeSpent ??
      analytics?.totalTimeSpentSeconds ??
      0
    ); // minutes
  };


  const avgTime =
    totalViews > 0
      ? totalTimeSpent / totalViews
      : 0;



  // const getTotalTime = (analytics?: any) =>
  // analytics?.totalTimeSpentSeconds ??
  // analytics?.totalTimeSpent ??
  // 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/proposals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">{proposal.title}</p>
        </div>
        {shareToken && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchServerAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {!shareToken ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Share Link</h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Create a share link for this proposal to start tracking analytics.
            </p>
            {/* <Button onClick={ensureShareExists}>
              Create Share Link
            </Button> */}
          </CardContent>
        </Card>
      ) : analyticsData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Analytics Yet</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Share this proposal with clients to start tracking their engagement.
              Analytics will appear here once someone views the shared proposal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews}</div>
                <p className="text-xs text-muted-foreground">Unique sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatTime(avgTime)} per view
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Max Scroll Depth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maxScrollDepth}%</div>
                <Progress value={maxScrollDepth} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Section Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Time Spent by Section
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sections ranked by client interest (time spent viewing)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionsArray.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No section data recorded yet
                </p>
              ) : (
                sectionsArray.map((section, index) => (
                  <div key={section.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{section.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {section.totalViews} views
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {formatTime(section.totalTime)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-9">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(section.totalTime / maxTime) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Individual Views */}
          <Card>
            <CardHeader>
              <CardTitle>View History</CardTitle>
              <p className="text-sm text-muted-foreground">Individual viewing sessions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.map((analytics, index) => {
                  // console.log("analytics", analytics);
                  // console.log("aaaanalytics", analytics.totalTimeSpent, analytics.totalTimeSpentSeconds);


                  return (
                    <div
                      key={analytics.shareToken || analytics.shareToken + index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Session {index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analytics.viewedAt || analytics.createdAt).toLocaleDateString()} at{' '}
                          {new Date(analytics.viewedAt || analytics.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {/* <p className="font-medium">{(analytics?.totalTimeSpent || analytics?.totalTimeSpentSeconds) ? formatTime(analytics.totalTimeSpent || analytics.totalTimeSpentSeconds) : ''}</p> */}
                        <p className="font-medium">{formatTime(getTotalTime(analytics))}</p>

                        <p className="text-sm text-muted-foreground">
                          {analytics.maxScrollDepth}% scroll depth
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}