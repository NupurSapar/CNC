# CNC Machine Dashboard 

<img width="1894" height="867" alt="image" src="https://github.com/user-attachments/assets/e324c534-6a5a-4c66-be30-ef4396e9ece9" />

A modern, interactive React-based dashboard for monitoring and analyzing CNC machine operations with real-time OEE (Overall Equipment Effectiveness) tracking, status visualization, and comprehensive data analytics.

![Language Distribution](https://img.shields.io/badge/JavaScript-96.0%25-yellow)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Status](https://img.shields.io/badge/Status-Active%20Development-green)

## 📋 Project Overview

This dashboard provides comprehensive monitoring and analysis capabilities for CNC laser machines, featuring real-time data visualization, OEE calculations, and machine timeline tracking. The project serves industrial IoT applications with a focus on manufacturing efficiency and predictive maintenance.

## ✨ Key Features

### 🎯 Real-time Monitoring
- **Live OEE Tracking**: Monitor Overall Equipment Effectiveness with interactive gauge charts
- **Machine Status Dashboard**: Real-time status updates for all connected CNC machines
- **Timeline Visualization**: Interactive Gantt-style timeline showing machine operational states

### 📊 Data Analytics
- **Performance Metrics**: Availability, Performance, and Quality metrics with trend analysis
- **Historical Data**: Time-series analysis with configurable date ranges (1h, 24h, 7d, 30d)
- **Status Summary**: Comprehensive breakdown of Work, Error, Wait, Idle, Stop, and Offline states

### 🔧 Machine Management
- **Multi-machine Support**: Monitor multiple ByStar CNC laser machines simultaneously
- **Interactive Selection**: Click-to-select machine switching with status indicators
- **Parameter Tracking**: Override, technology index, thickness, and current monitoring

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly across desktop and tablet devices
- **Interactive Charts**: Powered by Recharts with hover effects and filtering
- **Smart Notifications**: Real-time alerts for low OEE and maintenance schedules
- **Modular Components**: Clean, maintainable component architecture

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19.2.0**: Modern React with hooks and functional components
- **Recharts 3.2.1**: Interactive data visualization library
- **Lucide React**: Beautiful, customizable icons
- **Create React App**: Standard React build toolchain

### Data Management
- **CSV Data Processing**: Papa Parse for efficient CSV parsing
- **Service Layer Architecture**: Centralized DataService for all data operations
- **Real-time Updates**: Dynamic data loading with state management

### Project Structure
```
dash3/
├── public/
│   └── data/                    # CSV data files
│       ├── machines.csv
│       ├── raw_opcua_data.csv
│       ├── computed_oee_metrics.csv
│       ├── machine_timeline.csv
│       ├── status_summary.csv
│       └── realtime_data.csv
├── src/
│   ├── components/              # Modular React components
│   │   ├── Layout.js           # Sidebar and TopBar components
│   │   ├── Charts.js           # Gauge, Gantt, and Line charts
│   │   └── Pages.js            # Dashboard and Machines pages
│   ├── services/
│   │   └── DataService.js      # Central data management
│   ├── Dash.js                 # Main application component
│   └── assets/                 # Images and static files
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NupurSapar/CNC.git
   cd CNC/dash3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (⚠️ one-way operation)

## 📊 Data Schema

The dashboard processes six main data types:

### Machine Configuration (`machines.csv`)
```csv
machine_id,machine_name,machine_type,status,current_oee,previous_oee,availability,performance,quality,override,technology_index,thickness,current,location,installation_date,last_maintenance
```

### Raw OPC-UA Data (`raw_opcua_data.csv`)
Real-time machine parameters and sensor data

### OEE Metrics (`computed_oee_metrics.csv`)
Calculated efficiency metrics by time period

### Timeline Data (`machine_timeline.csv`)
Operational state transitions and durations

### Status Summary (`status_summary.csv`)
Aggregated status duration statistics

### Real-time Data (`realtime_data.csv`)
Live machine parameters and current values

## 🎮 Usage Guide

### Dashboard Navigation
1. **Sidebar Navigation**: Switch between Machines and Dashboard views
2. **Machine Selection**: Select active machines from the sidebar or machines page
3. **Time Range Control**: Adjust analysis periods using the top-bar dropdown
4. **Notifications**: Click the bell icon to view system alerts

### Interactive Features
- **Gauge Charts**: Click on OEE metrics to highlight corresponding data in charts
- **Timeline Filtering**: Use the filter dropdown to focus on specific operational states
- **Machine Cards**: Click on machine cards to switch context and view details
- **Hover Tooltips**: Hover over charts and timeline blocks for detailed information

## 🔧 Configuration

### Adding New Machines
1. Update `machines.csv` with new machine entries
2. Ensure corresponding data exists in other CSV files
3. Restart the application to load new data

### Customizing Metrics
Modify the `DataService.js` file to:
- Add new calculated metrics
- Adjust OEE calculation parameters
- Configure data aggregation periods

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📈 Recent Updates

- **v1.2.0** (Oct 7, 2024): Code modularization with component separation
- **v1.1.0** (Oct 6, 2024): Added database interactivity and real-time updates
- **v1.0.0** (Oct 6, 2024): Connected dataset integration and core functionality
- **v0.1.0** (Oct 4, 2024): Initial project setup and basic dashboard

## 🏢 Industrial Applications

This dashboard is designed for:
- **Manufacturing Plants**: Monitor CNC machine efficiency and downtime
- **Production Planning**: Optimize schedules based on OEE trends
- **Maintenance Teams**: Track machine health and predict service needs
- **Quality Control**: Monitor performance metrics and quality indicators
- **Operations Management**: Real-time visibility into production status

## 📞 Support & Contact

**Contributors:**
- **Nupur Sapar** - Lead Developer - [@NupurSapar](https://github.com/NupurSapar)
- **Samihan Narayankeri** - Developer - [@Sammychann](https://github.com/Sammychann)
---


