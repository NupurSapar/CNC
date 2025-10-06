// src/Dash.js
import React, { useState, useEffect } from 'react';
import logoImage from './elliot.png';
import cncImage from './cnc.png';
import dataService from './services/DataService.js';

import { 
  Factory, BarChart2, Scissors, Repeat, Wrench, Settings, LogOut, Bell, Search, Download, Sparkles,
  Filter, Calendar, AlertCircle, TrendingUp, Activity, Zap, Target, Award
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
    background: active ? '#FF6600B3' : 'transparent',
    ':hover': {
      background: active ? '#FF6600B3' : '#f0f0f0'
    }
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
    fontSize: '20px',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.3s',
    ':hover': {
      background: '#f0f0f0'
    }
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#ff4d4f',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    animation: 'pulse 2s infinite'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'background 0.3s',
    ':hover': {
      background: '#f0f0f0'
    }
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
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  btn: (variant, isActive) => ({
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
    background: variant === 'primary' ? '#FF6600B3' : (isActive ? '#e6f7ff' : 'white'),
    color: variant === 'primary' ? 'white' : (isActive ? '#1890ff' : '#333'),
    borderColor: isActive ? '#1890ff' : '#d9d9d9',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  }),
  gaugeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  card: (isHoverable) => ({
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: isHoverable ? 'all 0.3s' : 'none',
    cursor: isHoverable ? 'pointer' : 'default',
    ':hover': isHoverable ? {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    } : {}
  }),
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  machineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap:'24px'
  },
  machineCard: (isActive) => ({
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: isActive ? '0 8px 25px rgba(255,102,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
    cursor: 'pointer',
    border: isActive ? '2px solid #FF6600B3' : '2px solid transparent',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }
  }),
  machineImage: {
    height: '200px',
    background: '#f5f5f5',
    borderRadius: '18px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    overflow: 'hidden',
    transition: 'all 0.3s'
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
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '8px',
    zIndex: 1000
  },
  tooltip: {
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    position: 'absolute',
    zIndex: 1000
  }
};

// Enhanced Gauge Chart Component with interactivity
const GaugeChart = ({ current, previous, title, color, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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

  const getIcon = () => {
    switch(title) {
      case 'OEE': return <Target size={16} />;
      case 'Availability': return <Activity size={16} />;
      case 'Performance': return <TrendingUp size={16} />;
      case 'Quality': return <Award size={16} />;
      default: return <Zap size={16} />;
    }
  };

  return (
    <div 
      style={{
        ...styles.card(true),
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'none',
        boxShadow: isSelected ? '0 8px 25px rgba(255,102,0,0.2)' : (isHovered ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'),
        border: isSelected ? '2px solid #FF6600B3' : '2px solid transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(title.toLowerCase())}
    >
      <div style={{...styles.cardTitle, color: isSelected ? '#FF6600B3' : '#333'}}>
        {getIcon()}
        {title}
      </div>
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
        
        {/* Trend indicator */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '4px 8px',
          borderRadius: '12px',
          background: current > previous ? '#f6ffed' : '#fff2f0',
          color: current > previous ? '#52c41a' : '#ff4d4f',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {current > previous ? '↗' : '↘'} {Math.abs(current - previous).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

// Enhanced Machine Gantt Chart Component with interactivity
const MachineGanttChart = ({ selectedMachine, onMachineChange, timelineData, statusSummary, machines }) => {
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
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
      <div style={styles.card()}>
        <div style={styles.loadingContainer}>Loading timeline data...</div>
      </div>
    );
  }

  const allMachines = machines.map(m => m.machine_id);

  const handleBlockHover = (block, status) => {
    setHoveredBlock({ ...block, status });
  };

  const filteredTimeline = statusFilter === 'all' ? timelineData : {
    ...timelineData,
    overview: timelineData.overview.filter(block => block.status === statusFilter)
  };

  return (
    <div style={styles.card()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={styles.cardTitle}>
          <Activity size={20} />
          Machine Status for Current Data
        </div>
        <div style={{ position: 'relative' }}>
          <button 
            style={styles.btn('outline', filterOpen)}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={16} /> Filter
          </button>
          {filterOpen && (
            <div style={styles.filterDropdown}>
              <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '12px' }}>Filter by Status:</div>
              {['all', ...Object.keys(statusColors)].map(status => (
                <div 
                  key={status}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    background: statusFilter === status ? '#e6f7ff' : 'transparent',
                    color: statusFilter === status ? '#1890ff' : '#333',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    setStatusFilter(status);
                    setFilterOpen(false);
                  }}
                >
                  {status !== 'all' && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusColors[status]
                    }} />
                  )}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ minWidth: '120px' }}>
          <div style={{ fontWeight: '600', marginTop: '-1px', marginBottom: '8px', fontSize: '14px' }}>Device</div>
          {allMachines.map(machineId => {
            const machine = machines.find(m => m.machine_id === machineId);
            const isSelected = machineId === selectedMachine;
            return (
              <div
                key={machineId}
                onClick={() => onMachineChange(machineId)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: isSelected ? '#FF6600B3' : '#f5f5f5',
                  color: isSelected ? 'white' : '#333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  ':hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.background = '#e6f7ff';
                    e.target.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.background = '#f5f5f5';
                    e.target.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: machine?.status === 'Active' ? '#52c41a' : '#ff4d4f'
                  }} />
                  {machineId}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: isSelected ? 'rgba(255,255,255,0.8)' : 
                         (machine?.status === 'Active' ? '#52c41a' : '#ff4d4f')
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
                <div key={status} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: '30px', 
                  marginBottom: '10px',
                  opacity: statusFilter === 'all' || statusFilter === status ? 1 : 0.3,
                  transition: 'opacity 0.3s'
                }}>
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
              <div style={{ width: '1560px', position: 'relative' }}>
                {/* Overview row */}
                <div style={{ position: 'relative', height: '30px', marginBottom: '8px', border: '1px solid #e0e0e0' }}>
                  {filteredTimeline.overview?.map((block, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${(block.start / timelineHours) * 90}%`,
                        width: `${(block.duration / timelineHours) * 90}%`,
                        height: '100%',
                        background: statusColors[block.status],
                        borderRight: '1px solid white',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={() => handleBlockHover(block, block.status)}
                      onMouseLeave={() => setHoveredBlock(null)}
                      onClick={() => console.log(`Block clicked: ${block.status} from ${block.start}h for ${block.duration}h`)}
                    />
                  ))}
                </div>

                {/* Status rows */}
                {Object.keys(statusColors).map(status => (
                  <div key={status} style={{ 
                    position: 'relative', 
                    height: '30px', 
                    marginBottom: '8px', 
                    border: '1px solid #e0e0e0',
                    opacity: statusFilter === 'all' || statusFilter === status ? 1 : 0.3,
                    transition: 'opacity 0.3s'
                  }}>
                    {timelineData[status]?.map((block, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${(block.start / timelineHours) * 90}%`,
                          width: `${(block.duration / timelineHours) * 90}%`,
                          height: '100%',
                          background: statusColors[status],
                          borderRight: '1px solid white',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          ':hover': {
                            opacity: 0.8,
                            transform: 'scaleY(1.1)'
                          }
                        }}
                        onMouseEnter={() => handleBlockHover(block, status)}
                        onMouseLeave={() => setHoveredBlock(null)}
                        onClick={() => console.log(`Block clicked: ${status} from ${block.start}h for ${block.duration}h`)}
                      />
                    ))}
                  </div>
                ))}
                
                {/* Hover tooltip */}
                {hoveredBlock && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }}>
                    {hoveredBlock.status}: {hoveredBlock.duration.toFixed(1)}h (Start: {hoveredBlock.start.toFixed(1)}h)
                  </div>
                )}
              </div>
              
              {/* Interactive Time axis */}
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
                  <div 
                    key={time} 
                    style={{ 
                      fontSize: '11px', 
                      color: '#999',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f0f0f0';
                      e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#999';
                    }}
                    onClick={() => console.log(`Time clicked: ${time}:00`)}
                  >
                    {time}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Right durations */}
            <div style={{ width: '80px', textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
              <div style={{ 
                marginTop: '8px',
                marginBottom:'24px', 
                fontSize: '12px',
                fontWeight: '600',
                color: '#333'
              }}>
                {statusSummary.Overall || '24h 0m'}
              </div>
              {Object.keys(statusColors).map(status => (
                <div 
                  key={status} 
                  style={{ 
                    height: '30px', 
                    marginBottom: '10px', 
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.3s',
                    opacity: statusFilter === 'all' || statusFilter === status ? 1 : 0.3,
                    background: statusFilter === status ? '#e6f7ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = statusFilter === status ? '#e6f7ff' : 'transparent';
                  }}
                  onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                >
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

// Main App Component with full interactivity
const Dash = () => {
  const [page, setPage] = useState('dashboard');
  const [selectedMachine, setSelectedMachine] = useState('ByStar1');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'ByStar3 showing low OEE' },
    { id: 2, type: 'info', message: 'Maintenance scheduled for tomorrow' },
    { id: 3, type: 'success', message: 'ByStar1 achieved 90% efficiency' },
    { id: 4, type: 'error', message: 'Network connectivity issue resolved' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
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

  // Interactive handlers
  const handleGenerateAIReport = async () => {
    setAiReportLoading(true);
    // Simulate AI report generation
    setTimeout(() => {
      setAiReportLoading(false);
      alert(`AI Report generated for ${selectedMachine}:\n\n• Current OEE: ${currentOEE?.current_oee}%\n• Recommendation: Focus on reducing idle time\n• Next maintenance: Due in 15 days\n• Efficiency trend: Improving (+2.1% vs last month)`);
    }, 2000);
  };

  const handleDownloadReport = async () => {
    setDownloadProgress(0);
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(0), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    if (notification.type === 'warning' && notification.message.includes('ByStar3')) {
      setSelectedMachine('ByStar3');
      setPage('dashboard');
    }
    setShowNotifications(false);
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #FF6600B3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading dashboard data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <AlertCircle size={24} />
          <div style={{ marginLeft: '12px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Enhanced Sidebar */}
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
              marginRight: '8px',
              transition: 'transform 0.3s',
              ':hover': { transform: 'scale(1.1)' }
            }} 
          />
          <div style={styles.logoText}>Elliot Systems</div>
        </div>

        <div style={styles.navMenu}>
          <div 
            style={styles.navItem(page === 'machines')} 
            onClick={() => setPage('machines')}
            onMouseEnter={(e) => {
              if (page !== 'machines') {
                e.target.style.background = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== 'machines') {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <Factory size={20} />
            <span>Machines</span>
            <div style={{ marginLeft: 'auto', fontSize: '11px', background: '#FF6600B3', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>
              {machines.filter(m => m.status === 'Active').length}
            </div>
          </div>

          <div 
            style={styles.navItem(page === 'dashboard')} 
            onClick={() => setPage('dashboard')}
            onMouseEnter={(e) => {
              if (page !== 'dashboard') {
                e.target.style.background = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== 'dashboard') {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </div>

          {page === 'dashboard' && (
            <div style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: 'transparent', 
                  color: '#FF6600B3',           
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.background = '#fff7e6'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                onClick={() => console.log('Cut process selected')}
              >
                <Scissors size={16} />
                <span>Cut</span>
              </div>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.background = '#f0f0f0'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                onClick={() => console.log('Blend process selected')}
              >
                <Repeat size={16} />
                <span>Blend</span>
              </div>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.target.style.background = '#f0f0f0'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                onClick={() => console.log('Tubes process selected')}
              >
                <Wrench size={16} />
                <span>Tubes</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.navMenu}>
          <div 
            style={styles.navItem(false)}
            onMouseEnter={(e) => { e.target.style.background = '#f0f0f0'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            onClick={() => console.log('Settings clicked')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </div>
          <div 
            style={styles.navItem(false)}
            onMouseEnter={(e) => { e.target.style.background = '#f0f0f0'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            onClick={() => console.log('Sign out clicked')}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Enhanced Top Bar */}
        <div style={styles.topBar}>
          <div>
            <div style={styles.pageTitle}>
              {page === 'dashboard' ? 'Dashboard' : 'Machines'}
            </div>
            {page === 'dashboard' && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Monitoring {selectedMachine} • {timeRange} view
              </div>
            )}
          </div>
          <div style={styles.topBarRight}>
            {/* Time Range Selector */}
            {page === 'dashboard' && (
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #d9d9d9',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            )}
            
            {/* Interactive Notifications */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{
                  ...styles.notificationIcon,
                  background: showNotifications ? '#e6f7ff' : 'transparent'
                }}
                onClick={() => setShowNotifications(!showNotifications)}
                onMouseEnter={(e) => {
                  if (!showNotifications) e.target.style.background = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  if (!showNotifications) e.target.style.background = 'transparent';
                }}
              >
                <Bell size={20} />
                <div style={styles.notificationBadge}>{notifications.length}</div>
              </div>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '320px',
                  background: 'white',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '12px',
                  zIndex: 1000
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '12px' }}>Notifications</div>
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '8px',
                        borderRadius: '6px',
                        background: notification.type === 'error' ? '#fff2f0' : 
                                   notification.type === 'warning' ? '#fffbe6' :
                                   notification.type === 'success' ? '#f6ffed' : '#e6f7ff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      onMouseEnter={(e) => { e.target.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'translateX(0px)'; }}
                    >
                      {notification.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div 
              style={styles.userInfo}
              onMouseEnter={(e) => { e.target.style.background = '#f0f0f0'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
              onClick={() => console.log('User profile clicked')}
            >
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
            {/* Enhanced Action Bar */}
            <div style={styles.actionBar}>
              <button 
                style={styles.btn('outline', false)}
                onClick={() => console.log('Filter clicked')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <Search size={16} /> Filter
              </button>
              
              <button 
                style={{
                  ...styles.btn('primary', false),
                  opacity: aiReportLoading ? 0.7 : 1,
                  cursor: aiReportLoading ? 'not-allowed' : 'pointer'
                }}
                onClick={handleGenerateAIReport}
                disabled={aiReportLoading}
                onMouseEnter={(e) => {
                  if (!aiReportLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255,102,0,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!aiReportLoading) {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {aiReportLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate AI Report
                  </>
                )}
              </button>
              
              <button 
                style={styles.btn('primary', false)}
                onClick={handleDownloadReport}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255,102,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <Download size={16} /> 
                Download Report
                {downloadProgress > 0 && downloadProgress < 100 && (
                  <span style={{ marginLeft: '8px' }}>({downloadProgress}%)</span>
                )}
              </button>
            </div>

            {/* Enhanced Gauge Charts */}
            {currentOEE && (
              <div style={styles.gaugeGrid}>
                <GaugeChart 
                  current={currentOEE.current_oee} 
                  previous={currentOEE.previous_oee} 
                  title="OEE" 
                  color="#FF6600B3"
                  onClick={(metric) => setSelectedMetric(metric)}
                  isSelected={selectedMetric === 'oee'}
                />
                <GaugeChart 
                  current={currentOEE.availability} 
                  previous={currentOEE.previous_oee} 
                  title="Availability" 
                  color="#FFEC60"
                  onClick={(metric) => setSelectedMetric(metric)}
                  isSelected={selectedMetric === 'availability'}
                />
                <GaugeChart 
                  current={currentOEE.performance} 
                  previous={currentOEE.previous_oee} 
                  title="Performance" 
                  color="#40E377"
                  onClick={(metric) => setSelectedMetric(metric)}
                  isSelected={selectedMetric === 'performance'}
                />
                <GaugeChart 
                  current={currentOEE.quality} 
                  previous={currentOEE.previous_oee} 
                  title="Quality" 
                  color="#F47474"
                  onClick={(metric) => setSelectedMetric(metric)}
                  isSelected={selectedMetric === 'quality'}
                />
              </div>
            )}

            {/* Enhanced Gantt Chart */}
            <MachineGanttChart 
              selectedMachine={selectedMachine} 
              onMachineChange={setSelectedMachine}
              timelineData={timelineData}
              statusSummary={statusSummary}
              machines={machines}
            />

            {/* Enhanced OEE Metrics Over Time */}
            <div style={{ ...styles.card(), marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={styles.cardTitle}>
                  <TrendingUp size={20} />
                  OEE Metrics Over Time
                  {selectedMetric && (
                    <span style={{ 
                      marginLeft: '12px', 
                      fontSize: '12px', 
                      background: '#e6f7ff', 
                      color: '#1890ff',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      Highlighting: {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                    </span>
                  )}
                </div>
                <button 
                  style={styles.btn('outline', false)}
                  onClick={() => setSelectedMetric(null)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <Search size={16} /> Reset View
                </button>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={oeeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="OEEE" 
                    stroke="#FF6600B3" 
                    strokeWidth={selectedMetric === 'oee' || !selectedMetric ? 4 : 2}
                    opacity={selectedMetric === 'oee' || !selectedMetric ? 1 : 0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Availability" 
                    stroke="#ffca44ff" 
                    strokeWidth={selectedMetric === 'availability' || !selectedMetric ? 4 : 2}
                    opacity={selectedMetric === 'availability' || !selectedMetric ? 1 : 0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Performance" 
                    stroke="#77c845ff" 
                    strokeWidth={selectedMetric === 'performance' || !selectedMetric ? 4 : 2}
                    opacity={selectedMetric === 'performance' || !selectedMetric ? 1 : 0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Quality" 
                    stroke="#F47474" 
                    strokeWidth={selectedMetric === 'quality' || !selectedMetric ? 4 : 2}
                    opacity={selectedMetric === 'quality' || !selectedMetric ? 1 : 0.3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Enhanced Machines View */}
        {page === 'machines' && (
          <div style={styles.contentArea}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px', fontWeight: '600' }}>Select Device</div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select 
                  style={{ 
                    padding: '8px 20px', 
                    borderRadius: '4px', 
                    border: '1px solid #d9d9d9',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FF6600B3'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#d9d9d9'; }}
                >
                  <option>CNC</option>
                  <option>Laser</option>
                  <option>Press</option>
                </select>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: '#f6ffed',
                  color: '#52c41a'
                }}>
                  ● Active {machines.filter(m => m.status === 'Active').length}
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: '#fff2f0',
                  color: '#ff4d4f'
                }}>
                  ● Inactive {machines.filter(m => m.status === 'Inactive').length}
                </span>
                <span style={{ 
                  color: '#FF6600B3',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: '#fff7e6',
                  fontWeight: '600'
                }}>
                  ● All {machines.length}
                </span>
              </div>
            </div>

            <div style={styles.machineGrid}>
              {machines.map((machine) => {
                const realtimeData = dataService.getRealtimeData(machine.machine_id);
                const isSelected = machine.machine_id === selectedMachine;
                return (
                  <div
                    key={machine.machine_id}
                    style={{
                      ...styles.machineCard(isSelected),
                      width: '360px',          
                      padding: '12px',        
                      fontSize: '12px',       
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }
                    }}
                    onClick={() => setSelectedMachine(machine.machine_id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ 
                        color: machine.status === 'Active' ? '#52c41a' : '#ff4d4f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ● {machine.status}
                      </span>
                      <div style={{
                        fontSize: '11px',
                        background: machine.status === 'Active' ? '#f6ffed' : '#fff2f0',
                        color: machine.status === 'Active' ? '#52c41a' : '#ff4d4f',
                        padding: '2px 6px',
                        borderRadius: '8px'
                      }}>
                        OEE: {machine.current_oee}%
                      </div>
                    </div>
                    <div style={{
                      ...styles.machineImage,
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}>
                      <img 
                        src={cncImage} 
                        alt="CNC Laser Machine" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          borderRadius: '18px',
                          transition: 'all 0.3s'
                        }} 
                      />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                      {machine.machine_name}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>Override</span>
                        <span style={{ fontWeight: '600' }}>{machine.override}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>TechnologyIndex</span>
                        <span style={{ fontWeight: '600' }}>{machine.technology_index}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#666' }}>Thickness</span>
                        <span style={{ fontWeight: '600' }}>{machine.thickness}mm</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Current</span>
                        <span style={{ fontWeight: '600' }}>{machine.current}A</span>
                      </div>
                    </div>
                    <button 
                      style={{ 
                        ...styles.btn('primary'),
                        width: '100%', 
                        justifyContent: 'center',
                        background: isSelected ? '#FF6600B3' : '#1890ff',
                        ':hover': {
                          background: isSelected ? '#FF6600B3' : '#40a9ff'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMachine(machine.machine_id);
                        setPage('dashboard');
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.background = isSelected ? '#FF6600B3' : '#40a9ff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.background = isSelected ? '#FF6600B3' : '#1890ff';
                      }}
                    >
                      {isSelected ? 'Selected' : 'View Dashboard'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Add CSS animations */}
      <style jsx>{`
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
};

export default Dash;
