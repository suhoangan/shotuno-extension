import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BuyMeCoffeeLink } from '../components/BuyMeCoffeeLink';

/** Guest overview — no account required. */
export const Dashboard: React.FC = () => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Shotuno</h1>
        <p className="text-muted-foreground">
          Free forever. No account. Capture, annotate, and export locally on your machine.
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Support my work</CardTitle>
          <CardDescription>
            If you find Shotuno useful, you can tip via Buy me a coffee on the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BuyMeCoffeeLink />
        </CardContent>
      </Card>
    </>
  );
};
