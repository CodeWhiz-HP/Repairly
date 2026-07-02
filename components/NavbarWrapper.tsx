'use client';
import { useState } from 'react';
import { Navbar } from './Navbar';
import { UserRole } from '@/types/types';

export function NavbarWrapper() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  return (
    <Navbar
      currentView={currentView}
      userRole={userRole}
      onNavigate={(view) => setCurrentView(view)}
      onLogout={() => setUserRole(null)}
      onLogin={(role) => setUserRole(role)}
    />
  );
}