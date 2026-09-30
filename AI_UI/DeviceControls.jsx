import React from 'react';
import {
  ArrowRight, CalendarClock, Clock3, Fan, Flame, Lightbulb, PanelsTopLeft,
  Thermometer, ToggleLeft, Utensils, Wind
} from 'lucide-react';
import { DEVICE_NAMES } from './deviceCatalog';
import { saveRecord } from '../src/api.js';

export default function DeviceControls({
  rules,
  fanOn,
  setFanOn,
  windowOpen,
  setWindowOpen,
  heaterOn,
  setHeaterOn,
  mistOn,
  setMistOn,
  lightOn,
  setLightOn,
  feederOn,
  setFeederOn,
  onDispenseFeed,
  onNavigate
}) {
  const sortedRules = [...rules].sort((first, second) => Number(second.enabled) - Number(first.enabled));
  const [saveMessage, setSaveMessage] = React.useState('');

  const persistDevice = async (record) => {
    try {
      await saveRecord('devices', record.id, { ...record, updatedAt: new Date().toISOString() });
      setSaveMessage('Đã lưu trạng thái thiết bị.');
    } catch {
      setSaveMessage('Không lưu được trạng thái thiết bị vào Firestore.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-700/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-emerald-400">Vận hành trang trại</p>
            <h1 className="text-2xl font-bold text-white">Điều khiển thiết bị</h1>
            <p className="mt-1 text-sm text-slate-400">Theo dõi trạng thái và điều khiển thiết bị trong chuồng</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700/60 bg-[#172033] px-3 py-2 text-xs text-slate-300">
            <ToggleLeft className="h-4 w-4 text-emerald-300" />
            {sortedRules.filter((rule) => rule.enabled).length} luật đang hoạt động
          </div>
        </header>

        <section aria-label="Thiết bị trong trang trại" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DeviceCard
            title="Quạt hút thông gió"
            subtitle="Làm mát và thông gió"
            icon={Fan}
            accent="cyan"
            enabled={fanOn}
            onChange={setFanOn}
            stateText={fanOn ? 'Đang bật · 100%' : 'Đang tắt'}
            detail="Điều khiển thủ công hoặc theo luật cảm biến"
            deviceIds={['FAN_01']}
            rules={rules}
            onPersist={persistDevice}
          />
          <DeviceCard
            title="Mô-tơ cửa gió tự động"
            subtitle="Động cơ Step-motor"
            icon={PanelsTopLeft}
            accent="blue"
            enabled={windowOpen}
            onChange={setWindowOpen}
            stateText={windowOpen ? 'Đang mở · 75%' : 'Đang đóng'}
            detail="Điều khiển thủ công hoặc theo lịch trình"
            deviceIds={['WINDOW_01']}
            rules={rules}
            onPersist={persistDevice}
          />
          <DeviceCard
            title="Đèn sưởi hồng ngoại"
            subtitle="Sưởi ấm"
            icon={Flame}
            accent="amber"
            enabled={heaterOn}
            onChange={setHeaterOn}
            stateText={heaterOn ? 'Đang bật' : 'Đang tắt'}
            detail="Có thể cài theo nhiệt độ hoặc lịch trong Quy tắc tự động"
            deviceIds={['HEATER_01']}
            rules={rules}
            onPersist={persistDevice}
          />
          <DeviceCard
            title="Máy bơm phun sương làm mát"
            subtitle="Làm mát chuồng nuôi"
            icon={Wind}
            accent="blue"
            enabled={mistOn}
            onChange={setMistOn}
            stateText={mistOn ? 'Đang bật' : 'Đang tắt'}
            detail="Điều khiển theo luật cảm biến"
            deviceIds={['MIST_01']}
            rules={rules}
            onPersist={persistDevice}
          />
          <DeviceCard
            title="Hệ thống chiếu sáng LED"
            subtitle="Chiếu sáng chuồng nuôi"
            icon={Lightbulb}
            accent="amber"
            enabled={lightOn}
            onChange={setLightOn}
            stateText={lightOn ? 'Đang bật' : 'Đang tắt'}
            detail="Điều khiển theo luật cảm biến hoặc lịch"
            deviceIds={['LIGHT_01']}
            rules={rules}
            onPersist={persistDevice}
          />
          <DeviceCard
            title="Máng cho ăn tự động"
            subtitle="Sức chứa cám: 82%"
            icon={Utensils}
            accent="amber"
            enabled={feederOn}
            onChange={setFeederOn}
            stateText={feederOn ? 'Đang bật' : 'Đang tắt'}
            detail="Điều khiển theo lịch hoặc quy tắc tự động"
            deviceIds={['FEEDER_01']}
            rules={rules}
            onPersist={persistDevice}
            onAction={() => {
              onDispenseFeed();
              persistDevice({
                id: 'FEEDER_01', deviceId: 'FEEDER_01', name: 'Máng cho ăn tự động', category: 'Cho ăn',
                enabled: true, feedCapacityPercent: 82, lastDispensedAmountKg: 10,
                nextSchedule: '16:30'
              });
            }}
          />
        </section>
        {saveMessage && <p role="status" className="-mt-4 text-xs text-slate-400">{saveMessage}</p>}

        <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#172033] shadow-lg">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 px-5 py-4">
            <div>
              <h2 className="font-bold text-white">Quy tắc tự động</h2>
              <p className="mt-1 text-xs text-slate-400">Danh sách đồng bộ với trang quản lý quy tắc</p>
            </div>
            <button type="button" onClick={() => onNavigate('automation')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-500/20 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10">
              Quản lý quy tắc <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </header>
          {sortedRules.length ? (
            <div className="divide-y divide-slate-800/80">
              {sortedRules.map((rule) => {
                const condition = rule.type === 'SENSOR'
                  ? `${rule.sensorType} ${rule.operator} ${rule.thresholdValue} ${rule.unit}`
                  : `${rule.time} · ${rule.days?.join(', ') || 'Mỗi ngày'}`;
                const RuleIcon = rule.type === 'SENSOR' ? Thermometer : CalendarClock;
                return (
                  <div key={rule.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${rule.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <p className="truncate text-sm font-semibold text-slate-100">{rule.name}</p>
                      </div>
                      <p className="mt-1 pl-4 text-xs text-slate-500">{DEVICE_NAMES[rule.targetDeviceId] || rule.targetDeviceId}</p>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 text-xs text-slate-300">
                      <RuleIcon className="h-4 w-4 shrink-0 text-cyan-300" />
                      <span className="truncate">{condition}</span>
                    </div>
                    <span className={`text-xs font-semibold ${rule.enabled ? 'text-emerald-300' : 'text-slate-500'}`}>
                      {rule.enabled ? 'Đang bật' : 'Đang tắt'} · {rule.targetAction === 'ON' ? 'Bật' : 'Tắt'} thiết bị
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-slate-400">Chưa có quy tắc tự động nào.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function DeviceCard({ title, subtitle, icon: Icon, accent, enabled, onChange, stateText, detail, deviceIds, rules, onPersist, onAction }) {
  const accents = {
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300'
  };
  const attachedRules = rules.filter((rule) => deviceIds.includes(rule.targetDeviceId));
  const automaticRule = attachedRules.find((rule) => rule.enabled);

  return (
    <article className="flex min-h-48 flex-col justify-between rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`rounded-xl border p-2.5 ${accents[accent]}`}><Icon className={`h-5 w-5 ${enabled && accent === 'cyan' ? 'animate-spin' : ''}`} /></div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-white">{title}</h2>
            <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center" title={`Bật/tắt ${title}`}>
          <input type="checkbox" className="peer sr-only" checked={enabled} onChange={(event) => {
            const nextEnabled = event.target.checked;
            onChange(nextEnabled);
            onPersist({
              id: deviceIds[0], deviceId: deviceIds[0], name: title, category: subtitle,
              enabled: nextEnabled,
              stateText: nextEnabled ? (deviceIds[0] === 'FAN_01' ? 'Đang bật · 100%' : deviceIds[0] === 'WINDOW_01' ? 'Đang mở · 75%' : 'Đang bật') : 'Đang tắt',
              detail, linkedRuleIds: attachedRules.map((rule) => rule.id)
            });
          }} aria-label={`Bật/tắt ${title}`} />
          <span className="absolute inset-0 rounded-full bg-slate-700 transition peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#1e293b]" />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>
      {onAction && (
        <button type="button" onClick={onAction} className="mt-4 inline-flex min-h-9 items-center gap-2 self-start rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white transition hover:bg-amber-500">
          <Utensils className="h-3.5 w-3.5" /> Xả cám
        </button>
      )}
      <div className="mt-5 space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">Trạng thái</span>
          <span className={`font-semibold ${enabled ? 'text-emerald-300' : 'text-slate-400'}`}>{stateText}</span>
        </div>
        <div className="flex items-start justify-between gap-3 text-xs">
          <span className="shrink-0 text-slate-400">Điều khiển</span>
          <span className="text-right text-slate-300">{automaticRule ? `Tự động · ${automaticRule.type === 'SCHEDULE' ? `${automaticRule.time} hàng ngày` : `${automaticRule.sensorType} ${automaticRule.operator} ${automaticRule.thresholdValue}${automaticRule.unit}`}` : detail}</span>
        </div>
        {attachedRules.length > 0 && <p className="flex items-center gap-1.5 border-t border-slate-800 pt-2 text-[11px] text-slate-500"><Clock3 className="h-3 w-3" /> {attachedRules.length} quy tắc liên kết</p>}
      </div>
    </article>
  );
}