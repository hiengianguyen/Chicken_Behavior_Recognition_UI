import { useEffect, useMemo, useState } from 'react';
import {
  Bell, CalendarClock, Check, Clock3, Cpu, Pencil, Plus, Search, SlidersHorizontal, Trash2, X
} from 'lucide-react';
import { DEVICE_CATALOG } from './deviceCatalog';
import { removeRecord, saveRecord } from '../src/api.js';

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const initialRules = [
  {
    id: 'RULE-101', name: 'Tự động xả khí độc NH3', enabled: true, type: 'SENSOR',
    sensorType: 'NH3', operator: '>', thresholdValue: 20, unit: 'ppm',
    targetDeviceId: 'FAN_01', targetAction: 'ON', sendNotification: true,
    lastTriggered: '10 phút trước', triggerCount: 14
  },
  {
    id: 'RULE-102', name: 'Sưởi ấm gà con buổi tối', enabled: true, type: 'SCHEDULE',
    time: '18:30', days: weekdays, targetDeviceId: 'HEATER_01', targetAction: 'ON',
    sendNotification: false, lastTriggered: 'Hôm qua 18:30', triggerCount: 45
  },
  {
    id: 'RULE-103', name: 'Làm mát giảm nhiệt độ chuồng', enabled: false, type: 'SENSOR',
    sensorType: 'TEMP', operator: '>', thresholdValue: 33, unit: '°C',
    targetDeviceId: 'MIST_01', targetAction: 'ON', sendNotification: true,
    lastTriggered: '3 ngày trước', triggerCount: 8
  }
];

const emptyForm = () => ({
  name: '', type: 'SENSOR', sensorType: 'TEMP', operator: '>',
  thresholdValue: '30', time: '08:00', days: [...weekdays],
  targetDeviceId: 'FAN_01', targetAction: 'ON', sendNotification: true
});

const sensorUnits = { TEMP: '°C', HUM: '%', NH3: 'ppm', CO2: 'ppm' };

export default function AutomationRules({ rules, setRules }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = (message, tone = 'success') => setToast({ message, tone });

  const visibleRules = useMemo(() => rules.filter((rule) => {
    const matchesFilter = filter === 'ALL'
      || (filter === 'SENSOR' && rule.type === 'SENSOR')
      || (filter === 'SCHEDULE' && rule.type === 'SCHEDULE')
      || (filter === 'ACTIVE' && rule.enabled);
    return matchesFilter && rule.name.toLocaleLowerCase('vi').includes(searchQuery.trim().toLocaleLowerCase('vi'));
  }), [rules, filter, searchQuery]);

  const openCreateForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (rule) => {
    setForm({
      ...emptyForm(),
      ...rule,
      thresholdValue: String(rule.thresholdValue ?? 30),
      days: rule.days ? [...rule.days] : [...weekdays]
    });
    setEditingId(rule.id);
    setIsFormOpen(true);
  };

  const saveRule = async (event) => {
    event.preventDefault();
    const unit = sensorUnits[form.sensorType];
    let savedRule;

    if (editingId) {
      savedRule = {
        ...rules.find((rule) => rule.id === editingId),
        ...form,
        thresholdValue: Number(form.thresholdValue),
        unit
      };
      setRules((current) => current.map((rule) => rule.id === editingId ? savedRule : rule));
    } else {
      savedRule = {
        ...form,
        id: `RULE-${Date.now()}`,
        name: form.name.trim(),
        enabled: true,
        thresholdValue: Number(form.thresholdValue),
        unit,
        lastTriggered: 'Chưa kích hoạt',
        triggerCount: 0
      };
      setRules((current) => [savedRule, ...current]);
    }

    setIsFormOpen(false);
    try {
      await saveRecord('automationRules', savedRule.id, savedRule);
      notify(`Đã lưu luật “${savedRule.name}” vào Firestore`);
    } catch {
      notify('Đã cập nhật trên UI nhưng không lưu được luật vào Firestore.', 'error');
    }
  };

  const toggleRule = async (rule) => {
    const updatedRule = { ...rule, enabled: !rule.enabled };
    setRules((current) => current.map((item) => item.id === rule.id ? updatedRule : item));
    try {
      await saveRecord('automationRules', updatedRule.id, updatedRule);
      notify(`${updatedRule.enabled ? 'Đã bật' : 'Đã tắt'} và lưu luật “${rule.name}”`, updatedRule.enabled ? 'success' : 'info');
    } catch {
      notify('Không lưu được trạng thái quy tắc vào Firestore.', 'error');
    }
  };

  const deleteRule = async (rule) => {
    setRules((current) => current.filter((item) => item.id !== rule.id));
    try {
      await removeRecord('automationRules', rule.id);
      notify(`Đã xóa luật “${rule.name}”`, 'info');
    } catch {
      notify('Không xóa được quy tắc trong Firestore.', 'error');
    }
  };

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-slate-700/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-emerald-400">Vận hành trang trại</p>
            <h1 className="text-2xl font-bold text-white">Quy tắc tự động</h1>
            <p className="mt-1 text-sm text-slate-400">Quản lý điều kiện cảm biến và lịch vận hành thiết bị</p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Tạo luật mới
          </button>
        </header>

        <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Lọc quy tắc" className="flex gap-1 overflow-x-auto rounded-xl border border-slate-700/60 bg-[#172033] p-1">
            {[
              ['ALL', `Tất cả (${rules.length})`],
              ['SENSOR', 'Cảm biến'],
              ['SCHEDULE', 'Lịch trình'],
              ['ACTIVE', `Đang bật (${rules.filter((rule) => rule.enabled).length})`]
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-medium transition ${filter === key ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex min-h-10 w-full items-center gap-2 rounded-xl border border-slate-700/60 bg-[#172033] px-3 text-slate-500 focus-within:border-emerald-500 lg:max-w-xs">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm quy tắc..."
              aria-label="Tìm quy tắc"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>
        </section>

        <section aria-label="Danh sách quy tắc" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visibleRules.length ? visibleRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={() => toggleRule(rule)}
              onEdit={() => openEditForm(rule)}
              onDelete={() => deleteRule(rule)}
            />
          )) : (
            <div className="col-span-full rounded-2xl border border-slate-700/60 bg-[#172033] px-6 py-14 text-center">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">Không tìm thấy quy tắc phù hợp</p>
              <p className="mt-1 text-xs text-slate-500">Thử thay đổi bộ lọc hoặc tạo luật mới.</p>
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div role="status" className={`fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-xl ${toast.tone === 'error' ? 'border-rose-500/30 bg-[#172033] text-rose-200' : toast.tone === 'info' ? 'border-cyan-500/30 bg-[#172033] text-cyan-200' : 'border-emerald-500/30 bg-[#172033] text-emerald-200'}`}>
          <Check className="h-4 w-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center">
          <section role="dialog" aria-modal="true" aria-labelledby="rule-form-title" className="my-4 w-full max-w-xl rounded-2xl border border-slate-700 bg-[#172033] p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-700/60 pb-4">
              <div>
                <h2 id="rule-form-title" className="font-bold text-white">{editingId ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'}</h2>
                <p className="mt-1 text-xs text-slate-400">Thiết lập điều kiện và hành động cần thực hiện</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={saveRule} className="space-y-4">
              <Field label="Tên quy tắc">
                <input required maxLength={80} value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Ví dụ: Thông gió khi NH3 cao" className={inputClass} />
              </Field>

              <Field label="Loại kích hoạt">
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceButton active={form.type === 'SENSOR'} onClick={() => updateForm('type', 'SENSOR')} icon={Cpu}>Theo cảm biến</ChoiceButton>
                  <ChoiceButton active={form.type === 'SCHEDULE'} onClick={() => updateForm('type', 'SCHEDULE')} icon={Clock3}>Theo lịch</ChoiceButton>
                </div>
              </Field>

              {form.type === 'SENSOR' ? (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3 sm:grid-cols-3">
                  <Field label="Cảm biến">
                    <select value={form.sensorType} onChange={(event) => updateForm('sensorType', event.target.value)} className={inputClass}>
                      <option value="TEMP">Nhiệt độ</option>
                      <option value="HUM">Độ ẩm</option>
                      <option value="NH3">Khí NH3</option>
                    </select>
                  </Field>
                  <Field label="Điều kiện">
                    <select value={form.operator} onChange={(event) => updateForm('operator', event.target.value)} className={inputClass}>
                      <option value=">">Lớn hơn (&gt;)</option>
                      <option value="<">Nhỏ hơn (&lt;)</option>
                      <option value=">=">Lớn hơn hoặc bằng</option>
                      <option value="<=">Nhỏ hơn hoặc bằng</option>
                    </select>
                  </Field>
                  <Field label={`Ngưỡng (${sensorUnits[form.sensorType]})`}>
                    <input required type="number" step="0.1" value={form.thresholdValue} onChange={(event) => updateForm('thresholdValue', event.target.value)} className={inputClass} />
                  </Field>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                  <Field label="Giờ kích hoạt">
                    <input required type="time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Ngày áp dụng">
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {weekdays.map((day) => {
                        const selected = form.days.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => updateForm('days', selected ? form.days.filter((item) => item !== day) : [...form.days, day])}
                            className={`min-h-9 rounded-lg border text-xs font-medium transition ${selected ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Thiết bị mục tiêu">
                  <select value={form.targetDeviceId} onChange={(event) => updateForm('targetDeviceId', event.target.value)} className={inputClass}>
                    {DEVICE_CATALOG.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}
                  </select>
                </Field>
                <Field label="Hành động">
                  <select value={form.targetAction} onChange={(event) => updateForm('targetAction', event.target.value)} className={inputClass}>
                    <option value="ON">Bật thiết bị</option>
                    <option value="OFF">Tắt thiết bị</option>
                  </select>
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.sendNotification} onChange={(event) => updateForm('sendNotification', event.target.checked)} className="h-4 w-4 accent-emerald-500" />
                Gửi thông báo khi quy tắc được kích hoạt
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-700/60 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="min-h-10 rounded-xl px-4 text-sm text-slate-300 transition hover:bg-slate-800">Hủy</button>
                <button type="submit" disabled={form.type === 'SCHEDULE' && form.days.length === 0} className="min-h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {editingId ? 'Lưu thay đổi' : 'Tạo quy tắc'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500';

function Field({ label, children }) {
  return (
    <label className="block min-w-0 space-y-1.5 text-xs font-medium text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ChoiceButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200'}`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

function RuleCard({ rule, onToggle, onEdit, onDelete }) {
  const device = DEVICE_CATALOG.find((item) => item.id === rule.targetDeviceId);
  const isSensorRule = rule.type === 'SENSOR';
  const condition = isSensorRule
    ? `${rule.sensorType} ${rule.operator} ${rule.thresholdValue} ${rule.unit}`
    : `${rule.time} · ${rule.days?.join(', ') || 'Mỗi ngày'}`;

  return (
    <article className={`rounded-2xl border bg-[#1e293b] p-5 shadow-lg transition ${rule.enabled ? 'border-slate-700/60' : 'border-slate-800 opacity-75'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${isSensorRule ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300' : 'border-blue-500/20 bg-blue-500/10 text-blue-300'}`}>
              {isSensorRule ? <Cpu className="h-3 w-3" /> : <CalendarClock className="h-3 w-3" />}
              {isSensorRule ? 'Cảm biến' : 'Lịch trình'}
            </span>
            <span className={`text-[10px] font-medium ${rule.enabled ? 'text-emerald-300' : 'text-slate-500'}`}>{rule.enabled ? 'Đang bật' : 'Đang tắt'}</span>
          </div>
          <h2 className="break-words font-semibold text-white">{rule.name}</h2>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={rule.enabled}
          aria-label={`${rule.enabled ? 'Tắt' : 'Bật'} ${rule.name}`}
          onClick={onToggle}
          className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
        >
          <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 p-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Điều kiện</p>
          <p className={`mt-1.5 text-sm font-semibold ${isSensorRule ? 'text-cyan-300' : 'text-blue-300'}`}>{condition}</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 p-3">
          <p className="text-[10px] font-semibold uppercase text-slate-500">Hành động</p>
          <p className="mt-1.5 truncate text-sm font-medium text-slate-200" title={device?.name}>{device?.name || rule.targetDeviceId}</p>
          <p className={`mt-0.5 text-xs font-semibold ${rule.targetAction === 'ON' ? 'text-emerald-300' : 'text-rose-300'}`}>
            {rule.targetAction === 'ON' ? 'Bật thiết bị' : 'Tắt thiết bị'}
            {rule.sendNotification && <span className="ml-2 inline-flex items-center gap-1 font-normal text-slate-500"><Bell className="h-3 w-3" /> Có thông báo</span>}
          </p>
        </div>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-3">
        <p className="text-xs text-slate-500"></p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} title="Chỉnh sửa" aria-label={`Chỉnh sửa ${rule.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={onDelete} title="Xóa" aria-label={`Xóa ${rule.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-300">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </article>
  );
}