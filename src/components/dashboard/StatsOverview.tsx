import { Download, CheckCircle, XCircle, HardDrive } from 'lucide-react';
import { formatBytes } from '../../utils/format';
import { DownloadTaskCollection, DownloadTask } from '../../types';

interface StatsOverviewProps {
  tasks?: DownloadTaskCollection;
}

export function StatsOverview({ tasks }: StatsOverviewProps) {
  const running = tasks?.Running || [];
  const finished = tasks?.Finished || [];
  
  const failed = finished.filter((t: DownloadTask) => !t.IsSuccessful).length;
  const completed = finished.length - failed;
  
  const totalBytes = [...running, ...finished].reduce((acc, task: DownloadTask) => acc + task.TotalDownloadedBytes, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {/* Active */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <Download className={`w-6 h-6 text-blue-500 ${running.length > 0 ? 'animate-bounce' : ''}`} />
        </div>
        <div>
          <div className="text-slate-400 text-sm font-medium mb-1">Active Downloads</div>
          <div className="text-2xl font-bold text-slate-100">{running.length}</div>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <div className="text-slate-400 text-sm font-medium mb-1">Completed</div>
          <div className="text-2xl font-bold text-slate-100">{completed}</div>
        </div>
      </div>

      {/* Failed */}
      {(failed > 0 || true) && (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-slate-400 text-sm font-medium mb-1">Failed</div>
            <div className="text-2xl font-bold text-slate-100">{failed}</div>
          </div>
        </div>
      )}

      {/* Total Data */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
          <HardDrive className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <div className="text-slate-400 text-sm font-medium mb-1">Total Downloaded</div>
          <div className="text-2xl font-bold text-slate-100">{formatBytes(totalBytes)}</div>
        </div>
      </div>
    </div>
  );
}
