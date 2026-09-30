import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bolt, Check, Clock3, DollarSign, Pencil, X, Zap } from 'lucide-react';
import {
  Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { fetchCollection, saveRecord } from '../src/api.js';

const getDayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextDayStart = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day + 1).getTime();
};

const makeDailySnapshot = (date, devices, tariffRate) => {
  const dailyDevices = devices.map((device) => {
    const hours = Number(device.hours) || 0;
    const kWh = Number(device.wattage) * hours / 1000;
    return { ...device, hours, kWh, cost: kWh * tariffRate };
  });
  return {
    id: date,
    date,
    tariffRate,
    devices: dailyDevices,
    totalHours: dailyDevices.reduce((total, device) => total + device.hours, 0),
    totalKWh: dailyDevices.reduce((total, device) => total + device.kWh, 0),
    totalCost: dailyDevices.reduce((total, device) => total + device.cost, 0)
  };
};

const formatDay = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatVnd = (amount) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(amount);

export default function PowerDashboard({ trackingOnly = false }) {
  const [devices, setDevices] = useState([]);
  const [tariffRate, setTariffRate] = useState(0);
  const [draftRate, setDraftRate] = useState('0');
  const [dialogStep, setDialogStep] = useState(null);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [draftWattage, setDraftWattage] = useState('');
  const [wattageConfirmation, setWattageConfirmation] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const devicesRef = useRef([]);
  const statusesRef = useRef({});
  const trackerRef = useRef(null);
  const trackingRef = useRef(false);

  const persistPower = async (nextDevices, nextRate, date = getDayKey(new Date())) => {
    const results = await Promise.all(nextDevices.map((device) => {
      const kWh = device.wattage * device.hours / 1000;
      return saveRecord('power', device.id, {
        ...device,
        deviceId: device.id,
        usageDate: date,
        tariffRate: nextRate,
        kWh,
        cost: kWh * nextRate,
        accountedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }));
    return results;
  };

  useEffect(() => {
    let active = true;
    const loadPowerData = async () => {
      try {
        const [powerRecords, statusRecords, historyRecords] = await Promise.all([
          fetchCollection('power'), fetchCollection('devices'), fetchCollection('historyPower')
        ]);
        if (!active) return;

        const now = new Date();
        const today = getDayKey(now);
        const statusMap = Object.fromEntries(statusRecords.map((record) => [
          record.deviceId || record.id,
          { enabled: Boolean(record.enabled), updatedAt: record.updatedAt }
        ]));
        const storedDevices = powerRecords.map((record) => {
          const id = record.deviceId || record.id;
          const storedHours = Number(record.hours) || 0;
          const usageIsToday = record.usageDate === today;
          const status = statusMap[id];
          const accountedAt = Date.parse(record.accountedAt || '') || 0;
          const statusChangedAt = status?.enabled ? Date.parse(status.updatedAt || '') || 0 : 0;
          const activeSince = status?.enabled
            ? Math.max(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), accountedAt, statusChangedAt)
            : now.getTime();
          const hours = (usageIsToday ? storedHours : 0)
            + (status?.enabled ? Math.max(0, now.getTime() - activeSince) / 3600000 : 0);
          return {
            ...record,
            id,
            deviceId: id,
            hours,
            usageDate: today
          };
        });
        const storedRate = powerRecords.find((record) => Number(record.tariffRate) > 0)?.tariffRate;
        const nextRate = Number(storedRate) > 0 ? Number(storedRate) : 0;
        const normalizedHistory = historyRecords
          .filter((record) => record.date && record.date <= today)
          .sort((first, second) => first.date.localeCompare(second.date));

        setDevices(storedDevices);
        setHistory(normalizedHistory);
        setTariffRate(nextRate);
        setDraftRate(String(nextRate));
        devicesRef.current = storedDevices;
        statusesRef.current = statusMap;
        trackerRef.current = { at: now.getTime(), day: today };
        setIsLoaded(true);
      } catch {
        if (active) setSaveMessage('Không tải được dữ liệu điện năng từ Firestore.');
      }
    };
    loadPowerData();
    return () => { active = false; };
  }, []);

  useEffect(() => { devicesRef.current = devices; }, [devices]);

  useEffect(() => {
    if (!isLoaded) return undefined;

    const updateDailyUsage = async () => {
      if (trackingRef.current || !trackerRef.current || !devicesRef.current.length) return;
      trackingRef.current = true;
      try {
        const now = new Date();
        const nowMs = now.getTime();
        const statuses = await fetchCollection('devices').then((records) => Object.fromEntries(records.map((record) => [
          record.deviceId || record.id,
          { enabled: Boolean(record.enabled), updatedAt: record.updatedAt }
        ]))).catch(() => statusesRef.current);
        const previousStatuses = statusesRef.current;
        const intervals = Object.fromEntries(devicesRef.current.map((device) => {
          const previous = previousStatuses[device.id];
          const current = statuses[device.id];
          if (!previous?.enabled && !current?.enabled) return [device.id, null];
          if (previous?.enabled && !current?.enabled) {
            const changedAt = Date.parse(current.updatedAt || '') || nowMs;
            return [device.id, [trackerRef.current.at, Math.min(nowMs, Math.max(trackerRef.current.at, changedAt))]];
          }
          if (!previous?.enabled && current?.enabled) {
            const changedAt = Date.parse(current.updatedAt || '') || trackerRef.current.at;
            return [device.id, [Math.min(nowMs, Math.max(trackerRef.current.at, changedAt)), nowMs]];
          }
          return [device.id, [trackerRef.current.at, nowMs]];
        }));

        let nextDevices = devicesRef.current;
        let cursor = trackerRef.current.at;
        let cursorDay = trackerRef.current.day;
        const today = getDayKey(now);
        const newHistory = [];

        while (cursorDay < today) {
          const boundary = getNextDayStart(cursorDay);
          const segmentEnd = Math.min(boundary, nowMs);
          nextDevices = nextDevices.map((device) => {
            const interval = intervals[device.id];
            const overlap = interval
              ? Math.max(0, Math.min(interval[1], segmentEnd) - Math.max(interval[0], cursor)) / 3600000
              : 0;
            return { ...device, hours: (Number(device.hours) || 0) + overlap };
          });
          const snapshot = makeDailySnapshot(cursorDay, nextDevices, tariffRate);
          await saveRecord('historyPower', cursorDay, { ...snapshot, savedAt: new Date().toISOString() });
          newHistory.push(snapshot);
          cursor = boundary;
          cursorDay = getDayKey(new Date(boundary));
          nextDevices = nextDevices.map((device) => ({ ...device, hours: 0, usageDate: cursorDay }));
        }

        nextDevices = nextDevices.map((device) => {
          const interval = intervals[device.id];
          const overlap = interval
            ? Math.max(0, Math.min(interval[1], nowMs) - Math.max(interval[0], cursor)) / 3600000
            : 0;
          return { ...device, hours: (Number(device.hours) || 0) + overlap, usageDate: today };
        });

        devicesRef.current = nextDevices;
        statusesRef.current = statuses;
        trackerRef.current = { at: nowMs, day: today };
        setDevices(nextDevices);
        if (newHistory.length) {
          setHistory((current) => [...current.filter((record) => !newHistory.some((added) => added.date === record.date)), ...newHistory]
            .sort((first, second) => first.date.localeCompare(second.date)));
        }
        await persistPower(nextDevices, tariffRate, today);
      } catch {
        setSaveMessage('Không cập nhật được thời gian sử dụng vào Firestore.');
      } finally {
        trackingRef.current = false;
      }
    };

    const timer = window.setInterval(updateDailyUsage, 60000);
    return () => window.clearInterval(timer);
  }, [isLoaded, tariffRate]);

  const analytics = useMemo(() => {
    const deviceBreakdown = devices.map((device) => {
      const kWh = device.wattage * device.hours / 1000;
      return { ...device, kWh, cost: kWh * tariffRate };
    });
    const totalKWh = deviceBreakdown.reduce((total, device) => total + device.kWh, 0);
    const totalCost = totalKWh * tariffRate;
    const installedPower = devices.reduce((total, device) => total + device.wattage, 0);

    return { deviceBreakdown, totalKWh, totalCost, installedPower };
  }, [devices, tariffRate]);

  const historyDays = useMemo(() => {
    return [...history]
      .sort((first, second) => first.date.localeCompare(second.date))
      .slice(-7);
  }, [history]);

  const latestSevenDays = historyDays;

  const forecast = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const todayKey = getDayKey(now);
    const monthPrefix = todayKey.slice(0, 7);
    const recordedMonthCost = history
      .filter((record) => record.date.startsWith(monthPrefix))
      .reduce((total, record) => total + (Number(record.totalCost) || 0), 0);
    const averageDailyCost = latestSevenDays.reduce((total, record) => total + record.totalCost, 0)
      / Math.max(1, latestSevenDays.length);
    return recordedMonthCost + analytics.totalCost + averageDailyCost * (daysInMonth - now.getDate());
  }, [analytics.totalCost, history, latestSevenDays]);

  const chartData = historyDays.map((record) => ({
    day: formatDay(record.date),
    kWh: Number(record.totalKWh.toFixed(2)),
    cost: Math.round(record.totalCost)
  }));
  const historyRows = historyDays.flatMap((record) => record.devices.map((device) => ({
    date: record.date,
    name: device.name,
    hours: device.hours,
    kWh: device.kWh,
    cost: device.cost
  })));

  const energyRanking = useMemo(
    () => [...analytics.deviceBreakdown].sort((first, second) => second.kWh - first.kWh),
    [analytics.deviceBreakdown]
  );

  const openTariffDialog = () => {
    setDraftRate(String(tariffRate));
    setDialogStep('edit');
  };

  const startWattageEdit = (device) => {
    setEditingDeviceId(device.id);
    setDraftWattage(String(device.wattage));
  };

  const requestWattageConfirmation = (device) => {
    const wattage = Number(draftWattage);
    if (Number.isFinite(wattage) && wattage >= 0) {
      setWattageConfirmation({ deviceId: device.id, wattage });
    }
  };

  const confirmWattageChange = () => {
    if (!wattageConfirmation) return;
    const { deviceId, wattage } = wattageConfirmation;
    const nextDevices = devices.map((device) => (
      device.id === deviceId ? { ...device, wattage } : device
    ));
    setDevices(nextDevices);
    setEditingDeviceId(null);
    setWattageConfirmation(null);
    persistPower(nextDevices, tariffRate)
      .then(() => setSaveMessage('Đã lưu dữ liệu điện năng.'))
      .catch(() => setSaveMessage('Không lưu được dữ liệu điện năng.'));
  };

  const confirmTariffChange = () => {
    const nextRate = Number(draftRate);
    setTariffRate(nextRate);
    setDialogStep(null);
    persistPower(devices, nextRate)
      .then(() => setSaveMessage('Đã lưu đơn giá và chi phí điện.'))
      .catch(() => setSaveMessage('Không lưu được đơn giá điện.'));
  };

  if (trackingOnly) return null;

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-700/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-emerald-400">Vận hành trang trại</p>
            <h1 className="text-2xl font-bold text-white">Điện năng & chi phí</h1>
            <p className="mt-1 text-sm text-slate-400">Theo dõi mức tiêu thụ và chi phí điện của thiết bị</p>
          </div>
          <button
            type="button"
            onClick={openTariffDialog}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 sm:self-auto"
          >
            <Pencil className="h-4 w-4" />
            Đơn giá: {tariffRate.toLocaleString('vi-VN')} đ/kWh
          </button>
        </header>
        {saveMessage && <p role="status" className="-mt-4 text-xs text-slate-400">{saveMessage}</p>}

        <section aria-label="Tổng quan điện năng" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Tổng công suất thiết bị"
            value={(analytics.installedPower / 1000).toFixed(2)}
            unit="kW"
            detail={`${analytics.installedPower.toLocaleString('vi-VN')} W công suất lắp đặt`}
            icon={Zap}
            color="amber"
          />
          <SummaryCard
            label="Điện tiêu thụ hôm nay"
            value={analytics.totalKWh.toFixed(2)}
            unit="kWh"
            detail="Tổng thời gian vận hành trong ngày"
            icon={Bolt}
            color="cyan"
          />
          <SummaryCard
            label="Chi phí ước tính hôm nay"
            value={formatVnd(analytics.totalCost)}
            detail={`${tariffRate.toLocaleString('vi-VN')} đ cho mỗi kWh`}
            icon={DollarSign}
            color="emerald"
          />
          <SummaryCard
            label="Dự kiến đến cuối tháng"
            value={formatVnd(forecast)}
            detail="Thực chi trong tháng + trung bình 7 ngày × số ngày còn lại"
            icon={Clock3}
            color="blue"
          />
        </section>

        <section className="order-6 rounded-2xl border border-slate-700/60 bg-[#172033] p-5 shadow-lg sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-white">Lịch sử điện năng 7 ngày gần nhất</h2>
              <p className="mt-1 text-xs text-slate-400">Biểu đồ hiển thị đồng thời toàn bộ 7 ngày gần nhất</p>
            </div>
          </div>
          {historyDays.length ? (
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis yAxisId="energy" stroke="#22d3ee" tickLine={false} axisLine={false} fontSize={10} />
                  <YAxis yAxisId="cost" orientation="right" stroke="#34d399" tickLine={false} axisLine={false} fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(value, name) => name === 'Chi phí'
                      ? [formatVnd(value), name]
                      : [`${Number(value).toFixed(2)} kWh`, name]}
                  />
                  <Bar yAxisId="energy" dataKey="kWh" name="Điện năng" fill="#22d3ee" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  <Line yAxisId="cost" dataKey="cost" name="Chi phí" type="monotone" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu lịch sử trong collection historyPower.</p>
          )}
        </section>

        <section className="order-7 overflow-hidden rounded-2xl border border-slate-700/60 bg-[#172033] shadow-lg">
          <header className="border-b border-slate-700/60 px-5 py-4">
            <div>
              <h2 className="font-bold text-white">Chi tiết theo ngày và thiết bị</h2>
              <p className="mt-1 text-xs text-slate-400">Toàn bộ dữ liệu của 7 ngày gần nhất</p>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-950/50 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ngày</th>
                  <th className="px-5 py-3 font-semibold">Thiết bị</th>
                  <th className="px-5 py-3 font-semibold">Thời gian dùng</th>
                  <th className="px-5 py-3 font-semibold">Điện năng</th>
                  <th className="px-5 py-3 text-right font-semibold">Chi phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {historyRows.map((row, index) => (
                  <tr key={`${row.date}-${row.name}-${index}`} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3 text-slate-300">
                      {formatDay(row.date)}
                    </td>
                    <td className="px-5 py-3 text-slate-200">{row.name}</td>
                    <td className="px-5 py-3 text-slate-300">{row.hours.toFixed(2)} giờ</td>
                    <td className="px-5 py-3 text-cyan-300">{row.kWh.toFixed(2)} kWh</td>
                    <td className="px-5 py-3 text-right font-medium text-emerald-300">{formatVnd(row.cost)}</td>
                  </tr>
                ))}
                {!historyRows.length && (
                  <tr><td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">Chưa có dữ liệu trong collection historyPower.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="order-4 overflow-hidden rounded-2xl border border-slate-700/60 bg-[#172033] shadow-lg">
          <div className="flex flex-col gap-1 border-b border-slate-700/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-white">Thiết bị & mức tiêu thụ hôm nay</h2>
              <p className="mt-1 text-xs text-slate-400">Công suất, thời gian dùng, kWh và chi phí trong ngày hiện tại</p>
            </div>
            <span className="text-xs text-slate-500">{devices.length} thiết bị</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950/50 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Thiết bị</th>
                  <th className="px-5 py-3 font-semibold">Công suất</th>
                  <th className="px-5 py-3 font-semibold">Giờ dùng hôm nay</th>
                  <th className="px-5 py-3 font-semibold">kWh hôm nay</th>
                  <th className="px-5 py-3 text-right font-semibold">Chi phí hôm nay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {analytics.deviceBreakdown.map((device) => (
                  <tr key={device.id} className="transition hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100">{device.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{device.category} · {device.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <label className={`flex w-28 items-center gap-2 rounded-lg border px-2.5 ${editingDeviceId === device.id ? 'border-emerald-500 bg-slate-950' : 'border-slate-700 bg-slate-900/50'}`}>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={editingDeviceId === device.id ? draftWattage : device.wattage}
                          readOnly={editingDeviceId !== device.id}
                          onChange={(event) => setDraftWattage(event.target.value)}
                          aria-label={`Công suất ${device.name}`}
                          className="w-full bg-transparent py-1.5 text-sm font-semibold text-emerald-300 outline-none read-only:cursor-default"
                        />
                        <span className="text-xs text-slate-500">W</span>
                      </label>
                        {editingDeviceId === device.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => requestWattageConfirmation(device)}
                              aria-label={`Xác nhận sửa công suất ${device.name}`}
                              title="Lưu và xác nhận"
                              className="rounded-lg p-1.5 text-emerald-300 transition hover:bg-emerald-500/10"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDeviceId(null)}
                              aria-label={`Hủy sửa công suất ${device.name}`}
                              title="Hủy sửa"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startWattageEdit(device)}
                            aria-label={`Sửa công suất ${device.name}`}
                            title="Sửa công suất"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-300"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{device.hours.toFixed(1)} giờ</td>
                    <td className="px-5 py-4 font-semibold text-cyan-300">{device.kWh.toFixed(2)} kWh</td>
                    <td className="px-5 py-4 text-right font-semibold text-emerald-300">{formatVnd(device.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="order-5 rounded-2xl border border-slate-700/60 bg-[#172033] p-5 shadow-lg sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-cyan-300">
              <Bolt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-white">Phân bổ điện năng</h2>
              <p className="mt-1 text-xs text-slate-400">Tỷ trọng tiêu thụ theo từng thiết bị</p>
            </div>
          </div>
          <div className="space-y-4">
            {energyRanking.map((device) => {
              const share = analytics.totalKWh > 0 ? device.kWh / analytics.totalKWh * 100 : 0;
              return (
                <div key={device.id}>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
                    <span className="font-medium text-slate-300">{device.name}</span>
                    <span className="text-slate-400">{device.kWh.toFixed(2)} kWh · {share.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-[width] duration-300"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {wattageConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wattage-dialog-title"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#172033] p-5 shadow-2xl sm:p-6"
          >
            <h2 id="wattage-dialog-title" className="font-bold text-white">Xác nhận thay đổi công suất</h2>
            <p className="mt-1 text-sm text-slate-400">
              {devices.find((device) => device.id === wattageConfirmation.deviceId)?.name}
            </p>
            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-xs text-slate-400">Công suất hiện tại</p>
              <p className="mt-1 text-sm font-semibold text-slate-200">
                {devices.find((device) => device.id === wattageConfirmation.deviceId)?.wattage.toLocaleString('vi-VN')} W
              </p>
              <p className="mt-3 text-xs text-slate-400">Công suất mới</p>
              <p className="mt-1 text-lg font-bold text-amber-300">
                {wattageConfirmation.wattage.toLocaleString('vi-VN')} W
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWattageConfirmation(null)}
                className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={confirmWattageChange}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                <Check className="h-4 w-4" /> Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogStep && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tariff-dialog-title"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#172033] p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="tariff-dialog-title" className="font-bold text-white">
                  {dialogStep === 'edit' ? 'Cập nhật đơn giá điện' : 'Xác nhận thay đổi đơn giá'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {dialogStep === 'edit'
                    ? 'Nhập đơn giá áp dụng cho trang trại.'
                    : 'Đơn giá mới sẽ được áp dụng cho toàn bộ ước tính chi phí.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDialogStep(null)}
                aria-label="Đóng"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dialogStep === 'edit' ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (Number(draftRate) > 0) setDialogStep('confirm');
                }}
              >
                <label htmlFor="tariff-rate" className="mb-2 block text-sm text-slate-300">Đơn giá (VNĐ/kWh)</label>
                <input
                  id="tariff-rate"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={draftRate}
                  onChange={(event) => setDraftRate(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-emerald-300 outline-none focus:border-emerald-500"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialogStep(null)} className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800">Hủy</button>
                  <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">Tiếp tục</button>
                </div>
              </form>
            ) : (
              <>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs text-slate-400">Đơn giá hiện tại</p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">{tariffRate.toLocaleString('vi-VN')} đ/kWh</p>
                  <p className="mt-3 text-xs text-slate-400">Đơn giá mới</p>
                  <p className="mt-1 text-lg font-bold text-amber-300">{Number(draftRate).toLocaleString('vi-VN')} đ/kWh</p>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setDialogStep('edit')} className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800">Quay lại</button>
                  <button type="button" onClick={confirmTariffChange} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                    <Check className="h-4 w-4" /> Xác nhận
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value, unit, detail, icon: Icon, color }) {
  const accents = {
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-300'
  };

  return (
    <article className="flex min-h-36 items-start justify-between gap-3 rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5 shadow-lg">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <p className="break-words text-2xl font-bold text-white">{value}</p>
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">{detail}</p>
      </div>
      <div className={`shrink-0 rounded-xl border p-2.5 ${accents[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </article>
  );
}