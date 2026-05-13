import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Proposal, Client } from '@/types/proposal';
import { StatusBadge } from './StatusBadge';
import { Eye, Edit, Trash2, Share2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProposalCardProps {
  proposal: Proposal;
  client?: Client;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}


export function ProposalCard({ proposal, client, onDelete, onShare }: ProposalCardProps) {
  let isLocked = proposal?.signature?.client.value && proposal?.signature?.company.value
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">{proposal.title}</h3>
            {client && (
              <p className="text-sm text-muted-foreground">{client.companyName}</p>
            )}
          </div>
          <StatusBadge status={proposal.status} />
        </div>
      </CardHeader>
      <CardContent>
        {/* <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {proposal.projectOverview || 'No description'}
        </p> */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Updated {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}
          </span>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={proposal.type === 'external' ? `/proposals/${(proposal.projectCategory || 'all').trim().replace(/[^a-zA-Z0-9&-]+/g, "-").replace(/^-+|-+$/g, "")
 }/${proposal.id}/preview-pdf` : `/proposals/${(proposal.projectCategory || 'all').trim().replace(/[^a-zA-Z0-9&-]+/g, "-").replace(/^-+|-+$/g, "")
 }/${proposal.id}/preview`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={isLocked ? "" : `/proposals/${proposal.id}/analytics`}>
                  <BarChart3 className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Analytics</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={isLocked ? "" :`/proposals/${proposal.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" 
                onClick={() => isLocked ? "" : onShare(proposal.id)}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => isLocked ? "" : onDelete(proposal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
