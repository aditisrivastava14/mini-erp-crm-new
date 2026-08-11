import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';
import { Spinner } from '../../components/ui/Spinner';

export const TeamPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/users');
        setUsers(data.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center pt-20">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="mt-1 text-muted-foreground">
          View all sales executives and administrators across your organization.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((teamMember) => (
                  <tr key={teamMember.id || teamMember._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{teamMember.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{teamMember.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teamMember.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {teamMember.role === 'SALES' ? 'SALES EXECUTIVE' : teamMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {teamMember.createdAt ? new Date(teamMember.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
