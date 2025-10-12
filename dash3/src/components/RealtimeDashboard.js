// src/components/RealtimeDashboard.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/DataService';
import cncImage from './cncimg.png';
import { Cpu, Zap, Package, Ruler, Plug, Tool } from 'lucide-react';



const RealtimeDashboard = ({ machineId }) => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [oeeData, setOeeData] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('overview');

  // Initialize DataService and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await dataService.initialize(true, 5000); // Poll every 5 seconds
        await loadMachineData();
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    initializeData();

    return () => dataService.stopPolling();
  }, []);

  // Load machine-specific data
  const loadMachineData = async () => {
    if (!machineId) return;

    try {
      const [realtime, oee, timelineData] = await Promise.all([
        dataService.getRealtimeData(machineId),
        dataService.getCurrentOEE(machineId),
        dataService.getMachineTimeline(machineId, '24h')
      ]);

      setRealtimeData(realtime);
      setOeeData(oee);
      setTimeline(timelineData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading machine data:', err);
      setError(err.message);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.type === 'update') loadMachineData();
      else if (event.type === 'error') setError(event.error?.message || 'Unknown error');
    });
    return () => unsubscribe();
  }, [machineId]);

  // Reload when machine changes
  useEffect(() => {
    if (machineId) loadMachineData();
  }, [machineId]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error)
    return (
      <div className="error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={loadMachineData}>Retry</button>
      </div>
    );

  return (
    <div className="realtime-dashboard">
      <div className="dashboard-header">
        <h2>Real-time Monitor - Machine {machineId}</h2>
        <div className="update-info">
          Last Update: {lastUpdate?.toLocaleTimeString() ?? 'N/A'}
        </div>
      </div>

      {/* OEE Gauges */}
      <div className="oee-section">
        <div className="gauge-container">
          <GaugeChart
            title="OEE"
            value={oeeData?.current_oee}
            previousValue={oeeData?.previous_oee}
          />
          <GaugeChart title="Availability" value={oeeData?.availability} color="#4CAF50" />
          <GaugeChart title="Performance" value={oeeData?.performance} color="#2196F3" />
          <GaugeChart title="Quality" value={oeeData?.quality} color="#FF9800" />
        </div>
      </div>

      {/* Current Parameters */}
      <div className="parameters-section">
        <h3>Current Parameters</h3>
        <div className="parameters-grid">
          <ParameterCard label="State" value={realtimeData?.state ?? 'Unknown'} icon={Cpu} />
          <ParameterCard
            label="Cutting Speed"
            value={`${(realtimeData?.cutting_speed ?? 0).toFixed(1)} mm/s`}
            icon={Zap}
          />
          <ParameterCard label="Material" value={realtimeData?.material ?? 'N/A'} icon={Package} />
          <ParameterCard
            label="Thickness"
            value={`${(realtimeData?.thickness ?? 0).toFixed(1)} mm`}
            icon={Ruler}
          />
          <ParameterCard
            label="Current"
            value={`${(realtimeData?.current_marking ?? 0).toFixed(1)} A`}
            icon={Plug}
          />
          <ParameterCard
            label="Technology"
            value={realtimeData?.technology_name ?? 'N/A'}
            icon={Tool}
          />
        </div>
      </div>

      {/* Timeline Gantt Chart */}
      <div className="timeline-section">
        <h3>Machine Timeline (24h)</h3>
        <GanttChart data={timeline?.overview ?? []} />
      </div>

      {/* Status Filter Buttons */}
      <div className="status-filter">
        {['overview', 'Work', 'Error', 'Idle', 'Wait', 'Stop'].map((status) => (
          <button key={status} onClick={() => setFilterStatus(status)}>
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================== Helper Components ====================

const GaugeChart = ({ title, value, previousValue, color = '#9C27B0' }) => {
  const safeValue = value ?? 0;
  const safePrevious = previousValue ?? 0;

  return (
    <div className="gauge">
      <h4>{title}</h4>
      <div className="gauge-value" style={{ color }}>
        {safeValue.toFixed(1)}%
      </div>
      <div className="gauge-trend">
        {safeValue > safePrevious ? '↑' : '↓'} {(Math.abs(safeValue - safePrevious)).toFixed(1)}%
      </div>
    </div>
  );
};

const ParameterCard = ({ label, value, icon: Icon }) => (
  <div className="parameter-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
    {Icon && <Icon size={20} />}
    <div className="parameter-content">
      <div className="parameter-label" style={{ fontSize: '12px', color: '#666' }}>{label}</div>
      <div className="parameter-value" style={{ fontSize: '14px', fontWeight: '600' }}>{value}</div>
    </div>
  </div>
);


const GanttChart = ({ data }) => {
  const getStatusColor = (status) => {
    const colors = {
      Running: '#4CAF50',
      Error: '#F44336',
      Idle: '#FFC107',
      Stopped: '#9E9E9E',
      Wait: '#2196F3'
    };
    return colors[status] ?? '#757575';
  };

  return (
    <div className="gantt-chart">
      {data.map((entry, idx) => (
        <div
          key={idx}
          className="gantt-bar"
          style={{
            backgroundColor: getStatusColor(entry.status),
            width: `${((entry.duration ?? 0) / 86400) * 100}%`
          }}
          title={`${entry.status}: ${((entry.duration ?? 0) / 60).toFixed(1)} minutes`}
        />
      ))}
    </div>
  );
};

export default RealtimeDashboard;
