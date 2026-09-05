import React, { useEffect, useState, useCallback } from 'react';
import ComplexTable from '../components/horizon/ComplexTable';
import api from '../services/api';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs();
      if (data && data.success) {
        setLogs(data.logs || data.events || []);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-6 text-navy-700 dark:text-white font-body pb-8">
      <ComplexTable
        logs={logs}
        isLoading={isLoading}
        onRefresh={fetchEvents}
      />
    </div>
  );
}
