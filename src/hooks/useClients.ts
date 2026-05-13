import { useCallback, useEffect, useState } from 'react';
import { Client } from '@/types/proposal';
import {
  addClientAPI,
  updateClientAPI,
  deleteClientAPI,
  getClientListAPI,
} from '@/services/auth_service';

const validProjectCategories = new Set([
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
]);

const isValidProjectCategory = (category?: string) =>
  Boolean(category && validProjectCategories.has(category.trim()));

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===================== FETCH CLIENTS ===================== */
  const fetchClients = useCallback(async () => {
  setLoading(true);
  try {
    const res = await getClientListAPI(1, 100, ''); // Fetch more records for filtering

    const clientsData =
      res?.data?.leads ||
      res?.data?.clients ||
      res?.data ||
      [];

    // Map API response to frontend format (phone -> phoneNumber, date fields)
    const mappedClients = clientsData.map((client: any) => ({
      ...client,
      phoneNumber: client.phone || client.phoneNumber, // Map phone to phoneNumber
      dateAdded: client.dateAdded || client.date_added || client.createdAt || client.created_at,
      lastFollowUpDate: client.lastFollowUpDate || client.last_follow_up_date || client.lastFollowUp,
      nextFollowUpDate: client.nextFollowUpDate || client.next_follow_up_date || client.nextFollowUp,
      updatedAt: client.updatedAt || client.updated_at || client.updated, // Map updatedAt field
    }));

    setClients(mappedClients);
  } catch (error) {
    console.error('Fetch clients failed', error);
  } finally {
    setLoading(false);
  }
}, []);


  /* ===================== ADD CLIENT ===================== */
  const addClient = useCallback(async (client: any) => {
    const payload: any = {
      leadName: client.leadName,
      companyName: client.companyName,
    };

    // Only include optional fields if they have values
    if (client.contactPerson && client.contactPerson.trim()) {
      payload.contactPerson = client.contactPerson;
    }
    if (client.email && client.email.trim()) {
      payload.email = client.email;
    }
    if (client.phoneNumber && client.phoneNumber.trim()) {
      payload.phone = client.phoneNumber;
    }
    if (client.country && client.country.trim()) {
      payload.country = client.country;
    }
    if (client.leadSource && client.leadSource.trim()) {
      payload.leadSource = client.leadSource;
    }
    if (isValidProjectCategory(client.projectCategory)) {
      payload.projectCategory = client.projectCategory.trim();
    }
    if (client.assignedTo && client.assignedTo.trim()) {
      payload.assignedTo = client.assignedTo;
    }
    if (client.estimatedDealValue && client.estimatedDealValue > 0) {
      payload.estimatedDealValue = client.estimatedDealValue;
    }
    if (client.currency && client.currency.trim()) {
      payload.currency = client.currency;
    }
    if (client.leadStage && client.leadStage.trim()) {
      payload.leadStage = client.leadStage;
    }
    if (client.dateAdded && client.dateAdded.trim()) {
      payload.dateAdded = client.dateAdded;
    }
    if (client.lastFollowUpDate && client.lastFollowUpDate.trim()) {
      payload.lastFollowUpDate = client.lastFollowUpDate;
    }
    if (client.nextFollowUpDate && client.nextFollowUpDate.trim()) {
      payload.nextFollowUpDate = client.nextFollowUpDate;
    }

    const res = await addClientAPI(payload);
    await fetchClients();
    return res;
  }, [fetchClients]);

  /* ===================== UPDATE CLIENT ===================== */
  const updateClient = useCallback(async (id: string, client: any) => {
    const clientId = id || client?.id;
    const payload: any = {
      id: clientId,
    };

    // Only include fields that are being updated and have valid values
    if (client.leadName !== undefined) {
      payload.leadName = client.leadName;
    }
    if (client.companyName !== undefined) {
      payload.companyName = client.companyName;
    }
    if (client.contactPerson !== undefined && client.contactPerson.trim()) {
      payload.contactPerson = client.contactPerson;
    }
    if (client.email !== undefined && client.email.trim()) {
      payload.email = client.email;
    }
    if (client.phoneNumber !== undefined && client.phoneNumber.trim()) {
      payload.phone = client.phoneNumber;
    }
     if (client.country !== undefined && client.country.trim()) {
      payload.country = client.country;
    }
    if (client.leadSource !== undefined && client.leadSource.trim()) {
      payload.leadSource = client.leadSource;
    }
    if (client.projectCategory !== undefined && isValidProjectCategory(client.projectCategory)) {
      payload.projectCategory = client.projectCategory.trim();
    }
    if (client.assignedTo !== undefined && client.assignedTo.trim()) {
      payload.assignedTo = client.assignedTo;
    }
    if (client.estimatedDealValue !== undefined && client.estimatedDealValue > 0) {
      payload.estimatedDealValue = client.estimatedDealValue;
    }
    if (client.currency !== undefined && client.currency.trim()) {
      payload.currency = client.currency;
    }
    if (client.leadStage !== undefined && client.leadStage.trim()) {
      payload.leadStage = client.leadStage;
    }
    if (client.dateAdded !== undefined && client.dateAdded.trim()) {
      payload.dateAdded = client.dateAdded;
    }
    if (client.lastFollowUpDate !== undefined && client.lastFollowUpDate.trim()) {
      payload.lastFollowUpDate = client.lastFollowUpDate;
    }
    if (client.nextFollowUpDate !== undefined && client.nextFollowUpDate.trim()) {
      payload.nextFollowUpDate = client.nextFollowUpDate;
    }

    try {
      console.debug('Updating client with payload', payload);
      const res = await updateClientAPI(payload);
      await fetchClients();
      return res;
    } catch (err: any) {
      console.error('Update client failed', err?.response || err);
      throw err;
    }
  }, [fetchClients]);

  /* ===================== DELETE CLIENT ===================== */
  const deleteClient = useCallback(async (id: string) => {
    await deleteClientAPI(id);
    await fetchClients();
  }, [fetchClients]);

  /* ===================== CLIENT DETAIL (cached) ===================== */
  const getClient = useCallback((id: string) => {
    return clients.find((c) => c.id === id);
  }, [clients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    getClient,
  };
}
