import React from 'react';
import { webUrl } from '../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Login happens on the website; JWT is pushed to the extension via AUTH_LOGIN. */
export const AuthModal: React.FC = () => {
  const openWebLogin = () => {
    window.open(webUrl('/login'), '_blank');
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/40">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Log in</CardTitle>
            <CardDescription>
              Sign in on the Shotuno website. Your session syncs to this extension automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full" onClick={openWebLogin}>
              Open web login
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              No account?{' '}
              <Button
                variant="link"
                type="button"
                className="h-auto p-0 font-medium"
                onClick={() => window.open(webUrl('/register'), '_blank')}
              >
                Sign up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
