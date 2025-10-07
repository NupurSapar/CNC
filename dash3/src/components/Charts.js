// src/components/Charts.js - FIXED Gantt Chart Version
import React, { useState } from 'react';
import { Target, Activity, TrendingUp, Award, Zap, Filter, Calendar, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';

const timelineHours = 24;

const chartStyles = {
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s'
  },
  gaugeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#666'
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
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

// Enhanced Gauge Chart Component
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
        ...chartStyles.card,
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'none',
        boxShadow: isSelected ? '0 8px 25px rgba(255,102,0,0.2)' : (isHovered ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'),
        border: isSelected ? '2px solid #FF6600B3' : '2px solid transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(title.toLowerCase())}
    >
      <div style={{...chartStyles.cardTitle, color: isSelected ? '#FF6600B3' : '#333'}}>
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

// FIXED Enhanced Machine Gantt Chart Component - Complete Original Version
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
      <div style={chartStyles.card}>
        <div style={chartStyles.loadingContainer}>Loading timeline data...</div>
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
    <div style={chartStyles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={chartStyles.cardTitle}>
          <Activity size={20} />
          Machine Status for Current Data
        </div>
        <div style={{ position: 'relative' }}>
          <button 
            style={chartStyles.btn('outline', filterOpen)}
            onClick={() => setFilterOpen(!filterOpen)}
          >
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
                          transition: 'all 0.3s'
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

// OEE Line Chart Component
const OEELineChart = ({ data, selectedMetric, onMetricReset }) => {
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
        <button style={chartStyles.btn('outline', false)} onClick={onMetricReset}>
          <Search size={16} /> Reset View
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
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
    </div>
  );
};

export { GaugeChart, MachineGanttChart, OEELineChart };