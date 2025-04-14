import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface TechnicianLayoutProps {
  children: ReactNode;
}

export const TechnicianLayout = ({ children }: TechnicianLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="tecnico" />
      <div className="flex-1 overflow-auto transition-all duration-300 ml-0 md:ml-64">
        <div className="container px-4 py-6 mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}; 