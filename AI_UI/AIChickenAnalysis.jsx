import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, Bird, Eye, Maximize, RotateCcw, ScanEye,
  UserMinus, Video, ZoomIn, ZoomOut
} from 'lucide-react';

const separatedBehaviors = new Set(['separated', 'isolated', 'straying', 'strayed', 'tách đàn']);

function normalizeBehavior(behavior) {
  return String(behavior ?? '').trim().toLocaleLowerCase('vi');
}

function getChickenStats(flockData) {
  const chickens = Array.isArray(flockData?.chickens) ? flockData.chickens : null;
  if (!flockData || !chickens) {
    return { total: flockData?.total_tracks ?? null, normal: null, standing: null, separated: null };
  }

  const normalCount = chickens.filter((chicken) => normalizeBehavior(chicken.behavior) === 'normal').length;
  const standingCount = chickens.filter((chicken) => normalizeBehavior(chicken.behavior) === 'standing').length;
  const separatedCount = chickens.filter((chicken) => separatedBehaviors.has(normalizeBehavior(chicken.behavior))).length;

  return {
    total: flockData.total_tracks ?? chickens.length,
    normal: normalCount,
    standing: standingCount,
    separated: separatedCount
  };
}

function formatLogTime(log) {
  if (log.time) return log.time;
  if (log.timestamp) return new Date(log.timestamp).toLocaleString('vi-VN');
  return '--';
}

export default function AIChickenAnalysis({ videoStreamUrl, flockData, inferenceStatus, logs = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const stats = useMemo(() => getChickenStats(flockData), [flockData]);
  const aiLogs = useMemo(() => logs.filter((log) => log.sourceType === 'ai'), [logs]);
  const countLabel = (value) => value === null ? '--' : value.toLocaleString('vi-VN');

  const closeExpanded = () => {
    setIsExpanded(false);
    setZoom(1);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-700/60 pb-5">
          <p className="mb-1 text-xs font-semibold uppercase text-emerald-400">Thị giác máy tính</p>
          <h1 className="text-2xl font-bold text-white">Phân tích đàn gà</h1>
          <p className="mt-1 text-sm text-slate-400">Theo dõi số lượng và hành vi đàn gà từ camera AI</p>
        </header>

        <section aria-label="Thống kê đàn gà" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tổng số gà" value={countLabel(stats.total)} detail="Đang được AI theo dõi" icon={Bird} tone="emerald" />
          <StatCard label="Bình thường" value={countLabel(stats.normal)} detail="Hành vi ổn định" icon={Eye} tone="cyan" />
          <StatCard label="Đứng im" value={countLabel(stats.standing)} detail="Phân loại bởi mô hình hành vi" icon={AlertTriangle} tone="amber" />
          <StatCard label="Tách đàn" value={countLabel(stats.separated)} detail="Theo nhãn hành vi từ AI" icon={UserMinus} tone="blue" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#1e293b] p-4 shadow-lg sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Video className="h-5 w-5 text-emerald-400" />
              <div>
                <h2 className="font-bold text-white">Camera AI trực tiếp</h2>
                <p className="mt-0.5 text-xs text-slate-400">Luồng hình ảnh đã qua xử lý nhận diện</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${inferenceStatus?.running ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
              <span className={`h-2 w-2 rounded-full ${inferenceStatus?.running ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`} />
              {inferenceStatus?.running ? 'AI đang nhận diện' : 'AI đang dừng'}
            </span>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
            <img src={videoStreamUrl} alt="Luồng camera chuồng gà được AI phân tích" className="absolute inset-0 h-full w-full object-contain" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-rose-400" /> Camera 01
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              title="Mở rộng camera"
              aria-label="Mở rộng camera"
              className="absolute bottom-3 right-3 rounded-lg border border-slate-600 bg-slate-900/90 p-2 text-slate-200 transition hover:bg-slate-800 hover:text-emerald-300"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#172033] shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 px-5 py-4">
            <div>
              <h2 className="font-bold text-white">Nhật ký phân tích AI</h2>
              <p className="mt-1 text-xs text-slate-400">Chỉ hiển thị sự kiện có nguồn AI</p>
            </div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">{aiLogs.length} sự kiện</span>
          </div>
          {aiLogs.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-950/50 text-[10px] uppercase text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Thời gian</th>
                    <th className="px-5 py-3 font-semibold">Phát hiện</th>
                    <th className="px-5 py-3 font-semibold">Đối tượng / vị trí</th>
                    <th className="px-5 py-3 font-semibold">Mức độ</th>
                    <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {aiLogs.map((log) => {
                    const Icon = log.icon || ScanEye;
                    return (
                      <tr key={log.id} className="transition hover:bg-slate-800/30">
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-400">{formatLogTime(log)}</td>
                        <td className="px-5 py-4 font-medium text-slate-100">
                          <span className="flex items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${log.iconColor || 'text-cyan-300'}`} />{log.type || log.title || 'Phân tích hành vi'}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{log.location || log.subject || log.chicken_id || '--'}</td>
                        <td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${log.severityBg || 'bg-cyan-500/10 text-cyan-300'}`}>{log.severity || 'Thông tin'}</span></td>
                        <td className="px-5 py-4 text-xs text-slate-400">{log.status || 'Đã ghi nhận'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <ScanEye className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">Chưa có nhật ký phân tích AI</p>
              <p className="mt-1 text-xs text-slate-500">Sự kiện cảm biến sẽ không hiển thị trong danh sách này.</p>
            </div>
          )}
        </section>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-sm sm:p-6">
          <section role="dialog" aria-modal="true" aria-label="Camera AI mở rộng" className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#172033] shadow-2xl">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Video className="h-4 w-4 text-emerald-400" /> Camera AI trực tiếp</div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
                <button type="button" title="Thu nhỏ" aria-label="Thu nhỏ" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))} className="rounded p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40"><ZoomOut className="h-4 w-4" /></button>
                <span className="min-w-12 text-center text-xs font-mono text-emerald-300">{Math.round(zoom * 100)}%</span>
                <button type="button" title="Phóng to" aria-label="Phóng to" disabled={zoom >= 3} onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))} className="rounded p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40"><ZoomIn className="h-4 w-4" /></button>
                <button type="button" title="Đặt lại" aria-label="Đặt lại thu phóng" onClick={() => setZoom(1)} className="rounded border-l border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><RotateCcw className="h-4 w-4" /></button>
              </div>
              <button type="button" onClick={closeExpanded} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">Đóng</button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-950 p-3">
              <img src={videoStreamUrl} alt="Luồng camera chuồng gà được AI phân tích" className="max-h-[75vh] max-w-full object-contain transition-transform duration-200" style={{ transform: `scale(${zoom})` }} />
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-slate-700/60 px-4 py-3 text-xs text-slate-400 sm:px-5">
              <span>{inferenceStatus?.running ? 'AI đang nhận diện' : 'AI đang dừng'}</span>
              <span>{countLabel(stats.total)} cá thể được theo dõi</span>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  const tones = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-300'
  };
  return (
    <article className="flex min-h-32 items-start justify-between gap-3 rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5 shadow-lg">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
      </div>
      <div className={`shrink-0 rounded-xl border p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
    </article>
  );
}