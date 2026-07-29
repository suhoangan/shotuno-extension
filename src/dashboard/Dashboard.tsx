import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { API_BASE, googleAuthUrl } from '../lib/api';
import { PremiumGuard } from './PremiumGuard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

export const Dashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const [supportOpen, setSupportOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const driveConnected = Boolean(user?.hasGoogleDrive || user?.googleDriveRefreshToken);

  const handleConnectDrive = () => {
    window.location.href = googleAuthUrl();
  };

  const handleSupportSubmit = async () => {
    const issue = issueText.trim();
    if (!issue) {
      toast.error('Please describe your issue first.');
      return;
    }
    setSubmitting(true);
    try {
      const subject = encodeURIComponent('Shotuno support request');
      const body = encodeURIComponent(
        `From: ${user?.email || 'unknown'}\n\n${issue}`,
      );
      window.open(`mailto:support@shotuno.app?subject=${subject}&body=${body}`, '_blank');
      toast.success('Opening your email client to send the report.');
      setSupportOpen(false);
      setIssueText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveToCloud = async (provider: 's3' | 'drive') => {
    const blob = new Blob(['dummy content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test.txt');

    try {
      const res = await fetch(`${API_BASE}/${provider}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Saved to ${provider.toUpperCase()}`, {
          description: data.url ? String(data.url) : undefined,
        });
      } else {
        toast.error('Failed to upload. Make sure you are authenticated.');
      }
    } catch {
      toast.error('Network error during upload');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome back, here is what&apos;s happening with your account.</p>
      </div>

      <PremiumGuard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden group border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 text-xl">📁</div>
                Google Drive
              </CardTitle>
              <CardDescription className="pt-2">
                Connect your Google Drive to enable drag-and-drop support and automatic backups directly from your canvas.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              {!driveConnected ? (
                <Button onClick={handleConnectDrive} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground">
                  Connect Account
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleSaveToCloud('drive')} className="w-full text-primary border-primary/30 hover:bg-primary/10">
                  Save Image to Drive
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card className="relative overflow-hidden group border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 text-xl">☁️</div>
                AWS S3 Storage
              </CardTitle>
              <CardDescription className="pt-2">
                Securely back up your canvas images directly to our enterprise-grade S3 cloud storage buckets.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => handleSaveToCloud('s3')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-primary-foreground">
                Upload to S3
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 text-xl">🎧</div>
                Support & Feedback
              </CardTitle>
              <CardDescription className="pt-2">
                Found a bug or need help? Submit an issue directly to our engineering team and we&apos;ll investigate it immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={() => setSupportOpen(true)}>
                Submit an Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </PremiumGuard>

      <AlertDialog open={supportOpen} onOpenChange={setSupportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit an issue</AlertDialogTitle>
            <AlertDialogDescription>
              Describe the problem. We&apos;ll open your email client so the report is actually sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="support-issue">Issue</Label>
            <Textarea
              id="support-issue"
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="What went wrong?"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={submitting} onClick={handleSupportSubmit}>
              {submitting ? 'Opening…' : 'Send via email'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
