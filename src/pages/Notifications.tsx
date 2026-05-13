import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { ArrowLeft, Mail, Eye, PenTool, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { notifications } = useEmailNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Email Notifications</h1>
          <p className="text-muted-foreground">View all sent notifications (demo mode)</p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Notifications Yet</h3>
            <p className="text-muted-foreground text-center">
              Email notifications will appear here when clients view or sign proposals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${notif.type === 'viewed' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {notif.type === 'viewed' ? <Eye className="h-5 w-5" /> : <PenTool className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={notif.type === 'viewed' ? 'secondary' : 'default'}>
                        {notif.type === 'viewed' ? 'Viewed' : 'Signed'}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notif.sentAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="font-medium truncate">{notif.proposalTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {notif.clientName} ({notif.clientEmail})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
