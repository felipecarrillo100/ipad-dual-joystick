import { useCallback, useRef, useState } from "react";

/**
 * Measures the frequency (Hz) of triggered events.
 * You call `trigger()` for each event and it estimates events per second.
 *
 * @param windowSize - Number of recent events to average over (default = 20)
 */
export function useFrequencyMeter(windowSize: number = 20) {
    const timestamps = useRef<number[]>([]);
    const [hertz, setHertz] = useState(0);

    const trigger = useCallback(() => {
        const now = performance.now();
        timestamps.current.push(now);

        // Keep only the last N samples
        if (timestamps.current.length > windowSize) {
            timestamps.current.shift();
        }

        // Need at least two samples to compute intervals
        if (timestamps.current.length > 1) {
            const intervals: number[] = [];
            for (let i = 1; i < timestamps.current.length; i++) {
                intervals.push(timestamps.current[i] - timestamps.current[i - 1]);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const frequency = 1000 / avgInterval; // ms → Hz
            setHertz(frequency);
        }
    }, [windowSize]);

    return { hertz, trigger };
}
