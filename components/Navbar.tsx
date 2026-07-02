'use client';
import React, {useState} from 'react';
import { Wrench, User, LogOut, ShoppingBag, BarChart3 } from 'lucide-react';
import { UserRole } from '@/types/types';
import { Button } from './Button';
import Link from 'next/link';
import { usePathname } from "next/navigation";

interface NavbarProps {
  currentView: string;
  userRole: UserRole | null;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onLogin: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {

  const pathName = usePathname();
  const [userRole,setUserRole] = useState('');

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
            
            {!userRole ? (
              <div className="flex gap-3">
                 <Button variant="outline" size="sm" onClick={()=> setUserRole('seller')}>
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
                {userRole === 'buyer' && (
                  <button 
                    className={`flex items-center gap-2 text-sm hover:text-electricAqua transition-colors ${pathName === '/buyer-dashboard' ? 'text-electricAqua' : 'text-softGray'}`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    My Orders
                  </button>
                )}
                {userRole === 'seller' && (
                  <button 
                    className={`flex items-center gap-2 text-sm hover:text-electricAqua transition-colors ${pathName === '/seller-dashboard' ? 'text-electricAqua' : 'text-softGray'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </button>
                )}
                <div className="h-6 w-px bg-slateSteel mx-2" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gunmetal border border-slateSteel flex items-center justify-center">
                    <User className="w-4 h-4 text-electricAqua" />
                  </div>
                  <span className="text-sm font-medium text-white hidden lg:block">
                    {userRole === 'buyer' ? 'Alex Buyer' : 'CyberFix Labs'}
                  </span>
                </div>
                <button 
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