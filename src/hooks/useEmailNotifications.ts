import { useLocalStorage } from './useLocalStorage';

export interface EmailNotification {
  id: string;
  proposalId: string;
  proposalTitle: string;
  clientName: string;
  clientEmail: string;
  type: 'viewed' | 'signed';
  sentAt: string;
  status: 'sent' | 'pending';
}

export const useEmailNotifications = () => {
  const [notifications, setNotifications] = useLocalStorage<EmailNotification[]>('email-notifications', []);

  const sendViewNotification = (
    proposalId: string,
    proposalTitle: string,
    clientName: string,
    clientEmail: string
  ) => {
    // Check if we already sent a view notification for this proposal in the last hour
    const recentNotification = notifications.find(
      n => n.proposalId === proposalId && 
           n.type === 'viewed' &&
           new Date(n.sentAt).getTime() > Date.now() - 60 * 60 * 1000
    );

    if (recentNotification) {
      return;
    }

    const notification: EmailNotification = {
      id: `notif-${Date.now()}`,
      proposalId,
      proposalTitle,
      clientName,
      clientEmail,
      type: 'viewed',
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    // // Simulate email sending
    // console.log('[Mock Email] Sending notification to Prometteur:', {
    //   to: 'team@prometteur.com',
    //   subject: `Proposal Viewed: ${proposalTitle}`,
    //   body: `${clientName} (${clientEmail}) is now viewing the proposal "${proposalTitle}".`
    // });

    setNotifications(prev => [notification, ...prev]);
    return notification;
  };

  const sendSignedNotification = (
    proposalId: string,
    proposalTitle: string,
    clientName: string,
    clientEmail: string
  ) => {
    const notification: EmailNotification = {
      id: `notif-${Date.now()}`,
      proposalId,
      proposalTitle,
      clientName,
      clientEmail,
      type: 'signed',
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    // console.log('[Mock Email] Sending notification to Prometteur:', {
    //   to: 'team@prometteur.com',
    //   subject: `Proposal Signed: ${proposalTitle}`,
    //   body: `Great news! ${clientName} (${clientEmail}) has signed the proposal "${proposalTitle}".`
    // });

    setNotifications(prev => [notification, ...prev]);
    return notification;
  };

  return {
    notifications,
    sendViewNotification,
    sendSignedNotification
  };
};
