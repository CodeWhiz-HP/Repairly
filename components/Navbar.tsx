'use client';
import React from 'react';
import { Wrench, User, LogOut, ShoppingBag, BarChart3 } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { useSession, signOut } from 'next-auth/react';

export const Navbar: React.FC = () => {
  const pathName = usePathname();
  const { data: session } = useSession();
  const displayName = session?.user?.role === 'Technician'
    ? (session.user.businessName || session.user.name || 'User')
    : (session?.user?.name || 'User');
  const dashboardHref = session?.user?.role === 'Technician' ? '/seller-dashboard' : '/my-repairs';
  const dashboardLabel = session?.user?.role === 'Technician' ? 'Dashboard' : 'My Repairs';
  const dashboardIcon = session?.user?.role === 'Technician' ? BarChart3 : ShoppingBag;

  return (
    <nav className="sticky top-0 z-50 w-full bg-deepCarbon/90 backdrop-blur-md border-b border-slateSteel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div 
            className="flex items-center gap-2 cursor-pointer" 
          >
            <div className="w-8 h-8 bg-electricAqua rounded-sm flex items-center justify-center">
              <Wrench className="w-5 h-5 text-deepCarbon" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Repair<span className="text-electricAqua">Ly</span>
            </span>
          </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/Browse/All">
             <button 
              className={`text-sm hover:text-electricAqua hover:cursor-pointer transition-colors ${pathName === '/Browse' ? 'text-electricAqua' : 'text-softGray'}`}
            >
              Browse
            </button>
            </Link>
            
            {!session ? (
              <div className="flex gap-3">
                 <Button variant="outline" size="sm">
                   Vendor Access
                 </Button>
                 <Link href="/sign-in">
                  <Button size="sm">
                   Login / Sign Up
                 </Button>
                 </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href={dashboardHref}>
                  <button 
                    className={`flex items-center gap-2 text-sm hover:text-electricAqua transition-colors ${pathName === dashboardHref ? 'text-electricAqua' : 'text-softGray'}`}
                  >
                    {dashboardIcon === BarChart3 ? (
                      <BarChart3 className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                    {dashboardLabel}
                  </button>
                </Link>
                <div className="h-6 w-px bg-slateSteel mx-2" />
                <Link href="/my-profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-gunmetal border border-slateSteel flex items-center justify-center group-hover:border-electricAqua transition-colors">
                    <User className="w-4 h-4 text-electricAqua" />
                  </div>
                  <span className="text-sm font-medium text-white hidden lg:block group-hover:text-electricAqua transition-colors">
                    {displayName}
                  </span>
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-softGray hover:text-errorRed transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};