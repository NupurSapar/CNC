// src/components/Layout.js
import React from 'react';
import { Factory, BarChart2, Scissors, Repeat, Wrench, Settings, LogOut, Bell } from 'lucide-react';
import logoImage from '../elliot.png';

// All layout-related components and styles
const layoutStyles = {
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
  contentArea: {
    padding: '24px'
  }
};

const Sidebar = ({ page, onPageChange, machines }) => {
  const navItems = [
    { key: 'machines', icon: <Factory size={20} />, label: 'Machines', 
      badge: machines.filter(m => m.status === 'Active').length },
    { key: 'dashboard', icon: <BarChart2 size={20} />, label: 'Dashboard' }
  ];

  return (
    <div style={layoutStyles.sidebar}>
      {/* Logo */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f0f0f0' }}>
        <img src={logoImage} alt="Logo" style={{ width: '50px', height: '50px', borderRadius: '0%' }} />
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Elliot Systems</div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '20px 0' }}>
        {navItems.map(item => (
          <div 
            key={item.key}
            style={{
              padding: '12px 20px', margin: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px',
              cursor: 'pointer', borderRadius: '8px', transition: 'all 0.3s',
              color: page === item.key ? 'white' : '#333',
              background: page === item.key ? '#FF6600B3' : 'transparent'
            }}
            onClick={() => onPageChange(item.key)}
            onMouseEnter={(e) => {
              if (page !== item.key) e.target.style.background = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              if (page !== item.key) e.target.style.background = 'transparent';
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <div style={{ marginLeft: 'auto', fontSize: '11px', background: '#FF6600B3', 
                color: 'white', padding: '2px 6px', borderRadius: '10px' }}>
                {item.badge}
              </div>
            )}
          </div>
        ))}

        {/* Process sub-menu for dashboard */}
        {page === 'dashboard' && (
          <div style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { icon: <Scissors size={16} />, name: 'Cut' },
              { icon: <Repeat size={16} />, name: 'Blend' },
              { icon: <Wrench size={16} />, name: 'Tubes' }
            ].map((process, index) => (
              <div key={process.name} style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', 
                borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
                color: index === 0 ? '#FF6600B3' : '#333'
              }}>
                {process.icon}
                <span>{process.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div style={{ padding: '20px 0' }}>
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
};

const TopBar = ({ page, selectedMachine, timeRange, onTimeRangeChange, notifications, showNotifications, onNotificationToggle, onNotificationClick }) => {
  return (
    <div style={layoutStyles.topBar}>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '600' }}>
          {page === 'dashboard' ? 'Dashboard' : 'Machines'}
        </div>
        {page === 'dashboard' && (
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Monitoring {selectedMachine} • {timeRange} view
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Time Range Selector */}
        {page === 'dashboard' && (
          <select value={timeRange} onChange={(e) => onTimeRangeChange(e.target.value)} 
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d9d9d9', background: 'white', cursor: 'pointer' }}>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        )}
        
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', cursor: 'pointer', fontSize: '20px', padding: '8px', borderRadius: '50%', transition: 'background 0.3s' }}
               onClick={onNotificationToggle}>
            <Bell size={20} />
            <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4d4f', color: 'white', 
                         borderRadius: '10px', padding: '2px 6px', fontSize: '10px', animation: 'pulse 2s infinite' }}>
              {notifications.length}
            </div>
          </div>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '320px', background: 'white', 
                         border: '1px solid #d9d9d9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                         padding: '12px', zIndex: 1000 }}>
              <div style={{ fontWeight: '600', marginBottom: '12px' }}>Notifications</div>
              {notifications.map(notification => (
                <div key={notification.id} style={{ padding: '8px 12px', marginBottom: '8px', borderRadius: '6px', 
                                                   cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s',
                                                   background: notification.type === 'warning' ? '#fffbe6' : '#e6f7ff' }}
                     onClick={() => onNotificationClick(notification)}>
                  {notification.message}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', 
                     padding: '8px 12px', borderRadius: '8px', transition: 'background 0.3s' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1890ff', color: 'white', 
                       display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>N</div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Nupur</div>
            <div style={{ fontSize: '12px', color: '#999' }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ page, onPageChange, machines, selectedMachine, timeRange, onTimeRangeChange, 
                 notifications, showNotifications, onNotificationToggle, onNotificationClick, children }) => {
  return (
    <div style={layoutStyles.container}>
      <Sidebar page={page} onPageChange={onPageChange} machines={machines} />
      <div style={layoutStyles.mainContent}>
        <TopBar 
          page={page} selectedMachine={selectedMachine} timeRange={timeRange} 
          onTimeRangeChange={onTimeRangeChange} notifications={notifications}
          showNotifications={showNotifications} onNotificationToggle={onNotificationToggle}
          onNotificationClick={onNotificationClick}
        />
        <div style={layoutStyles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;