import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { CirculationDeskPage } from './pages/CirculationDeskPage';
import { BooksInventoryPage } from './pages/BooksInventoryPage';
import { PatronManagementPage } from './pages/PatronManagementPage';
import { LoansOverduePage } from './pages/LoansOverduePage';
import { FineSettlementsPage } from './pages/FineSettlementsPage';
import { ReservationsQueuePage } from './pages/ReservationsQueuePage';
import { DeskReportsPage } from './pages/DeskReportsPage';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('circulation');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>
        Verifying staff session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div>
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="container">
        {currentTab === 'circulation' && <CirculationDeskPage />}
        {currentTab === 'books' && <BooksInventoryPage />}
        {currentTab === 'users' && <PatronManagementPage />}
        {currentTab === 'loans' && <LoansOverduePage />}
        {currentTab === 'fines' && <FineSettlementsPage />}
        {currentTab === 'reservations' && <ReservationsQueuePage />}
        {currentTab === 'reports' && <DeskReportsPage />}
      </main>
    </div>
  );
};
