import { api } from "./api";



export interface LoginPayload {

  username: string;

  password: string;

}



export interface SignupPayload {

  fName: string;

  lName: string;

  email: string;

  phone: string;

  password: string;

  // deviceId: string;

}



export interface AddClientPayload {

  leadName: string;

  companyName: string;

  contactPerson?: string;

  email?: string;

  phone?: string;

  country?: string;

  leadSource?: string;

  projectCategory?: string;

  assignedTo?: string;

  estimatedDealValue?: number;

  currency?: string;

  leadStage?: string;

}



export interface UpdateClientPayload{

  id: string;

  leadName?: string;

  companyName?: string;

  contactPerson?: string;

  email?: string;

  phone?: string;

  country?: string;

  leadSource?: string;

  projectCategory?: string;

  assignedTo?: string;

  estimatedDealValue?: number;

  currency?: string;

  leadStage?: string;

}



export interface UpdateProposalPayload {

  id: string;

  title: string;

  createdBy?: string;

  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

}



export interface TechStackAndEstimation {

  frontend: string;

  backend: string;

  database: string;

  ui_ux: string;

  estimation: ProposalEstimation[];

}



export interface ProposalEstimation {

  milestone: string;

  duration: string;

  costInr: number;

  gst: number;

}



export interface ProjectTeamMember {

  name: string;

  role: string;

  avatarUrl?: string;

  linkedinUrl?: string;

}



export interface ProposalSignature {

  company: SignatureParty;

  client: SignatureParty;

}



export interface SignatureParty {

  mode: 'typed' | 'image';

  value: string;

  signedAt: string;

}



export interface AddProposalPayload {

  title: string;

  clientId: string;

  userId: string;



  companyOverview: string;

  applicationDetails: string;

  scopeOfWork: string;



  techStackAndEstimation: TechStackAndEstimation;



  detailedPhaseBreakdown: string;

  postLaunchSupport: string;

  ongoingMaintenanceAndSupport: string;



  projectTeam: ProjectTeamMember[];



  deploymentStructure: string;

  sourceCodeOwnership: string;

  terminationAndExit: string;



  signature: ProposalSignature;



  contactUs: string;

  paymentTerms: string;

  // paymentGateway: string;

  // paymentMethod: string;

}



export interface UpdateUserPayload {

  fName: string;

  lName: string;

  userId: string;

}



export interface DeleteUserPayload {

  userId: string;

}





export const loginUser = async (data: LoginPayload) => {

  const res = await api.post('/user/login', data);

  return res.data;

};



export const registerUser = async (data: SignupPayload) => {

  const res = await api.post('/user/addUser', data);

  return res.data;

};



// ----------------for client-----------------



/** ➕ Add Client */

export const addClientAPI = async (data: AddClientPayload) => {

  const res = await api.post('/leadAdd', data);

  return res.data;

};



/** ✏️ Update Client */

export const updateClientAPI = async (data: UpdateClientPayload) => {

  const res = await api.put('/leadUpdate', data);

  return res.data;

};



/** 🗑 Delete Client */

export const deleteClientAPI = async (clientId: string) => {

  const res = await api.delete(`/leadDel?clientId=${clientId}`);

  return res.data;

};



/** 📃 Client List */

export const getClientListAPI = async (

  pageNo = 1,

  limit = 10,

  searchVal = ''

) => {

  const res = await api.get(

    `/leadList?pageNo=${pageNo}&limit=${limit}&searchVal=${searchVal}`

  );

  return res.data;

};



/** 🔍 Client Detail */

export const getClientDetailAPI = async (clientId: string) => {

  const res = await api.get(`/lead/detail?clientId=${clientId}`);

  return res.data;

};



// ----------------- User APIs -----------------



/** 📃 User List */

export const getUserListAPI = async (pageNo: number, limit: number) => {

  const res = await api.get('/user/list', {

    params: {

      pageNo,

      limit,

    },

  });

  return res.data;

};



export const getAssignedToListAPI = async (pageNo: number, limit: number) => {

  const res = await api.get('/user/listForAssignTo', {

    params: {

      pageNo,

      limit,

    },

  });

  return res.data;

};





export const updateUser = async (data: UpdateUserPayload) => {

  const res = await api.put('/user/update', data);

  return res.data;

};



export const deleteUser = async (data: DeleteUserPayload) => {

  const res = await api.delete('/user/delete', {

    data: data, // axios requires this for DELETE body

  });

  return res.data;

};



// ----------------- Comment APIs -----------------



/** ➕ Add Comment */

export const addCommentAPI = async (clientId: string, comment: string) => {

  const res = await api.post('/lead/comment/add', {

    clientId,

    comment

  });

  return res.data;

};



/** 📃 Get Comments */

export const getCommentsAPI = async (clientId: string) => {

  const res = await api.get(`/lead/comment/list?clientId=${clientId}`);

  return res.data;

};



/** 🗑 Delete Comment */

export const deleteCommentAPI = async (clientId: string, commentId: string) => {

  const res = await api.delete(`/lead/comment/delete?clientId=${clientId}&commentId=${commentId}`);

  return res.data;

};



// ----------------- Proposal APIs -----------------



/** 📄 Fetch all proposals */

export const fetchProposalsAPI = async (pageNo: number, limit: number) => {

  const res = await api.get('/proposalList', {

    params: {

      pageNo,

      limit,

    },

  });

  return res.data;

};



/** ➕ Add new proposal */

export const addProposalAPI = async (data: AddProposalPayload | FormData) => {

  const res = await api.post('/addProposal', data);

  return res.data;

};



/** ✏️ Update proposal */

export const updateProposalAPI = async (updates: any) => {

  // console.log('Sending to API:', JSON.stringify(updates, null, 2));



  const res = await api.put(`/updateProposal`, updates);

  return res.data;

};



/** � Update proposal status */

export const updateProposalStatusAPI = async (proposalId: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => {

  // console.log('Sending to API:', JSON.stringify({ id: proposalId, status }, null, 2));

  const res = await api.put(`/updateProposal`, { id: proposalId, status });

  return res.data;

};



/** �🗑 Delete proposal */

export const deleteProposalAPI = async (id: string) => {

  const res = await api.delete(`/proposalDel?proposalId=${id}`);

  return res.data;

};



/** 🔍 Get single proposal */

export const getProposalAPI = async (id: string) => {

  const res = await api.get(`/getProposal?proposalId=${id}`);

  return res.data;

};

export const viewPdfAPI = async (id: string) => {

  const res = await api.get(`/proposal/viewPdf/${id}`, {
    responseType: 'arraybuffer' // Important for handling binary PDF data
  });

  return res;

};



/** ➕ Create share (server-backed) */

export const createShareAPI = async (data: { proposalId: string; expiresInDays?: number; language?: 'en' | 'fr' }) => {

  const res = await api.post('/shareCreate', data);

  return res.data;

};



/** ➕ Create share link (returns shareUrl/shareToken) */

export const createShareLinkAPI = async (data: { proposalId: string; expiresInDays?: number; language?: 'en' | 'fr' }) => {

  const res = await api.put('/shareLink', data);

  return res.data;

};



/** 🔍 Get share by id (server-backed) */

export const getShareAPI = async (shareId: string) => {

  const res = await api.get(`/getShare?shareId=${shareId}`);

  return res.data;

};



/** 🔍 Get public share by token (public view) */

export const getShareByTokenAPI = async (projectCategory: string, token: string) => {

  const base = import.meta.env.VITE_BASE_URL || '';

  const url = `${base.replace(/\/$/, '')}/share/${encodeURIComponent(projectCategory)}/${encodeURIComponent(token)}`;

  const resp = await fetch(url, { method: 'GET' });

  if (!resp.ok) {

    throw new Error(`Failed to fetch share by token: ${resp.status} ${resp.statusText}`);

  }

  // Check if response is a PDF (external proposal)
  const contentType = resp.headers.get('content-type');
  const contentDisposition = resp.headers.get('content-disposition');
  
  if (contentType?.includes('application/pdf') || contentDisposition?.includes('.pdf')) {
    // Return PDF data as external proposal
    const pdfBlob = await resp.blob();
    return {
      data: {
        type: 'external',
        title: contentDisposition?.match(/filename="([^"]+)"/)?.[1] || 'External Proposal',
        id: token, // Use token as ID for external proposals
        pdfBlob: pdfBlob
      }
    };
  }

  // Otherwise, parse as JSON (regular proposal)
  return await resp.json();

};



/** 🔍 Get share by proposal id (public share endpoint) */

export const getShareByProposalIdAPI = async (proposalId: string) => {

  // Use a plain fetch to call the public share endpoint without the

  // axios instance headers (avoids sending extra headers that can

  // trigger CORS preflight on some backends).

  const base = import.meta.env.VITE_BASE_URL || '';

  const url = `${base.replace(/\/$/, '')}/share?id=${encodeURIComponent(proposalId)}`;

  const resp = await fetch(url, { method: 'GET' });

  if (!resp.ok) {

    throw new Error(`Failed to fetch share: ${resp.status} ${resp.statusText}`);

  }

  return await resp.json();

};



/* ===============================

   📊 PROPOSAL COUNTS BY CONDITIONS

================================ */

export const getProposalCountsByConditionsAPI = async () => {

  const res = await api.get('/proposalCountsByConditions');

  return res.data;

};



// ===============================

// 📈 PROPOSAL ANALYTICS APIS

// ===============================



export interface AnalyticsSection {

  name: string;

  views: number;

  timeSpent: number;

  _id: string;

  id: string;

}



export interface ProposalAnalyticsData {

  maxScrollDepth: number;

  proposalId: string;

  shareToken: string;

  totalTimeSpent: number;

  lastViewedAt: string;

  sections: AnalyticsSection[];

  createdAt: string;

  id: string;

}



export interface AnalyticsPayload {

  maxScrollDepth: number;

  proposalId: string;

  shareToken: string;

  totalTimeSpent: number;

  lastViewedAt: string;

  sections: Omit<AnalyticsSection, '_id' | 'id'>[];

}



/** 🔍 Get proposal analytics by share token */

export const getProposalAnalyticsAPI = async (shareToken: string) => {

  const res = await api.get(`/analytics/detail?shareToken=${shareToken}`);

  return res.data;

};



/** ➕ Add/update proposal analytics */

export const addProposalAnalyticsAPI = async (data: AnalyticsPayload) => {

  const res = await api.post('/analyticsAdd', data);

  return res.data;

};



/** ✏️ Update proposal by client (for signature) */

export const updateProposalByClientAPI = async (shareToken: string, signature: any) => {

  

  try {

    const res = await api.put(`/updateProposalByClient/${shareToken}`, signature);

    return res.data;

  } catch (error) {

    console.error('Error:', error);

    throw error;

  }

};



export const exportProposalPDFAPI = async (id: string) => {

  try {

    const res = await api.get(`/proposal/exportPDF/${id}`);

    return res.data;

  } catch (error) {

    console.error("Error:", error);

    throw error;

  }

};