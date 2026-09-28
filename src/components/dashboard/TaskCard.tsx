import React, { useState } from 'react';
import { DownloadTask } from '../../types';
import { ProgressBar } from './ProgressBar';
import { formatBytes, formatSpeed, formatRelativeTime } from '../../utils/format';
import { Trash2, Copy, Play, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface TaskCardProps {
  task: DownloadTask;
  onRemove?: (id: string) => void;
}

export function TaskCard({ task, onRemove }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(task.Url);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove(task.Aid);
  };

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex gap-4">
        {/* Thumbnail */}
        <div className="w-32 h-20 shrink-0 bg-slate-800 rounded-lg overflow-hidden relative">
          {task.Pic ? (
            <img src={task.Pic} alt={task.Title || 'Video Thumbnail'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <Play className="text-slate-500 w-8 h-8 opacity-50" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="text-slate-200 font-medium truncate" title={task.Title || task.Url}>
                {task.Title || 'Resolving video info...'}
              </h3>
              <p className="text-slate-500 text-xs truncate mt-0.5" title={task.Url}>
                {task.Url}
              </p>
            </div>
            {/* Status Badge */}
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/50">
              {!task.IsSuccessful && task.TaskFinishTime === null ? (
                <><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /><span className="text-blue-400">Downloading</span></>
              ) : task.IsSuccessful ? (
                <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-500">Completed</span></>
              ) : (
                <><XCircle className="w-3 h-3 text-red-500" /><span className="text-red-500">Failed</span></>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{(task.Progress * 100).toFixed(1)}%</span>
              <span>{formatBytes(task.TotalDownloadedBytes)} downloaded</span>
            </div>
            <ProgressBar progress={task.Progress} size="sm" animated={task.TaskFinishTime === null} />
          </div>
        </div>
      </div>

      {/* Expanded Actions & Info */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/50 flex justify-between items-center text-sm flex-wrap gap-y-3">
          <div className="flex gap-4 text-slate-400">
            {task.TaskFinishTime === null && (
              <div className="font-mono text-blue-400">{formatSpeed(task.DownloadSpeed)}</div>
            )}
            <div>Started: {formatRelativeTime(task.TaskCreateTime)}</div>
            {task.TaskFinishTime !== null && (
              <div>Finished: {formatRelativeTime(task.TaskFinishTime)}</div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-8 flex items-center gap-1">
              <Copy className="w-3 h-3" /> Copy URL
            </Button>
            {task.TaskFinishTime !== null && onRemove && (
              <Button variant="danger" size="sm" onClick={handleRemove} className="text-xs h-8 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Remove
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
