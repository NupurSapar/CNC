// src/Dash.js
import React, { useState, useEffect } from 'react';
import logoImage from './elliot.png';
import cncImage from './cnc.png';
import dataService from './services/DataService.js';

import { 
  Factory, BarChart2, Scissors, Repeat, Wrench, Settings, LogOut, Bell, Search, Download, Sparkles 
} from 'lucide-react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const timelineHours = 24;

// Styles (same as before)
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f5f5f5'
  },
  sidebar: {
    width: '240px',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
  },
  logo: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f0f0f0'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'black',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '20px',
    borderRadius: '5px'
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '600'
  },
  navMenu: {
    flex: 1,
    padding: '20px 0'
  },
  navItem: (active) => ({
    padding: '12px 20px',
    margin: '4px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s',
    color: active ? 'white' : '#333',
    background: active ? '#FF6600B3' : 'transparent'
  }),
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
  },
  topBar: {
    background: 'white',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  notificationIcon: {
    position: 'relative',
    cursor: 'pointer',
    fontSize: '20px'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ff4d4f',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#1890ff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600'
  },
  contentArea: {
    padding: '24px'
  },
  actionBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  btn: (variant) => ({
    padding: '10px 20px',
    border: variant === 'outline' ? '1px solid #d9d9d9' : 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    background: variant === 'primary' ? '#FF6600B3' : 'white',
    color: variant === 'primary' ? 'white' : '#333'
  }),
  gaugeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    marginBottom: '24px'
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px'
  },
  machineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 0.25fr)',
    gap:'24px'
  },
  machineCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  machineImage: {
    height: '200px',
    background: '#f5f5f5',
    borderRadius: '18px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#666'
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#ff4d4f'
  }
};

// Gauge Chart Component (same as before but now uses CSV data)
const GaugeChart = ({ current, previous, title, color }) => {
  const data = [
    { value: current, fill: color },
    { value: 100 - current, fill: '#e0e0e0' }
  ];
  
  const previousData = [
    { value: previous, fill: '#7192FF' },
    { value: 100 - previous, fill: '#EEEEEE' }
  ];

  const renderTicks = () => {
    const tickPositions = [
      { value: 0,   x: 18,  y: 180 },
      { value: 20,  x: 22,  y: 100 },
      { value: 40,  x: 80, y: 40 },
      { value: 60,  x: 190, y: 40 },
      { value: 80,  x: 245, y: 100 },
      { value: 100, x: 252, y: 180 }
    ];

    return tickPositions.map(tick => (
      <text
        key={tick.value}
        x={tick.x}
        y={tick.y}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize="8"
        fill="#666"
      >
        {tick.value}
      </text>
    ));
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={{ position: 'relative', width: '100%', height: '250px' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={previousData}
              cx="50%"
              cy="60%"
              startAngle={225}
              endAngle={-45}
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
            />
            <Pie
              data={data}
              cx="50%"
              cy="60%"
              startAngle={225}
              endAngle={-45}
              innerRadius={95}
              outerRadius={115}
              dataKey="value"
            />
            {renderTicks()}
          </PieChart>
        </ResponsiveContainer>

        <div style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -20%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{current}%</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Current</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#666', marginTop: '8px' }}>{previous}%</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Previous</div>
        </div>
      </div>
    </div>
  );
};

// Machine Gantt Chart Component (now uses CSV data)
const MachineGanttChart = ({ selectedMachine, onMachineChange, timelineData, statusSummary, machines }) => {
  const statusColors = {
    Work: '#77c845ff',
    Error: '#C08CE0',
    Wait: '#7192FF',
    Idle: '#ffca44ff',
    Stop: '#9e9e9e',
    Offline: '#F47474'
  };

  if (!timelineData || !statusSummary || !machines) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingContainer}>Loading timeline data...</div>
      </div>
    );
  }

  const activeMachines = machines.filter(m => m.status === 'Active');
  const allMachines = machines.map(m => m.machine_id);

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={styles.cardTitle}>Machine Status for Current Data</div>
        <button style={styles.btn('outline')}>
          <Search size={16} /> Filter
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ minWidth: '120px' }}>
          <div style={{ fontWeight: '600', marginTop: '-1px', marginBottom: '8px', fontSize: '14px' }}>Device</div>
          {allMachines.map(machineId => {
            const machine = machines.find(m => m.machine_id === machineId);
            return (
              <div
                key={machineId}
                onClick={() => onMachineChange(machineId)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: machineId === selectedMachine ? '#FF6600B3' : '#f5f5f5',
                  color: machineId === selectedMachine ? 'white' : '#333',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{machineId}</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: machineId === selectedMachine ? 'white' : 
                         (machine?.status === 'Active' ? '#4caf50' : '#ff4d4f')
                }}>
                  Status: {machine?.status || 'Unknown'}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ fontWeight: '600', marginTop: '-10px', marginBottom: '8px', fontSize: '14px' }}>Gantt</div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '80px', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', color: '#777777ff', marginTop: '8px', marginBottom: '14px' }}>Overview</div>
              {Object.keys(statusColors).map(status => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', height: '30px', marginBottom: '10px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: statusColors[status],
                    marginRight: '8px'
                  }} />
                  <div style={{ fontSize: '12px' }}>{status}</div>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, overflowX: 'auto'}}>
              <div style={{ width: '1560px' }}>
                {/* Overview row */}
                <div style={{ position: 'relative', height: '30px', marginBottom: '8px', border: '1px solid #e0e0e0' }}>
                  {timelineData.overview?.map((block, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${(block.start / timelineHours) * 90}%`,
                        width: `${(block.duration / timelineHours) * 90}%`,
                        height: '100%',
                        background: statusColors[block.status],
                        borderRight: '1px solid white'
                      }}
                    />
                  ))}
                </div>

                {/* Status rows */}
                {Object.keys(statusColors).map(status => (
                  <div key={status} style={{ position: 'relative', height: '30px', marginBottom: '8px', border: '1px solid #e0e0e0' }}>
                    {timelineData[status]?.map((block, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${(block.start / timelineHours) * 90}%`,
                          width: `${(block.duration / timelineHours) * 90}%`,
                          height: '100%',
                          background: statusColors[status],
                          borderRight: '1px solid white'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Time axis */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '8px', 
                marginBottom: '8px', 
                paddingRight: '96px',
                width: '180%',
                minWidth: '1200px',
              }}>
                {[0, 4, 8, 12, 16, 20, 24].map(time => (
                  <div key={time} style={{ fontSize: '11px', color: '#999'}}>{time}:00</div>
                ))}
              </div>
            </div>

            {/* Right durations */}
            <div style={{ width: '80px', textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
              <div style={{ marginTop: '8px', marginBottom:'24px', fontSize: '12px' }}>
                {statusSummary.Overall || '24h 0m'}
              </div>
              {Object.keys(statusColors).map(status => (
                <div key={status} style={{ height: '30px', marginBottom: '10px', fontSize: '12px' }}>
                  {statusSummary[status] || '0h 0m'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const Dash = () => {
  const [page, setPage] = useState('dashboard');
  const [selectedMachine, setSelectedMachine] = useState('ByStar1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data state
  const [machines, setMachines] = useState([]);
  const [oeeData, setOeeData] = useState([]);
  const [currentOEE, setCurrentOEE] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);

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

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <img 
            src={logoImage} 
            alt="Elliot Systems Logo" 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '0%', 
              objectFit: 'cover', 
              marginRight: '8px' 
            }} 
          />
          <div style={styles.logoText}>Elliot Systems</div>
        </div>

        <div style={styles.navMenu}>
          <div 
            style={styles.navItem(page === 'machines')} 
            onClick={() => setPage('machines')}
          >
            <Factory size={20} />
            <span>Machines</span>
          </div>

          <div 
            style={styles.navItem(page === 'dashboard')} 
            onClick={() => setPage('dashboard')}
          >
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </div>

          {page === 'dashboard' && (
            <div style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '4px 8px', 
                borderRadius: '4px',
                cursor: 'pointer',
                background: 'transparent', 
                color: '#FF6600B3',           
                transition: 'background 0.2s'
              }}>
                <Scissors size={16} />
                <span>Cut</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '4px 8px', 
                borderRadius: '4px',
                cursor: 'pointer',
                background: 'transparent',
                transition: 'background 0.2s'
              }}>
                <Repeat size={16} />
                <span>Blend</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '4px 8px', 
                borderRadius: '4px',
                cursor: 'pointer',
                background: 'transparent',
                transition: 'background 0.2s'
              }}>
                <Wrench size={16} />
                <span>Tubes</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.navMenu}>
          <div style={styles.navItem(false)}>
            <Settings size={20} />
            <span>Settings</span>
          </div>
          <div style={styles.navItem(false)}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div style={styles.pageTitle}>
            {page === 'dashboard' ? 'Dashboard' : 'Machines'}
          </div>
          <div style={styles.topBarRight}>
            <div style={styles.notificationIcon}>
              <Bell size={20} />
              <div style={styles.notificationBadge}>4</div>
            </div>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>N</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Nupur</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard View */}
        {page === 'dashboard' && (
          <div style={styles.contentArea}>
            <div style={styles.actionBar}>
              <button style={styles.btn('outline')}>
                <Search size={16} /> Filter
              </button>
              <button style={styles.btn('primary')}>
                <Sparkles size={16} /> Generate AI Report
              </button>
              <button style={styles.btn('primary')}>
                <Download size={16} /> Download Report
              </button>
            </div>

            {/* Gauge Charts */}
            {currentOEE && (
              <div style={styles.gaugeGrid}>
                <GaugeChart 
                  current={currentOEE.current_oee} 
                  previous={currentOEE.previous_oee} 
                  title="OEE" 
                  color="#FF6600B3" 
                />
                <GaugeChart 
                  current={currentOEE.availability} 
                  previous={currentOEE.previous_oee} 
                  title="Availability" 
                  color="#FFEC60" 
                />
                <GaugeChart 
                  current={currentOEE.performance} 
                  previous={currentOEE.previous_oee} 
                  title="Performance" 
                  color="#40E377" 
                />
                <GaugeChart 
                  current={currentOEE.quality} 
                  previous={currentOEE.previous_oee} 
                  title="Quality" 
                  color="#F47474" 
                />
              </div>
            )}

            {/* Gantt Chart */}
            <MachineGanttChart 
              selectedMachine={selectedMachine} 
              onMachineChange={setSelectedMachine}
              timelineData={timelineData}
              statusSummary={statusSummary}
              machines={machines}
            />

            {/* OEE Metrics Over Time */}
            <div style={{ ...styles.card, marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={styles.cardTitle}>OEE Metrics Over Time</div>
                <button style={styles.btn('outline')}>
                  <Search size={16} /> Filter
                </button>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={oeeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="OEEE" stroke="#FF6600B3" strokeWidth={3} />
                  <Line type="monotone" dataKey="Availability" stroke="#ffca44ff" strokeWidth={3} />
                  <Line type="monotone" dataKey="Performance" stroke="#77c845ff" strokeWidth={3} />
                  <Line type="monotone" dataKey="Quality" stroke="#F47474" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Machines View */}
        {page === 'machines' && (
          <div style={styles.contentArea}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px', fontWeight: '600' }}>Select Device</div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <select style={{ padding: '8px 20px', borderRadius: '4px', border: '1px solid #d9d9d9' }}>
                  <option>CNC</option>
                  <option>Laser</option>
                  <option>Press</option>
                </select>
                <span>○ Active {machines.filter(m => m.status === 'Active').length}</span>
                <span>○ Inactive {machines.filter(m => m.status === 'Inactive').length}</span>
                <span style={{ color: '#FF6600B3' }}>● All {machines.length}</span>
              </div>
            </div>

            <div style={styles.machineGrid}>
              {machines.map((machine) => {
                const realtimeData = dataService.getRealtimeData(machine.machine_id);
                return (
                  <div
                    key={machine.machine_id}
                    style={{
                      ...styles.machineCard,
                      width: '360px',          
                      padding: '12px',        
                      fontSize: '12px',       
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ 
                        color: machine.status === 'Active' ? '#4caf50' : '#ff4d4f' 
                      }}>
                        ● {machine.status}
                      </span>
                    </div>
                    <div style={styles.machineImage}>
                      <img src={cncImage} alt="CNC Laser Machine" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                      {machine.machine_name}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>Override</span>
                        <span>{machine.override}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>TechnologyIndex</span>
                        <span>{machine.technology_index}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>Thickness</span>
                        <span>{machine.thickness}mm</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Current</span>
                        <span>{machine.current}A</span>
                      </div>
                    </div>
                    <button 
                      style={{ ...styles.btn('primary'), width: '100%', justifyContent: 'center' }}
                      onClick={() => {
                        setSelectedMachine(machine.machine_id);
                        setPage('dashboard');
                      }}
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dash;