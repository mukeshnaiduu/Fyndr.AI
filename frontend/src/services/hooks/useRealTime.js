// Re-export all hooks from the main useRealTime file
export {
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
} from '../../hooks/useRealTime';

export { default } from '../../hooks/useRealTime';
