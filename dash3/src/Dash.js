// src/Dash.js - Refactored Main Component (4 files total)
import React, { useState, useEffect } from 'react';
import dataService from './services/DataService.js';
import Layout from './components/Layout';
import { Dashboard, Machines } from './components/Pages';

const Dash = ({ onLogout }) => {  // ← Just added this prop
  // State management
  const [page, setPage] = useState('dashboard');
  const [selectedMachine, setSelectedMachine] = useState('ByStar1');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [machines, setMachines] = useState([]);
  const [oeeData, setOeeData] = useState([]);
  const [currentOEE, setCurrentOEE] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);
  
  // Notification state
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'ByStar3 showing low OEE' },
    { id: 2, type: 'info', message: 'Maintenance scheduled for tomorrow' },
    { id: 3, type: 'success', message: 'ByStar1 achieved 90% efficiency' },
    { id: 4, type: 'error', message: 'Network connectivity issue resolved' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await dataService.loadAllData();
        
        // Load machines data
        const machinesData = dataService.getMachines();
        setMachines(machinesData);
        
        // Load OEE metrics for chart
        const oeeMetrics = dataService.getOEEMetrics();
        setOeeData(oeeMetrics);
        
        // Set default selected machine
        if (machinesData.length > 0) {
          const defaultMachine = machinesData[0].machine_id;
          setSelectedMachine(defaultMachine);
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please check console for details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load machine-specific data when selected machine changes
  useEffect(() => {
    if (selectedMachine && dataService.isLoaded) {
      try {
        const oeeData = dataService.getCurrentOEE(selectedMachine);
        setCurrentOEE(oeeData);
        
        const timeline = dataService.getMachineTimeline(selectedMachine);
        setTimelineData(timeline);
        
        const summary = dataService.getStatusSummary(selectedMachine);
        setStatusSummary(summary);
      } catch (err) {
        console.error('Error loading machine data:', err);
      }
    }
  }, [selectedMachine]);

  // Interactive handlers
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    if (notification.type === 'warning' && notification.message.includes('ByStar3')) {
      setSelectedMachine('ByStar3');
      setPage('dashboard');
    }
    setShowNotifications(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #FF6600B3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Loading dashboard data...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#ff4d4f' }}>
        {error}
      </div>
    );
  }

  return (
    <Layout
      page={page}
      onPageChange={setPage}
      machines={machines}
      selectedMachine={selectedMachine}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      notifications={notifications}
      showNotifications={showNotifications}
      onNotificationToggle={() => setShowNotifications(!showNotifications)}
      onNotificationClick={handleNotificationClick}
      onLogout={onLogout}  
    >
      {page === 'dashboard' && (
        <Dashboard 
          selectedMachine={selectedMachine}
          onMachineChange={setSelectedMachine}
          machines={machines}
          oeeData={oeeData}
          timeRange={timeRange}
          currentOEE={currentOEE}
          timelineData={timelineData}
          statusSummary={statusSummary}
        />
      )}

      {page === 'machines' && (
        <Machines 
          machines={machines}
          selectedMachine={selectedMachine}
          onMachineChange={setSelectedMachine}
          onPageChange={setPage}
        />
      )}
    </Layout>
  );
};

export default Dash;
