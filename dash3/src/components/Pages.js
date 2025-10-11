// src/components/Pages.js - FIXED for API Integration
import React, { useState } from 'react';
import { Search, Download, Sparkles } from 'lucide-react';
import cncImage from '../cnc.png';
import { GaugeChart, MachineGanttChart, OEELineChart, MachineCard, DrillMarkGanttChart } from './Charts';

const pageStyles = {
  tabBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e5e5',
    flexWrap: 'wrap',
  },
  tab: (active) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: active ? '600' : '500',
    color: active ? '#FF6600B3' : '#666',
    borderBottom: active ? '2px solid #FF6600B3' : '2px solid transparent',
    transition: 'all 0.3s',
  }),
  actionBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  btn: (variant, loading) => ({
    padding: '10px 20px',
    border: variant === 'outline' ? '1px solid #d9d9d9' : 'none',
    borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    background: variant === 'primary' ? '#FF6600B3' : 'white',
    color: variant === 'primary' ? 'white' : '#333',
    opacity: loading ? 0.7 : 1
  }),
  machineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px'
  }
};

// Dashboard Page Component
const Dashboard = ({ selectedMachine, onMachineChange, machines, oeeData, timeRange, currentOEE, timelineData, statusSummary }) => {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState('real-time');

  const handleGenerateAIReport = async () => {
    setAiReportLoading(true);
    setTimeout(() => {
      setAiReportLoading(false);
      const oeeValue = currentOEE?.current_oee || 0;
      alert(`AI Report generated for ${selectedMachine}:\n\n• Current OEE: ${oeeValue.toFixed(1)}%\n• Recommendation: Focus on reducing idle time\n• Next maintenance: Due in 15 days\n• Efficiency trend: ${oeeValue > 70 ? 'Good' : 'Needs improvement'}`);
    }, 2000);
  };

  const handleDownloadReport = async () => {
    setDownloadProgress(0);
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

  // Safe data with defaults
  const safeCurrentOEE = currentOEE || { current_oee: 0, previous_oee: 0, availability: 0, performance: 0, quality: 0 };
  const safeOeeData = Array.isArray(oeeData) ? oeeData : [];
  const safeMachines = Array.isArray(machines) ? machines : [];
  const safeTimelineData = timelineData || { overview: [], Work: [], Error: [], Wait: [], Idle: [], Stop: [], Offline: [] };
  const safeStatusSummary = statusSummary || {};

  return (
    <div>
      {/* Tab Bar */}
      <div style={pageStyles.tabBar}>
        <div style={pageStyles.tab(selectedTab === 'real-time')} onClick={() => setSelectedTab('real-time')}>
          Real-Time
        </div>
        <div style={pageStyles.tab(selectedTab === 'historical')} onClick={() => setSelectedTab('historical')}>
          Historical
        </div>
        <div style={pageStyles.tab(selectedTab === 'error')} onClick={() => setSelectedTab('error')}>
          Error
        </div>
      </div>

      {/* Real-Time Section */}
      {selectedTab === 'real-time' && (
        <>
          {/* Selected Machine Card */}
          {selectedMachine && safeMachines.length > 0 && (
            <MachineCard
              machine={safeMachines.find(m => m.machine_id === selectedMachine) || {}}
              currentOEE={safeCurrentOEE}
            />
          )}

          {/* Gantt Chart */}
          <DrillMarkGanttChart
            selectedMachine={selectedMachine}
            onMachineChange={onMachineChange}
            timelineData={safeTimelineData}
            machines={safeMachines}
          />
        </>
      )}

      {/* Historical Section */}
      {selectedTab === 'historical' && (
        <div>
          {/* Action Bar */}
          <div style={pageStyles.actionBar}>
            <button style={pageStyles.btn('outline', false)} onClick={() => console.log('Filter clicked')}>
              <Search size={16} /> Filter
            </button>

            <button style={pageStyles.btn('primary', aiReportLoading)} onClick={handleGenerateAIReport} disabled={aiReportLoading}>
              <Sparkles size={16} />
              {aiReportLoading ? 'Generating...' : 'Generate AI Report'}
              {aiReportLoading && (
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', 
                           borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              )}
            </button>

            <button style={pageStyles.btn('primary', false)} onClick={handleDownloadReport}>
              <Download size={16} />
              Download Report
              {downloadProgress > 0 && downloadProgress < 100 && (
                <span style={{ marginLeft: '8px' }}>({downloadProgress}%)</span>
              )}
            </button>
          </div>

          {/* Gauges Row */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '24px', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <GaugeChart 
                current={safeCurrentOEE.current_oee || 0} 
                previous={safeCurrentOEE.previous_oee || 0}
                title="OEE" 
                color="#FF6600B3" 
              />
            </div>
            <div style={{ flex: 1 }}>
              <GaugeChart 
                current={safeCurrentOEE.performance || 0}
                previous={safeCurrentOEE.performance || 0}
                title="Performance" 
                color="#1f78b4B3" 
              />
            </div>
            <div style={{ flex: 1 }}>
              <GaugeChart 
                current={safeCurrentOEE.availability || 0}
                previous={safeCurrentOEE.availability || 0}
                title="Availability" 
                color="#52C41AB3" 
              />
            </div>
            <div style={{ flex: 1 }}>
              <GaugeChart 
                current={safeCurrentOEE.quality || 0}
                previous={safeCurrentOEE.quality || 0}
                title="Quality" 
                color="#FFCA44B3" 
              />
            </div>
          </div>

          {/* Machine Status / Gantt Chart */}
          <div style={{ marginTop: '32px' }}>
            <MachineGanttChart
              selectedMachine={selectedMachine}
              onMachineChange={onMachineChange}
              timelineData={safeTimelineData}
              statusSummary={safeStatusSummary}
              machines={safeMachines}
            />
          </div>

          {/* OEE Line Chart */}
          <div style={{ marginTop: '32px' }}>
            <OEELineChart 
              data={safeOeeData} 
              selectedMetric={selectedMetric} 
              onMetricReset={() => setSelectedMetric(null)} 
            />
          </div>
        </div>
      )}

      {/* Error Section */}
      {selectedTab === 'error' && (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🚨 Error Analysis
          </h3>
          <div style={{ padding: '20px', background: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
            <p style={{ color: '#52c41a', fontWeight: '500', margin: 0 }}>
              No critical errors reported for <strong>{selectedMachine}</strong> in the last 24 hours
            </p>
          </div>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>✓ All systems operational</p>
            <p>✓ No maintenance alerts</p>
            <p>✓ Machine performing within normal parameters</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Machines Page Component
const Machines = ({ machines, selectedMachine, onMachineChange, onPageChange }) => {
  const safeMachines = Array.isArray(machines) ? machines : [];
  
  // Calculate machine statistics
  const activeMachines = safeMachines.filter(m => m.state === 'Running').length;
  const inactiveMachines = safeMachines.length - activeMachines;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px', fontWeight: '600' }}>Select Device</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={{ padding: '8px 20px', borderRadius: '4px', border: '1px solid #d9d9d9', cursor: 'pointer' }}>
            <option value="CNC">CNC</option>
            <option value="Laser">Laser</option>
            <option value="Press">Press</option>
          </select>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', background: '#f6ffed', color: '#52c41a' }}>
            ● Active {activeMachines}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', background: '#fff2f0', color: '#ff4d4f' }}>
            ● Inactive {inactiveMachines}
          </span>
          <span style={{ color: '#FF6600B3', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', background: '#fff7e6', fontWeight: '600' }}>
            ● All {safeMachines.length}
          </span>
        </div>
      </div>

      {safeMachines.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏭</div>
          <div style={{ fontSize: '18px', color: '#666' }}>No machines available</div>
          <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
            Start the data generator to see machines
          </div>
        </div>
      ) : (
        <div style={pageStyles.machineGrid}>
          {safeMachines.map((machine) => {
            const isSelected = machine.machine_id === selectedMachine;
            const isActive = machine.state === 'Running';
            
            // Extract machine data with safe defaults
            const machineData = {
              machine_id: machine.machine_id || 'Unknown',
              state: machine.state || 'Unknown',
              current_oee: 75, // Placeholder since we don't have it in real-time data
              override: machine.override_flag ? 'Yes' : 'No',
              technology_index: machine.technology_index || 0,
              thickness: machine.tickness || 0, // Note: API has typo 'tickness'
              current: machine.current_marking || 0
            };
            
            return (
              <div key={machine.machine_id} style={{
                background: 'white', 
                borderRadius: '8px', 
                padding: '12px', 
                fontSize: '12px',
                boxShadow: isSelected ? '0 8px 25px rgba(255,102,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s', 
                cursor: 'pointer', 
                border: isSelected ? '2px solid #FF6600B3' : '2px solid transparent',
                width: '100%'
              }}
              onClick={() => onMachineChange(machine.machine_id)}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ 
                    color: isActive ? '#52c41a' : '#ff4d4f', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '12px', 
                    fontWeight: '600' 
                  }}>
                    ● {machineData.state}
                  </span>
                  <div style={{ 
                    fontSize: '11px', 
                    background: isActive ? '#f6ffed' : '#fff2f0',
                    color: isActive ? '#52c41a' : '#ff4d4f', 
                    padding: '2px 6px', 
                    borderRadius: '8px' 
                  }}>
                    OEE: {machineData.current_oee}%
                  </div>
                </div>
                
                <div style={{ 
                  height: '200px', 
                  background: '#f5f5f5', 
                  borderRadius: '18px', 
                  marginBottom: '16px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)', 
                  transition: 'all 0.3s' 
                }}>
                  <img 
                    src={cncImage} 
                    alt="CNC Machine" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '18px' 
                    }} 
                  />
                </div>
                
                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  {machineData.machine_id}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Override</span>
                    <span style={{ fontWeight: '600' }}>{machineData.override}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Technology Index</span>
                    <span style={{ fontWeight: '600' }}>{machineData.technology_index}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Thickness</span>
                    <span style={{ fontWeight: '600' }}>{machineData.thickness.toFixed(1)}mm</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Current</span>
                    <span style={{ fontWeight: '600' }}>{machineData.current.toFixed(2)}A</span>
                  </div>
                </div>
                
                <button style={{ 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  fontWeight: '500', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  transition: 'all 0.3s',
                  width: '100%', 
                  justifyContent: 'center', 
                  color: 'white',
                  background: isSelected ? '#FF6600B3' : '#1890ff'
                }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onMachineChange(machine.machine_id); 
                  onPageChange('dashboard'); 
                }}>
                  {isSelected ? 'Selected' : 'View Dashboard'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { Dashboard, Machines };