import React from 'react';
import { useAuthStore } from '../store/authStore';
import { webUrl } from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PremiumGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, checkTrialOrSubscription } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              Log in on the Shotuno website — your session syncs to the extension.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                window.open(webUrl('/login'), '_blank');
              }}
            >
              Open web login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!checkTrialOrSubscription()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Pro required</CardTitle>
            <CardDescription className="text-base mt-2">
              Your free trial has ended. Upgrade for Drive/S3 and premium tools.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full font-bold h-12 text-lg"
              onClick={() => {
                window.open(webUrl('/#pricing'), '_blank');
              }}
            >
              Upgrade Now - $5/mo
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
