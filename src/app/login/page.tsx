'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const auth = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFirebaseError(null);
    try {
      await initiateEmailSignIn(auth, data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error.message);
      setFirebaseError(error.message || 'Failed to sign in.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
               {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {firebaseError && <p className="text-sm text-destructive">{firebaseError}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
             <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
