// src/services/DataService.js

import Papa from 'papaparse';

class DataService {
  constructor() {
    this.machines = [];
    this.rawOpcuaData = [];
    this.computedOeeMetrics = [];
    this.machineTimeline = [];
    this.statusSummary = [];
    this.realtimeData = [];
    this.isLoaded = false;
  }

  async loadCSVFile(filename) {
    const response = await fetch(`/data/${filename}`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value) => {
          if (!isNaN(value) && value !== '' && value !== 'NaN') {
            return parseFloat(value);
          }
          if (value === 'true' || value === 'True') return true;
          if (value === 'false' || value === 'False') return false;
          return value;
        },
        complete: (results) => {
          if (results.errors.length) {
            console.warn(`Parsing warnings for ${filename}:`, results.errors);
          }
          resolve(results.data);
        },
        error: (error) => reject(error),
      });
    });
  }

  async loadAllData() {
    if (this.isLoaded) return;
    const [
      machines,
      rawOpcua,
      computedOee,
      timeline,
      summary,
      realtime,
    ] = await Promise.all([
      this.loadCSVFile('machines.csv'),
      this.loadCSVFile('raw_opcua_data.csv'),
      this.loadCSVFile('computed_oee_metrics.csv'),
      this.loadCSVFile('machine_timeline.csv'),
      this.loadCSVFile('status_summary.csv'),
      this.loadCSVFile('realtime_data.csv'),
    ]);

    this.machines = machines;
    this.rawOpcuaData = rawOpcua;
    this.computedOeeMetrics = computedOee;
    this.machineTimeline = timeline;
    this.statusSummary = summary;
    this.realtimeData = realtime;
    this.isLoaded = true;
  }

  getMachines() {
    return this.machines;
  }

  getMachine(machineId) {
    return this.machines.find((m) => m.machine_id === machineId);
  }

  getRawOpcuaData(machineId, startDate, endDate) {
    let data = this.rawOpcuaData.filter((r) => r.machine_id === machineId);
    if (startDate && endDate) {
      const from = new Date(startDate), to = new Date(endDate);
      data = data.filter((r) => {
        const t = new Date(r.timestamp);
        return t >= from && t <= to;
      });
    }
    return data;
  }

  getCurrentParameters(machineId) {
    const data = this.rawOpcuaData
      .filter((r) => r.machine_id === machineId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return data[0] || null;
  }

  getOEEMetrics() {
    const monthOrder = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];
    const agg = {};
    this.computedOeeMetrics.forEach((r) => {
      if (!agg[r.month]) {
        agg[r.month] = { month: r.month, OEEE:0, Availability:0, Performance:0, Quality:0, count:0 };
      }
      agg[r.month].OEEE += r.oee;
      agg[r.month].Availability += r.availability;
      agg[r.month].Performance += r.performance;
      agg[r.month].Quality += r.quality;
      agg[r.month].count++;
    });
    return monthOrder
      .filter((m) => agg[m])
      .map((m) => {
        const d = agg[m];
        return {
          month: m,
          OEEE: Math.round(d.OEEE / d.count),
          Availability: Math.round(d.Availability / d.count),
          Performance: Math.round(d.Performance / d.count),
          Quality: Math.round(d.Quality / d.count),
        };
      });
  }

  getMachineOEEMetrics(machineId) {
    return this.computedOeeMetrics.filter((r) => r.machine_id === machineId);
  }

  getMachineTimeline(machineId) {
    const data = this.machineTimeline.filter((r) => r.machine_id === machineId);
    const grouped = { overview: data.map((r) => ({ start: r.start_time, duration: r.duration, status: r.status })) };
    ['Work','Error','Wait','Idle','Stop','Offline'].forEach((s) => {
      grouped[s] = data.filter((r) => r.status===s).map((r) => ({ start:r.start_time, duration:r.duration }));
    });
    return grouped;
  }

  getStatusSummary(machineId) {
    const sum = {};
    this.statusSummary
      .filter((r) => r.machine_id === machineId)
      .forEach((r) => { sum[r.status] = r.duration; });
    return sum;
  }

  getRealtimeData(machineId) {
    return this.realtimeData.find((r) => r.machine_id === machineId);
  }

  getCurrentOEE(machineId) {
    const machine = this.getMachine(machineId);
    const mOee = this.getMachineOEEMetrics(machineId).sort((a,b) => {
      const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return mo.indexOf(b.month) - mo.indexOf(a.month);
    });
    const current = mOee[0] || {};
    const previous = mOee[1] || current;
    return {
      current_oee: current.oee ?? machine.current_oee,
      previous_oee: previous.oee ?? machine.previous_oee,
      availability: current.availability ?? machine.availability,
      performance: current.performance ?? machine.performance,
      quality: current.quality ?? machine.quality,
    };
  }

  getParameterStats(machineId, param, startDate, endDate) {
    const data = this.getRawOpcuaData(machineId, startDate, endDate).map((r) => r[param]).filter((v) => v != null);
    if (!data.length) return null;
    const sum = data.reduce((a,b) => a+b, 0);
    return {
      min: Math.min(...data),
      max: Math.max(...data),
      avg: sum / data.length,
      count: data.length,
    };
  }

  getErrorAnalysis(machineId, startDate, endDate) {
    const data = this.getRawOpcuaData(machineId, startDate, endDate);
    const errors = data.filter((r) => r.error_code > 0);
    const total = data.length;
    const types = {};
    errors.forEach((r) => {
      const c = r.error_code;
      if (!types[c]) types[c] = { code:c, text:r.error_text, count:0, last:r.timestamp };
      types[c].count++;
      if (new Date(r.timestamp) > new Date(types[c].last)) types[c].last = r.timestamp;
    });
    return {
      totalErrors: errors.length,
      errorRate: total? (errors.length/total)*100:0,
      errorTypes: Object.values(types),
      timeRange: { start: data[0]?.timestamp, end: data[data.length-1]?.timestamp },
    };
  }

  getProductionSummary(machineId, startDate, endDate) {
    const data = this.getRawOpcuaData(machineId, startDate, endDate);
    const running = data.filter((r) => r.state==='Running').length;
    const total = data.length;
    const mats = {};
    data.forEach((r) => {
      if (r.state==='Running') {
        const m = r.material;
        if (!mats[m]) mats[m] = { hours:0, thickness:0, current:0, count:0 };
        mats[m].hours++;
        mats[m].thickness += r.thickness||0;
        mats[m].current += r.current||0;
        mats[m].count++;
      }
    });
    const materials = Object.entries(mats).map(([name,d]) => ({
      name,
      hours: d.hours,
      avgThickness: Math.round((d.thickness/d.count)*10)/10,
      avgCurrent: Math.round((d.current/d.count)*10)/10,
    }));
    return {
      runningHours: running,
      totalHours: total,
      utilizationRate: total? (running/total)*100:0,
      materials,
    };
  }
}

const dataService = new DataService();
export default dataService;