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
import { useAuth, initiateEmailSignUp } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const auth = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setFirebaseError(null);
    try {
      await initiateEmailSignUp(auth, data.email, data.password);
      router.push('/dashboard/profile'); // Redirect to profile page to fill details
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setFirebaseError('This email address is already in use. Please log in or use a different email.');
      } else {
        setFirebaseError(error.message || 'Failed to create an account.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Create an account to get personalized climate-health guidance.
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
            {firebaseError && (
              <div className="text-sm text-destructive">
                {firebaseError.includes("already in use") ? (
                  <p>
                    This email is already in use. Please{' '}
                    <Link href="/login" className="underline font-bold">
                      Login
                    </Link>{' '}
                    instead.
                  </p>
                ) : (
                  <p>{firebaseError}</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
