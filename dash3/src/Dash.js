// src/Dash.js - Updated with API Integration
import React, { useState, useEffect } from 'react';
import dataService from './services/DataService.js';
import Layout from './components/Layout';
import { Dashboard, Machines } from './components/Pages';

const Dash = ({ onLogout }) => {
  // State management
  const [page, setPage] = useState('dashboard');
  const [selectedMachine, setSelectedMachine] = useState(null);
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
    { id: 1, type: 'warning', message: 'Low OEE detected on a machine' },
    { id: 2, type: 'info', message: 'Maintenance scheduled for tomorrow' },
    { id: 3, type: 'success', message: 'High efficiency achieved' },
    { id: 4, type: 'error', message: 'Network connectivity issue resolved' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize DataService on mount
  useEffect(() => {
    const initializeDataService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize DataService with polling
        const initialized = await dataService.initialize(true, 5000);
        
        if (!initialized) {
          throw new Error('Failed to initialize data service');
        }
        
        console.log('DataService initialized successfully');
        
      } catch (err) {
        console.error('Error initializing DataService:', err);
        setError('Failed to connect to server. Please ensure the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDataService();
    
    // Cleanup on unmount
    return () => {
      dataService.stopPolling();
    };
  }, []);

  // Load initial data after initialization
  useEffect(() => {
    if (!isLoading && !error) {
      loadAllData();
    }
  }, [isLoading, error]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.type === 'update') {
        console.log('Data updated at:', event.timestamp);
        loadAllData();
      } else if (event.type === 'error') {
        console.error('DataService error:', event.error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load all dashboard data
  const loadAllData = async () => {
    try {
      // Load machines list
      const machinesData = dataService.getMachines();
      
      if (machinesData && machinesData.length > 0) {
        setMachines(machinesData);
        
        // Set default selected machine if not set
        if (!selectedMachine) {
          setSelectedMachine(machinesData[0].machine_id);
        }
      }
      
      // Load OEE metrics for overall dashboard
      const oeeMetrics = await dataService.getOEEMetrics();
      setOeeData(oeeMetrics || []);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Load machine-specific data when selected machine or time range changes
  useEffect(() => {
    if (selectedMachine) {
      loadMachineData();
    }
  }, [selectedMachine, timeRange]);

  const loadMachineData = async () => {
    if (!selectedMachine) return;
    
    try {
      // Load machine-specific data in parallel
      const [oee, timeline, summary] = await Promise.all([
        dataService.getCurrentOEE(selectedMachine),
        dataService.getMachineTimeline(selectedMachine, timeRange),
        dataService.getStatusSummary(selectedMachine, timeRange)
      ]);
      
      setCurrentOEE(oee || {
        current_oee: 0,
        previous_oee: 0,
        availability: 0,
        performance: 0,
        quality: 0
      });
      
      setTimelineData(timeline || {
        overview: [],
        Work: [],
        Error: [],
        Wait: [],
        Idle: [],
        Stop: [],
        Offline: []
      });
      
      setStatusSummary(summary || {});
      
    } catch (err) {
      console.error('Error loading machine data:', err);
    }
  };

  // Interactive handlers
  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    setShowNotifications(false);
    
    // Handle notification actions
    if (notification.type === 'warning' && machines.length > 0) {
      setSelectedMachine(machines[0].machine_id);
      setPage('dashboard');
    }
  };

  const handleMachineChange = (machineId) => {
    setSelectedMachine(machineId);
    setPage('dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #FF6600B3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div>Connecting to server...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#ff4d4f', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div>{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            background: '#FF6600', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // No machines state
  if (machines.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>🏭</div>
        <div>No machines found</div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Make sure the data generator is running and adding data to the database
        </div>
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
          onMachineChange={handleMachineChange}
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
          onMachineChange={handleMachineChange}
          onPageChange={setPage}
        />
      )}
    </Layout>
  );
};

export default Dash;