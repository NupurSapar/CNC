// src/components/Charts.js - COMPLETE FIXED VERSION for API Integration
import React, { useState } from 'react';
import { Target, Activity, TrendingUp, Award, Zap, Filter, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
import ReactSpeedometer from 'react-d3-speedometer';

const chartStyles = {
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#666'
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
    borderColor: isActive ? '#1890ff' : '#d9d9d9'
  }),
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
  }
};

// Current Gauge Chart Component
export const CurrentGaugeChart = ({ current, title = "Current (Amperes)", color = "#FF6600B3" }) => {
  const safeValue = current || 0;
  const data = [
    { value: safeValue, fill: color },
    { value: 100 - safeValue, fill: '#e0e0e0' }
  ];

  const renderTicks = () => {
    const tickPositions = [
      { value: 0, x: 160, y: 180 },
      { value: 20, x: 155, y: 100 },
      { value: 40, x: 190, y: 40 },
      { value: 60, x: 360, y: 40 },
      { value: 80, x: 393, y: 100 },
      { value: 100, x: 387, y: 180 }
    ];

    return tickPositions.map(tick => (
      <text key={tick.value} x={tick.x} y={tick.y} textAnchor="middle" alignmentBaseline="middle" fontSize="8" fill="#666">
        {tick.value}
      </text>
    ));
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '250px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#333',
        gap: '6px'
      }}>
        <Activity size={16} /> {title}
      </div>
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} cx="50%" cy="60%" startAngle={225} endAngle={-45} innerRadius={90} outerRadius={115} dataKey="value" />
            {renderTicks()}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginTop: '-40px'
      }}>
        {safeValue.toFixed(1)}A
      </div>
    </div>
  );
};

// Speedometer Chart Component
export const SpeedometerChart = ({ title = "Speed", value = 0, maxValue = 100, titleColor = "#000" }) => {
  const safeValue = value || 0;
  const safeMaxValue = maxValue || 100;
  
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        alignSelf: 'flex-start',
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '16px',
        color: titleColor,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Activity size={16} /> {title}
      </div>
      <ReactSpeedometer
        value={safeValue}
        minValue={0}
        maxValue={safeMaxValue}
        needleColor="#1f78b4"
        startColor="#00c853"
        endColor="#d50000"
        segments={6}
        segmentColors={["#00c853", "#64dd17", "#aee775ff", "#ffeb3b", "#ffb23dff", "#ff4545ff"]}
        currentValueText={`${safeValue.toFixed(1)} mm/s`}
        height={180}
        width={250}
        textColor="#333"
      />
    </div>
  );
};

// Enhanced Gauge Chart Component
const GaugeChart = ({ current = 0, previous = 0, title, color, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const safeCurrent = current || 0;
  const safePrevious = previous || 0;
  
  const data = [
    { value: safeCurrent, fill: color },
    { value: 100 - safeCurrent, fill: '#e0e0e0' }
  ];
  
  const previousData = [
    { value: safePrevious, fill: '#7192FF' },
    { value: 100 - safePrevious, fill: '#EEEEEE' }
  ];

  const renderTicks = () => {
    const tickPositions = [
      { value: 0, x: 18, y: 180 },
      { value: 20, x: 22, y: 100 },
      { value: 40, x: 80, y: 40 },
      { value: 60, x: 190, y: 40 },
      { value: 80, x: 245, y: 100 },
      { value: 100, x: 252, y: 180 }
    ];

    return tickPositions.map(tick => (
      <text key={tick.value} x={tick.x} y={tick.y} textAnchor="middle" alignmentBaseline="middle" fontSize="8" fill="#666">
        {tick.value}
      </text>
    ));
  };

  const getIcon = () => {
    switch (title) {
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
        ...chartStyles.card,
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'none',
        boxShadow: isSelected ? '0 8px 25px rgba(255,102,0,0.2)' : (isHovered ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'),
        border: isSelected ? '2px solid #FF6600B3' : '2px solid transparent',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(title.toLowerCase())}
    >
      <div style={{ ...chartStyles.cardTitle, color: isSelected ? '#FF6600B3' : '#333' }}>
        {getIcon()}
        {title}
      </div>
      <div style={{ position: 'relative', width: '100%', height: '250px' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={previousData} cx="50%" cy="60%" startAngle={225} endAngle={-45} innerRadius={70} outerRadius={90} dataKey="value" />
            <Pie data={data} cx="50%" cy="60%" startAngle={225} endAngle={-45} innerRadius={95} outerRadius={115} dataKey="value" />
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
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{safeCurrent.toFixed(1)}%</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Current</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#666', marginTop: '8px' }}>{safePrevious.toFixed(1)}%</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Previous</div>
        </div>
        
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '4px 8px',
          borderRadius: '12px',
          background: safeCurrent > safePrevious ? '#f6ffed' : '#fff2f0',
          color: safeCurrent > safePrevious ? '#52c41a' : '#ff4d4f',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {safeCurrent > safePrevious ? '↗' : '↘'} {Math.abs(safeCurrent - safePrevious).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

// Machine Gantt Chart Component
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
    Offline: '#F47474',
    Running: '#77c845ff'
  };

  if (!timelineData || !machines || machines.length === 0) {
    return (
      <div style={chartStyles.card}>
        <div style={chartStyles.loadingContainer}>Loading timeline data...</div>
      </div>
    );
  }

  const allMachines = machines.map(m => m.machine_id);
  const timelineHours = 24;

  const handleBlockHover = (block, status) => {
    setHoveredBlock({ ...block, status });
  };

  const filteredTimeline = statusFilter === 'all' ? timelineData : {
    ...timelineData,
    overview: timelineData.overview?.filter(block => block.status === statusFilter) || []
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={chartStyles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={chartStyles.cardTitle}>
          <Activity size={20} />
          Machine Status Timeline
        </div>
        <div style={{ position: 'relative' }}>
          <button style={chartStyles.btn('outline', filterOpen)} onClick={() => setFilterOpen(!filterOpen)}>
            <Filter size={16} /> Filter
          </button>
          {filterOpen && (
            <div style={chartStyles.filterDropdown}>
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
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[status] }} />
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
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Device</div>
          {allMachines.map(machineId => {
            const machine = machines.find(m => m.machine_id === machineId);
            const isSelected = machineId === selectedMachine;
            const machineState = machine?.state || 'Unknown';
            const isActive = machineState === 'Running';
            
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
                  transition: 'all 0.3s'
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
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#52c41a' : '#ff4d4f' }} />
                  {machineId}
                </div>
                <div style={{ fontSize: '11px', color: isSelected ? 'rgba(255,255,255,0.8)' : (isActive ? '#52c41a' : '#ff4d4f') }}>
                  {machineState}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowX: 'auto' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Timeline</div>
          <div style={{ minWidth: '800px' }}>
            <div style={{ position: 'relative', height: '30px', marginBottom: '8px', border: '1px solid #e0e0e0' }}>
              {filteredTimeline.overview?.map((block, i) => {
                const blockColor = statusColors[block.status] || '#999';
                
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${(i / (filteredTimeline.overview.length || 1)) * 100}%`,
                      width: `${100 / (filteredTimeline.overview.length || 1)}%`,
                      height: '100%',
                      background: blockColor,
                      borderRight: '1px solid white',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={() => handleBlockHover(block, block.status)}
                    onMouseLeave={() => setHoveredBlock(null)}
                  />
                );
              })}
            </div>

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
                {hoveredBlock.status}: {formatDuration(hoveredBlock.duration)}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#999' }}>
            {[0, 4, 8, 12, 16, 20, 24].map(time => (
              <div key={time}>{time}:00</div>
            ))}
          </div>
        </div>

        <div style={{ width: '80px', textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
          <div style={{ marginBottom: '16px', fontSize: '12px', fontWeight: '600', color: '#333' }}>
            Duration
          </div>
          <div style={{ fontSize: '12px' }}>
            {formatDuration(statusSummary?.Work || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Drill/Mark Gantt Chart
const DrillMarkGanttChart = ({ selectedMachine, onMachineChange, timelineData, machines }) => {
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const statusColors = {
    Drilling: '#FF4D4F',
    Marking: '#52C41A',
  };

  if (!timelineData || !machines || machines.length === 0) {
    return (
      <div style={chartStyles.card}>
        <div style={chartStyles.loadingContainer}>Loading timeline data...</div>
      </div>
    );
  }

  const allMachines = machines.map(m => m.machine_id);

  const handleBlockHover = (block, status) => {
    setHoveredBlock({ ...block, status });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div style={chartStyles.card}>
      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '16px', marginBottom: '16px', gap: '6px' }}>
        <Activity size={20} /> Drill/Mark Timeline
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ minWidth: '120px' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Device</div>
          {allMachines.map(machineId => {
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
                  transition: 'all 0.3s'
                }}
              >
                {machineId}
              </div>
            );
          })}
        </div>

        <div style={{ minWidth: '80px' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Legend</div>
          {Object.keys(statusColors).map(status => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: statusColors[status] }} />
              <div style={{ fontSize: '12px' }}>{status}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowX: 'auto' }}>
          <div style={{ minWidth: '800px', position: 'relative' }}>
            {Object.keys(statusColors).map((status) => (
              <div key={status} style={{ position: 'relative', height: '30px', marginBottom: '8px', border: '1px solid #e0e0e0' }}>
                {timelineData[status]?.map((block, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${(i / (timelineData[status]?.length || 1)) * 100}%`,
                      width: `${100 / (timelineData[status]?.length || 1)}%`,
                      height: '100%',
                      background: statusColors[status],
                      borderRight: '1px solid white',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={() => handleBlockHover(block, status)}
                    onMouseLeave={() => setHoveredBlock(null)}
                  />
                ))}
              </div>
            ))}

            {hoveredBlock && (
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                pointerEvents: 'none',
                zIndex: 1000
              }}>
                {hoveredBlock.status}: {formatDuration(hoveredBlock.duration)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#999' }}>
            {[0, 4, 8, 12, 16, 20, 24].map(time => (
              <div key={time}>{time}:00</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// OEE Line Chart Component
const OEELineChart = ({ data, selectedMetric, onMetricReset }) => {
  const safeData = data || [];
  
  return (
    <div style={{ ...chartStyles.card, marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={chartStyles.cardTitle}>
          <TrendingUp size={20} />
          OEE Metrics Over Time
          {selectedMetric && (
            <span style={{ marginLeft: '12px', fontSize: '12px', background: '#e6f7ff', color: '#1890ff', padding: '2px 8px', borderRadius: '12px' }}>
              Highlighting: {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
            </span>
          )}
        </div>
        {onMetricReset && (
          <button style={chartStyles.btn('outline', false)} onClick={onMetricReset}>
            <Search size={16} /> Reset View
          </button>
        )}
      </div>
      
      {safeData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="OEEE" stroke="#FF6600B3" 
                  strokeWidth={selectedMetric === 'oee' || !selectedMetric ? 4 : 2}
                  opacity={selectedMetric === 'oee' || !selectedMetric ? 1 : 0.3} />
            <Line type="monotone" dataKey="Availability" stroke="#ffca44ff"
                  strokeWidth={selectedMetric === 'availability' || !selectedMetric ? 4 : 2}
                  opacity={selectedMetric === 'availability' || !selectedMetric ? 1 : 0.3} />
            <Line type="monotone" dataKey="Performance" stroke="#77c845ff"
                  strokeWidth={selectedMetric === 'performance' || !selectedMetric ? 4 : 2}
                  opacity={selectedMetric === 'performance' || !selectedMetric ? 1 : 0.3} />
            <Line type="monotone" dataKey="Quality" stroke="#F47474"
                  strokeWidth={selectedMetric === 'quality' || !selectedMetric ? 4 : 2}
                  opacity={selectedMetric === 'quality' || !selectedMetric ? 1 : 0.3} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={chartStyles.loadingContainer}>No historical data available</div>
      )}
    </div>
  );
};

// Machine Card Component
const MachineCard = ({ machine, currentOEE }) => {
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const machineId = machine?.machine_id || 'Unknown Machine';
  const machineState = machine?.state || 'Unknown';
  const programState = machine?.program_state || 'Unknown';
  const drilling = machine?.drilling || 0;
  const currentMarking = machine?.current_marking || 0;
  const cuttingSpeed = machine?.cutting_speed || 0;
  const maxSpeed = 500;

  const states = [
    { name: 'Machine State', label: machineState, bgColor: machineState === 'Running' ? '#dcffbaff' : '#fee4e1ff', textColor: machineState === 'Running' ? '#52c41a' : '#ff4d4f' },
    { name: 'Program State', label: programState, bgColor: programState === 'ACTIVE' ? '#dcffbaff' : '#fee4e1ff', textColor: programState === 'ACTIVE' ? '#52c41a' : '#ff4d4f' },
    { name: 'Drilling', label: drilling > 0 ? 'Active' : 'Inactive', bgColor: drilling > 0 ? '#dcffbaff' : '#fee4e1ff', textColor: drilling > 0 ? '#52c41a' : '#ff4d4f' },
    { name: 'Marking', label: currentMarking > 0 ? 'Active' : 'Inactive', bgColor: currentMarking > 0 ? '#dcffbaff' : '#fee4e1ff', textColor: currentMarking > 0 ? '#52c41a' : '#ff4d4f' },
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '6px', fontWeight: '700', fontSize: '22px', color: '#1d1d1dff' }}>
        {machineId}
      </div>

      <div style={{ textAlign: 'center', fontWeight: '400', fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        {timestamp}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginBottom: '20px' }}>
        {states.map((state, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: '500', marginBottom: '4px', color: '#474747' }}>
              {state.name}
            </div>
            <div style={{
              padding: '6px',
              borderRadius: '6px',
              background: state.bgColor,
              color: state.textColor,
              fontWeight: '600',
              fontSize: '12px'
            }}>
              {state.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <div style={{ flex: '1 1 220px', minWidth: '220px' }}>
          <CurrentGaugeChart current={currentMarking} title="Current (Amperes)" color="#FF6600B3" />
        </div>
        <div style={{ flex: '1 1 220px', minWidth: '220px' }}>
          <SpeedometerChart
            value={cuttingSpeed}
            maxValue={maxSpeed}
            title="Cutting Speed"
          />
        </div>
      </div>
    </div>
  );
};

export { GaugeChart, MachineGanttChart, OEELineChart, MachineCard, DrillMarkGanttChart };