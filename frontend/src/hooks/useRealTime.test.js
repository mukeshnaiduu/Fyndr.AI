// Quick test to verify all exports are available
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

console.log('✅ All exports available:', {
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
});

export default true;
