import numpy as np
from scipy import signal, optimize
from datetime import datetime, timedelta
from typing import List, Tuple
import math

class CircadianAnalyzer:
    """
    Circadian rhythm analysis engine using signal processing methods.
    
    DISCLAIMER: This is a research prototype for demonstration purposes.
    All analyses are based on simulated synthetic data and do not represent
    clinically validated circadian phase estimation.
    """
    
    def __init__(self):
        self.sampling_rate = 1.0  # readings per hour for simulation
        
    def cosinor_fit(self, times: np.ndarray, values: np.ndarray) -> Tuple[float, float, float, float]:
        """
        Fit a cosinor model to time-series data.
        
        Returns: (mesor, amplitude, acrophase, goodness_of_fit)
        - mesor: rhythm-adjusted mean
        - amplitude: half the difference between peak and trough
        - acrophase: timing of the peak in radians
        - goodness_of_fit: R-squared value
        """
        # Convert times to hours from midnight
        hours = np.array([t.hour + t.minute/60 for t in times])
        
        # Fit cosinor model: y = mesor + amplitude * cos(2*pi*(hours - acrophase)/24)
        def cosinor_func(t, mesor, amplitude, acrophase):
            return mesor + amplitude * np.cos(2 * np.pi * (t - acrophase) / 24)
        
        try:
            params, _ = optimize.curve_fit(
                cosinor_func, 
                hours, 
                values,
                p0=[np.mean(values), np.std(values), 12],
                maxfev=5000
            )
            mesor, amplitude, acrophase = params
            
            # Calculate R-squared
            predicted = cosinor_func(hours, *params)
            ss_res = np.sum((values - predicted) ** 2)
            ss_tot = np.sum((values - np.mean(values)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            
            return mesor, amplitude, acrophase, r_squared
        except:
            return np.mean(values), 0, 12, 0
    
    def smooth_signal(self, values: np.ndarray, window_size: int = 5) -> np.ndarray:
        """Apply moving average smoothing to reduce noise."""
        return np.convolve(values, np.ones(window_size)/window_size, mode='same')
    
    def detect_peaks(self, times: np.ndarray, values: np.ndarray, prominence: float = None) -> List[int]:
        """Detect peaks in the time-series data."""
        if prominence is None:
            prominence = np.std(values) * 0.5
        peaks, _ = signal.find_peaks(values, prominence=prominence)
        return peaks.tolist()
    
    def calculate_rhythm_stability(self, values: np.ndarray) -> float:
        """
        Calculate rhythm stability based on regularity of the pattern.
        Returns a value between 0 (unstable) and 1 (highly stable).
        """
        if len(values) < 4:
            return 0.5
        
        # Calculate autocorrelation at lag 24 hours
        smoothed = self.smooth_signal(values)
        autocorr = np.correlate(smoothed, smoothed, mode='full')
        autocorr = autocorr[len(autocorr)//2:]
        
        # Normalize
        if autocorr[0] > 0:
            autocorr = autocorr / autocorr[0]
        
        # Stability is based on autocorrelation at expected period
        expected_lag = min(24, len(autocorr) - 1)
        stability = max(0, min(1, autocorr[expected_lag]))
        
        return stability
    
    def estimate_data_quality(self, values: np.ndarray, signal_quality_scores: List[str]) -> float:
        """
        Estimate overall data quality based on signal quality indicators and noise.
        Returns a value between 0 (poor) and 1 (excellent).
        """
        # Base quality from signal quality scores
        quality_map = {"excellent": 1.0, "good": 0.8, "fair": 0.6, "poor": 0.4}
        avg_quality = np.mean([quality_map.get(q, 0.5) for q in signal_quality_scores])
        
        # Adjust based on noise (coefficient of variation)
        if len(values) > 1:
            cv = np.std(values) / np.mean(values) if np.mean(values) > 0 else 1
            noise_penalty = min(0.3, cv * 2)
        else:
            noise_penalty = 0
        
        return max(0, min(1, avg_quality - noise_penalty))
    
    def detect_phase_shift(self, times: np.ndarray, values: np.ndarray, expected_peak: float) -> bool:
        """
        Detect if there's a significant phase shift from expected peak time.
        expected_peak: expected peak time in hours
        """
        mesor, amplitude, acrophase, r_squared = self.cosinor_fit(times, values)
        
        # Convert acrophase to hours (0-24)
        peak_hours = (acrophase % (2 * np.pi)) * 24 / (2 * np.pi)
        
        # Check if shift is significant (> 2 hours)
        shift = abs(peak_hours - expected_peak)
        shift = min(shift, 24 - shift)  # Handle circular nature
        
        return shift > 2 and r_squared > 0.5
    
    def analyze_comprehensive(
        self, 
        cortisol_data: List[Tuple[datetime, float]],
        melatonin_data: List[Tuple[datetime, float]],
        temp_data: List[Tuple[datetime, float]],
        signal_qualities: List[str]
    ) -> dict:
        """
        Perform comprehensive circadian analysis on all biomarkers.
        
        Returns dictionary with analysis results.
        """
        # Convert to numpy arrays
        cortisol_times = np.array([d[0] for d in cortisol_data])
        cortisol_values = np.array([d[1] for d in cortisol_data])
        
        melatonin_times = np.array([d[0] for d in melatonin_data])
        melatonin_values = np.array([d[1] for d in melatonin_data])
        
        temp_times = np.array([d[0] for d in temp_data])
        temp_values = np.array([d[1] for d in temp_data])
        
        # Analyze each biomarker
        cortisol_mesor, cortisol_amp, cortisol_acro, cortisol_r2 = self.cosinor_fit(
            cortisol_times, cortisol_values
        )
        melatonin_mesor, melatonin_amp, melatonin_acro, melatonin_r2 = self.cosinor_fit(
            melatonin_times, melatonin_values
        )
        temp_mesor, temp_amp, temp_acro, temp_r2 = self.cosinor_fit(
            temp_times, temp_values
        )
        
        # Convert acrophases to hours
        cortisol_peak = (cortisol_acro % (2 * np.pi)) * 24 / (2 * np.pi)
        melatonin_peak = (melatonin_acro % (2 * np.pi)) * 24 / (2 * np.pi)
        temp_peak = (temp_acro % (2 * np.pi)) * 24 / (2 * np.pi)
        
        # Calculate composite metrics
        rhythm_stability = np.mean([
            self.calculate_rhythm_stability(cortisol_values),
            self.calculate_rhythm_stability(melatonin_values),
            self.calculate_rhythm_stability(temp_values)
        ])
        
        data_quality = self.estimate_data_quality(
            np.concatenate([cortisol_values, melatonin_values, temp_values]),
            signal_qualities
        )
        
        # Estimate overall biological phase (simplified composite)
        # Phase 0 = circadian midnight, Phase 0.5 = circadian noon
        estimated_phase = (melatonin_peak / 24)  # Using melatonin as primary marker
        
        # Detect phase shifts
        cortisol_shift = self.detect_phase_shift(cortisol_times, cortisol_values, 8)  # Expected 8 AM
        melatonin_shift = self.detect_phase_shift(melatonin_times, melatonin_values, 2)  # Expected 2 AM
        
        # Overall confidence based on fit quality and data quality
        avg_r2 = np.mean([cortisol_r2, melatonin_r2, temp_r2])
        confidence = (avg_r2 * 0.6) + (data_quality * 0.4)
        
        return {
            "cortisol_peak_time": cortisol_peak,
            "melatonin_peak_time": melatonin_peak,
            "temp_peak_time": temp_peak,
            "estimated_phase": estimated_phase,
            "rhythm_stability": rhythm_stability,
            "data_quality": data_quality,
            "phase_shift_detected": cortisol_shift or melatonin_shift,
            "confidence": confidence,
            "cortisol_fit_quality": cortisol_r2,
            "melatonin_fit_quality": melatonin_r2,
            "temp_fit_quality": temp_r2,
            "disclaimer": "SIMULATED DATA — NOT REAL PATIENT MEASUREMENTS"
        }
