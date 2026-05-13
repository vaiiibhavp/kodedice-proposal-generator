import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useUsers } from '@/hooks/useUsers';
import type { Client, PredefinedProjectCategory } from '@/types/proposal';
import { useToast } from '@/hooks/use-toast';
import { getClientDetailAPI, addCommentAPI, getCommentsAPI, deleteCommentAPI } from '@/services/auth_service';
import { Plus, Edit, Trash2, Users, Eye, Search, X, ChevronDown, MessageSquare, CloudCog } from 'lucide-react';

const predefinedProjectCategories = [
  'Healthcare',
  'E-Commerce',
  'FinTech',
  'Gaming / iGaming',
  'Enterprise Solutions',
  'EdTech',
  'Logistics & Transportation',
  'Hospitality & Travel',
  'Real Estate',
  'Social & Community Platforms',
  'Media & Entertainment',
  'SaaS Products',
  'On-Demand Services',
  'IoT & Smart Devices',
  'AI & Automation',
] as const satisfies readonly PredefinedProjectCategory[];

type FormProjectCategory = PredefinedProjectCategory | 'Other';
const projectCategoryOptions = [...predefinedProjectCategories, 'Other'] as const;

const isPredefinedProjectCategory = (value?: string): value is PredefinedProjectCategory =>
  Boolean(value && predefinedProjectCategories.includes(value as PredefinedProjectCategory));

const getProjectCategoryFormState = (category?: string): { projectCategory: FormProjectCategory; customCategory: string } => {
  const trimmedCategory = category?.trim();

  if (!trimmedCategory || trimmedCategory.toLowerCase() === 'other') {
    return { projectCategory: 'Healthcare', customCategory: '' };
  }

  return isPredefinedProjectCategory(trimmedCategory)
    ? { projectCategory: trimmedCategory, customCategory: '' }
    : { projectCategory: 'Other', customCategory: trimmedCategory };
};

const buildClientPayload = (client: Partial<Client>, customCategory: string): Partial<Client> => {
  const payload = { ...client };
  const selectedCategory = client.projectCategory?.trim();
  const resolvedCategory =
    selectedCategory === 'Other'
      ? customCategory.trim()
      : selectedCategory;

  if (isPredefinedProjectCategory(resolvedCategory)) {
    payload.projectCategory = resolvedCategory;
  } else {
    delete payload.projectCategory;
  }

  return payload;
};

const emptyClient: Partial<Client> = {
  // leadId: '',
  leadName: '',
  companyName: '',
  contactPerson: '',
  phoneNumber: '',
  email: '',
  country:'',
  leadSource: 'Website',
  assignedTo: '',
  estimatedDealValue: 0,
  currency: 'INR',
  leadStage: 'New',
  probability: 0,
  projectCategory: 'Healthcare',
  dateAdded: new Date().toISOString().split('T')[0],
  lastFollowUpDate: '',
  nextFollowUpDate: '',
};

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { getUserOptions, getUserDisplayName, loading: usersLoading, fetchAssignedToUsers } = useUsers();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>(emptyClient);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewClient, setPreviewClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [commentClient, setCommentClient] = useState<Client | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState<Record<string, Array<{ text: string; timestamp: string }>>>({});
  const [newComment, setNewComment] = useState('');

  // Date filtering state
  const [dateRange, setDateRange] = useState<string>('');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // change as you like
  const [customCategory, setCustomCategory] = useState('');

  const handleOpen = (client?: Client) => {
    if (client) {
      console.log('Editing client:', client);
      console.log('Current assignedTo value:', client.assignedTo);
      console.log('Date fields from API:', {
        dateAdded: client.dateAdded,
        lastFollowUpDate: client.lastFollowUpDate,
        nextFollowUpDate: client.nextFollowUpDate,
        createdAt: client.createdAt,
        date_added: (client as any).date_added,
        last_follow_up_date: (client as any).last_follow_up_date,
        next_follow_up_date: (client as any).next_follow_up_date,
      });
      console.log('Available user options:', uniqueAssignees);

      // Extract user ID from assignedTo if it's an object
      let assignedToValue = '';
      if (client.assignedTo) {
        if (typeof client.assignedTo === 'string') {
          assignedToValue = client.assignedTo;
        } else if (typeof client.assignedTo === 'object' && client.assignedTo && 'id' in client.assignedTo) {
          assignedToValue = (client.assignedTo as any).id;
        }
      }

      // console.log('Extracted assignedTo value:', assignedToValue);

      // Helper function to format date for HTML input
      const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0]; // Returns yyyy-MM-dd
        } catch {
          return '';
        }
      };

      setEditingId(client.id);
      const categoryState = getProjectCategoryFormState(client.projectCategory);
      console.log("dateAdded:", client.dateAdded)
      setFormData({
        // leadId: client.leadId || '',
        leadName: client.leadName,
        companyName: client.companyName,
        contactPerson: client.contactPerson || '',
        phoneNumber: client.phoneNumber || '',
        email: client.email || '',
        country: client.country || '',
        leadSource: client.leadSource || 'Website',
        assignedTo: assignedToValue,
        estimatedDealValue: client.estimatedDealValue || 0,
        currency: client.currency || 'INR',
        leadStage: client.leadStage || 'New',
        probability: client.probability || 0,
        projectCategory: categoryState.projectCategory,
        dateAdded: formatDateForInput(client.dateAdded),

        lastFollowUpDate: formatDateForInput(client.lastFollowUpDate),
        nextFollowUpDate: formatDateForInput(client.nextFollowUpDate),
      });
      setCustomCategory(categoryState.customCategory);

      console.log("dateAdded:", client.dateAdded)
      // console.log('Form data set with assignedTo:', assignedToValue);
    } else {
      setEditingId(null);
      setFormData(emptyClient);
      setCustomCategory('');
    }
    setIsOpen(true);
  };

  const handleAddClient = async () => {
    if (!formData.leadName) {
      toast({ title: 'Lead Name is required', variant: 'destructive' });
      return;
    }
    
    const finalPayload = buildClientPayload(formData, customCategory);

    try {
      await addClient(finalPayload);
      toast({ title: 'Lead added successfully' });
      setIsOpen(false);
    } catch (error: any) {
      toast({ 
        title: error?.response?.data?.msg ||'Failed to add lead', 
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateClient = async () => {
    if (!editingId) return;

    if (!formData.leadName) {
      toast({ title: 'Lead Name is required', variant: 'destructive' });
      return;
    }

    const finalPayload = buildClientPayload(formData, customCategory);

    try {
      await updateClient(editingId, finalPayload);
      toast({ title: 'Lead updated successfully' });
      setIsOpen(false);
    } catch (error) {
      const msg = (error as any)?.response?.data?.msg || 'Failed to update lead';
      toast({ title: msg, variant: 'destructive' });
    }
  };



  const handleDelete = (id: string) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handlePreview = async (client: Client) => {
    try {
      // console.log('Fetching detailed client data for:', client.id);
      const detailedClient = await getClientDetailAPI(client.id);
      // console.log('Detailed client data:', detailedClient);

      // Apply the same data mapping as in fetchClients
      console.log(detailedClient);

      const mappedClient = {
        ...detailedClient.data,
        phoneNumber: detailedClient.data.phone || detailedClient.data.phoneNumber,
        dateAdded: detailedClient.data.dateAdded || detailedClient.data.date_added || detailedClient.data.createdAt || detailedClient.data.created_at,
        lastFollowUpDate: detailedClient.data.lastFollowUpDate || detailedClient.data.last_follow_up_date || detailedClient.data.lastFollowUp,
        nextFollowUpDate: detailedClient.data.nextFollowUpDate || detailedClient.data.next_follow_up_date || detailedClient.data.nextFollowUp,
      };
      console.log(mappedClient);

      setPreviewClient(mappedClient);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Failed to fetch client details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load client details',
        variant: 'destructive'
      });
      // Fallback to list data if API fails
      setPreviewClient(client);
      setPreviewOpen(true);
    }
  };

  const handleComment = async (client: Client) => {
    try {
      // console.log('Fetching comments for client:', client.id);
      const commentsData = await getCommentsAPI(client.id);
      // console.log('Comments data:', commentsData);

      // Transform API data to the format expected by the component
      const transformedComments = commentsData?.data?.map((comment: any) => ({
        text: comment.comment,
        timestamp: comment.createdAt || new Date().toISOString()
      })) || [];

      setComments(prev => ({
        ...prev,
        [client.id]: transformedComments
      }));

      setCommentClient(client);
      setCommentOpen(true);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      });
      // Still open the dialog even if comments fail to load
      setCommentClient(client);
      setCommentOpen(true);
    }
  };

  const handleAddComment = async () => {
    if (commentClient && newComment.trim()) {
      try {
        // console.log('Adding comment for client:', commentClient.id, 'comment:', newComment.trim());
        await addCommentAPI(commentClient.id, newComment.trim());

        // Refresh comments after adding
        const commentsData = await getCommentsAPI(commentClient.id);
        const transformedComments = commentsData?.data?.map((comment: any) => ({
          text: comment.comment,
          timestamp: comment.createdAt || new Date().toISOString()
        })) || [];

        setComments(prev => ({
          ...prev,
          [commentClient.id]: transformedComments
        }));

        setNewComment('');
        toast({ title: 'Comment added' });
      } catch (error) {
        console.error('Failed to add comment:', error);
        toast({
          title: 'Error',
          description: 'Failed to add comment',
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteComment = async (clientId: string, commentIndex: number) => {
    try {
      const clientComments = comments[clientId] || [];
      const commentToDelete = clientComments[commentIndex];

      if (!commentToDelete) {
        toast({ title: 'Comment not found', variant: 'destructive' });
        return;
      }

      // Find the comment ID from the API response (we need to store this)
      // For now, we'll need to fetch comments to get the proper comment ID
      const commentsData = await getCommentsAPI(clientId);
      const apiComments = commentsData?.data || [];
      const commentId = apiComments[commentIndex]?._id || apiComments[commentIndex]?.id;

      if (commentId) {
        await deleteCommentAPI(clientId, commentId);

        // Refresh comments after deleting
        const refreshedComments = await getCommentsAPI(clientId);
        const transformedComments = refreshedComments?.data?.map((comment: any) => ({
          text: comment.comment,
          timestamp: comment.createdAt || new Date().toISOString()
        })) || [];

        setComments(prev => ({
          ...prev,
          [clientId]: transformedComments
        }));

        toast({ title: 'Comment deleted' });
      } else {
        toast({ title: 'Comment ID not found', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive'
      });
    }
  };

  // Date filtering helper functions
  const getDateRangeFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case 'Last Week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7);
        // Set end of day for today to include all records from today
        const endOfWeek = new Date(today);
        endOfWeek.setHours(23, 59, 59, 999);
        // console.log('Last Week range:', lastWeekStart, 'to', endOfWeek);
        return { start: lastWeekStart, end: endOfWeek };

      case 'Last Month':
        const lastMonthStart = new Date(today);
        lastMonthStart.setMonth(today.getMonth() - 1);
        // Set end of day for today to include all records from today
        const endOfMonth = new Date(today);
        endOfMonth.setHours(23, 59, 59, 999);
        // console.log('Last Month range:', lastMonthStart, 'to', endOfMonth);
        return { start: lastMonthStart, end: endOfMonth };

      case 'Last Year':
        const lastYearStart = new Date(today);
        lastYearStart.setFullYear(today.getFullYear() - 1);
        // Set end of day for today to include all records from today
        const endOfYear = new Date(today);
        endOfYear.setHours(23, 59, 59, 999);
        // console.log('Last Year range:', lastYearStart, 'to', endOfYear);
        // console.log('Current date:', today, 'One year ago:', lastYearStart);
        return { start: lastYearStart, end: endOfYear };

      case 'Custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          // Set start to beginning of day and end to end of day
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          // console.log('Custom range:', startDate, 'to', endDate);
          return { start: startDate, end: endDate };
        }
        return null;

      default:
        return null;
    }
  };

  const isClientInDateRange = (client: Client) => {
    const dateFilter = getDateRangeFilter();

    if (!dateFilter) return true;

    // Get the client's created date
    const clientDate = client.createdAt || (client as any).created_at || client.dateAdded || (client as any).date_added;

    if (!clientDate) {
      // console.log('Client has no date fields:', client.leadName);
      return true;
    }

    const clientDateTime = new Date(clientDate);

    // Check if client date is within the filter range (inclusive)
    const inRange = clientDateTime >= dateFilter.start && clientDateTime <= dateFilter.end;

    // Log first few clients to see their dates
    if (clients.indexOf(client) < 3) {
      // console.log('Client:', client.leadName, 'Date:', clientDate, 'Parsed:', clientDateTime, 'In range:', inRange);
    }

    if (!inRange && dateRange) {
      // console.log('Filtered out client:', client.leadName, 'Date:', clientDate, 'Range:', dateRange);
    }

    return inRange;
  };

  const handleDateRangeChange = (range: string) => {
    // console.log('Date range changed to:', range);
    setDateRange(range);
    if (range !== 'Custom') {
      setCustomDateRange({ start: '', end: '' });
      setDateFilterOpen(false);
    }
    setCurrentPage(1); // Reset to page 1 when date filter changes
  };

  const handleCustomDateApply = () => {
    if (customDateRange.start && customDateRange.end) {
      setDateFilterOpen(false);
      setCurrentPage(1); // Reset to page 1 when custom date filter is applied
    }
  };

  const clearDateFilter = () => {
    setDateRange('');
    setCustomDateRange({ start: '', end: '' });
    setCurrentPage(1); // Reset to page 1 when date filter is cleared
  };

  // Handle click outside for date filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterOpen) {
        const target = event.target as Element;
        if (!target.closest('.date-filter-container')) {
          setDateFilterOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dateFilterOpen]);

  // Static options for filters
  const stageOptions = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
  const sourceOptions = ['Website', 'Referral', 'Ads', 'LinkedIn', 'Upwork', 'Codeur', 'Other'];
  const categoryOptions = projectCategoryOptions;

  // Get unique assignees from data
  const uniqueAssignees = getUserOptions();
  const uniqueAssigneeNames = uniqueAssignees
    .filter(user => user && user.label && typeof user.label === 'string')
    .map(user => user.label);
  // console.log('Unique assignees in form:', uniqueAssignees);
  // console.log('Unique assignee names:', uniqueAssigneeNames);

  // Filter clients based on search term and filters
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();

    // Helper function to get assignedTo display value for search
    const getAssignedToDisplay = (assignedTo: any) => {
      if (!assignedTo) return '';
      if (typeof assignedTo === 'string') return assignedTo;
      if (typeof assignedTo === 'object' && assignedTo.fName && assignedTo.lName) {
        return `${assignedTo.fName} ${assignedTo.lName}`;
      }
      if (typeof assignedTo === 'object' && assignedTo.email) return assignedTo.email;
      return '';
    };

    const assignedToDisplay = getAssignedToDisplay(client.assignedTo);

    const matchesSearch = (
      client.leadName?.toLowerCase().includes(searchLower) ||
      client.companyName?.toLowerCase().includes(searchLower) ||
      client.contactPerson?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phoneNumber?.toLowerCase().includes(searchLower) ||
      client.country?.toLowerCase().includes(searchLower) ||
      client.leadSource?.toLowerCase().includes(searchLower) ||
      assignedToDisplay.toLowerCase().includes(searchLower) ||
      client.leadStage?.toLowerCase().includes(searchLower) ||
      client.projectCategory?.toLowerCase().includes(searchLower)
    );

    // Helper function to get assignedTo ID for filtering
    const getAssignedToId = (assignedTo: any) => {
      if (!assignedTo) return '';
      if (typeof assignedTo === 'string') return assignedTo;
      if (typeof assignedTo === 'object' && assignedTo.id) return assignedTo.id;
      return '';
    };

    const assignedToId = getAssignedToId(client.assignedTo);

    const matchesStage = selectedStages.length === 0 || (client.leadStage && selectedStages.includes(client.leadStage));
    const matchesSource = selectedSources.length === 0 || (client.leadSource && selectedSources.includes(client.leadSource));
    const matchesAssignee = selectedAssignees.length === 0 || (assignedToDisplay && selectedAssignees.includes(assignedToDisplay));
    const matchesCategory = selectedCategories.length === 0 || (client.projectCategory && selectedCategories.includes(client.projectCategory));
    const matchesDate = isClientInDateRange(client);

    return matchesSearch && matchesStage && matchesSource && matchesAssignee && matchesCategory && matchesDate;
  }).sort((a, b) => {
    // Sort by most recently updated first
    const getSortDate = (client: Client) => {
      // Try updatedAt first (from API), then fallback to createdAt
      const updatedAt = (client as any).updatedAt || (client as any).updated_at;
      const createdAt = client.createdAt || (client as any).created_at;

      if (updatedAt) {
        return new Date(updatedAt).getTime();
      }
      if (createdAt) {
        return new Date(createdAt).getTime();
      }
      // Fallback to very old date if no dates available
      return new Date(0).getTime();
    };

    const dateA = getSortDate(a);
    const dateB = getSortDate(b);

    // Sort in descending order (most recent first)
    return dateB - dateA;
  });

  // Log filtering results
  // console.log('Total clients:', clients.length, 'Filtered clients:', filteredClients.length, 'Date range:', dateRange);

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      toast({ title: 'Lead deleted' });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // console.log("Browser timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);

  // console.log(previewClient.createdAt);


  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage your sales leads</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 when searching
              }}
              className="pl-10"
            // className="pl-10 w-full sm:w-64"
            />
          </div>

          {/* Lead Stage Filter */}
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={() => document.getElementById('stage-dropdown')?.click()}
            >
              <span>Lead Stage</span>
              <ChevronDown className="h-4 w-4" />
              {selectedStages.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {selectedStages.length}
                </span>
              )}
            </Button>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedStages.includes(value)) {
                  setSelectedStages([...selectedStages, value]);
                }
              }}
            >
              <SelectTrigger id="stage-dropdown" className="absolute opacity-0 pointer-events-none w-0 h-0" />
              <SelectContent>
                {stageOptions.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead Source Filter */}
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={() => document.getElementById('source-dropdown')?.click()}
            >
              <span>Lead Source</span>
              <ChevronDown className="h-4 w-4" />
              {selectedSources.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {selectedSources.length}
                </span>
              )}
            </Button>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedSources.includes(value)) {
                  setSelectedSources([...selectedSources, value]);
                }
              }}
            >
              <SelectTrigger id="source-dropdown" className="absolute opacity-0 pointer-events-none w-0 h-0" />
              <SelectContent>
                {sourceOptions.map(source => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter */}
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={() => document.getElementById('assignee-dropdown')?.click()}
            >
              <span>Assigned To</span>
              <ChevronDown className="h-4 w-4" />
              {selectedAssignees.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {selectedAssignees.length}
                </span>
              )}
            </Button>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && value !== 'no-assignees' && !selectedAssignees.includes(value)) {
                  setSelectedAssignees([...selectedAssignees, value]);
                }
              }}
            >
              <SelectTrigger id="assignee-dropdown" className="absolute opacity-0 pointer-events-none w-0 h-0" />
              <SelectContent>
                {uniqueAssigneeNames.length > 0 ? (
                  uniqueAssigneeNames.map((assigneeName, index) => (
                    <SelectItem key={`assignee-${index}-${assigneeName}`} value={assigneeName}>
                      {assigneeName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-assignees" disabled>
                    No assignees available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Project Category Filter */}
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={() => document.getElementById('category-dropdown')?.click()}
            >
              <span>Category</span>
              <ChevronDown className="h-4 w-4" />
              {selectedCategories.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </Button>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedCategories.includes(value)) {
                  setSelectedCategories([...selectedCategories, value]);
                }
              }}
            >
              <SelectTrigger id="category-dropdown" className="absolute opacity-0 pointer-events-none w-0 h-0" />
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="relative date-filter-container">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
            >
              <span>Date Range</span>
              <ChevronDown className="h-4 w-4" />
              {dateRange && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {dateRange === 'Custom' ? 'Custom' : dateRange}
                </span>
              )}
            </Button>

            {dateFilterOpen && (
              <div className="absolute top-full mt-1 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Button
                      variant={dateRange === 'Last Week' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('Last Week')}
                    >
                      Last Week
                    </Button>
                    <Button
                      variant={dateRange === 'Last Month' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('Last Month')}
                    >
                      Last Month
                    </Button>
                    <Button
                      variant={dateRange === 'Last Year' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('Last Year')}
                    >
                      Last Year
                    </Button>
                    <Button
                      variant={dateRange === 'Custom' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('Custom')}
                    >
                      Custom
                    </Button>
                  </div>

                  {dateRange === 'Custom' && (
                    <div className="space-y-2 border-t pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="date"
                            value={customDateRange.start}
                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="date"
                            value={customDateRange.end}
                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleCustomDateApply}
                        disabled={!customDateRange.start || !customDateRange.end}
                        className="w-full"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {(selectedStages.length > 0 || selectedSources.length > 0 || selectedAssignees.length > 0 || selectedCategories.length > 0 || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStages([]);
                setSelectedSources([]);
                setSelectedAssignees([]);
                setSelectedCategories([]);
                clearDateFilter();
              }}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpen()} >
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Edit the existing lead information below.' : 'Fill in the form below to add a new lead to the system.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                {/* Lead Name & country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadName">Lead Name *</Label>
                  <Input
                    id="leadName"
                    value={formData.leadName || ''}
                    onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                    required
                    placeholder="Enter lead name"
                  />
                </div>
                  <div className="space-y-2">
                  <Label htmlFor="leadName">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    placeholder="Enter country name"
                  />
                </div>
                </div>

                {/* Company & Contact Person */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson || ''}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Lead Source & Assigned To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <Select
                      value={formData.leadSource || 'Website'}
                      onValueChange={(value) => setFormData({ ...formData, leadSource: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Ads">Ads</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Upwork">Upwork</SelectItem>
                        <SelectItem value="Codeur">Codeur</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Select
                      value={formData.assignedTo || ''}
                      onValueChange={(value) => {
                        // console.log('Assigned to changed from', formData.assignedTo, 'to', value);
                        setFormData({ ...formData, assignedTo: value });
                      }}
                      disabled={usersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={usersLoading ? "Loading users..." : "Select user to assign"} />
                      </SelectTrigger>
                      <SelectContent>
                        {usersLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading users...
                          </SelectItem>
                        ) : uniqueAssignees.length > 0 ? (
                          uniqueAssignees
                            .filter(user => user && user.value && user.label)
                            .map((user) => (
                              <SelectItem key={user.value} value={user.value}>
                                {user.label}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-users" disabled>
                            No users available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {/* Debug info */}
                    {/* <div className="text-xs text-muted-foreground">
                    Debug: formData.assignedTo = "{formData.assignedTo || 'empty'}"
                  </div> */}
                  </div>
                </div>

                {/* Deal Value & Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDealValue">Estimated Deal Value</Label>
                    <Input
                      id="estimatedDealValue"
                      type="number"
                      value={formData.estimatedDealValue || ''}
                      // onChange={(e) => setFormData({ ...formData, estimatedDealValue: parseFloat(e.target.value) || 0 })}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value < 0) return; // block negative numbers
                        setFormData({ ...formData, estimatedDealValue: value });
                      }}
                      placeholder="Enter estimated deal value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency || 'INR'}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lead Stage & Project Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leadStage">Lead Stage</Label>
                    <Select
                      value={formData.leadStage || 'New'}
                      onValueChange={(value) => setFormData({ ...formData, leadStage: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Won">Won</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectCategory">Project Category</Label>
                    <Select
                      value={formData.projectCategory || 'Healthcare'}
                      onValueChange={(value) => {
                        const nextCategory = value as FormProjectCategory;
                        setFormData({ ...formData, projectCategory: nextCategory });

                        if (nextCategory !== 'Other') {
                          setCustomCategory('');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project category" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectCategoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.projectCategory === 'Other' && (
                      <Input
                        placeholder="Enter custom category"
                        value={customCategory}
                        onChange={(event) => setCustomCategory(event.target.value)}
                      />
                    )}
                  </div>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateAdded">Date Added</Label>
                    <Input
                      id="dateAdded"
                      type="date"
                      value={formData.dateAdded || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastFollowUpDate">Last Follow-up Date</Label>
                    <Input
                      id="lastFollowUpDate"
                      type="date"
                      value={formData.lastFollowUpDate || ''}
                      onChange={(e) => setFormData({ ...formData, lastFollowUpDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                    <Input
                      id="nextFollowUpDate"
                      type="date"
                      value={formData.nextFollowUpDate || ''}
                      onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={editingId ? handleUpdateClient : handleAddClient}
                  className="w-full"
                >
                  {editingId ? 'Update' : 'Add'} Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Selected Filters Display */}
      {(selectedStages.length > 0 || selectedSources.length > 0 || selectedAssignees.length > 0 || selectedCategories.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedStages.map(stage => (
            <div key={stage} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              <span>Stage: {stage}</span>
              <button
                onClick={() => setSelectedStages(selectedStages.filter(s => s !== stage))}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {selectedSources.map(source => (
            <div key={source} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              <span>Source: {source}</span>
              <button
                onClick={() => setSelectedSources(selectedSources.filter(s => s !== source))}
                className="ml-1 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {selectedAssignees.map(assignee => (
            <div key={assignee} className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              <span>Assignee: {assignee}</span>
              <button
                onClick={() => setSelectedAssignees(selectedAssignees.filter(a => a !== assignee))}
                className="ml-1 hover:text-orange-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {selectedCategories.map(category => (
            <div key={category} className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              <span>Category: {category}</span>
              <button
                onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                className="ml-1 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No leads found matching your search' : 'No leads yet'}
            </p>
            <Button onClick={() => handleOpen()}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first lead
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>All Leads ({filteredClients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead Name</TableHead>
                      <TableHead className="hidden md:table-cell">Company</TableHead>
                      <TableHead>Lead Stage</TableHead>
                      <TableHead className="hidden md:table-cell">Deal Value</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.leadName}</TableCell>
                        <TableCell className="hidden md:table-cell">{client.companyName || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.leadStage === 'Won' ? 'bg-green-100 text-green-800' :
                            client.leadStage === 'Lost' ? 'bg-red-100 text-red-800' :
                              client.leadStage === 'Proposal Sent' ? 'bg-blue-100 text-blue-800' :
                                client.leadStage === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {client.leadStage || 'New'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.estimatedDealValue
                            ? `${client.currency || 'USD'} ${client.estimatedDealValue.toLocaleString()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePreview(client)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleComment(client)}
                              className="relative"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {comments[client.id]?.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                  {comments[client.id].length}
                                </span>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpen(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(client.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex flex-row sm:flex-row justify-center items-center gap-2 mt-6">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Lead
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] md:max-w-6xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View all the detailed information about this lead including contact details, stage, and follow-up information.
            </DialogDescription>
          </DialogHeader>
          {previewClient && (
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lead ID</Label>
                  <p className="mt-1">{previewClient.leadId || 'N/A'}</p>
                </div> */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lead Name</Label>
                  <p className="mt-1 font-medium">{previewClient.leadName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                  <p className="mt-1 font-medium">{previewClient.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                  <p className="mt-1">{previewClient.companyName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                  <p className="mt-1">{previewClient.contactPerson || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  <p className="mt-1">{previewClient.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="mt-1">{previewClient.email || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lead Source</Label>
                  <p className="mt-1">{previewClient.leadSource || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                  <p className="mt-1">
                    {previewClient.assignedTo
                      ? getUserDisplayName(previewClient.assignedTo)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estimated Deal Value</Label>
                  <p className="mt-1">
                    {previewClient.estimatedDealValue
                      ? `${previewClient.currency || 'USD'} ${previewClient.estimatedDealValue.toLocaleString()}`
                      : 'N/A'
                    }
                  </p>
                </div>
                {/* <div>
                  <Label className="text-sm font-medium text-muted-foreground">Probability</Label>
                  <p className="mt-1">{previewClient.probability ? `${previewClient.probability}%` : 'N/A'}</p>
                </div> */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lead Stage</Label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${previewClient.leadStage === 'Won' ? 'bg-green-100 text-green-800' :
                      previewClient.leadStage === 'Lost' ? 'bg-red-100 text-red-800' :
                        previewClient.leadStage === 'Proposal Sent' ? 'bg-blue-100 text-blue-800' :
                          previewClient.leadStage === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                      }`}>
                      {previewClient.leadStage || 'New'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date Added</Label>
                  {/* <p className="mt-1">{previewClient.dateAdded || 'N/A'}</p> */}
                  <p className="mt-1">
                    {previewClient.createdAt
                      ? new Date(previewClient.createdAt).toLocaleString('en-IN', {
                        timeZone: userTimeZone,
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Follow-up</Label>
                  {/* <p className="mt-1">{previewClient.lastFollowUpDate || 'N/A'}</p> */}
                  <p className="mt-1">
                    {previewClient.lastFollowUpDate
                      ? new Date(previewClient.lastFollowUpDate).toLocaleString('en-IN', {
                        timeZone: userTimeZone,
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        // hour: '2-digit',
                        // minute: '2-digit',
                      })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Next Follow-up</Label>
                  {/* <p className="mt-1">{previewClient.nextFollowUpDate || 'N/A'}</p> */}
                  <p className="mt-1">
                    {previewClient.nextFollowUpDate
                      ? new Date(previewClient.nextFollowUpDate).toLocaleString('en-IN', {
                        timeZone: userTimeZone,
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        // hour: '2-digit',
                        // minute: '2-digit',
                      })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comments - {commentClient?.leadName}</DialogTitle>
            <DialogDescription>
              Add and manage comments for this lead. Track communication history and important notes.
            </DialogDescription>
          </DialogHeader>
          {commentClient && (
            <div className="space-y-4">
              {/* Add Comment Section */}
              <div className="space-y-2">
                <Label htmlFor="new-comment">Add Comment</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {comments[commentClient.id]?.length > 0 ? (
                  comments[commentClient.id].map((comment, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{comment.text}</p>
                        {/* <p className="text-xs text-muted-foreground mt-1">{comment.timestamp}</p> */}
                        <p className="text-xs text-muted-foreground mt-1">
                          {comment.timestamp
                            ? new Date(comment.timestamp).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              year: 'numeric',
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'N/A'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteComment(commentClient.id, index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">Add the first comment above</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
