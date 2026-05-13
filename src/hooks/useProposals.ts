import { addProposalAPI, deleteProposalAPI, fetchProposalsAPI, updateProposalAPI, createShareAPI, createShareLinkAPI, getShareAPI, getShareByTokenAPI, getProposalAPI, getShareByProposalIdAPI, updateProposalStatusAPI, updateProposalByClientAPI } from '@/services/auth_service';
import { Proposal, ProposalShare } from '@/types/proposal';
import { useCallback, useEffect, useState } from 'react';
import { generateUUID } from '@/utils/uuid';
import { log } from 'console';

function normalizeProposal(raw: any): Proposal {
  
  const id = raw.id || raw._id || '';

  const techSrc = raw.techStackAndEstimation || raw.techStack || {};
  // console.log('Tech stack source:', techSrc);
  const techStack = {
    frontend: techSrc.frontend || '',
    backend: techSrc.backend || '',
    database: techSrc.database || '',
    timeline:techSrc.timeline || "",
    ui_ux: techSrc.ui_ux || techSrc.ui_ux || '',
  };
  // console.log('Normalized tech stack:', techStack);

  const estimationArr = techSrc.estimation || raw.estimation || raw.estimationMilestones || [];
  // console.log('Estimation array source:', estimationArr);
  const estimationMilestones = (estimationArr || []).map((it: any) => ({
    id: it.id || it._id || generateUUID(),
    milestone: it.milestone || it.name || '',
    description: it.description || '',
    duration: String(it.duration ?? ''),
    costInr: String(it.costInr ?? it.cost ?? ''),
    currency: String(it.currency ?? 'INR'),
    gst: String(it.gst ?? ''),
  }));
  // console.log('Normalized estimation milestones:', estimationMilestones);

  const teamSrc = raw.projectTeam || raw.team || [];
  // console.log('Team source:', teamSrc);
  const team = (teamSrc || []).map((m: any) => ({
    id: m.id || m._id || generateUUID(),
    name: m.name || '',
    role: m.role || m.title || '',
    linkedinUrl: m.linkedinUrl || m.linkedin || '',
    avatar: m.avatarUrl || m.avatar || '',
  }));
  // console.log('Normalized team:', team);

  const sigSrc = raw.signature || raw.signatures || {};
  // console.log('Signature source:', sigSrc);
  const mapParty = (p: any) => {
    if (!p) return undefined;
    const mode = p.mode || p.type || null;
    const value = p.value || p.data || '';
    // Handle all possible image modes: 'image', 'draw', 'image/png'
    const isImageMode = mode === 'image' || mode === 'draw' || mode === 'image/png' || mode?.includes('image');
    // console.log('Mapping signature party:', { mode, value, isImageMode, original: p });

    const signatureData: any = {
      type: isImageMode ? 'draw' as const : 'type' as const,
      data: value || '',
    };

    // Only include signature metadata if there's actual signature data
    if (value) {
      signatureData.signedAt = p.signedAt || p.signed_at || undefined;
      signatureData.signerName = p.signerName || p.signer_name || undefined;
    }

    return signatureData;
  };

  const signatures = {
    company: mapParty(sigSrc.company),
    client: mapParty(sigSrc.client),
  };
  // console.log('Normalized signatures:', signatures);

  const normalized: any = {
    id,
    title: raw.title || raw.name || '',
    clientId: raw.clientId || raw.client_id || raw.client || undefined,
    userId: raw.userId || raw.createdBy || raw.user || undefined,
    projectCategory: raw.projectCategory || null,
    sections: (raw.sections && Object.keys(raw.sections).length > 0) ? raw.sections : undefined,
    companyOverview: raw.companyOverview || raw.company_overview || raw.projectOverview || '',
    applicationDetails: raw.applicationDetails || raw.application_details || '',
    scopeOfWork: raw.scopeOfWork || raw.scope_of_work || raw.scope || '',
    techStackAndEstimation: {
      ...techStack,
      estimation: estimationMilestones
    },
    estimation: estimationMilestones, // Keep for backward compatibility
    detailedPhaseBreakdown: raw.detailedPhaseBreakdown || raw.detailed_phase_breakdown || '',
    postLaunchSupport: raw.postLaunchSupport || raw.post_launch_support || '',
    ongoingMaintenanceAndSupport: raw.ongoingMaintenanceAndSupport || raw.ongoingMaintenanceSupport || raw.ongoing_maintenance_support || '',
    team,
    invoiceTerms: raw.invoiceTerms || raw.invoice_terms || '',
    deploymentStructure: raw.deploymentStructure || raw.deployment_structure || '',
    sourceCodeOwnership: raw.sourceCodeOwnership || raw.source_code_ownership || '',
    terminationAndExit: raw.terminationAndExit || raw.termination_and_exit || '',
    termsAndConditions: raw.termsAndConditions || raw.terms_and_conditions || '',
    signatures,
    clientSignature: signatures.client,
    contactUs: raw.contactUs || raw.contact_us || '',
    projectOverview: raw.projectOverview || '',
    scope: raw.scope || '',
    phases: raw.phases || [],
    timeline: raw.timeline || '',
    investment: raw.investment || '',
    status: raw.status || 'draft',
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };

  // console.log('Final normalized proposal:', normalized);
  return normalized as Proposal;
}

export function useProposals({ autoFetch = true } = { autoFetch: true }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [shares, setShares] = useState<ProposalShare[]>([]);

  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetchProposalsAPI(1, 1000);
      const list = res?.data?.proposals ?? [];
      setProposals(list);
    } catch (err) {
      console.error('Fetch proposals failed', err);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchProposals();
  }, [autoFetch, fetchProposals]);

  const addProposal = useCallback(async (payload) => {

    console.log("externalPdf:", payload.externalPdf);
    console.log("isFile:", payload.externalPdf instanceof File);
    // Check if payload contains external PDF file
    const hasFile =
    payload.externalPdf instanceof File ||
    payload.externalPdf instanceof Blob;

  if (hasFile) {
    const formData = new FormData();

    // Add basic form fields
    formData.append('title', payload.title || '');
    formData.append('clientId', payload.clientId || '');
    formData.append('userId', payload.userId || '');
    
    // Add the PDF file
    formData.append('pdf', payload.externalPdf);

    const res = await addProposalAPI(formData);
    await fetchProposals();
    return res;
    } else {
      // Send raw JSON data when no PDF
      const res = await addProposalAPI(payload);
      await fetchProposals();
      return res;
    }
  }, [fetchProposals]);

  const updateProposal = useCallback(async (id: string, updates: any) => {
    // console.log('Updating proposal with data:', updates);
    
    // Send the complete payload to the API
    const payload = {
      id,
      ...updates,
    };
    
    try {
      await updateProposalAPI(payload);
      // console.log('Proposal updated successfully, refetching...');
      await fetchProposals();
    } catch (error) {
      // console.error('Update proposal failed:', error);
      throw error;
    }
  }, [fetchProposals]);

  const deleteProposal = useCallback(async (id: string) => {
    await deleteProposalAPI(id);
    await fetchProposals();
  }, [fetchProposals]);

  const getProposal = useCallback((id: string) => proposals.find((p) => p.id === id), [proposals]);

  const fetchProposalById = useCallback(async (proposalId: string) => {
    try {
      const res = await getProposalAPI(proposalId);
      const proposal = res?.data ?? res;
      if (!proposal) return null;
      console.log(proposal);
      const normalized = normalizeProposal(proposal);
      setProposals((prev) => {
        const exists = prev.find((p) => p.id === normalized.id);
        if (exists) return prev.map((p) => (p.id === normalized.id ? normalized : p));
        return [...prev, normalized];
      });
      return normalized;
    } catch (err) {
      console.error('fetchProposalById failed', err);
      return null;
    }
  }, []);

  const fetchProposalFromShareEndpoint = useCallback(async (proposalId: string) => {
    try {
      const res = await getShareByProposalIdAPI(proposalId);
      const payload = res?.data ?? res;
      // payload might be the proposal itself or an object containing proposal
      const proposal = payload?.proposal ?? payload;
      if (!proposal || !proposal.id) return null;
      const normalized = normalizeProposal(proposal);
      setProposals((prev) => {
        const exists = prev.find((p) => p.id === normalized.id);
        if (exists) return prev.map((p) => (p.id === normalized.id ? normalized : p));
        return [...prev, normalized];
      });
      return normalized;
    } catch (err) {
      console.error('fetchProposalFromShareEndpoint failed', err);
      return null;
    }
  }, []);

  const createShare = useCallback(async (proposalId: string, expiresInDays?: number, language?: 'en' | 'fr') => {
    const payload = { proposalId, expiresInDays, language };
    let shareCreated = false;
    
    // Prefer the authenticated share-link endpoint which returns a `shareUrl` / token
    try {
      const res = await createShareLinkAPI(payload);
      const data = res?.data ?? res;
      // server may return data.shareUrl or data.shareToken
      const shareUrl = data?.shareUrl;
      const shareToken = data?.shareToken || (typeof shareUrl === 'string' ? shareUrl.split('/share/').pop() : undefined) || data?.id || data?._id;
      if (shareToken) {
        const share: ProposalShare = {
          id: shareToken,
          proposalId,
          expiresAt: data?.sharedAt ? new Date(Date.parse(data.sharedAt)).toISOString() : (data?.expiresAt || data?.expiresAt),
          createdAt: data?.createdAt || new Date().toISOString(),
          language: language || 'en',
          // include original shareUrl when server returns it
          ...(data?.shareUrl ? { shareUrl: data.shareUrl } : {}),
        };
        setShares((prev) => [...prev, share]);
        shareCreated = true;
        
        // Update proposal status to 'sent' when share is created
        try {
          await updateProposalStatusAPI(proposalId, 'sent');
          // Update local proposals state
          setProposals(prev => prev.map(p => 
            p.id === proposalId ? { ...p, status: 'sent' } : p
          ));
        } catch (err) {
          console.warn('Failed to update proposal status to sent:', err);
        }
        
        return share;
      }
    } catch (err: any) {
      console.warn('createShareLinkAPI failed, falling back to legacy createShare flow', err?.message ?? err);
    }

    // Try server-side createShare endpoint (legacy)
    try {
      const res = await createShareAPI(payload);
      const share: ProposalShare = res?.data ?? res;
      if (share && share.id) {
        setShares((prev) => [...prev, share]);
        shareCreated = true;
        
        // Update proposal status to 'sent' when share is created
        try {
          await updateProposalStatusAPI(proposalId, 'sent');
          // Update local proposals state
          setProposals(prev => prev.map(p => 
            p.id === proposalId ? { ...p, status: 'sent' } : p
          ));
        } catch (err) {
          console.warn('Failed to update proposal status to sent:', err);
        }
        
        return share;
      }
    } catch (err: any) {
      console.warn('createShareAPI failed', err?.message ?? err);
    }

    // Fallback: call public `/share?id=PROPOSAL_ID` (some backends return share data)
    try {
      const res2 = await getShareByProposalIdAPI(proposalId);
      const share = res2?.data ?? res2;
      if (share && share.id) {
        setShares((prev) => [...prev, share]);
        shareCreated = true;
        
        // Update proposal status to 'sent' when share is created
        try {
          await updateProposalStatusAPI(proposalId, 'sent');
          // Update local proposals state
          setProposals(prev => prev.map(p => 
            p.id === proposalId ? { ...p, status: 'sent' } : p
          ));
        } catch (err) {
          console.warn('Failed to update proposal status to sent:', err);
        }
        
        return share;
      }
    } catch (err: any) {
      console.warn('getShareByProposalIdAPI fallback failed', err?.message ?? err);
    }

    // Last resort: create local share object
    const share: ProposalShare = {
      id: generateUUID(),
      proposalId,
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      language: language || 'en',
    };
    setShares((prev) => [...prev, share]);
    shareCreated = true;
    
    // Update proposal status to 'sent' when share is created
    try {
      await updateProposalStatusAPI(proposalId, 'sent');
      // Update local proposals state
      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { ...p, status: 'sent' } : p
      ));
    } catch (err) {
      console.warn('Failed to update proposal status to sent:', err);
    }
    
    return share;
  }, []);

  // Check for expired shares and update proposal status
  const checkAndUpdateExpiredProposals = useCallback(async () => {
    const now = new Date();
    for (const share of shares) {
      if (share.expiresAt && new Date(share.expiresAt) < now) {
        try {
          await updateProposalStatusAPI(share.proposalId, 'expired');
          // Update local proposals state
          setProposals(prev => prev.map(p => 
            p.id === share.proposalId ? { ...p, status: 'expired' } : p
          ));
        } catch (err) {
          console.warn('Failed to update proposal status to expired:', err);
        }
      }
    }
  }, [shares]);

  const fetchShareAndProposal = useCallback(async (projectCategory: string, token: string) => {
    try {
      // Use public token-based share endpoint (GET /share/:projectCategory/:token)
      const shareRes = await getShareByTokenAPI(projectCategory, token);
      const share = shareRes?.data ?? shareRes;
      if (!share) return null;
      if (share.expiresAt && new Date(share.expiresAt) < new Date()) return null;
      // If the public token endpoint returned a proposal payload directly, use it
      const possibleProposal = share.proposal ?? share.data ?? share;
      let normalized = null;
      if (possibleProposal && possibleProposal.id) {
        normalized = normalizeProposal(possibleProposal);
      } else if (share.id && (share.title || share.techStackAndEstimation)) {
        // The share object itself might be the proposal (based on API response structure)
        normalized = normalizeProposal(share);
      } else if (share.proposalId) {
        const propRes = await getProposalAPI(share.proposalId);
        const proposal = propRes?.data ?? propRes;
        normalized = proposal ? normalizeProposal(proposal) : null;
      }
      // console.debug('fetchShareAndProposal -> raw share:', shareRes);
      // console.debug('fetchShareAndProposal -> normalized proposal:', normalized);
      if (normalized) {
        setProposals((prev) => {
          const exists = prev.find((p) => p.id === normalized.id);
          if (exists) return prev.map((p) => (p.id === normalized.id ? normalized : p));
          return [...prev, normalized];
        });
      }

      // ensure we store the share keyed by the token (shareId route param)
      const storedShare: any = (() => {
        if (token) {
          return {
            id: token,
            proposalId: share.proposalId || (normalized ? normalized.id : undefined) || share.id || share._id,
            createdAt: share.createdAt || share.sharedAt || new Date().toISOString(),
            expiresAt: share.expiresAt || (share.shareExpiryDays ? undefined : undefined),
            language: share.language || 'en',
            // include other useful metadata if present
            shareUrl: (share as any).shareUrl || undefined,
            raw: share,
          };
        }
        return { id: share.id || share._id || generateUUID(), ...share };
      })();

      setShares((prev) => {
        const exists = prev.find((s) => s.id === storedShare.id);
        if (exists) return prev.map((s) => (s.id === storedShare.id ? storedShare : s));
        return [...prev, storedShare];
      });

      return normalized ?? null;
    } catch (err) {
      console.error('fetchShareAndProposal failed', err);
      return null;
    }
  }, []);

  const getShareLanguage = useCallback((shareId: string): 'en' | 'fr' => {
    const share = shares.find((s) => s.id === shareId);
    return share?.language || 'en';
  }, [shares]);

  const getShareByProposal = useCallback((proposalId: string) => {
    return shares.filter((share) => share.proposalId === proposalId);
  }, [shares]);

  const getProposalByShareId = useCallback((shareId: string) => {
    const share = shares.find((s) => s.id === shareId);
    if (!share) return null;
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return null;
    }
    return proposals.find((p) => p.id === share.proposalId) || null;
  }, [shares, proposals]);

  const markShareViewed = useCallback((shareId: string) => {
    setShares((prev) => prev.map((share) => (share.id === shareId ? { ...share, viewedAt: new Date().toISOString() } : share)));
  }, []);

  const updateProposalByClient = useCallback(async (shareToken: string, signature: any) => {
    // console.log('Updating proposal by client with shareToken:', shareToken, 'signature:', signature);
    
    try {
      const res = await updateProposalByClientAPI(shareToken, signature);
      // console.log('Proposal updated by client successfully:', res);
      
      // Update local state if the response contains updated proposal data
      if (res?.data?.proposal) {
        const updatedProposal = normalizeProposal(res.data.proposal);
        setProposals((prev) => 
          prev.map((p) => (p.id === updatedProposal.id ? updatedProposal : p))
        );
      }
      
      return res;
    } catch (error) {
      console.error('Update proposal by client failed:', error);
      throw error;
    }
  }, []);

  return {
    proposals,
    setProposals,
    shares,
    addProposal,
    updateProposal,
    updateProposalByClient,
    deleteProposal,
    getProposal,
    fetchProposalById,
    fetchProposalFromShareEndpoint,
    createShare,
    getShareByProposal,
    fetchShareAndProposal,
    getProposalByShareId,
    markShareViewed,
    getShareLanguage,
  };
}
