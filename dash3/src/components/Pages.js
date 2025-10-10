// src/components/Pages.js
import React, { useState } from 'react';
import { Search, Download, Sparkles } from 'lucide-react';
import cncImage from '../cnc.png';
import dataService from '../services/DataService.js';
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
  gaugeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
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
      alert(`AI Report generated for ${selectedMachine}:\n\n• Current OEE: ${currentOEE?.current_oee}%\n• Recommendation: Focus on reducing idle time\n• Next maintenance: Due in 15 days\n• Efficiency trend: Improving (+2.1% vs last month)`);
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
    {selectedMachine && (
      <MachineCard
        machine={machines.find(m => m.machine_id === selectedMachine)}
        currentOEE={currentOEE}
      />
    )}

    {/* Gantt Chart */}
    <DrillMarkGanttChart
      selectedMachine={selectedMachine}
      onMachineChange={onMachineChange}
      timelineData={timelineData}
      statusSummary={statusSummary}
      machines={machines}
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
        <GaugeChart current={oeeData.oee} title="OEE" color="#FF6600B3" />
      </div>
      <div style={{ flex: 1 }}>
        <GaugeChart current={oeeData.performance} title="Performance" color="#1f78b4B3" />
      </div>
      <div style={{ flex: 1 }}>
        <GaugeChart current={oeeData.availability} title="Availability" color="#52C41AB3" />
      </div>
      <div style={{ flex: 1 }}>
        <GaugeChart current={oeeData.quality} title="Quality" color="#FFCA44B3" />
      </div>
    </div>

    {/* Machine Status / Gantt Chart */}
    <div style={{ marginTop: '32px' }}>
      <MachineGanttChart
        selectedMachine={selectedMachine}
        onMachineChange={onMachineChange}
        timelineData={timelineData}
        statusSummary={statusSummary}
        machines={machines}
      />
    </div>

    {/* OEELineChart */}
    <div style={{ marginTop: '32px' }}>
      <OEELineChart 
        data={oeeData} 
        selectedMetric={selectedMetric} 
        onMetricReset={() => setSelectedMetric(null)} 
      />
    </div>
  </div>
)}

      {/* Error Section */}
      {selectedTab === 'error' && (
        <div style={{ padding: '20px', color: '#ff4d4f', fontWeight: '500' }}>
          {/* You can replace this with your actual error analytics later */}
          <p>No critical errors reported for <strong>{selectedMachine}</strong> in the last 24 hours 🚨</p>
        </div>
      )}
    </div>
  );
};

// Machines Page Component
const Machines = ({ machines, selectedMachine, onMachineChange, onPageChange }) => {
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
            ● Active {machines.filter(m => m.status === 'Active').length}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', background: '#fff2f0', color: '#ff4d4f' }}>
            ● Inactive {machines.filter(m => m.status === 'Inactive').length}
          </span>
          <span style={{ color: '#FF6600B3', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', background: '#fff7e6', fontWeight: '600' }}>
            ● All {machines.length}
          </span>
        </div>
      </div>

      <div style={pageStyles.machineGrid}>
        {machines.map((machine) => {
          const realtimeData = dataService.getRealtimeData(machine.machine_id);
          const isSelected = machine.machine_id === selectedMachine;
          
          return (
            <div key={machine.machine_id} style={{
              background: 'white', borderRadius: '8px', padding: '12px', fontSize: '12px',
              boxShadow: isSelected ? '0 8px 25px rgba(255,102,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s', cursor: 'pointer', 
              border: isSelected ? '2px solid #FF6600B3' : '2px solid transparent',
              width: '360px'
            }}
            onClick={() => onMachineChange(machine.machine_id)}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: machine.status === 'Active' ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                  ● {machine.status}
                </span>
                <div style={{ fontSize: '11px', background: machine.status === 'Active' ? '#f6ffed' : '#fff2f0',
                           color: machine.status === 'Active' ? '#52c41a' : '#ff4d4f', padding: '2px 6px', borderRadius: '8px' }}>
                  OEE: {machine.current_oee}%
                </div>
              </div>
              
              <div style={{ height: '200px', background: '#f5f5f5', borderRadius: '18px', marginBottom: '16px',
                           display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                           transform: isSelected ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.3s' }}>
                <img src={cncImage} alt="CNC Machine" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
              </div>
              
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{machine.machine_name}</div>
              
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
              
              <button style={{ 
                padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s',
                width: '100%', justifyContent: 'center', color: 'white',
                background: isSelected ? '#FF6600B3' : '#1890ff'
              }}
              onClick={(e) => { e.stopPropagation(); onMachineChange(machine.machine_id); onPageChange('dashboard'); }}>
                {isSelected ? 'Selected' : 'View Dashboard'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Dashboard, Machines };
