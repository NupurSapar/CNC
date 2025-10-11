// Example: src/components/RealtimeDashboard.js
import React, { useState, useEffect } from 'react';
import dataService from '../services/DataService';

const RealtimeDashboard = ({ machineId }) => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [oeeData, setOeeData] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Initialize and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Initialize DataService (only once)
        await dataService.initialize(true, 5000); // Poll every 5 seconds
        
        // Load initial data for selected machine
        await loadMachineData();
        
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup on unmount
    return () => {
      dataService.stopPolling();
    };
  }, []);

  // Load machine-specific data
  const loadMachineData = async () => {
    if (!machineId) return;

    try {
      // Fetch all required data in parallel
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
      if (event.type === 'update') {
        // Reload data when update occurs
        loadMachineData();
      } else if (event.type === 'error') {
        setError(event.error.message);
      }
    });

    return () => unsubscribe();
  }, [machineId]);

  // Reload when machine changes
  useEffect(() => {
    if (machineId) {
      loadMachineData();
    }
  }, [machineId]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={loadMachineData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="realtime-dashboard">
      <div className="dashboard-header">
        <h2>Real-time Monitor - Machine {machineId}</h2>
        <div className="update-info">
          Last Update: {lastUpdate?.toLocaleTimeString()}
        </div>
      </div>

      {/* OEE Gauges */}
      <div className="oee-section">
        <div className="gauge-container">
          <GaugeChart
            title="OEE"
            value={oeeData?.current_oee || 0}
            previousValue={oeeData?.previous_oee || 0}
          />
          <GaugeChart
            title="Availability"
            value={oeeData?.availability || 0}
            color="#4CAF50"
          />
          <GaugeChart
            title="Performance"
            value={oeeData?.performance || 0}
            color="#2196F3"
          />
          <GaugeChart
            title="Quality"
            value={oeeData?.quality || 0}
            color="#FF9800"
          />
        </div>
      </div>

      {/* Current Parameters */}
      <div className="parameters-section">
        <h3>Current Parameters</h3>
        <div className="parameters-grid">
          <ParameterCard
            label="State"
            value={realtimeData?.state || 'Unknown'}
            icon="⚙️"
          />
          <ParameterCard
            label="Cutting Speed"
            value={`${realtimeData?.cutting_speed?.toFixed(1) || 0} mm/s`}
            icon="⚡"
          />
          <ParameterCard
            label="Material"
            value={realtimeData?.material || 'N/A'}
            icon="📦"
          />
          <ParameterCard
            label="Thickness"
            value={`${realtimeData?.tickness?.toFixed(1) || 0} mm`}
            icon="📏"
          />
          <ParameterCard
            label="Current"
            value={`${realtimeData?.current_marking?.toFixed(1) || 0} A`}
            icon="🔌"
          />
          <ParameterCard
            label="Technology"
            value={realtimeData?.technology_name || 'N/A'}
            icon="🔧"
          />
        </div>
      </div>

      {/* Timeline Gantt Chart */}
      <div className="timeline-section">
        <h3>Machine Timeline (24h)</h3>
        <GanttChart data={timeline?.overview || []} />
      </div>

      {/* Status Filter Buttons */}
      <div className="status-filter">
        <button onClick={() => setFilterStatus('overview')}>Overview</button>
        <button onClick={() => setFilterStatus('Work')}>Work</button>
        <button onClick={() => setFilterStatus('Error')}>Error</button>
        <button onClick={() => setFilterStatus('Idle')}>Idle</button>
        <button onClick={() => setFilterStatus('Wait')}>Wait</button>
        <button onClick={() => setFilterStatus('Stop')}>Stop</button>
      </div>
    </div>
  );
};

// Helper Components
const GaugeChart = ({ title, value, previousValue, color = '#9C27B0' }) => (
  <div className="gauge">
    <h4>{title}</h4>
    <div className="gauge-value" style={{ color }}>
      {value.toFixed(1)}%
    </div>
    {previousValue && (
      <div className="gauge-trend">
        {value > previousValue ? '↑' : '↓'} {Math.abs(value - previousValue).toFixed(1)}%
      </div>
    )}
  </div>
);

const ParameterCard = ({ label, value, icon }) => (
  <div className="parameter-card">
    <div className="parameter-icon">{icon}</div>
    <div className="parameter-content">
      <div className="parameter-label">{label}</div>
      <div className="parameter-value">{value}</div>
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
    return colors[status] || '#757575';
  };

  return (
    <div className="gantt-chart">
      {data.map((entry, idx) => (
        <div
          key={idx}
          className="gantt-bar"
          style={{
            backgroundColor: getStatusColor(entry.status),
            width: `${(entry.duration / 86400) * 100}%`, // 86400 seconds in a day
          }}
          title={`${entry.status}: ${(entry.duration / 60).toFixed(1)} minutes`}
        />
      ))}
    </div>
  );
};

export default RealtimeDashboard;


// ==================== HISTORICAL ANALYSIS EXAMPLE ====================

// Example: src/components/HistoricalAnalysis.js
export const HistoricalAnalysis = ({ machineId }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [historicalData, setHistoricalData] = useState([]);
  const [oeeMetrics, setOeeMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistoricalData();
  }, [machineId, timeRange]);

  const loadHistoricalData = async () => {
    setLoading(true);
    try {
      const [oee, history] = await Promise.all([
        dataService.getMachineOEEMetrics(machineId, timeRange),
        dataService.getMultiMetricHistory(
          machineId,
          ['cutting_speed', 'current_marking', 'tickness'],
          timeRange
        )
      ]);

      setOeeMetrics(oee);
      setHistoricalData(history);
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="historical-analysis">
      <div className="time-range-selector">
        <button onClick={() => setTimeRange('1h')}>1 Hour</button>
        <button onClick={() => setTimeRange('24h')}>24 Hours</button>
        <button onClick={() => setTimeRange('7d')}>7 Days</button>
        <button onClick={() => setTimeRange('30d')}>30 Days</button>
      </div>

      <div className="metrics-summary">
        <MetricCard title="OEE" value={oeeMetrics?.oee} unit="%" />
        <MetricCard title="Availability" value={oeeMetrics?.availability} unit="%" />
        <MetricCard title="Performance" value={oeeMetrics?.performance} unit="%" />
        <MetricCard title="Quality" value={oeeMetrics?.quality} unit="%" />
      </div>

      <div className="charts-section">
        <LineChart
          data={historicalData}
          xKey="time"
          yKeys={['cutting_speed', 'current_marking']}
          title="Performance Metrics Over Time"
        />
      </div>
    </div>
  );
};


// ==================== ERROR ANALYSIS EXAMPLE ====================

// Example: src/components/ErrorAnalysis.js
export const ErrorAnalysis = ({ machineId }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    loadErrorData();
  }, [machineId, timeRange]);

  const loadErrorData = async () => {
    try {
      const data = await dataService.getErrorAnalysis(machineId, timeRange);
      setErrorData(data);
    } catch (error) {
      console.error('Error loading error analysis:', error);
    }
  };

  return (
    <div className="error-analysis">
      <h2>Error Analysis - Machine {machineId}</h2>
      
      <div className="error-kpis">
        <KPI
          title="Total Errors"
          value={errorData?.totalErrors || 0}
          icon="⚠️"
        />
        <KPI
          title="Error Rate"
          value={`${errorData?.errorRate?.toFixed(2) || 0}%`}
          icon="📊"
        />
      </div>

      <div className="error-types-table">
        <h3>Error Types</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Count</th>
              <th>Level</th>
              <th>Last Occurrence</th>
            </tr>
          </thead>
          <tbody>
            {errorData?.errorTypes?.map((error, idx) => (
              <tr key={idx}>
                <td>{error.code}</td>
                <td>{error.text}</td>
                <td>{error.count}</td>
                <td>{error.level}</td>
                <td>{new Date(error.last).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, unit }) => (
  <div className="metric-card">
    <h4>{title}</h4>
    <div className="metric-value">
      {value?.toFixed(1) || 0}
      <span className="unit">{unit}</span>
    </div>
  </div>
);

const KPI = ({ title, value, icon }) => (
  <div className="kpi-card">
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-content">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
    </div>
  </div>
);