import React, { useState, useEffect } from 'react';
import { 
  Bird, AlertTriangle, Thermometer, Droplets, Wind, Cpu, 
  CheckCircle, ShieldCheck, AlertCircle, Video, Maximize, 
  LineChart as LineChartIcon, Bell, UserMinus, CheckCircle2, Sliders,
  X, ZoomIn, ZoomOut, RotateCcw, Power, LayoutDashboard, Eye, Zap, Workflow
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import NotificationCenter from '../AI_UI/notifications.jsx';
import PowerDashboard from '../AI_UI/PowerDashboard.jsx';
import AutomationRules, { initialRules } from '../AI_UI/AutomationRules.jsx';
import DeviceControls from '../AI_UI/DeviceControls.jsx';
import AIChickenAnalysis from '../AI_UI/AIChickenAnalysis.jsx';
import { fetchCollection } from './api.js';

function NavigationSidebar({ activePage, onNavigate }) {
  const navigationItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'ai-analysis', label: 'Phân tích gà', icon: Eye },
    { id: 'devices', label: 'Thiết bị', icon: Power },
    { id: 'power', label: 'Điện năng', icon: Zap },
    { id: 'automation', label: 'Quy tắc tự động', icon: Workflow },
    { id: 'notifications', label: 'Thông báo', icon: Bell }
  ];

  return (
    <aside className="z-40 flex w-full shrink-0 flex-col border-b border-slate-700/60 bg-[#111c2f] md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="hidden items-center gap-3 border-b border-slate-700/60 px-5 py-5 md:flex">
        <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400"><Bird className="h-6 w-6" /></div>
        <div><p className="text-sm font-bold text-white">Smart Poultry AI</p><p className="text-[10px] text-slate-500">FARM MANAGEMENT</p></div>
      </div>
      <nav aria-label="Điều hướng chính" className="flex gap-2 overflow-x-auto p-3 md:flex-col md:gap-1 md:p-4">
        <p className="hidden px-3 pb-2 pt-1 text-[10px] font-semibold text-slate-500 md:block">KHÔNG GIAN LÀM VIỆC</p>
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onNavigate(id)} aria-current={activePage === id ? 'page' : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl border px-3 text-sm font-medium transition md:w-full ${activePage === id ? 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300' : 'border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'}`}>
            <Icon className="h-4 w-4" /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto hidden border-t border-slate-700/60 px-5 py-4 text-[11px] text-slate-500 md:block">Smart Poultry AI · Chuồng #02</div>
    </aside>
  );
}

function PageShell({ activePage, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-[#0f172a] md:flex">
      <NavigationSidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="min-w-0 flex-1">{children}</div>
      {activePage !== 'power' && (
        <div className="hidden" aria-hidden="true">
          <PowerDashboard trackingOnly />
        </div>
      )}
    </div>
  );
}

const initialChartData = [
  { time: '14:20', temp: 28.1, humidity: 60, gas: 10 },
  { time: '14:21', temp: 28.2, humidity: 61, gas: 11 },
  { time: '14:22', temp: 28.4, humidity: 63, gas: 11 },
  { time: '14:23', temp: 28.3, humidity: 62, gas: 12 },
  { time: '14:24', temp: 28.5, humidity: 62, gas: 12 },
  { time: '14:25', temp: 28.5, humidity: 63, gas: 11 },
  { time: '14:26', temp: 28.6, humidity: 61, gas: 13 },
  { time: '14:27', temp: 28.4, humidity: 62, gas: 12 },
  { time: '14:28', temp: 28.5, humidity: 62, gas: 12 },
  { time: '14:29', temp: 28.5, humidity: 62, gas: 12 }
];

const initialLogs = [
  {
    id: 1,
    sourceType: 'ai',
    time: '14:22:10',
    type: 'Gà đứng im lâu (>10p)',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
    textColor: 'text-amber-300',
    location: 'Khu vực B - Cam 01 (ID: #G-084)',
    severity: 'Trung bình',
    severityBg: 'bg-amber-500/20 text-amber-300',
    action: 'Gửi thông báo ứng dụng Mobile',
    status: 'Đang theo dõi',
    statusColor: 'text-slate-400'
  },
  {
    id: 2,
    sourceType: 'ai',
    time: '13:05:45',
    type: 'Phát hiện gà tách đàn',
    icon: UserMinus,
    iconColor: 'text-purple-400',
    textColor: 'text-purple-300',
    location: 'Góc Tây Bắc (ID: #G-102)',
    severity: 'Thấp',
    severityBg: 'bg-purple-500/20 text-purple-300',
    action: 'Khoanh vùng trên Cam',
    status: 'Đang theo dõi',
    statusColor: 'text-slate-400'
  },
  {
    id: 3,
    sourceType: 'system',
    time: '09:12:00',
    type: 'Cửa sổ sát trần',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-300',
    location: 'Toàn bộ hệ thống',
    severity: 'Thông tin',
    severityBg: 'bg-blue-500/20 text-blue-300',
    action: 'Mở cửa 75% theo lịch hẹn',
    status: 'Hoàn tất',
    statusColor: 'text-emerald-400'
  }
];

const videoStreamUrl = 'http://localhost:5000/api/video?source=0';
const latestDataUrl = 'http://localhost:5000/api/latest-data';

export default function App() {
  const [time, setTime] = useState(new Date());
  const [activePage, setActivePage] = useState('dashboard');
  const [chartData, setChartData] = useState(initialChartData);
  const [logs, setLogs] = useState(initialLogs);
  const [automationRules, setAutomationRules] = useState(initialRules);
  const [flockData, setFlockData] = useState(null);
  
  // Camera Modal & Zoom State
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Custom Information Modal State
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' // 'info' | 'success' | 'warning' | 'danger'
  });

  // Zoom control handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(Number((prev - 0.25).toFixed(2)), 1));
  const handleResetZoom = () => setZoomLevel(1);
  const closeCameraModal = () => {
    setIsCameraExpanded(false);
    setZoomLevel(1);
  };

  const closeInfoModal = () => {
    setInfoModal(prev => ({ ...prev, isOpen: false }));
  };

  // Sensors State
  const [sensors, setSensors] = useState({ temp: 28.5, humidity: 62, gas: 12 });
  
  // Actuators State
  const [fanOn, setFanOn] = useState(false);
  const [windowOpen, setWindowOpen] = useState(true);
  const [heaterOn, setHeaterOn] = useState(false);
  const [feedMessage, setFeedMessage] = useState(null);
  
  // Hazard State
  const [hazard, setHazard] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLatestData = async () => {
      try {
        const response = await fetch(latestDataUrl);
        if (!response.ok && response.status !== 202) {
          throw new Error(`Latest data request failed: ${response.status}`);
        }

        const payload = await response.json();
        if (isMounted && payload.ready && payload.data) {
          setFlockData(payload.data);
        }
      } catch (error) {
        if (isMounted) {
          setFlockData(null);
        }
      }
    };

    loadLatestData();
    const timer = setInterval(loadLatestData, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchCollection('automationRules'), fetchCollection('devices')])
      .then(([rules, devices]) => {
        if (!isMounted) return;
        if (rules.length) setAutomationRules(rules);
        const byId = new Map(devices.map((device) => [device.deviceId || device.id, device]));
        if (byId.has('FAN_01')) setFanOn(Boolean(byId.get('FAN_01').enabled));
        if (byId.has('WINDOW_01')) setWindowOpen(Boolean(byId.get('WINDOW_01').enabled));
        if (byId.has('HEATER_01')) setHeaterOn(Boolean(byId.get('HEATER_01').enabled));
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Clear feed message automatically after 3 seconds
  useEffect(() => {
    if (feedMessage) {
      const timer = setTimeout(() => setFeedMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedMessage]);

  const addLog = (type, location, severity, severityBg, action, status, statusColor) => {
    const newLog = {
      id: Date.now(),
      sourceType: 'sensor',
      time: new Date().toLocaleTimeString('vi-VN'),
      type,
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      textColor: 'text-red-400',
      location,
      severity,
      severityBg,
      action,
      status,
      statusColor
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const triggerGasAlert = () => {
    setSensors({ ...sensors, gas: 48 });
    setHazard({
      type: 'GAS',
      title: 'CẢNH BÁO NGUY HIỂM KHẨN CẤP!',
      message: 'Phát hiện Nồng độ Khí Gas/NH3 vượt mức cực hạn (48 PPM)! Hệ thống tự động BẬT Quạt thông gió!'
    });
    setFanOn(true);
    addLog(
      'BÁO ĐỘNG KHÍ GAS / HỎA HOẠN', 'Khu vực Trung tâm', 
      'Nghiêm trọng', 'bg-red-500/20 text-red-300', 
      'Tự động Bật Quạt & Mở Cửa', 'Cần xử lý', 'text-red-400 font-semibold'
    );
    
    // Update chart
    const newData = [...chartData];
    newData[newData.length - 1] = { ...newData[newData.length - 1], gas: 48 };
    setChartData(newData);
  };

  const triggerHighTemp = () => {
    setSensors({ ...sensors, temp: 35.8 });
    setHazard({
      type: 'TEMP',
      title: 'CẢNH BÁO QUÁ NHIỆT!',
      message: 'Cảnh báo Nhiệt độ chuồng quá cao (35.8°C)! Nguy cơ gây sốc nhiệt cho đàn gà.'
    });
    setFanOn(true);
    addLog(
      'Báo động Quá nhiệt', 'Cảm biến T-01', 
      'Cao', 'bg-red-500/20 text-red-300', 
      'Bật quạt & Phun sương', 'Cần xử lý', 'text-red-400 font-semibold'
    );

    // Update chart
    const newData = [...chartData];
    newData[newData.length - 1] = { ...newData[newData.length - 1], temp: 35.8 };
    setChartData(newData);
  };

  const resetSimulations = () => {
    setSensors({ temp: 28.5, humidity: 62, gas: 12 });
    setHazard(null);
    const newData = [...chartData];
    newData[newData.length - 1] = { ...newData[newData.length - 1], temp: 28.5, gas: 12 };
    setChartData(newData);
  };

  const dismissHazard = () => setHazard(null);
  
  const dispenseFeed = () => {
    setFeedMessage('🔔 Đã kích hoạt mô-tơ xả cám! Đang cung cấp 10kg thức ăn vào máng.');
    setInfoModal({
      isOpen: true,
      title: 'Hệ Thống Cho Ăn Tự Động',
      message: '🔔 Đã kích hoạt mô-tơ xả cám thành công! Đang cung cấp 10kg thức ăn vào máng cho đàn gà.',
      type: 'success'
    });
  };

  const normalizeBehavior = (behavior) => String(behavior ?? '').trim().toLocaleLowerCase('vi');
  const detectedChickens = flockData?.total_tracks ?? null;
  const standingCount = flockData?.chickens?.filter(
    (chicken) => normalizeBehavior(chicken.behavior) === 'standing'
  ).length ?? null;
  const behaviorAlerts = flockData?.chickens?.filter((chicken) => {
    const behavior = normalizeBehavior(chicken.behavior);
    return behavior && behavior !== 'unknown' && behavior !== 'normal';
  }).length ?? null;
  const temporarilyMissingCount = flockData?.temporarily_missing ?? null;

  if (activePage === 'notifications') {
    return <PageShell activePage={activePage} onNavigate={setActivePage}><NotificationCenter /></PageShell>;
  }
  if (activePage === 'power') {
    return <PageShell activePage={activePage} onNavigate={setActivePage}><PowerDashboard /></PageShell>;
  }
  if (activePage === 'automation') {
    return <PageShell activePage={activePage} onNavigate={setActivePage}><AutomationRules rules={automationRules} setRules={setAutomationRules} /></PageShell>;
  }
  if (activePage === 'devices') {
    return <PageShell activePage={activePage} onNavigate={setActivePage}>
      <DeviceControls rules={automationRules} fanOn={fanOn} setFanOn={setFanOn} windowOpen={windowOpen} setWindowOpen={setWindowOpen} heaterOn={heaterOn} setHeaterOn={setHeaterOn} onDispenseFeed={dispenseFeed} feedMessage={feedMessage} onNavigate={setActivePage} />
    </PageShell>;
  }
  if (activePage === 'ai-analysis') {
    return <PageShell activePage={activePage} onNavigate={setActivePage}>
      <AIChickenAnalysis videoStreamUrl={videoStreamUrl} flockData={flockData} logs={logs} inferenceStatus={{ running: false }} />
    </PageShell>;
  }

  return (
    <PageShell activePage={activePage} onNavigate={setActivePage}>
    <div className="bg-[#0f172a] text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
                <Bird className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight text-white">Smart Poultry AI</h1>
                <p className="text-xs text-slate-400">Hệ thống Giám sát & Trại gà Thông minh</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Hệ thống Hoạt động BÌNH THƯỜNG</span>
              </div>
              <div className="text-right border-l border-slate-700 pl-4">
                <div className="text-xs text-slate-400">Thời gian thực</div>
                <div className="text-sm font-mono font-medium text-slate-200">
                  {time.toLocaleTimeString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {hazard && (
          <div className="bg-red-900/40 border-2 border-red-500 text-red-200 p-4 rounded-xl flex items-center justify-between animate-[pulse_1.5s_ease-in-out_infinite]">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg text-white">{hazard.title}</h3>
                <p className="text-sm text-red-300">{hazard.message}</p>
              </div>
            </div>
            <button 
              onClick={dismissHazard}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition"
            >
              Tắt Còi Báo
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Nhiệt Độ Chuồng</p>
                <h3 className="text-3xl font-bold mt-1 text-white">
                  {sensors.temp}<span className="text-lg font-normal text-slate-400">°C</span>
                </h3>
              </div>
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <Thermometer className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-400">
              {sensors.temp > 31 ? (
                <span className="text-red-400 font-semibold flex items-center mr-2">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Quá nhiệt
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center mr-2">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Lý tưởng
                </span>
              )}
              (Ngưỡng: 26°C - 31°C)
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Độ Ẩm Không Khí</p>
                <h3 className="text-3xl font-bold mt-1 text-white">
                  {sensors.humidity}<span className="text-lg font-normal text-slate-400">%</span>
                </h3>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Droplets className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center mr-2">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Ổn định
              </span>
              (Ngưỡng: 55% - 70%)
            </div>
          </div>

          {/* Gas / NH3 */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Khí Gas & Ammonia (NH3)</p>
                <h3 className="text-3xl font-bold mt-1 text-white">
                  {sensors.gas}<span className="text-lg font-normal text-slate-400"> PPM</span>
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${sensors.gas > 25 ? 'bg-red-500/20 text-red-400 animate-bounce' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Wind className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-400">
              {sensors.gas > 25 ? (
                <span className="text-red-400 font-bold flex items-center mr-2">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Báo Động!
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center mr-2">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> An toàn
                </span>
              )}
              (Báo động &gt; 25 PPM)
            </div>
          </div>

          {/* Flock / AI Status */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Tổng Đàn Gà / Phát Hiện AI</p>
                <h3 className="text-3xl font-bold mt-1 text-white">
                  {detectedChickens === null ? '--' : detectedChickens.toLocaleString('vi-VN')}
                  <span className="text-sm font-normal text-slate-400"> con</span>
                </h3>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-400">
              <span className="text-amber-400 font-semibold flex items-center mr-2">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {behaviorAlerts === null ? '--' : behaviorAlerts} Cảnh báo AI
              </span>
              (Đứng im / Tách đàn)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Camera Video Stream */}
          <div className="lg:col-span-7 bg-[#1e293b] rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-slate-100">Camera AI Giám Sát Trực Tiếp</h2>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 font-mono">Py-YOLOv8 Active</span>
              </div>
            </div>

            <div className="relative bg-slate-950 rounded-xl aspect-video overflow-hidden border border-slate-800 flex items-center justify-center group">
              <img
                src={videoStreamUrl}
                alt="Luồng camera trực tiếp đã được AI phân tích"
                className="absolute inset-0 w-full h-full object-cover"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"></div>

              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded backdrop-blur">
                Cam-01 | FPS: 29.4 | Temp Overlay: Normal
              </div>

              { }
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button 
                  onClick={() => setIsCameraExpanded(true)}
                  title="Mở rộng camera"
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs backdrop-blur transition border border-slate-700 flex items-center gap-1.5 shadow"
                >
                  <Maximize className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-xs font-medium">Phóng to</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-[11px] text-slate-400">Cảnh báo đứng im</p>
                <p className="text-lg font-bold text-amber-400">
                  {standingCount === null ? '--' : `${standingCount} con`}
                </p>
              </div>
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-[11px] text-slate-400">Mất dấu tạm thời</p>
                <p className="text-lg font-bold text-purple-400">
                  {temporarilyMissingCount === null ? '--' : `${temporarilyMissingCount} con`}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Recharts */}
          <div className="lg:col-span-5 bg-[#1e293b] rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <LineChartIcon className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-slate-100">Biểu Đồ Thời Gian Thực</h2>
              </div>
              <span className="text-xs text-slate-400">10 phút gần đây</span>
            </div>

            <div className="relative w-full h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gas" name="Khí Gas (PPM)" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-4 text-xs mt-2 border-t border-slate-700/50 pt-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-slate-300">Nhiệt độ</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-slate-300">Độ ẩm</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Khí Gas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-slate-100">Nhật Ký Cảnh Báo AI & Báo Động</h2>
            </div>
            <button className="text-xs text-emerald-400 hover:underline">Xóa lịch sử</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Thời Gian</th>
                  <th className="p-3">Loại Cảnh Báo</th>
                  <th className="p-3">Vị Trí / Đối Tượng</th>
                  <th className="p-3">Mức Độ</th>
                  <th className="p-3">Hành Động Tự Động</th>
                  <th className="p-3 rounded-r-lg">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => {
                  const Icon = log.icon;
                  return (
                    <tr key={log.id} className={`hover:bg-slate-800/40 transition ${log.severity === 'Nghiêm trọng' || log.severity === 'Cao' ? 'bg-red-950/20' : ''}`}>
                      <td className="p-3 font-mono text-slate-400">{log.time}</td>
                      <td className={`p-3 font-medium flex items-center gap-1.5 ${log.textColor}`}>
                        <Icon className={`w-4 h-4 ${log.iconColor}`} /> {log.type}
                      </td>
                      <td className="p-3">{log.location}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded font-semibold ${log.severityBg}`}>{log.severity}</span></td>
                      <td className="p-3 text-slate-400">{log.action}</td>
                      <td className="p-3"><span className={log.statusColor}>{log.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demostration Simulation Toolset */}
        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4" /> MÔ PHỎNG SỰ CỐ DÀNH CHO DEMO:
          </span>
          <div className="flex flex-wrap gap-2">
            <button onClick={triggerGasAlert} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs transition">
              🔥 Rò Rỉ Gas / Khói
            </button>
            <button onClick={triggerHighTemp} className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-lg text-xs transition">
              ☀️ Tăng Nhiệt Độ
            </button>
            <button onClick={resetSimulations} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs transition">
              🔄 Khôi Phục Bình Thường
            </button>
          </div>
        </div>

        {}
        {/* Modal Camera Phóng To & Thu Phóng Chi Tiết */}
        {isCameraExpanded && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 animate-fadeIn">
            <div className="bg-[#1e293b] border border-slate-700/80 rounded-2xl w-full max-w-[98vw] max-h-[98vh] flex flex-col overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                      Camera AI Giám Sát Chi Tiết - Cam 01
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-normal">
                        FHD 1080p
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Chế độ xem mở rộng & Phân tích hành vi đàn gà theo thời gian thực</p>
                  </div>
                </div>

                {/* Toolbar Controls */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1 text-xs">
                    <button 
                      onClick={handleZoomOut} 
                      disabled={zoomLevel <= 1}
                      title="Thu nhỏ"
                      className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-700 rounded transition"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-mono font-semibold text-emerald-400 min-w-[55px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button 
                      onClick={handleZoomIn} 
                      disabled={zoomLevel >= 3}
                      title="Phóng to"
                      className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 hover:bg-slate-700 rounded transition"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleResetZoom}
                      title="Đặt lại độ thu phóng"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition border-l border-slate-700 ml-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={closeCameraModal} 
                    className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition border border-slate-700"
                    title="Đóng (ESC)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Stream Body with Dynamic Zoom Transform */}
              <div className="flex-1 overflow-auto bg-slate-950 relative min-h-[350px] sm:min-h-[480px] flex items-center justify-center p-2 sm:p-3">
                <div 
                  className="relative w-full max-w-[96vw] aspect-video rounded-xl overflow-hidden border border-slate-800 shadow-2xl transition-transform duration-200 ease-out origin-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    src={videoStreamUrl}
                    alt="Luồng camera trực tiếp đã được AI phân tích"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"></div>

                  {/* AI Detection Boxes */}
                  <div className="absolute top-[35%] left-[25%] w-20 h-20 border-2 border-emerald-500/80 bg-emerald-500/10 rounded-lg flex flex-col justify-between p-1 shadow-lg">
                    <span className="bg-emerald-500 text-[10px] text-black font-bold px-1.5 py-0.5 rounded w-max shadow">Chicken 98%</span>
                    <span className="text-[9px] text-emerald-300 font-mono">Bình thường</span>
                  </div>

                  <div className="absolute top-[50%] left-[55%] w-24 h-24 border-2 border-amber-500 bg-amber-500/20 rounded-lg flex flex-col justify-between p-1 animate-pulse shadow-lg">
                    <span className="bg-amber-500 text-[10px] text-black font-bold px-1.5 py-0.5 rounded w-max shadow">⚠️ Đứng im 12p</span>
                    <div className="text-right">
                      <p className="text-[9px] text-amber-300 font-mono">ID: #G-084</p>
                      <p className="text-[8px] text-slate-300 font-mono">Thân nhiệt: 41.2°C</p>
                    </div>
                  </div>

                  <div className="absolute top-[20%] right-[15%] w-20 h-20 border-2 border-purple-500 bg-purple-500/20 rounded-lg flex flex-col justify-between p-1 shadow-lg">
                    <span className="bg-purple-500 text-[10px] text-white font-bold px-1.5 py-0.5 rounded w-max shadow">⚠️ Tách đàn</span>
                    <div className="text-right">
                      <p className="text-[9px] text-purple-300 font-mono">ID: #G-102</p>
                      <p className="text-[8px] text-slate-300 font-mono">Khoảng cách: 2.8m</p>
                    </div>
                  </div>

                  {/* Live Stream Overlay Details */}
                  <div className="absolute bottom-3 left-3 text-xs font-mono text-slate-300 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur border border-slate-800 flex items-center gap-3">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> LIVE
                    </span>
                    <span>FPS: 29.8</span>
                    <span>Độ trễ AI: 12ms</span>
                    <span>Phát hiện: 42 gà</span>
                  </div>

                  <div className="absolute top-3 right-3 text-xs font-mono text-slate-300 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur border border-slate-800">
                    Khung hình: 1920x1080
                  </div>
                </div>
              </div>

              {/* Modal Footer Info Panel */}
              <div className="px-5 py-3 bg-slate-900 border-t border-slate-700/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Khỏe mạnh: <strong className="text-white">1,243</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Cảnh báo bất thường: <strong className="text-amber-400">2</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Sử dụng thanh công cụ để phóng to tối đa 300% và soi rõ từng vùng chuồng.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Custom Interactive Information Modal (Hộp thoại thông báo tương tác) */}
        {infoModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#1e293b] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative flex flex-col items-center text-center transform transition-all scale-100">
              <button 
                onClick={closeInfoModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={`p-4 rounded-full mb-4 ${
                infoModal.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                infoModal.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                infoModal.type === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {infoModal.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> :
                 infoModal.type === 'warning' ? <AlertTriangle className="w-10 h-10" /> :
                 infoModal.type === 'danger' ? <AlertCircle className="w-10 h-10" /> :
                 <Bell className="w-10 h-10" />}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{infoModal.title}</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                {infoModal.message}
              </p>

              <button
                onClick={closeInfoModal}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-900/30 text-sm active:scale-95"
              >
                Xác nhận / Đóng
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
    </PageShell>
  );
}