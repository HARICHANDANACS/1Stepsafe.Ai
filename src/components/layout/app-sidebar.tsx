'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Home,
  LineChart,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Users2,
  Shield,
  HeartPulse
} from 'lucide-react';
import { StepSafeLogo } from '../icons';
import { UserNav } from './user-nav';

const sidebarNavLinks = [
    { href: '/dashboard', icon: Home, label: 'Today Overview' },
    { href: '/dashboard/guidance', icon: Shield, label: 'Daily Guidance' },
    { href: '/dashboard/history', icon: LineChart, label: 'Exposure History' },
    { href: '/dashboard/profile', icon: Settings, label: 'Profile' },
];


export function AppSidebar() {
    const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <HeartPulse className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">StepSafe AI</span>
        </Link>
        {sidebarNavLinks.map(({ href, icon: Icon, label }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                    pathname === href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
      </nav>
      </TooltipProvider>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <UserNav />
      </nav>
    </aside>
  );
}
