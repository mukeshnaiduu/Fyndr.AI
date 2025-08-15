// Quick test to verify all exports are available
import { describe, it, expect } from 'vitest';
import {
    useRealTime,
    useLiveApplications,
    useJobMatching,
    useConnectionStatus,
    useRealTimeConnection,
    useRealTimeJobMatching,
    useDynamicApplications,
    useRealTimeApplications,
    useRealTimeTracking,
    useApplicationTracking,
    useLiveAnalytics,
    useSystemHealth
} from './useRealTime.js';

describe('useRealTime exports', () => {
    it('should export expected hooks as functions', () => {
        const types = {
            useRealTime: typeof useRealTime,
            useLiveApplications: typeof useLiveApplications,
            useJobMatching: typeof useJobMatching,
            useConnectionStatus: typeof useConnectionStatus,
            useRealTimeConnection: typeof useRealTimeConnection,
            useRealTimeJobMatching: typeof useRealTimeJobMatching,
            useDynamicApplications: typeof useDynamicApplications,
            useRealTimeApplications: typeof useRealTimeApplications,
            useRealTimeTracking: typeof useRealTimeTracking,
            useApplicationTracking: typeof useApplicationTracking,
            useLiveAnalytics: typeof useLiveAnalytics,
            useSystemHealth: typeof useSystemHealth
        };
        console.log('✅ All exports available:', types);
        Object.values(types).forEach((t) => expect(t).toBe('function'));
    });
});
