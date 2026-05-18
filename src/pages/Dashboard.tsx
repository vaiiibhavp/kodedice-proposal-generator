import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProposals } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { StatusBadge } from '@/components/proposals/StatusBadge';
import { FileText, Users, Plus, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { proposals } = useProposals();
  const { clients } = useClients();

  // console.log("propsal",proposals);
  

  const recentProposals = [...proposals]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === 'draft').length,
    sent: proposals.filter((p) => p.status === 'sent').length,
    accepted: proposals.filter((p) => p.status === 'signed').length,
  };

  return (
    <div className="space-y-8">
      {/* <div className="flex items-center justify-between"> */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1> */}

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Kodedice</p>
        </div>
         {/* <Button asChild> */}
        <Button asChild className="w-full sm:w-auto">
          <Link to="/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Proposals</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/proposals">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentProposals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No proposals yet</p>
              <Button variant="link" asChild>
                <Link to="/proposals/new">Create your first proposal</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  // className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"

                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="space-y-1">
                    <Link 
                      to={`/proposals/${proposal.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {proposal.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Updated {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
