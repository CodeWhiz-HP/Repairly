'use client';
import React, { useState } from 'react';
import { Wrench, User, LogOut, ShoppingBag, BarChart3, Menu, X } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { useSession, signOut } from 'next-auth/react';

export const Navbar: React.FC = () => {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const displayName = session?.user?.role === 'Technician'
    ? (session.user.businessName || session.user.name || 'User')
    : (session?.user?.name || 'User');
  const dashboardHref = session?.user?.role === 'Technician' ? '/seller-dashboard' : '/my-repairs';
  const dashboardLabel = session?.user?.role === 'Technician' ? 'Dashboard' : 'My Repairs';
  const dashboardIcon = session?.user?.role === 'Technician' ? BarChart3 : ShoppingBag;

  return (
    <>
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

            {/* Mobile Menu Button to trigger sidebar drawer */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-softGray hover:text-white focus:outline-none focus:text-white"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop screen overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100]"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar drawer content container */}
          <div className="fixed z-[100] top-0 right-0 bottom-0 w-64 bg-gunmetal border-l border-slateSteel p-6 flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[101] animate-slide-in-right">
            <div className="flex justify-between items-center pb-4 border-b border-slateSteel/50">
              <span className="font-display font-bold text-lg text-white">Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-softGray hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/Browse/All" onClick={() => setIsOpen(false)}>
                <button
                  className={`w-full text-left text-base font-medium py-2 transition-colors ${pathName === '/Browse/All' ? 'text-electricAqua' : 'text-softGray hover:text-white'}`}
                >
                  Browse
                </button>
              </Link>

              {!session ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-slateSteel/30">
                  <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">
                      Login / Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pt-4 border-t border-slateSteel/30">
                  <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                    <button
                      className={`flex items-center gap-3 w-full text-left text-base font-medium py-2 transition-colors ${pathName === dashboardHref ? 'text-electricAqua' : 'text-softGray hover:text-white'}`}
                    >
                      {dashboardIcon === BarChart3 ? (
                        <BarChart3 className="w-5 h-5 text-electricAqua" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-electricAqua" />
                      )}
                      {dashboardLabel}
                    </button>
                  </Link>

                  <Link href="/my-profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 py-2 text-softGray hover:text-white group">
                    <div className="w-8 h-8 rounded-full bg-deepCarbon border border-slateSteel flex items-center justify-center group-hover:border-electricAqua transition-colors">
                      <User className="w-4 h-4 text-electricAqua" />
                    </div>
                    <span className="text-base font-medium text-white">
                      {displayName}
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-3 text-softGray hover:text-errorRed transition-colors text-base font-medium py-2 text-left"
                  >
                    <LogOut className="w-5 h-5 text-errorRed/80" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};