import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WEB_BASE } from '../lib/api';

/** Extension keeps a thin entry — full admin lives on the web (Refine + shadcn). */
export const AdminDashboard: React.FC = () => {
  const adminUrl = `${WEB_BASE.replace(/\/$/, '')}/admin`;

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-none">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Admin dashboard</CardTitle>
          <CardDescription>
            Manage users, complimentary Pro, trial dates, and Pro feature gates in the web admin
            (Refine + shadcn — same design system as Shotuno).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="gap-2"
            onClick={() => window.open(adminUrl, '_blank')}
          >
            Open web admin
            <ExternalLink className="size-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">{adminUrl}</p>
        </CardContent>
      </Card>
    </div>
  );
};
