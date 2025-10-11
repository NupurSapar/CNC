// src/services/DataService.js

class DataService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.cache = {
      machines: null,
      machineData: {},
      lastUpdate: null
    };
    this.updateInterval = null;
    this.subscribers = [];
  }

  // ==================== UTILITY METHODS ====================
  
  async fetchAPI(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  startPolling(interval = 5000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.refreshAllData();
        this.notifySubscribers({ type: 'update', timestamp: new Date() });
      } catch (error) {
        console.error('Polling error:', error);
        this.notifySubscribers({ type: 'error', error });
      }
    }, interval);
  }

  stopPolling() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async refreshAllData() {
    await this.loadMachines();
    this.cache.lastUpdate = new Date();
  }

  // ==================== MACHINE METHODS ====================

  async loadMachines() {
    try {
      const result = await this.fetchAPI('/machines');
      this.cache.machines = result.machines || [];
      return this.cache.machines;
    } catch (error) {
      console.error('Error loading machines:', error);
      return [];
    }
  }

  getMachines() {
    return this.cache.machines || [];
  }

  getMachine(machineId) {
    const machines = this.getMachines();
    return machines.find(m => m.machine_id === machineId);
  }

  async getRealtimeData(machineId) {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/realtime`);
      this.cache.machineData[machineId] = {
        ...this.cache.machineData[machineId],
        realtime: result.data
      };
      return result.data;
    } catch (error) {
      console.error(`Error getting realtime data for ${machineId}:`, error);
      return null;
    }
  }

  async getCurrentParameters(machineId) {
    return await this.getRealtimeData(machineId);
  }

  // ==================== RAW DATA METHODS ====================

  async getRawOpcuaData(machineId, timeRange = '24h') {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/raw-data?range=${timeRange}`);
      return result.data || [];
    } catch (error) {
      console.error(`Error getting raw data for ${machineId}:`, error);
      return [];
    }
  }

  // ==================== OEE METHODS ====================

  async getOEEMetrics() {
    try {
      const result = await this.fetchAPI('/metrics/oee');
      return result.metrics || [];
    } catch (error) {
      console.error('Error getting OEE metrics:', error);
      return [];
    }
  }

  async getMachineOEEMetrics(machineId, timeRange = '24h') {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/oee?range=${timeRange}`);
      return result;
    } catch (error) {
      console.error(`Error getting OEE for ${machineId}:`, error);
      return {
        oee: 0,
        availability: 0,
        performance: 0,
        quality: 0
      };
    }
  }

  async getCurrentOEE(machineId) {
    try {
      // Get current (24h) and previous (7d) OEE
      const [current, previous] = await Promise.all([
        this.getMachineOEEMetrics(machineId, '24h'),
        this.getMachineOEEMetrics(machineId, '7d')
      ]);

      return {
        current_oee: current.oee,
        previous_oee: previous.oee,
        availability: current.availability,
        performance: current.performance,
        quality: current.quality
      };
    } catch (error) {
      console.error(`Error getting current OEE for ${machineId}:`, error);
      return {
        current_oee: 0,
        previous_oee: 0,
        availability: 0,
        performance: 0,
        quality: 0
      };
    }
  }

  // ==================== TIMELINE METHODS ====================

  async getMachineTimeline(machineId, timeRange = '24h') {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/timeline?range=${timeRange}`);
      return result.timeline || {
        overview: [],
        Work: [],
        Error: [],
        Wait: [],
        Idle: [],
        Stop: [],
        Offline: []
      };
    } catch (error) {
      console.error(`Error getting timeline for ${machineId}:`, error);
      return {
        overview: [],
        Work: [],
        Error: [],
        Wait: [],
        Idle: [],
        Stop: [],
        Offline: []
      };
    }
  }

  // ==================== STATUS SUMMARY METHODS ====================

  async getStatusSummary(machineId, timeRange = '24h') {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/status-summary?range=${timeRange}`);
      return result.summary || {};
    } catch (error) {
      console.error(`Error getting status summary for ${machineId}:`, error);
      return {};
    }
  }

  // ==================== STATISTICS METHODS ====================

  async getParameterStats(machineId, param, timeRange = '24h') {
    try {
      const rawData = await this.getRawOpcuaData(machineId, timeRange);
      
      // Filter and extract parameter values
      const values = rawData
        .map(r => r[param])
        .filter(v => v != null && !isNaN(v));

      if (values.length === 0) return null;

      const sum = values.reduce((a, b) => a + b, 0);
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
        count: values.length
      };
    } catch (error) {
      console.error(`Error getting parameter stats for ${machineId}:`, error);
      return null;
    }
  }

  // ==================== ERROR ANALYSIS METHODS ====================

  async getErrorAnalysis(machineId, timeRange = '24h') {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/errors?range=${timeRange}`);
      return result;
    } catch (error) {
      console.error(`Error getting error analysis for ${machineId}:`, error);
      return {
        totalErrors: 0,
        errorRate: 0,
        errorTypes: [],
        timeRange: { start: null, end: null }
      };
    }
  }

  // ==================== PRODUCTION METHODS ====================

  async getProductionSummary(machineId, timeRange = '24h') {
    try {
      const result = await this.fetchAPI(`/machines/${machineId}/production?range=${timeRange}`);
      return result;
    } catch (error) {
      console.error(`Error getting production summary for ${machineId}:`, error);
      return {
        runningHours: 0,
        totalHours: 0,
        utilizationRate: 0,
        materials: []
      };
    }
  }

  // ==================== HISTORICAL DATA METHODS ====================

  async getHistoricalData(machineId, metric, timeRange = '24h') {
    try {
      const rawData = await this.getRawOpcuaData(machineId, timeRange);
      
      // Format data for charts
      return rawData.map(d => ({
        time: new Date(d.time).toLocaleTimeString(),
        timestamp: d.time,
        value: d[metric],
        ...d
      }));
    } catch (error) {
      console.error(`Error getting historical data for ${machineId}:`, error);
      return [];
    }
  }

  async getMultiMetricHistory(machineId, metrics, timeRange = '24h') {
    try {
      const rawData = await this.getRawOpcuaData(machineId, timeRange);
      
      return rawData.map(d => {
        const entry = {
          time: new Date(d.time).toLocaleTimeString(),
          timestamp: d.time
        };
        
        metrics.forEach(metric => {
          entry[metric] = d[metric];
        });
        
        return entry;
      });
    } catch (error) {
      console.error(`Error getting multi-metric history for ${machineId}:`, error);
      return [];
    }
  }

  // ==================== AGGREGATION METHODS ====================

  async getAggregatedMetrics(machineId, timeRange = '24h', interval = 'hour') {
    try {
      const rawData = await this.getRawOpcuaData(machineId, timeRange);
      
      // Group data by time interval
      const grouped = {};
      
      rawData.forEach(d => {
        const date = new Date(d.time);
        let key;
        
        if (interval === 'hour') {
          key = `${date.getHours()}:00`;
        } else if (interval === 'day') {
          key = date.toLocaleDateString();
        } else {
          key = date.toISOString();
        }
        
        if (!grouped[key]) {
          grouped[key] = {
            time: key,
            cutting_speed: [],
            current_marking: [],
            drilling: [],
            count: 0
          };
        }
        
        grouped[key].cutting_speed.push(d.cutting_speed || 0);
        grouped[key].current_marking.push(d.current_marking || 0);
        grouped[key].drilling.push(d.drilling || 0);
        grouped[key].count++;
      });
      
      // Calculate averages
      return Object.values(grouped).map(g => ({
        time: g.time,
        avgCuttingSpeed: g.cutting_speed.reduce((a, b) => a + b, 0) / g.count,
        avgCurrent: g.current_marking.reduce((a, b) => a + b, 0) / g.count,
        avgDrilling: g.drilling.reduce((a, b) => a + b, 0) / g.count,
        recordCount: g.count
      }));
    } catch (error) {
      console.error(`Error getting aggregated metrics for ${machineId}:`, error);
      return [];
    }
  }

  // ==================== HEALTH CHECK ====================

  async checkHealth() {
    try {
      const result = await this.fetchAPI('/health');
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // ==================== BATCH OPERATIONS ====================

  async loadAllMachineData(machineIds, timeRange = '24h') {
    try {
      const promises = machineIds.map(async (machineId) => {
        const [realtime, oee, timeline, status] = await Promise.all([
          this.getRealtimeData(machineId),
          this.getCurrentOEE(machineId),
          this.getMachineTimeline(machineId, timeRange),
          this.getStatusSummary(machineId, timeRange)
        ]);

        return {
          machineId,
          realtime,
          oee,
          timeline,
          status
        };
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error loading all machine data:', error);
      return [];
    }
  }

  // ==================== INITIALIZATION ====================

  async loadAllData() {
    // Alias for backward compatibility with old CSV-based code
    return await this.initialize(false, 5000);
  }

  async loadAllMachineData() {
    // Load initial machine list - backward compatibility method
    try {
      await this.loadMachines();
      return this.cache.machines || [];
    } catch (error) {
      console.error('Error loading all machine data:', error);
      return [];
    }
  }

  async initialize(startPolling = true, pollInterval = 5000) {
    try {
      console.log('Initializing DataService...');
      
      // Check API health
      const health = await this.checkHealth();
      console.log('API Health:', health);
      
      // Load initial data
      await this.loadMachines();
      console.log('Machines loaded:', this.cache.machines?.length || 0);
      
      // Start polling if requested
      if (startPolling) {
        this.startPolling(pollInterval);
        console.log(`Polling started with ${pollInterval}ms interval`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize DataService:', error);
      return false;
    }
  }

  // ==================== CLEANUP ====================

  cleanup() {
    this.stopPolling();
    this.subscribers = [];
    this.cache = {
      machines: null,
      machineData: {},
      lastUpdate: null
    };
  }
}

// Create singleton instance
const dataService = new DataService();

// Export both the instance and the class
export default dataService;
export { DataService };