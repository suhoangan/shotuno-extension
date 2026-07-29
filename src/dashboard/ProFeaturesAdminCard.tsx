import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { API_BASE } from '../lib/api';
import { useAuthStore } from '../store/authStore';

type ProFeatureId = 'ocr' | 'smart_blur' | 'watermark' | 'send_to_ai' | 'send_to_saas';
type ProFeaturesMap = Record<ProFeatureId, boolean>;

type ProFeaturesResponse = {
  features: ProFeaturesMap;
  catalog: Array<{ id: ProFeatureId; label: string }>;
};

function unwrap<T>(body: { data?: T } | T): T {
  if (body && typeof body === 'object' && 'data' in body && (body as { data?: T }).data != null) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export function ProFeaturesAdminCard() {
  const { token } = useAuthStore();
  const [catalog, setCatalog] = useState<ProFeaturesResponse['catalog']>([]);
  const [features, setFeatures] = useState<ProFeaturesMap | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/pro-features`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load Pro features');
        return unwrap<ProFeaturesResponse>(await res.json());
      })
      .then((data) => {
        setCatalog(data.catalog);
        setFeatures(data.features);
      })
      .catch((err: Error) => toast.error(err.message));
  }, [token]);

  const toggle = useCallback(
    async (id: ProFeatureId, enabled: boolean) => {
      if (!token || !features) return;
      const prev = features;
      setFeatures({ ...features, [id]: enabled });
      setSavingId(id);
      try {
        const res = await fetch(`${API_BASE}/admin/pro-features`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [id]: enabled }),
        });
        if (!res.ok) throw new Error('Failed to save Pro feature');
        const data = unwrap<ProFeaturesResponse>(await res.json());
        setFeatures(data.features);
        toast.success(enabled ? 'Pro required' : 'Free for everyone');
      } catch (err) {
        setFeatures(prev);
        toast.error(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSavingId(null);
      }
    },
    [features, token],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pro features</CardTitle>
          <CardDescription>
            Toggle which tools require Pro or an active trial. Off = free for all users.
          </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!features ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        ) : (
          catalog.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 border-b border-border last:border-0 pb-3 last:pb-0"
            >
              <Label htmlFor={`pro-${item.id}`} className="text-sm text-foreground">
                {item.label}
              </Label>
              <Switch
                id={`pro-${item.id}`}
                checked={features[item.id]}
                disabled={savingId === item.id}
                onCheckedChange={(checked) => void toggle(item.id, checked)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
