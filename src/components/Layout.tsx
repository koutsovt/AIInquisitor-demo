import React from 'react';
import Navbar from './Navbar';
import Notifications from './Notifications';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-28 pb-12 px-4">
        {children}
      </main>
      <Notifications />
    </div>
  );
};

export default Layout;