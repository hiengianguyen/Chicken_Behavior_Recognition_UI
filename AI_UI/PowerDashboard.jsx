import React, { useMemo, useState } from 'react';
import { Bolt, Check, Clock3, DollarSign, Pencil, X, Zap } from 'lucide-react';
import { fetchCollection, saveRecord } from '../src/api.js';

export const initialDevices = [
  { id: 'FAN_01', name: 'Quạt hút thông gió #01', category: 'Thông gió', wattage: 1500, hours: 4 },
  { id: 'HEATER_01', name: 'Đèn sưởi hồng ngoại Khu A', category: 'Sưởi ấm', wattage: 800, hours: 5 },
  { id: 'MIST_01', name: 'Máy bơm phun sương làm mát', category: 'Làm mát', wattage: 750, hours: 2 },
  { id: 'WINDOW_01', name: 'Mô-tơ cửa gió tự động', category: 'Cơ khí', wattage: 350, hours: 1 },
  { id: 'LIGHT_01', name: 'Hệ thống chiếu sáng LED', category: 'Chiếu sáng', wattage: 200, hours: 8 }
];

const formatVnd = (amount) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(amount);

export default function PowerDashboard() {
  const [devices, setDevices] = useState(initialDevices);
  const [tariffRate, setTariffRate] = useState(2500);
  const [draftRate, setDraftRate] = useState('2500');
  const [dialogStep, setDialogStep] = useState(null);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [draftWattage, setDraftWattage] = useState('');
  const [wattageConfirmation, setWattageConfirmation] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  const persistPower = async (nextDevices, nextRate) => {
    const results = await Promise.all(nextDevices.map((device) => {
      const kWh = device.wattage * device.hours / 1000;
      return saveRecord('power', device.id, {
        ...device,
        deviceId: device.id,
        tariffRate: nextRate,
        kWh,
        cost: kWh * nextRate,
        updatedAt: new Date().toISOString()
      });
    }));
    return results;
  };

  React.useEffect(() => {
    let active = true;
    fetchCollection('power').then((records) => {
      if (!active || !records.length) return;
      const stored = new Map(records.map((record) => [record.deviceId || record.id, record]));
      setDevices((current) => current.map((device) => ({
        ...device,
        ...(stored.has(device.id) ? stored.get(device.id) : {})
      })));
      const storedRate = records.find((record) => Number(record.tariffRate) > 0)?.tariffRate;
      if (storedRate) {
        setTariffRate(Number(storedRate));
        setDraftRate(String(storedRate));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

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
            label="Điện tiêu thụ ghi nhận"
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
            label="Dự kiến trong 30 ngày"
            value={formatVnd(analytics.totalCost * 30)}
            detail="Ước tính theo mức tiêu thụ hôm nay"
            icon={Clock3}
            color="blue"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#172033] shadow-lg">
          <div className="flex flex-col gap-1 border-b border-slate-700/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-white">Thiết bị & mức tiêu thụ</h2>
              <p className="mt-1 text-xs text-slate-400">Cập nhật công suất để điều chỉnh ước tính điện năng</p>
            </div>
            <span className="text-xs text-slate-500">{devices.length} thiết bị</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950/50 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Thiết bị</th>
                  <th className="px-5 py-3 font-semibold">Công suất</th>
                  <th className="px-5 py-3 font-semibold">Thời gian ghi nhận</th>
                  <th className="px-5 py-3 font-semibold">Tiêu thụ</th>
                  <th className="px-5 py-3 text-right font-semibold">Chi phí</th>
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

        <section className="rounded-2xl border border-slate-700/60 bg-[#172033] p-5 shadow-lg sm:p-6">
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