export type PredefinedProjectCategory =
  | 'Healthcare'
  | 'E-Commerce'
  | 'FinTech'
  | 'Gaming / iGaming'
  | 'Enterprise Solutions'
  | 'EdTech'
  | 'Logistics & Transportation'
  | 'Hospitality & Travel'
  | 'Real Estate'
  | 'Social & Community Platforms'
  | 'Media & Entertainment'
  | 'SaaS Products'
  | 'On-Demand Services'
  | 'IoT & Smart Devices'
  | 'AI & Automation';

export type ProjectCategory = PredefinedProjectCategory | 'Other' | (string & {});

export interface Client {
  id: string;
  leadId?: string;
  leadName: string;
  companyName: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  country:string;
  leadSource?: 'Website' | 'Referral' | 'Ads' | 'LinkedIn' | 'Upwork' | 'Codeur' | 'Other';
  assignedTo?: string;
  estimatedDealValue?: number;
  currency?: string;
  leadStage?: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  probability?: number;
  projectCategory?: ProjectCategory;
  dateAdded?: string;
  lastFollowUpDate?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  scope: string;
  techStack: string[];
  termsAndConditions: string;
  createdAt: string;
}

export interface ProposalPhase {
  id: string;
  name: string;
  duration: string;
  deliverables: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  linkedinUrl?: string;
  avatar?: string;
}

export interface TechStackCategory {
  frontend?: string;
  backend?: string;
  database?: string;
  ui_ux?: string;
  // estimation?:any
  timeline?: string; 
  totalCost?: number;    

  estimation?: EstimationMilestone[];

}

export interface EstimationMilestone {
  id?: string;
  milestone: string;
  description: string;
  duration: string;
  costInr: string;
  currency: string;
  gst: string;
}

export interface SignatureData {
  mode: 'image' | 'typed';
  type: 'draw' | 'type';
  value?:string;
  data: string; // base64 for draw, text for type
  signedAt?: string;
  signerName?: string;
}

export interface ProposalSignatures {
  company?: SignatureData;
  client?: SignatureData;
}

export interface ProposalSections {
  companyOverview: boolean;
  applicationDetails: boolean;
  scopeOfWork: boolean;
  techStackEstimation: boolean;
  detailedPhaseBreakdown: boolean;
  postLaunchSupport: boolean;
  ongoingMaintenanceAndSupport: boolean;
  projectTeam: boolean;
  deploymentStructure: boolean;
  sourceCodeOwnership: boolean;
  terminationAndExit: boolean;
  invoiceTerms: boolean;
  termsAndConditions: boolean;
  signature: boolean;
  contactUs: boolean;
}

export interface Proposal {
  id: string;
  title: string;
  clientId?: string;
  userId?:string;
  projectCategory?: string | null;
  
  // External PDF file
  externalPdf?: File | null;
  externalPdfUrl?: string;
  
  // Proposal type: internal or external
  type?: 'internal' | 'external';
  
  // Attached PDF info for external proposals
  attachedPdf?: {
    filename: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
  
  // Section visibility
  sections: ProposalSections;
  
  // Company Overview
  companyOverview: string;
  
  // Application Development Details
  applicationDetails: string;
  
  // Scope of Work
  scopeOfWork: string;
  
  // Tech Stack (categorized)
  techStackAndEstimation : TechStackCategory;
  totalCost: number;
  // Estimation
  estimation: EstimationMilestone[];
  
  // Detailed Phase Breakdown
  detailedPhaseBreakdown: string;
  
  // Post Launch Support
  postLaunchSupport: string;
  
  // Ongoing Maintenance and Support
  ongoingMaintenanceAndSupport: string;
  
  // Project Team
  team: TeamMember[];
  
  // Invoice Terms
  invoiceTerms: string;
  
  // Deployment Structure
  deploymentStructure: string;
  
  // Source Code Ownership
  sourceCodeOwnership: string;
  
  // Termination & Exit
  terminationAndExit: string;
  
  // Terms & Conditions
  termsAndConditions: string;
  
  // Signatures (both parties)
  signatures?: ProposalSignatures;
  signature?: ProposalSignatures;
  
  // Legacy field for backward compatibility
  clientSignature?: SignatureData;
  
  // Contact Us
  contactUs: string;
  
  // Legacy fields for backward compatibility
  projectOverview: string;
  scope: string;
  phases: ProposalPhase[];
  timeline: string;
  investment: string;

  shareToken:any;
  
  status: 'draft' | 'sent' | 'signed' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface ProposalShare {
  id: string;
  proposalId: string;
  expiresAt?: string;
  viewedAt?: string;
  createdAt: string;
  language?: 'en' | 'fr'; // Language preference for shared link
}

export interface ProposalEstimation {
  milestone: string;
  duration: string;
  cost: number;
  currency: string;
  gst: number;
}

export interface TechStackAndEstimation {
  frontend: string;
  backend: string;
  database: string;
  ui_ux: string;
  estimation: ProposalEstimation[];
}

export interface ProjectTeamMember {
  name: string;
  role: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

export interface SignatureParty {
  mode: 'typed' | 'image';
  value: string;
  signedAt: string;
}

export interface ProposalSignature {
  company: SignatureParty;
  client: SignatureParty;
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
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
}

export interface UpdateProposalPayload {
  id: string;
  title: string;
  createdBy?: string;
    // estimation?:any
  timeline?: string; 
  totalCost?: number;   
}
