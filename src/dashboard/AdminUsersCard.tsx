import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_BASE } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  trialEndsAt: string | null;
  proToolUseCount: number;
  planTier: string;
  isPro: boolean;
  isTrialActive: boolean;
  canUsePro: boolean;
  complimentaryPro: boolean;
  canRevokeComplimentary: boolean;
};

function unwrap<T>(body: { data?: T } | T): T {
  if (body && typeof body === 'object' && 'data' in body && (body as { data?: T }).data != null) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

type Props = { initialUsers?: AdminUserRow[] };

export function AdminUsersCard({ initialUsers = [] }: Props) {
  const { token } = useAuthStore();
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [trialDraft, setTrialDraft] = useState<Record<string, string>>({});

  const load = useCallback(async (query: string) => {
    if (!token) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    params.set('take', '50');
    const res = await fetch(`${API_BASE}/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load users');
    setUsers(unwrap<AdminUserRow[]>(await res.json()));
  }, [token]);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const patchUser = useCallback((next: AdminUserRow) => {
    setUsers((prev) => prev.map((u) => (u.id === next.id ? next : u)));
  }, []);

  const toggleCompPro = async (user: AdminUserRow, enabled: boolean) => {
    if (!token) return;
    setBusyId(user.id);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/complimentary-pro`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || body?.data?.message || 'Update failed');
      patchUser(unwrap<AdminUserRow>(body));
      toast.success(enabled ? 'Complimentary Pro granted' : 'Complimentary Pro revoked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const saveTrial = async (user: AdminUserRow) => {
    if (!token) return;
    const raw = trialDraft[user.id] ?? toDateInput(user.trialEndsAt);
    const trialEndsAt = raw.trim() ? new Date(`${raw}T23:59:59.999`).toISOString() : null;
    setBusyId(user.id);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/trial`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trialEndsAt }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || body?.data?.message || 'Update failed');
      const next = unwrap<AdminUserRow>(body);
      patchUser(next);
      setTrialDraft((d) => ({ ...d, [user.id]: toDateInput(next.trialEndsAt) }));
      toast.success(trialEndsAt ? 'Trial end date saved' : 'Trial cleared');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="gap-3">
        <div>
          <CardTitle>Users & Pro access</CardTitle>
          <CardDescription>
            Grant unlimited complimentary Pro, or set a trial end date. Tool uses are counted only.
          </CardDescription>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load(q).catch((err: Error) => toast.error(err.message));
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or name"
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Trial ends</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead className="text-right">Pro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const busy = busyId === user.id;
              const trialValue = trialDraft[user.id] ?? toDateInput(user.trialEndsAt);
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="text-foreground">{user.email}</div>
                    <div className="text-[10px] text-muted-foreground">{user.role}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{user.planTier}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {user.complimentaryPro
                        ? 'Complimentary Pro'
                        : user.isPro
                          ? 'Pro'
                          : user.isTrialActive
                            ? 'Trial active'
                            : 'No access'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="date"
                        className="h-8 w-[9.5rem]"
                        value={trialValue}
                        disabled={busy || user.role === 'ADMIN'}
                        onChange={(e) =>
                          setTrialDraft((d) => ({ ...d, [user.id]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        disabled={busy || user.role === 'ADMIN'}
                        onClick={() => void saveTrial(user)}
                      >
                        Save
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.proToolUseCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === 'ADMIN' ? (
                      <span className="text-xs text-muted-foreground">Always Pro</span>
                    ) : user.canRevokeComplimentary ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void toggleCompPro(user, false)}
                      >
                        Revoke Pro
                      </Button>
                    ) : user.isPro ? (
                      <span className="text-xs text-muted-foreground">Paid Pro</span>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void toggleCompPro(user, true)}
                      >
                        Grant Pro
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
