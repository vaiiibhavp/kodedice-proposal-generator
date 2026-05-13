import { Badge } from '@/components/ui/badge';
import { Proposal } from '@/types/proposal';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

type StatusConfig = {
  [key: string]: {
    label: string;
    className: string;
    icon?: React.ReactNode; 
  }
}

const statusConfig : StatusConfig = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', className: 'bg-primary/10 text-primary' },
  accepted: { label: 'Accepted', className: 'bg-success/10 text-success' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expired', className: 'bg-orange-100 text-orange-800' },
   signed: { 
    label: 'Signed', 
    className: 'bg-green-50 text-green-700',
    icon: <Lock className="h-3 w-3 mr-1" /> 
  },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) {
    return (
      <Badge variant="secondary" className="font-medium">
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
      {config.icon}
    </Badge>
  );
}
