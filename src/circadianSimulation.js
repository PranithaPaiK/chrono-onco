// Circadian Rhythm Simulation Engine
// Simulates realistic cortisol, melatonin, and temperature patterns based on circadian biology

export class CircadianSimulation {
  constructor() {
    this.baseTime = new Date();
    this.phaseOffset = 0; // Individual circadian phase offset in hours
    this.amplitudeVariation = 0.15; // Individual amplitude variation (15%)
    this.noiseLevel = 0.08; // Sensor noise level
    
    // Patient-specific parameters (can be customized)
    this.patientParams = {
      cortisolPeak: 8, // Peak at 8 AM (in hours from midnight)
      cortisolAmplitude: 15, // μg/dL
      cortisolBaseline: 5,
      
      melatoninPeak: 2, // Peak at 2 AM
      melatoninAmplitude: 60, // pg/mL
      melatoninBaseline: 10,
      
      tempPeak: 17, // Peak at 5 PM
      tempAmplitude: 1.2, // °C
      tempBaseline: 36.5, // °C
    };
  }

  // Set individual patient's circadian phase offset
  setPhaseOffset(hours) {
    this.phaseOffset = hours;
  }

  // Add realistic noise to simulate sensor readings
  addNoise(value, noiseLevel = this.noiseLevel) {
    const noise = (Math.random() - 0.5) * 2 * noiseLevel * value;
    return Math.max(0, value + noise);
  }

  // Cosinor function for circadian rhythm modeling
  // Returns value based on time of day using sinusoidal pattern
  cosinor(hour, peakHour, amplitude, baseline, phaseOffset = 0) {
    const adjustedHour = (hour + phaseOffset) % 24;
    const phase = (2 * Math.PI * (adjustedHour - peakHour)) / 24;
    const rhythm = baseline + amplitude * Math.cos(phase);
    return rhythm;
  }

  // Calculate cortisol level at given time
  getCortisol(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const individualAmplitude = this.patientParams.cortisolAmplitude * (1 + (Math.random() - 0.5) * this.amplitudeVariation);
    const cortisol = this.cosinor(
      hour,
      this.patientParams.cortisolPeak,
      individualAmplitude,
      this.patientParams.cortisolBaseline,
      this.phaseOffset
    );
    return this.addNoise(cortisol);
  }

  // Calculate melatonin level at given time
  getMelatonin(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const individualAmplitude = this.patientParams.melatoninAmplitude * (1 + (Math.random() - 0.5) * this.amplitudeVariation);
    const melatonin = this.cosinor(
      hour,
      this.patientParams.melatoninPeak,
      individualAmplitude,
      this.patientParams.melatoninBaseline,
      this.phaseOffset
    );
    return this.addNoise(melatonin);
  }

  // Calculate skin temperature at given time
  getTemperature(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const individualAmplitude = this.patientParams.tempAmplitude * (1 + (Math.random() - 0.5) * this.amplitudeVariation);
    const temp = this.cosinor(
      hour,
      this.patientParams.tempPeak,
      individualAmplitude,
      this.patientParams.tempBaseline,
      this.phaseOffset
    );
    return this.addNoise(temp, 0.02); // Lower noise for temperature
  }

  // Calculate composite circadian phase (0-1, where 0 = circadian midnight)
  getCircadianPhase(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const adjustedHour = (hour + this.phaseOffset) % 24;
    return adjustedHour / 24;
  }

  // Determine bone marrow vulnerability based on circadian phase
  // Returns: 0-1 scale (higher = more vulnerable)
  getBoneMarrowVulnerability(date = new Date()) {
    const phase = this.getCircadianPhase(date);
    // Bone marrow is most vulnerable during circadian night (phase 0.7-0.9)
    // Least vulnerable during circadian day (phase 0.2-0.5)
    const vulnerabilityCurve = Math.sin(2 * Math.PI * (phase - 0.8));
    return Math.max(0, Math.min(1, (vulnerabilityCurve + 1) / 2));
  }

  // Generate 24-hour forecast of all biomarkers
  generate24HourForecast(startDate = new Date()) {
    const forecast = [];
    for (let i = 0; i < 24; i++) {
      const time = new Date(startDate.getTime() + i * 60 * 60 * 1000);
      forecast.push({
        time: time,
        cortisol: this.getCortisol(time),
        melatonin: this.getMelatonin(time),
        temperature: this.getTemperature(time),
        vulnerability: this.getBoneMarrowVulnerability(time),
        phase: this.getCircadianPhase(time)
      });
    }
    return forecast;
  }

  // Generate historical data for the past 7 days
  generateHistoricalData(days = 7) {
    const history = [];
    const now = new Date();
    for (let day = 0; day < days; day++) {
      const dayStart = new Date(now.getTime() - (days - day) * 24 * 60 * 60 * 1000);
      for (let hour = 0; hour < 24; hour++) {
        const time = new Date(dayStart.getTime() + hour * 60 * 60 * 1000);
        history.push({
          time: time,
          cortisol: this.getCortisol(time),
          melatonin: this.getMelatonin(time),
          temperature: this.getTemperature(time),
          vulnerability: this.getBoneMarrowVulnerability(time)
        });
      }
    }
    return history;
  }

  // Get optimal chemotherapy timing windows
  // Returns array of {start, end, score} objects
  getOptimalTimingWindows(date = new Date()) {
    const forecast = this.generate24HourForecast(date);
    const windows = [];
    
    // Find 4-hour windows with lowest bone marrow vulnerability
    for (let i = 0; i < forecast.length - 4; i++) {
      const windowData = forecast.slice(i, i + 4);
      const avgVulnerability = windowData.reduce((sum, d) => sum + d.vulnerability, 0) / 4;
      const score = 1 - avgVulnerability; // Higher score = better timing
      
      windows.push({
        start: windowData[0].time,
        end: windowData[windowData.length - 1].time,
        score: score,
        avgVulnerability: avgVulnerability
      });
    }
    
    // Sort by score and return top 3 windows
    return windows.sort((a, b) => b.score - a.score).slice(0, 3);
  }
}
