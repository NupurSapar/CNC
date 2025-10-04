import React, { useState, useEffect } from 'react';
import logoImage from './elliot.png';
import cncImage from './cnc.png';

import { 
  Factory, BarChart2, Scissors, Repeat, Wrench, Settings, LogOut, Bell, Search, Download, Sparkles 
} from 'lucide-react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const timelineHours = 24;

// Styles
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
  }
};

// Gauge Chart Component (3/4 circular + tick labels)
const GaugeChart = ({ current, previous, title, color }) => {
  const data = [
    { value: current, fill: color },
    { value: 100 - current, fill: '#e0e0e0' }
  ];
  
  const previousData = [
    { value: previous, fill: '#7192FF' },
    { value: 100 - previous, fill: '#EEEEEE' }
  ];

  // Function to position tick labels along outer rim
  const renderTicks = () => {
  // Manual positions for each tick (x, y)
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
            {/* Outer ring (previous) */}
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
            {/* Inner ring (current) */}
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
            {/* Tick labels */}
            {renderTicks()}
          </PieChart>
        </ResponsiveContainer>

        {/* Text values inside gauge */}
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


// Machine Gantt Chart Component
const MachineGanttChart = ({ selectedMachine, onMachineChange }) => {
  const statusColors = {
    Work: '#77c845ff',
    Error: '#C08CE0',
    Wait: '#7192FF',
    Idle: '#ffca44ff',
    Stop: '#9e9e9e',
    Offline: '#F47474'
  };

  const machines = ['ByStar1', 'ByStar2', 'ByStar3'];
  
  const generateTimeBlocks = () => {
    const blocks = [];
    const statuses = ['Work', 'Error', 'Wait', 'Idle', 'Offline'];
    let currentTime = 0;
    
    while (currentTime < 12) {
      const duration = Math.random() * 1.5 + 0.3;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      blocks.push({
        start: currentTime,
        duration: Math.min(duration, 12 - currentTime),
        status
      });
      currentTime += duration;
    }
    return blocks;
  };

  const [machineData, ] = useState({
 ByStar1: {
  overview: [
    { start: 0, duration: 1.5, status: 'Work' },
    { start: 1.5, duration: 0.4, status: 'Wait' },
    { start: 1.9, duration: 1.3, status: 'Work' },
    { start: 3.1, duration: 0.5, status: 'Error' },
    { start: 3.6, duration: 0.3, status: 'Work' },
    { start: 3.9, duration: 0.3, status: 'Idle' },
    { start: 4.2, duration: 0.5, status: 'Work' },
    { start: 4.7, duration: 0.3, status: 'Idle' },
    { start: 5, duration: 0.3, status: 'Work' },
    { start: 5.3, duration: 0.2, status: 'Idle' },
    { start: 5.5, duration: 1, status: 'Work' },
    { start: 6.5, duration: 0.1, status: 'Offline' },
    { start: 6.6, duration: 1, status: 'Work' },
    { start: 7.6, duration: 0.6, status: 'Wait' },
    { start: 8.2, duration: 0.4, status: 'Idle' },
    { start: 8.6, duration: 0.7, status: 'Error' },
    { start: 9.3, duration: 1, status: 'Work' },
    { start: 10.3, duration: 0.2, status: 'Wait' },
    { start: 10.5, duration: 0.2, status: 'Error' },
    { start: 10.7, duration: 1.4, status: 'Work' },
    { start: 12.1, duration: 2, status: 'Idle' },
    { start: 14.1, duration: 3, status: 'Work' },
    { start: 17.1, duration: 1, status: 'Wait' },
    { start: 18.1, duration: 0.5, status: 'Error' },
    { start: 18.6, duration: 2, status: 'Work' },
    { start: 20.6, duration: 0.4, status: 'Idle' },
    { start: 21, duration: 1.5, status: 'Work' },
    { start: 22.5, duration: 0.5, status: 'Offline' },
    { start: 23, duration: 1, status: 'Idle' }
  ],
  Work: [
    { start: 0, duration: 1.5 },
    { start: 1.9, duration: 1.3 },
    { start: 3.6, duration: 0.3 },
    { start: 4.2, duration: 0.5 },
    { start: 5, duration: 0.3 },
    { start: 5.5, duration: 1 },
    { start: 6.6, duration: 1 },
    { start: 9.3, duration: 1 },
    { start: 10.7, duration: 1.4 },
    { start: 14.1, duration: 3 },
    { start: 18.6, duration: 2 },
    { start: 21, duration: 1.5 }
  ],
  Error: [
    { start: 3.1, duration: 0.5 },
    { start: 8.6, duration: 0.7 },
    { start: 10.5, duration: 0.2 },
    { start: 18.1, duration: 0.5 }
  ],
  Wait: [
    { start: 1.5, duration: 0.4 },
    { start: 7.6, duration: 0.6 },
    { start: 10.3, duration: 0.2 },
    { start: 17.1, duration: 1 }
  ],
  Idle: [
    { start: 3.9, duration: 0.3 },
    { start: 4.7, duration: 0.3 },
    { start: 5.3, duration: 0.2 },
    { start: 8.2, duration: 0.4 },
    { start: 12.1, duration: 2 },
    { start: 20.6, duration: 0.4 },
    { start: 23, duration: 1 }
  ],
  Offline: [
    { start: 6.5, duration: 0.1 },
    { start: 22.5, duration: 0.5 }
  ],
  Stop: []
},
  ByStar2: {
  overview: [
    { start: 0, duration: 1.2, status: 'Work' },
    { start: 1.2, duration: 0.6, status: 'Wait' },
    { start: 1.8, duration: 1.5, status: 'Work' },
    { start: 3.3, duration: 0.5, status: 'Error' },
    { start: 3.8, duration: 0.4, status: 'Idle' },
    { start: 4.2, duration: 1, status: 'Work' },
    { start: 5.2, duration: 0.3, status: 'Offline' },
    { start: 5.5, duration: 1.4, status: 'Work' },
    { start: 6.9, duration: 0.5, status: 'Wait' },
    { start: 7.4, duration: 0.6, status: 'Error' },
    { start: 8.0, duration: 1.1, status: 'Work' },
    { start: 9.1, duration: 0.3, status: 'Idle' },
    { start: 9.4, duration: 0.3, status: 'Work' },
    { start: 9.7, duration: 0.3, status: 'Idle' },
    { start: 10.0, duration: 1.0, status: 'Work' },
    { start: 11.0, duration: 1.0, status: 'Wait' },
    { start: 12.0, duration: 2.5, status: 'Work' },
    { start: 14.5, duration: 0.8, status: 'Idle' },
    { start: 15.3, duration: 2, status: 'Work' },
    { start: 17.3, duration: 1.0, status: 'Wait' },
    { start: 18.3, duration: 0.7, status: 'Error' },
    { start: 19.0, duration: 3, status: 'Work' },
    { start: 22.0, duration: 1, status: 'Idle' },
    { start: 23.0, duration: 1, status: 'Offline' }
  ],
  Work: [
    { start: 0, duration: 1.2 },
    { start: 1.8, duration: 1.5 },
    { start: 4.2, duration: 1 },
    { start: 5.5, duration: 1.4 },
    { start: 8.0, duration: 1.1 },
    { start: 9.4, duration: 0.3 },
    { start: 10.0, duration: 1.0 },
    { start: 12.0, duration: 2.5 },
    { start: 15.3, duration: 2 },
    { start: 19.0, duration: 3 }
  ],
  Error: [
    { start: 3.3, duration: 0.5 },
    { start: 7.4, duration: 0.6 },
    { start: 18.3, duration: 0.7 }
  ],
  Wait: [
    { start: 1.2, duration: 0.6 },
    { start: 6.9, duration: 0.5 },
    { start: 11.0, duration: 1.0 },
    { start: 17.3, duration: 1.0 }
  ],
  Idle: [
    { start: 3.8, duration: 0.4 },
    { start: 9.1, duration: 0.3 },
    { start: 9.7, duration: 0.3 },
    { start: 14.5, duration: 0.8 },
    { start: 22.0, duration: 1 }
  ],
  Offline: [
    { start: 5.2, duration: 0.3 },
    { start: 23.0, duration: 1 }
  ],
  Stop: []
},

 ByStar3: {
  overview: [
    { start: 0, duration: 0.8, status: 'Offline' },
    { start: 0.8, duration: 1.6, status: 'Work' },
    { start: 2.4, duration: 0.4, status: 'Wait' },
    { start: 2.8, duration: 0.9, status: 'Work' },
    { start: 3.7, duration: 0.6, status: 'Error' },
    { start: 4.3, duration: 0.5, status: 'Idle' },
    { start: 4.8, duration: 1.5, status: 'Work' },
    { start: 6.3, duration: 0.2, status: 'Offline' },
    { start: 6.5, duration: 1.5, status: 'Work' },
    { start: 8.0, duration: 0.4, status: 'Wait' },
    { start: 8.4, duration: 0.7, status: 'Error' },
    { start: 9.1, duration: 0.3, status: 'Idle' },
    { start: 9.4, duration: 1.2, status: 'Work' },
    { start: 10.6, duration: 0.4, status: 'Idle' },
    { start: 11.0, duration: 1.0, status: 'Work' },
    { start: 12.0, duration: 2, status: 'Work' },
    { start: 14.0, duration: 1, status: 'Wait' },
    { start: 15.0, duration: 1.5, status: 'Work' },
    { start: 16.5, duration: 0.5, status: 'Error' },
    { start: 17.0, duration: 2, status: 'Work' },
    { start: 19.0, duration: 0.6, status: 'Idle' },
    { start: 19.6, duration: 2.4, status: 'Work' },
    { start: 22.0, duration: 1, status: 'Wait' },
    { start: 23.0, duration: 1, status: 'Offline' }
  ],
  Work: [
    { start: 0.8, duration: 1.6 },
    { start: 2.8, duration: 0.9 },
    { start: 4.8, duration: 1.5 },
    { start: 6.5, duration: 1.5 },
    { start: 9.4, duration: 1.2 },
    { start: 11.0, duration: 1.0 },
    { start: 12.0, duration: 2 },
    { start: 15.0, duration: 1.5 },
    { start: 17.0, duration: 2 },
    { start: 19.6, duration: 2.4 }
  ],
  Error: [
    { start: 3.7, duration: 0.6 },
    { start: 8.4, duration: 0.7 },
    { start: 16.5, duration: 0.5 }
  ],
  Wait: [
    { start: 2.4, duration: 0.4 },
    { start: 8.0, duration: 0.4 },
    { start: 14.0, duration: 1 },
    { start: 22.0, duration: 1 }
  ],
  Idle: [
    { start: 4.3, duration: 0.5 },
    { start: 9.1, duration: 0.3 },
    { start: 10.6, duration: 0.4 },
    { start: 19.0, duration: 0.6 }
  ],
  Offline: [
    { start: 0, duration: 0.8 },
    { start: 6.3, duration: 0.2 },
    { start: 23.0, duration: 1 }
  ],
  Stop: []
}

});


  const durations = {
    ByStar1: '18h 19m',
    ByStar2: '18h 19m',
    ByStar3: '3h 50m'
  };

  const statusDurations = {
    Work: '18h 19m',
    Error: '31m 20s',
    Wait: '3h 50m',
    Idle: '1h 42m',
    Stop: '0s',
    Offline: '40s'
  };
const statusDurationsData = {
  ByStar1: { overall: '24h 0m', Work: '15h 24m', Error: '1h 42m', Wait: '2h 0m', Idle: '4h 12m', Offline: '0h 33m', Stop: '0h 0m' },
  ByStar2: { overall: '24h 0m', Work: '15h 6m', Error: '1h 36m', Wait: '2h 48m', Idle: '3h 24m', Offline: '1h 9m', Stop: '0h 0m' },
  ByStar3: { overall: '24h 0m', Work: '16h 18m', Error: '1h 40m', Wait: '2h 36m', Idle: '1h 40m', Offline: '1h 51m', Stop: '0h 0m' },
};



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
          {machines.map(machine => (
            <div
              key={machine}
              onClick={() => onMachineChange(machine)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: machine === selectedMachine ? '#FF6600B3' : '#f5f5f5',
                color: machine === selectedMachine ? 'white' : '#333',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{machine}</div>
              <div style={{ fontSize: '11px', color: machine === selectedMachine ? 'white' : '#4caf50' }}>
                Last status: Work
              </div>
            </div>
          ))}
        </div>

        {/*<div style={{ flex: 1 }}>*/}
        <div style={{ flex: 1, overflowX: 'hidden' }}>
  <div
    style={{
      width: '180%', // adjust width as needed to fit 24h timeline
      minWidth: '800px', // ensures scrollbar shows
      paddingBottom: '8px',
    }}
  ></div>
          <div style={{ fontWeight: '600', marginTop: '-10px', marginBottom: '8px', fontSize: '14px' }}>Gantt</div>
          <div style={{ display: 'flex' }}>
  {/* Left labels */}
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

  {/* Scrollable bars */}
  <div style={{ flex: 1, overflowX: 'auto'}}>
    <div style={{ width: '1560px' }}>
        
      {/* Overview row */}
      <div style={{ position: 'relative', height: '30px', marginBottom: '8px', border: '1px solid #e0e0e0' }}>
        {machineData[selectedMachine].overview.map((block, i) => (
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
          {machineData[selectedMachine][status]?.map((block, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(block.start /timelineHours) * 90}%`,
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
  width: '180%',       // match Gantt chart width
  minWidth: '1200px',  // optional, same as chart
}}>
            {[0, 4, 8, 12, 16, 20, 24].map(time => (
              <div key={time} style={{ fontSize: '11px', color: '#999'}}>{time}:00</div>
            ))}
          </div>
  </div>

  {/* Right durations */}
  <div style={{ width: '80px', textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
  <div style={{ marginTop: '8px',marginBottom:'24px', fontSize: '12px' }}>
    {statusDurationsData[selectedMachine].overall}
  </div>
  {Object.keys(statusColors).map(status => (
    <div key={status} style={{ height: '30px', marginBottom: '10px', fontSize: '12px' }}>
      {statusDurationsData[selectedMachine][status]}
    </div>
  ))}
</div>
  
</div>
        </div>
      </div>
    </div>
  );
};

{/* Scrollbar style */}
<style>
  {`
    ::-webkit-scrollbar {
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: #bbb;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #888;
    }
  `}
</style>
// Main App Component
const Dash = () => {
  const [page, setPage] = useState('dashboard');
  const [selectedMachine, setSelectedMachine] = useState('ByStar2');
  const [oeeData, setOeeData] = useState([]);

useEffect(() => {
  // Hardcoded OEE data for each month
  const data = [
    { month: 'Jan', OEEE: 320, Availability: 180, Performance: 170, Quality: 120 },
    { month: 'Feb', OEEE: 310, Availability: 190, Performance: 160, Quality: 130 },
    { month: 'Mar', OEEE: 330, Availability: 200, Performance: 150, Quality: 110 },
    { month: 'Apr', OEEE: 300, Availability: 185, Performance: 155, Quality: 115 },
    { month: 'May', OEEE: 340, Availability: 195, Performance: 165, Quality: 125 },
    { month: 'Jun', OEEE: 315, Availability: 180, Performance: 170, Quality: 120 },
    { month: 'Jul', OEEE: 325, Availability: 190, Performance: 160, Quality: 130 },
    { month: 'Aug', OEEE: 310, Availability: 200, Performance: 150, Quality: 110 },
    { month: 'Sept', OEEE: 335, Availability: 185, Performance: 155, Quality: 115 },
    { month: 'Oct', OEEE: 320, Availability: 195, Performance: 165, Quality: 125 },
    { month: 'Nov', OEEE: 330, Availability: 180, Performance: 170, Quality: 120 },
    { month: 'Dec', OEEE: 340, Availability: 190, Performance: 160, Quality: 130 }
  ];

  setOeeData(data);
}, []);


  return (
    <div style={styles.container}>
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

  {/* Main Menu */}
  <div style={styles.navMenu}>
    {/* Machines */}
    <div 
      style={styles.navItem(page === 'machines')} 
      onClick={() => setPage('machines')}
    >
      <Factory size={20} />
      <span>Machines</span>
    </div>

    {/* Dashboard */}
    <div 
      style={styles.navItem(page === 'dashboard')} 
      onClick={() => setPage('dashboard')}
    >
      <BarChart2 size={20} />
      <span>Dashboard</span>
    </div>

    {/* Dashboard Sub-items */}
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
        transition: 'background 0.2s'
      }}
    >
      <Scissors size={16} />
      <span style={{ display: 'inline-block', minWidth: '40px' }}>Cut</span>
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
        transition: 'background 0.2s'
      }}
    >
      <Repeat size={16} />
      <span style={{ display: 'inline-block', minWidth: '40px' }}>Blend</span>
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
        transition: 'background 0.2s'
      }}
    >
      <Wrench size={16} />
      <span style={{ display: 'inline-block', minWidth: '40px' }}>Tubes</span>
    </div>

  </div>
)}
</div>

  {/* Settings / Sign Out */}
  <div style={styles.navMenu}>
    <div 
      style={styles.navItem(false)}
      onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Settings size={20} />
      <span>Settings</span>
    </div>
    <div 
      style={styles.navItem(false)}
      onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <LogOut size={20} />
      <span>Sign Out</span>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Top Bar */}
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
            {/* Action Bar */}
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
            <div style={styles.gaugeGrid}>
              <GaugeChart current={78.2} previous={60.1} title="OEE" color="#FF6600B3" />
              <GaugeChart current={78.2} previous={60.1} title="Availability" color="#FFEC60" />
              <GaugeChart current={78.2} previous={60.1} title="Performance" color="#40E377" />
              <GaugeChart current={78.2} previous={60.1} title="Quality" color="#F47474" />
            </div>

            {/* Gantt Chart */}
            <MachineGanttChart 
              selectedMachine={selectedMachine} 
              onMachineChange={setSelectedMachine}
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
                <span>○  Active 2</span>
                <span>○ Inactive 0</span>
                <span style={{ color: '#FF6600B3' }}>● All 2</span>
              </div>
            </div>

            <div style={styles.machineGrid}>
              {[1, 2].map(num => (
    <div
      key={num}
      style={{
        ...styles.machineCard,
        width: '360px',          
        padding: '12px',        
        fontSize: '12px',       
      }}
    >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#4caf50' }}>● Active</span>
                  </div>
                  <div style={styles.machineImage}>
  <img src={cncImage} alt="CNC Laser Machine" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                    CNC Laser Machine {num}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#666' }}>Override</span>
                      <span>-</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#666' }}>TechnologyIndex</span>
                      <span>-</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#666' }}>Thickness</span>
                      <span>-</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Current</span>
                      <span>-</span>
                    </div>
                  </div>
                  <button style={{ ...styles.btn('primary'), width: '100%', justifyContent: 'center' }}>
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dash;