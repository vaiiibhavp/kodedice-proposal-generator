import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProposals } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProposalsList() {
  const { proposals, deleteProposal, createShare } = useProposals();
  const { getClient } = useClients();
  const [search, setSearch] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // change as you like


  const filteredProposals = proposals.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleDelete = (id: string) => {
    setProposalToDelete(id);
    setDeleteDialogOpen(true);
  };

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProposals = filteredProposals.slice(startIndex, endIndex);


  const confirmDelete = () => {
    if (proposalToDelete) {
      deleteProposal(proposalToDelete);
      toast.success('Proposal deleted');
      setDeleteDialogOpen(false);
      setProposalToDelete(null);
    }
  };

  const handleShare = async (id: string) => {
    try {
      const share = await createShare(id, 30);
      // If server returned a share id (server-backed share token), use that route
      if (share && (share as any).id) {
        const link = `${window.location.origin}/share/${(share as any).id}`;
        setShareLink(link);
      } else {
        // Fallback: show frontend stateless share link which loads proposal by id
        const link = `${window.location.origin}/share?id=${id}`;
        setShareLink(link);
      }
      setShowShareDialog(true);
    } catch (err) {
      // fallback behaviour
      const backendBase = import.meta.env.VITE_BASE_URL || window.location.origin;
      const link = `${backendBase}/share?id=${id}`;
      setShareLink(link);
      setShowShareDialog(true);
    }
  };

  // const copyToClipboard = () => {
  //   navigator.clipboard.writeText(shareLink);
  //   toast.success('Link copied to clipboard');
  // };

  const copyToClipboard = async () => {
  try {
    // Modern clipboard API (HTTPS only)
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard');
      return;
    }

    // Fallback for HTTP / older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareLink;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (success) {
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Failed to copy link');
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    toast.error('Failed to copy link');
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Manage your project proposals</p>
        </div>
        <Button asChild>
          <Link to="/proposals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search proposals..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); 
          }}
          className="pl-10"
        />
      </div>

      {/* {filteredProposals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No proposals found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              client={proposal.clientId ? getClient(proposal.clientId) : undefined}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}
        </div>
      )} */}

        {filteredProposals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No proposals found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                client={proposal.clientId ? getClient(proposal.clientId) : undefined}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>

          {/* ✅ Pagination UI */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                 ⟨
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                 ⟩
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Proposal</DialogTitle>
            <DialogDescription>
              Anyone with this link can view the proposal. Link expires in 30 days.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Proposal
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
