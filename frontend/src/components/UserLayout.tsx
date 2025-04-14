import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface UserLayoutProps {
  children: ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="usuario" />
      <div className="flex-1 overflow-auto transition-all duration-300 ml-0 md:ml-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}; 