import { useCallback, useEffect, useState } from 'react';
import { getUserListAPI, getAssignedToListAPI } from '@/services/auth_service';

export interface User {
  id: string;
  fName: string;
  lName: string;
  email: string;
  phone: string;
  profileImg: string;
  status: string;
  balances: any;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignedToUsers = useCallback(async () => {
    setLoading(true);
    try {
      // console.log('Fetching assigned to users...');
      const res = await getAssignedToListAPI(1, 100);
      // console.log('Assigned to users API response:', res);
      const usersData = res?.data || [];
      // console.log('Assigned to users data:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Fetch assigned to users failed', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // console.log('Fetching users...');
      const res = await getUserListAPI(1, 100);
      // console.log('Users API response:', res);
      const usersData = res?.data || [];
      // console.log('Users data:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Fetch users failed', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserDisplayName = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return 'Unknown User';
    return `${user.fName} ${user.lName}`.trim() || user.email;
  }, [users]);

  const getUserOptions = useCallback(() => {
    const activeUsers = users.filter(user => user.status === 'active');
    // console.log('Active users:', activeUsers);
    const options = activeUsers.map(user => ({
      value: user.id,
      label: `${user.fName} ${user.lName}`.trim() || user.email,
      email: user.email
    }));
    // console.log('User options:', options);
    return options;
  }, [users]);

  useEffect(() => {
    fetchUsers();
    fetchAssignedToUsers();
  }, [fetchUsers, fetchAssignedToUsers]);

  return {
    users,
    loading,
    fetchUsers,
    fetchAssignedToUsers,
    getUserDisplayName,
    getUserOptions,
  };
}
