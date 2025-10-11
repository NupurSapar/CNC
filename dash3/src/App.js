import React, { useState, useEffect, useRef } from 'react';
import { Factory, BarChart2, Activity, TrendingUp, AlertCircle, Download, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// API Service
const API_BASE = 'http://localhost:5000/api';

const fetchAPI = async (endpoint) => {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.json();
};

// Color Scheme
const COLORS = {
  primary: '#FF6600',
  success: '#52C41A',
  warning: '#FFA940',
  error: '#FF4D4F',
  info: '#1890FF',
  running: '#52C41A',
  idle: '#FFA940',
  error_state: '#FF4D4F',
  stopped: '#8C8C8C',
  drilling: '#3b82f6',
  off: '#94a3b8',
  wait: '#f97316'
};

// Gauge Component
const GaugeChart = ({ value, title, color = COLORS.primary }) => {
  const safeValue = Math.min(Math.max(value || 0, 0), 100);
  const data = [
    { value: safeValue, fill: color },
    { value: 100 - safeValue, fill: '#E8E8E8' }
  ];

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>{title}</div>
      <div style={{ position: 'relative', height: '200px' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} cx="50%" cy="60%" startAngle={225} endAngle={-45} innerRadius={60} outerRadius={80} dataKey="value" />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -20%)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>{safeValue.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

// Speedometer Component
const SpeedometerChart = ({ value, maxValue = 500, title = "Speed" }) => {
  const safeValue = Math.min(Math.max(value || 0, 0), maxValue);
  const percentage = (safeValue / maxValue) * 100;
  
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>{title}</div>
      <div style={{ position: 'relative', height: '150px' }}>
        <div style={{ width: '100%', height: '10px', background: '#E8E8E8', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: `linear-gradient(90deg, ${COLORS.success}, ${COLORS.warning}, ${COLORS.error})`, transition: 'width 0.5s' }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '28px', fontWeight: '700', color: '#333' }}>
          {safeValue.toFixed(1)} <span style={{ fontSize: '16px', color: '#999' }}>mm/s</span>
        </div>
      </div>
    </div>
  );
};

// Binary Indicator Component
const BinaryIndicator = ({ label, isActive }) => (
  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', background: isActive ? '#F6FFED' : '#FFF2F0' }}>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{label}</div>
    <div style={{
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: isActive ? COLORS.running : COLORS.error,
      margin: '0 auto',
      boxShadow: isActive ? `0 0 10px ${COLORS.running}` : 'none'
    }} />
    <div style={{ fontSize: '14px', fontWeight: '600', color: isActive ? COLORS.running : COLORS.error, marginTop: '6px' }}>
      {isActive ? 'ON' : 'OFF'}
    </div>
  </div>
);

// Real-time Dashboard with 10s refresh and scroll preservation
const RealtimeDashboard = ({ machineId }) => {
  const [realtimeData, setRealtimeData] = useState(null);
  const [oeeData, setOeeData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [historicalChartData, setHistoricalChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const scrollPositionRef = useRef(0);
  const currentMachineRef = useRef(machineId);

  useEffect(() => {
    currentMachineRef.current = machineId;
  }, [machineId]);

  useEffect(() => {
    if (!machineId) return;
    
    const loadData = async () => {
      // Don't update if machine changed
      if (currentMachineRef.current !== machineId) return;
      
      // Save scroll position
      scrollPositionRef.current = window.scrollY;
      
      try {
        if (loading) setLoading(true);
        
        const [realtime, oee, timeline, historical] = await Promise.all([
          fetchAPI(`/machines/${machineId}/realtime`),
          fetchAPI(`/machines/${machineId}/oee?range=24h`),
          fetchAPI(`/machines/${machineId}/timeline?range=24h`),
          fetchAPI(`/machines/${machineId}/historical?range=1h`)
        ]);
        
        // Only update if still on same machine
        if (currentMachineRef.current !== machineId) return;
        
        setRealtimeData(realtime.data);
        setOeeData(oee);
        setTimelineData(timeline.timeline);
        
        // Process historical data - add timestamps with 10s intervals
        const chartData = historical.data.slice(-50).map((d, idx) => {
          const timestamp = new Date(d.time);
          return {
            time: `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`,
            current: d.current || 0,
            speed: d.cutting_speed || 0
          };
        });
        setHistoricalChartData(chartData);
        
        setLoading(false);
        setLastUpdate(new Date());
        
        // Restore scroll position after render
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
        }, 0);
      } catch (error) {
        console.error('Error loading data:', error);
        if (loading) setLoading(false);
      }
    };

    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [machineId]);

  if (loading && !realtimeData) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!realtimeData) return <div style={{ padding: '40px', textAlign: 'center' }}>No data available</div>;

  const isRunning = realtimeData.state === 'Running';
  const isProgramActive = realtimeData.program_state === 'ACTIVE';
  const isDrilling = realtimeData.drilling > 0;
  const isMarking = realtimeData.current > 0;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Real-time Monitor - {machineId}</h2>
        <div style={{ fontSize: '12px', color: '#999' }}>
          🔄 Auto-refresh: 10s | Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
      
      {/* Binary Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <BinaryIndicator label="Machine State" isActive={isRunning} />
        <BinaryIndicator label="Program State" isActive={isProgramActive} />
        <BinaryIndicator label="Marking" isActive={isMarking} />
        <BinaryIndicator label="Drilling" isActive={isDrilling} />
      </div>

      {/* Current and Speed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <GaugeChart value={(realtimeData.current / 150) * 100} title={`Current: ${realtimeData.current.toFixed(2)} A`} color={COLORS.primary} />
        <SpeedometerChart value={realtimeData.cutting_speed} maxValue={500} title="Cutting Speed" />
      </div>

      {/* OEE Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <GaugeChart value={oeeData?.oee || 0} title="OEE" color={COLORS.primary} />
        <GaugeChart value={oeeData?.availability || 0} title="Availability" color={COLORS.success} />
        <GaugeChart value={oeeData?.performance || 0} title="Performance" color={COLORS.info} />
        <GaugeChart value={oeeData?.quality || 0} title="Quality" color={COLORS.warning} />
      </div>

      {/* Enhanced Gantt Chart with Legend */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} key={`gantt-${lastUpdate.getTime()}`}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Machine Timeline (24h) - Updates every 10s</h3>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', paddingBottom: '12px', borderBottom: '2px solid #F0F0F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: COLORS.running, borderRadius: '4px', border: '1px solid #ddd' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Running</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: COLORS.drilling, borderRadius: '4px', border: '1px solid #ddd' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Drilling</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: COLORS.idle, borderRadius: '4px', border: '1px solid #ddd' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Idle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: COLORS.off, borderRadius: '4px', border: '1px solid #ddd' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Off</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: COLORS.wait, borderRadius: '4px', border: '1px solid #ddd' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Wait</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: COLORS.error, borderRadius: '4px', border: '1px solid #ddd' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Error</span>
          </div>
        </div>
        
        {/* Timeline Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Overview</div>
          <div style={{ height: '50px', background: '#F5F5F5', borderRadius: '8px', display: 'flex', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
            {timelineData?.overview?.map((block, i) => {
              const colors = {
                Running: COLORS.running,
                Drilling: COLORS.drilling,
                Idle: COLORS.idle,
                Error: COLORS.error,
                Stopped: COLORS.stopped,
                Off: COLORS.off,
                Wait: COLORS.wait
              };
              const totalDuration = timelineData.overview.reduce((sum, b) => sum + (b.duration || 0), 0);
              const width = totalDuration > 0 ? (block.duration / totalDuration) * 100 : 0;
              
              if (width <= 0) return null;
              
              return (
                <div
                  key={i}
                  style={{
                    width: `${width}%`,
                    background: colors[block.status] || '#CCC',
                    borderRight: '1px solid white',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    minWidth: '2px'
                  }}
                  title={`${block.status}: ${(block.duration / 60).toFixed(1)} min`}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                />
              );
            })}
          </div>
        </div>

        {/* Individual Status Rows */}
        {['Running', 'Drilling', 'Idle', 'Error', 'Stopped'].map(statusType => {
          const statusData = timelineData?.[statusType] || [];
          if (statusData.length === 0) return null;

          const colors = {
            Running: COLORS.running,
            Drilling: COLORS.drilling,
            Idle: COLORS.idle,
            Error: COLORS.error,
            Stopped: COLORS.stopped
          };

          const totalDuration = statusData.reduce((sum, d) => sum + (d.duration || 0), 0);

          return (
            <div key={statusType} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{statusType}</div>
              <div style={{ height: '30px', background: '#F5F5F5', borderRadius: '6px', display: 'flex', overflow: 'hidden' }}>
                {statusData.map((item, idx) => {
                  const width = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;
                  if (width <= 0) return null;

                  return (
                    <div
                      key={idx}
                      style={{
                        width: `${width}%`,
                        background: colors[statusType],
                        borderRight: '1px solid white',
                        cursor: 'pointer',
                        minWidth: '2px'
                      }}
                      title={`${Math.round(item.duration)}s`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Line Charts - FIXED FOR AUTO REFRESH */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Current (Amperes) - Real-time (10s intervals)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalChartData} key={`current-${lastUpdate.getTime()}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                style={{ fontSize: '11px' }} 
                interval={Math.floor(historicalChartData.length / 6)}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke={COLORS.primary} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Cutting Speed (mm/s) - Real-time (10s intervals)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalChartData} key={`speed-${lastUpdate.getTime()}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                style={{ fontSize: '11px' }} 
                interval={Math.floor(historicalChartData.length / 6)}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke={COLORS.success} 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Historical Dashboard with Date Range Picker
const HistoricalDashboard = ({ machineId }) => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString().split('T')[0];
  });
  const [oeeData, setOeeData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [oeeHistorical, setOeeHistorical] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Calculate time range from dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const diffMs = end - start;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        let timeRange = '24h';
        if (diffDays <= 1) timeRange = '24h';
        else if (diffDays <= 7) timeRange = '7d';
        else if (diffDays <= 30) timeRange = '30d';
        else timeRange = '1y';
        
        const [oee, historical] = await Promise.all([
          fetchAPI(`/machines/${machineId}/oee?range=${timeRange}`),
          fetchAPI(`/machines/${machineId}/historical?range=${timeRange}`)
        ]);
        
        // Filter data based on selected date range
        const filteredData = historical.data.filter(d => {
          const dataDate = new Date(d.time);
          return dataDate >= start && dataDate <= end;
        });
        
        setOeeData(oee);
        setHistoricalData(filteredData);
        
        // Generate OEE time series from filtered data
        const groupedData = {};
        filteredData.forEach(d => {
          const timeKey = new Date(d.time).toLocaleDateString();
          if (!groupedData[timeKey]) {
            groupedData[timeKey] = { 
              date: timeKey, 
              records: [],
              runningCount: 0,
              totalCount: 0,
              speeds: [],
              errors: 0
            };
          }
          groupedData[timeKey].totalCount++;
          groupedData[timeKey].records.push(d);
          if (d.state === 'Running') groupedData[timeKey].runningCount++;
          if (d.cutting_speed > 0) groupedData[timeKey].speeds.push(d.cutting_speed);
          if (d.error_code) groupedData[timeKey].errors++;
        });
        
        // Calculate actual OEE metrics from data
        const oeeHistory = Object.entries(groupedData).map(([date, data]) => {
          const availability = data.totalCount > 0 ? (data.runningCount / data.totalCount) * 100 : 0;
          const avgSpeed = data.speeds.length > 0 ? data.speeds.reduce((a, b) => a + b, 0) / data.speeds.length : 0;
          const performance = avgSpeed > 0 ? (avgSpeed / 500.0) * 100 : 0;
          const quality = data.totalCount > 0 ? (1 - (data.errors / data.totalCount)) * 100 : 100;
          const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
          
          return {
            date,
            oee: parseFloat(oee.toFixed(2)),
            availability: parseFloat(availability.toFixed(2)),
            performance: parseFloat(performance.toFixed(2)),
            quality: parseFloat(quality.toFixed(2))
          };
        });
        
        setOeeHistorical(oeeHistory);
        setLoading(false);
      } catch (error) {
        console.error('Error loading historical data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [machineId, startDate, endDate]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  // Process data for charts
  const materialData = {};
  const gasTypeData = {};
  const scrapData = { scrap: 0, good: 0 };
  const overrideData = { override: 0, normal: 0 };
  const thicknessDepthData = [];

  historicalData.forEach(d => {
    if (d.material) materialData[d.material] = (materialData[d.material] || 0) + 1;
    if (d.gas_type) gasTypeData[d.gas_type] = (gasTypeData[d.gas_type] || 0) + 1;
    if (d.scrap_cut) scrapData.scrap++; else scrapData.good++;
    if (d.override_flag) overrideData.override++; else overrideData.normal++;
    if (d.thickness && d.drilling_depth) {
      thicknessDepthData.push({ thickness: d.thickness, depth: d.drilling_depth });
    }
  });

  const materialChart = Object.entries(materialData).map(([name, value]) => ({ name, value }));
  const gasTypeChart = Object.entries(gasTypeData).map(([name, value]) => ({ name, value }));
  const scrapChart = [
    { name: 'Good Parts', value: scrapData.good },
    { name: 'Scrap', value: scrapData.scrap }
  ];
  const overrideChart = [
    { name: 'Normal', value: overrideData.normal },
    { name: 'Override', value: overrideData.override }
  ];

  const CHART_COLORS = ['#FF6600', '#52C41A', '#1890FF', '#FFA940', '#FF4D4F', '#722ED1'];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Historical Analysis - {machineId}</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D9D9D9', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D9D9D9', fontSize: '14px' }}
            />
          </div>
        </div>
      </div>

      {/* OEE Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <GaugeChart value={oeeData?.oee || 0} title="OEE" color={COLORS.primary} />
        <GaugeChart value={oeeData?.availability || 0} title="Availability" color={COLORS.success} />
        <GaugeChart value={oeeData?.performance || 0} title="Performance" color={COLORS.info} />
        <GaugeChart value={oeeData?.quality || 0} title="Quality" color={COLORS.warning} />
      </div>

      {/* OEE Trends */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>OEE Metrics Over Time (Calculated from actual data)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={oeeHistorical}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
            <YAxis style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="oee" stroke={COLORS.primary} strokeWidth={2} name="OEE %" />
            <Line type="monotone" dataKey="availability" stroke={COLORS.success} strokeWidth={2} name="Availability %" />
            <Line type="monotone" dataKey="performance" stroke={COLORS.info} strokeWidth={2} name="Performance %" />
            <Line type="monotone" dataKey="quality" stroke={COLORS.warning} strokeWidth={2} name="Quality %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Override & Material */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Override Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overrideChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.info} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Material Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={materialChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.success} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gas Type & Scrap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Gas Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={gasTypeChart} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {gasTypeChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Scrap Cut Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scrapChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="value">
                {scrapChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.success : COLORS.error} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thickness vs Drilling Depth Scatter */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Thickness vs Drilling Depth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="thickness" name="Thickness" unit="mm" style={{ fontSize: '12px' }} />
            <YAxis dataKey="depth" name="Drilling Depth" unit="mm" style={{ fontSize: '12px' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Thickness vs Depth" data={thicknessDepthData} fill={COLORS.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Error Analysis Dashboard
const ErrorAnalysisDashboard = ({ machineId }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [errorData, setErrorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machineId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const errors = await fetchAPI(`/machines/${machineId}/errors?range=${timeRange}`);
        setErrorData(errors);
        setLoading(false);
      } catch (error) {
        console.error('Error loading error data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [machineId, timeRange]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const errorCodeFrequency = {};
  const errorLevelData = {};
  const errorTextData = {};
  const arcErrorData = { arcError: errorData?.arcErrors || 0, noError: (errorData?.totalErrors || 0) - (errorData?.arcErrors || 0) };

  errorData?.errorTypes?.forEach(error => {
    errorCodeFrequency[error.code] = error.count;
    errorLevelData[`Level ${error.level}`] = (errorLevelData[`Level ${error.level}`] || 0) + error.count;
    errorTextData[error.text] = (errorTextData[error.text] || 0) + error.count;
  });

  const errorCodeChart = Object.entries(errorCodeFrequency).map(([code, count]) => ({ code, count }));
  const errorLevelChart = Object.entries(errorLevelData).map(([level, count]) => ({ level, count }));
  const errorTextChart = Object.entries(errorTextData).map(([text, count]) => ({ text: text.substring(0, 20), count, fullText: text }));
  const arcErrorChart = [
    { name: 'Arc Errors', value: arcErrorData.arcError },
    { name: 'Other Errors', value: arcErrorData.noError }
  ];

  const CHART_COLORS = ['#FF4D4F', '#FF7A45', '#FFA940', '#FFC53D', '#FFEC3D', '#BAE637'];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Error Analysis - {machineId}</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #D9D9D9', fontSize: '14px', cursor: 'pointer' }}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last Month</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Error KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Errors</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.error }}>{errorData?.totalErrors || 0}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Arc Errors</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.warning }}>{errorData?.arcErrors || 0}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Error Rate</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.primary }}>{errorData?.errorRate?.toFixed(2) || 0}%</div>
        </div>
      </div>

      {/* Error Code & Arc Error */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Error Code Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorCodeChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="code" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.error} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Arc Error Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={arcErrorChart} 
                cx="50%" 
                cy="45%" 
                outerRadius={90} 
                dataKey="value" 
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                labelLine={{ stroke: '#999', strokeWidth: 1 }}
              >
                {arcErrorChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.error : COLORS.success} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} errors`, name]} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value} (${entry.payload.value} errors)`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Text & Level */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Error Text Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={errorTextChart} 
                cx="50%" 
                cy="45%" 
                outerRadius={90} 
                dataKey="count" 
                label={({ text, count, percent }) => count > 3 ? `${text}: ${count}` : ''}
                labelLine={{ stroke: '#999', strokeWidth: 1 }}
                nameKey="text"
              >
                {errorTextChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} occurrences`, name]} />
              <Legend 
                verticalAlign="bottom" 
                height={56}
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => value.length > 25 ? value.substring(0, 25) + '...' : value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Error Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorLevelChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="count">
                {errorLevelChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Details Table */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Error Details</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '2px solid #E8E8E8' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Error Code</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Level</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Count</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Last Occurrence</th>
              </tr>
            </thead>
            <tbody>
              {errorData?.errorTypes?.map((error, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace', color: COLORS.error }}>{error.code}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{error.text}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: error.level >= 4 ? '#FFF2F0' : (error.level >= 3 ? '#FFF7E6' : '#F6FFED'),
                      color: error.level >= 4 ? COLORS.error : (error.level >= 3 ? COLORS.warning : COLORS.success)
                    }}>
                      Level {error.level}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{error.count}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {new Date(error.last).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!errorData?.errorTypes || errorData.errorTypes.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                    No errors recorded in this time period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [currentPage, setCurrentPage] = useState('machines');
  const [dashboardTab, setDashboardTab] = useState('realtime');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMachines = async () => {
      try {
        setLoading(true);
        const result = await fetchAPI('/machines');
        setMachines(result.machines || []);
        if (result.machines && result.machines.length > 0 && !selectedMachine) {
          setSelectedMachine(result.machines[0].machine_id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading machines:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadMachines();
    const interval = setInterval(loadMachines, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMachineSelect = (machineId) => {
    setSelectedMachine(machineId);
    setCurrentPage('dashboard');
    setDashboardTab('realtime');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F5F5F5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E8E8E8', borderTop: '4px solid #FF6600', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '16px', color: '#666' }}>Loading machines...</div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F5F5F5' }}>
        <AlertCircle size={48} color={COLORS.error} />
        <div style={{ fontSize: '18px', color: COLORS.error, marginTop: '16px', marginBottom: '8px' }}>Connection Error</div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>{error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 24px', background: COLORS.primary, color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'white', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #F0F0F0' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.primary }}>🏭 CNC Monitor</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Real-time Dashboard</div>
        </div>

        <div style={{ flex: 1, padding: '16px 0' }}>
          <div 
            onClick={() => setCurrentPage('machines')}
            style={{
              padding: '12px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: currentPage === 'machines' ? '#FFF7F0' : 'transparent',
              borderLeft: currentPage === 'machines' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
              color: currentPage === 'machines' ? COLORS.primary : '#333'
            }}
          >
            <Factory size={20} />
            <span style={{ fontWeight: currentPage === 'machines' ? '600' : '400' }}>Machines</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', background: '#F0F0F0', padding: '2px 8px', borderRadius: '10px' }}>{machines.length}</span>
          </div>

          {selectedMachine && (
            <div 
              onClick={() => setCurrentPage('dashboard')}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: currentPage === 'dashboard' ? '#FFF7F0' : 'transparent',
                borderLeft: currentPage === 'dashboard' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                color: currentPage === 'dashboard' ? COLORS.primary : '#333'
              }}
            >
              <BarChart2 size={20} />
              <span style={{ fontWeight: currentPage === 'dashboard' ? '600' : '400' }}>Dashboard</span>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F0F0', fontSize: '12px', color: '#999' }}>
          <div>Connected: {machines.filter(m => m.state === 'Running').length}/{machines.length}</div>
          <div style={{ marginTop: '4px' }}>v1.0.0</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ background: 'white', padding: '20px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
              {currentPage === 'machines' ? 'Machines' : `Dashboard - ${selectedMachine}`}
            </h1>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {currentPage === 'dashboard' && `${dashboardTab.charAt(0).toUpperCase() + dashboardTab.slice(1)} View`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentPage === 'machines' && (
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Select a Machine</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '16px', background: '#F6FFED', color: COLORS.success, fontSize: '14px' }}>
                    ● Running: {machines.filter(m => m.state === 'Running').length}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '16px', background: '#FFF7E6', color: COLORS.idle, fontSize: '14px' }}>
                    ● Idle: {machines.filter(m => m.state === 'Idle').length}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '16px', background: '#FFF2F0', color: COLORS.error, fontSize: '14px' }}>
                    ● Error: {machines.filter(m => m.state === 'Error').length}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {machines.map(machine => {
                  const isRunning = machine.state === 'Running';
                  const hasError = machine.error_code != null;
                  
                  return (
                    <div 
                      key={machine.machine_id}
                      onClick={() => handleMachineSelect(machine.machine_id)}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: selectedMachine === machine.machine_id ? `0 4px 16px ${COLORS.primary}40` : '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: selectedMachine === machine.machine_id ? `2px solid ${COLORS.primary}` : '2px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{machine.machine_id}</div>
                          <div style={{ fontSize: '14px', color: '#666' }}>{machine.technology_name || 'N/A'}</div>
                        </div>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: isRunning ? COLORS.running : (hasError ? COLORS.error : COLORS.idle),
                          boxShadow: isRunning ? `0 0 10px ${COLORS.running}` : 'none'
                        }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>State</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: isRunning ? COLORS.running : COLORS.error }}>{machine.state}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Material</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{machine.material || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Speed</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{machine.cutting_speed?.toFixed(1) || 0} mm/s</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Current</div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{machine.current?.toFixed(2) || 0} A</div>
                        </div>
                      </div>

                      <button style={{
                        width: '100%',
                        padding: '10px',
                        background: selectedMachine === machine.machine_id ? COLORS.primary : '#F5F5F5',
                        color: selectedMachine === machine.machine_id ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}>
                        {selectedMachine === machine.machine_id ? 'Selected' : 'View Dashboard'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentPage === 'dashboard' && selectedMachine && (
            <div>
              {/* Dashboard Tabs */}
              <div style={{ background: 'white', borderBottom: '1px solid #F0F0F0', display: 'flex', gap: '32px', padding: '0 32px' }}>
                <div
                  onClick={() => setDashboardTab('realtime')}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    borderBottom: dashboardTab === 'realtime' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                    color: dashboardTab === 'realtime' ? COLORS.primary : '#666',
                    fontWeight: dashboardTab === 'realtime' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Activity size={18} />
                  Real-time
                </div>
                <div
                  onClick={() => setDashboardTab('historical')}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    borderBottom: dashboardTab === 'historical' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                    color: dashboardTab === 'historical' ? COLORS.primary : '#666',
                    fontWeight: dashboardTab === 'historical' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <TrendingUp size={18} />
                  Historical
                </div>
                <div
                  onClick={() => setDashboardTab('errors')}
                  style={{
                    padding: '16px 0',
                    cursor: 'pointer',
                    borderBottom: dashboardTab === 'errors' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                    color: dashboardTab === 'errors' ? COLORS.primary : '#666',
                    fontWeight: dashboardTab === 'errors' ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={18} />
                  Error Analysis
                </div>
              </div>

              {/* Dashboard Content */}
              {dashboardTab === 'realtime' && <RealtimeDashboard machineId={selectedMachine} />}
              {dashboardTab === 'historical' && <HistoricalDashboard machineId={selectedMachine} />}
              {dashboardTab === 'errors' && <ErrorAnalysisDashboard machineId={selectedMachine} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;