import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface LogEntry {
  line: number;
  level: string;
  message: string;
  timestamp: string;
  component: string;
  function: string;
  extra: Record<string, any>;
}

interface LogViewerProps {
  logs: LogEntry[];
}

function LogLevelIcon({ level }: { level: string }) {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'WARNING':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'INFO':
      return <Info className="w-4 h-4 text-blue-500" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-400" />;
  }
}

function LogEntry({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);

  const formattedTime = new Date(entry.timestamp).toLocaleTimeString();
  
  return (
    <div className="border-b border-gray-200 dark:border-dark-200 last:border-0">
      <div 
        className="flex items-start gap-2 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-200"
        onClick={() => setExpanded(!expanded)}
      >
        <LogLevelIcon level={entry.level} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-dark-400">{formattedTime}</span>
            <span className="text-sm text-gray-900 dark:text-dark-600 truncate">
              {entry.message}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-dark-400">
            {entry.component}.{entry.function}
          </div>
        </div>

        {Object.keys(entry.extra).length > 0 && (
          expanded ? 
            <ChevronDown className="w-4 h-4 text-gray-400" /> :
            <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {expanded && Object.keys(entry.extra).length > 0 && (
        <div className="p-2 bg-gray-50 dark:bg-dark-100 text-sm">
          <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-dark-400">
            {JSON.stringify(entry.extra, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function LogViewer({ logs }: LogViewerProps) {
  if (!logs.length) {
    return (
      <div className="text-sm text-gray-500 dark:text-dark-400 text-center py-4">
        No logs available
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-dark-200 rounded-lg divide-y divide-gray-200 dark:divide-dark-200 max-h-[400px] overflow-y-auto">
      {logs.map((log, index) => (
        <LogEntry key={index} entry={log} />
      ))}
    </div>
  );
}