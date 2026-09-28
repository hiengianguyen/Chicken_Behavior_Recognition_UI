
    import { useState, useEffect, useMemo, useCallback } from 'react';
    import ToastContainer from './ToastContainer.jsx';

    const INITIAL_NOTIFICATIONS = [
      // SYSTEM TAB
      {
        id: 'SYS-001',
        category: 'system',
        severity: 'info',
        title: 'Quạt hút thông gió #02 đã TỰ ĐỘNG BẬT',
        subtitle: 'Hệ thống tự động kích hoạt dựa trên kịch bản cài đặt',
        description: 'Quạt hút công suất cao #02 đã được bật ở chế độ 80% công suất do nhiệt độ trung bình vượt ngưỡng 30°C.',
        device: 'Quạt Hút #02',
        actionState: 'Bật (ON)',
        timestamp: '10:42 AM - Hôm nay',
        read: false
      },
      {
        id: 'SYS-002',
        category: 'system',
        severity: 'warning',
        title: 'Cửa gió tự động bị kẹt nhẹ khi đóng',
        subtitle: 'Phát hiện lực cản cơ khí bất thường',
        description: 'Cửa hướng gió phía Tây đóng đạt 85% thì motor báo quá dòng nhẹ. Khuyên kiểm tra bụi bẩn ổ khớp truyền động.',
        device: 'Cửa Gió Tây',
        actionState: 'Cảnh báo',
        timestamp: '09:15 AM - Hôm nay',
        read: false
      },
      {
        id: 'SYS-003',
        category: 'system',
        severity: 'info',
        title: 'Hệ thống sưởi hồng ngoại khu A đã TẮT',
        subtitle: 'Hoàn thành chu kỳ sưởi buổi sáng',
        description: 'Đèn sưởi 500W được tắt tự động khi nhiệt độ chuồng đạt ngưỡng tối ưu 28°C.',
        device: 'Đèn Sưởi Khu A',
        actionState: 'Tắt (OFF)',
        timestamp: '08:00 AM - Hôm nay',
        read: true
      },
      {
        id: 'SYS-004',
        category: 'system',
        severity: 'critical',
        title: 'Máy bơm phun sương làm mát bị ngắt điện (Mất tải)',
        subtitle: 'Aptomat chống rò/quá tải tự động ngắt',
        description: 'Máy bơm tưới sưởi làm mát chuồng bị ngắt điện đột ngột. Cần kỹ thuật viên kiểm tra trực tiếp nguồn điện khẩn cấp.',
        device: 'Máy Phun Sương #01',
        actionState: 'Lỗi Ngắt Nguồn',
        timestamp: '07:30 AM - Hôm nay',
        read: false
      },

      // ENVIRONMENT TAB
      {
        id: 'ENV-001',
        category: 'environment',
        severity: 'critical',
        title: 'Nồng độ Khí NH3 (Ammonia) vượt ngưỡng nguy hiểm (28.5 ppm)',
        subtitle: 'Cảm biến Gas Sensor GS-03 phát hiện',
        description: 'Nồng độ khí NH3 trong không khí đạt 28.5 ppm (ngưỡng an toàn < 20 ppm). Có nguy cơ gây bệnh đường hô hấp cho gà.',
        sensorValue: '28.5 ppm',
        unit: 'NH3',
        timestamp: '10:35 AM - Hôm nay',
        read: false
      },
      {
        id: 'ENV-002',
        category: 'environment',
        severity: 'warning',
        title: 'Nhiệt độ chuồng gà tăng cao (33.8 °C)',
        subtitle: 'Cảm biến Temp-Hum DHT22 Khu vực B',
        description: 'Nhiệt độ môi trường đo được là 33.8°C, cao hơn mức lý tưởng 4.8°C. Bắt đầu kích hoạt chế độ làm mát tăng cường.',
        sensorValue: '33.8 °C',
        unit: 'Nhiệt độ',
        timestamp: '10:10 AM - Hôm nay',
        read: false
      },
      {
        id: 'ENV-003',
        category: 'environment',
        severity: 'warning',
        title: 'Độ ẩm không khí xuống thấp (42%)',
        subtitle: 'Cảm biến độ ẩm chuồng trung tâm',
        description: 'Độ ẩm tương đối rơi xuống 42%, không khí bị khô. Khuyến nghị bật phun sương bù ẩm nhẹ.',
        sensorValue: '42 %',
        unit: 'Độ ẩm',
        timestamp: '09:50 AM - Hôm nay',
        read: true
      },
      {
        id: 'ENV-004',
        category: 'environment',
        severity: 'info',
        title: 'Khí CO2 ổn định ở mức an toàn (450 ppm)',
        subtitle: 'Kiểm tra định kỳ cảm biến CO2',
        description: 'Chỉ số lưu thông không khí đạt chất lượng tốt, lượng khí CO2 ổn định.',
        sensorValue: '450 ppm',
        unit: 'CO2',
        timestamp: '06:00 AM - Hôm nay',
        read: true
      },

      // AI VISION TAB
      {
        id: 'AI-001',
        category: 'ai',
        severity: 'critical',
        title: 'Phát hiện gà nằm bất động > 25 phút (Nghi vấn gà bệnh)',
        subtitle: 'AI Camera #01 - Góc Chuồng Phía Đông',
        description: 'Mô hình Computer Vision phát hiện 01 cá thể gà nằm rủ bất động liên tục 25 phút không di chuyển ăn uống.',
        camera: 'Cam #01 (Góc Đông)',
        confidence: '96.2%',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
        recommendation: 'Cần cách ly cá thể nghi bị ốm để tránh lây nhiễm dịch bệnh cho toàn đàn.',
        timestamp: '10:28 AM - Hôm nay',
        read: false
      },
      {
        id: 'AI-002',
        category: 'ai',
        severity: 'warning',
        title: 'Cảnh báo tụ tập mật độ cao ở khu vực máng nước',
        subtitle: 'AI Camera #02 - Khu Uống Nước',
        description: 'AI ghi nhận tụ tập mật độ gà dồn cục bất thường (hơn 45 con/m2) tại khu máng nước số 3. Có thể tắc vòi phun.',
        camera: 'Cam #02 (Khu Máng Uống)',
        confidence: '91.8%',
        imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
        recommendation: 'Kiểm tra vòi cấp nước máng số 3 xem có bị tắc nghẽn nước không.',
        timestamp: '09:40 AM - Hôm nay',
        read: false
      },
      {
        id: 'AI-003',
        category: 'ai',
        severity: 'warning',
        title: 'Khay thức ăn tự động #04 hết sạch nguyên liệu',
        subtitle: 'AI Camera #03 - Máng Ăn Trung Tâm',
        description: 'Hình ảnh phân tích nhận diện khay chứa thức ăn trống hơn 90% liên tục trong 15 phút.',
        camera: 'Cam #03 (Khu Máng Ăn)',
        confidence: '94.5%',
        imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
        recommendation: 'Bật máy tiếp cám tự động hoặc bổ sung thức ăn thủ công.',
        timestamp: '08:20 AM - Hôm nay',
        read: true
      }
    ];

    const REALTIME_SIMULATION_POOL = [
      {
        category: 'system',
        severity: 'info',
        title: 'Hệ thống quạt làm mát #01 vừa KÍCH HOẠT',
        subtitle: 'Tự động theo lập trình nhiệt độ',
        description: 'Bật quạt công suất 100% để hạ nhiệt độ khu nuôi.',
        device: 'Quạt Hút #01',
        actionState: 'Bật (ON)'
      },
      {
        category: 'environment',
        severity: 'critical',
        title: 'CẢNH BÁO KHÍ ĐỘC: Khí CO2 đạt 1200 ppm!',
        subtitle: 'Cảm biến khí Gas Chuồng Trung Tâm',
        description: 'Lượng CO2 tăng nhanh bất thường. Bật ngay hệ thống quạt thông gió cưỡng bức!',
        sensorValue: '1200 ppm',
        unit: 'CO2'
      },
      {
        category: 'ai',
        severity: 'warning',
        title: 'AI phát hiện xô đẩy chen chúc tại máng ăn',
        subtitle: 'AI Camera #04',
        description: 'Đàn gà dồn nén tranh giành thức ăn khu vực máng số 2.',
        camera: 'Cam #04 (Khu Cám)',
        confidence: '93.1%',
        imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
        recommendation: 'Bổ sung thêm khay ăn phụ để giảm áp lực tranh giành.'
      }
    ];

    const playAlertSound = (type = 'info', enabled = true) => {
      if (!enabled) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        let freq = 520;
        if (type === 'critical') freq = 880;
        if (type === 'warning') freq = 650;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {
        console.log('Audio Context error or restricted', e);
      }
    };

    export default function NotificationCenter() {
      const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
      const [currentTab, setCurrentTab] = useState('all');
      const [searchQuery, setSearchQuery] = useState('');
      const [soundEnabled, setSoundEnabled] = useState(true);
      
      const [selectedAiItem, setSelectedAiItem] = useState(null);
      const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
      const [toasts, setToasts] = useState([]);

      const addToast = useCallback((alertObj) => {
        const toastId = Date.now();
        const newToast = { ...alertObj, toastId };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.toastId !== toastId));
        }, 4500);
      }, []);

      const simulateNewAlert = () => {
        const randomSample = REALTIME_SIMULATION_POOL[Math.floor(Math.random() * REALTIME_SIMULATION_POOL.length)];
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Vừa xong';
        const newId = (randomSample.category.toUpperCase()) + '-' + Math.floor(100 + Math.random() * 900);

        const newAlert = {
          ...randomSample,
          id: newId,
          timestamp: timeStr,
          read: false
        };

        setNotifications(prev => [newAlert, ...prev]);
        playAlertSound(newAlert.severity, soundEnabled);
        addToast(newAlert);
      };

      const testToast = () => {
        addToast({
          label: 'Test toast',
          title: 'Thông báo thử nghiệm',
          description: 'Toast xuất hiện từ góc trên bên phải và tự đóng sau vài giây.',
          severity: 'info'
        });
      };

      const dismissToast = (toastId) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.toastId !== toastId));
      };

      const toggleRead = (id) => {
        setNotifications(prev =>
          prev.map(item => item.id === id ? { ...item, read: !item.read } : item)
        );
      };

      const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(item => item.id !== id));
      };

      const clearAllNotifications = () => {
        setNotifications([]);
        setShowClearConfirmModal(false);
      };

      const openAiModal = (item) => {
        setSelectedAiItem(item);
        if (!item.read) {
          toggleRead(item.id);
        }
      };

      const filteredNotifications = useMemo(() => {
        return notifications.filter(item => {
          if (currentTab !== 'all' && item.category !== currentTab) return false;
          if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            const matchTitle = item.title.toLowerCase().includes(query);
            const matchSub = item.subtitle ? item.subtitle.toLowerCase().includes(query) : false;
            const matchDesc = item.description ? item.description.toLowerCase().includes(query) : false;
            if (!matchTitle && !matchSub && !matchDesc) return false;
          }
          return true;
        });
      }, [notifications, currentTab, searchQuery]);

      const stats = useMemo(() => {
        return {
          total: notifications.length,
          unread: notifications.filter(n => !n.read).length,
          critical: notifications.filter(n => n.severity === 'critical').length,
          sysCount: notifications.filter(n => n.category === 'system').length,
          envCount: notifications.filter(n => n.category === 'environment').length,
          aiCount: notifications.filter(n => n.category === 'ai').length,
        };
      }, [notifications]);

      return (
        <div className="min-h-screen overflow-x-hidden bg-[#0f172a] font-sans text-slate-100 selection:bg-emerald-500 selection:text-slate-950">

          <ToastContainer toasts={toasts} onDismiss={dismissToast} />

          {/* Header Navbar */}
          <header className="sticky top-0 z-30 border-b border-slate-700/60 bg-[#1e293b]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h1 className="text-sm font-bold leading-tight text-white sm:text-base">Trung tâm thông báo</h1>
                  <p className="text-xs text-slate-400">Smart Poultry AI · Chuồng #02</p>
                </div>
              </div>

              {/* Header Quick Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-300 transition-colors hover:bg-slate-800"
                  title={soundEnabled ? "Tắt âm thanh cảnh báo" : "Bật âm thanh cảnh báo"}
                >
                  <i className={`fa-solid ${soundEnabled ? 'fa-volume-high text-emerald-400' : 'fa-volume-xmark text-slate-500'}`}></i>
                </button>

                <button
                  onClick={testToast}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Kiểm tra toast thông báo"
                >
                  <i className="fa-solid fa-vial text-cyan-300"></i>
                  <span className="hidden sm:inline">Test toast</span>
                </button>

                <button
                  onClick={simulateNewAlert}
                  className="flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 active:scale-95"
                >
                  <i className="fa-solid fa-bolt"></i>
                  <span className="hidden md:inline">Giả lập Thông báo Mới</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

            {/* Title Header & Stat Cards */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  <i className="fa-solid fa-bell text-emerald-400"></i>
                  Trung Tâm Thông Báo
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Theo dõi nhật ký vận hành thiết bị, cảnh báo chỉ số môi trường và phát hiện hành vi AI.
                </p>
              </div>
            </div>

            {/* Filter & Tab Controls Panel */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-[#1e293b] p-4 shadow-lg">
              
              {/* Category Tabs */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div className="flex w-full items-center space-x-1 overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/70 p-1.5 sm:w-auto sm:space-x-2">
                  
                  <button
                    onClick={() => setCurrentTab('all')}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      currentTab === 'all'
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white font-medium'
                    }`}
                  >
                    <i className="fa-solid fa-list-ul"></i>
                    Tất cả
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${currentTab === 'all' ? 'bg-slate-950/30' : 'bg-slate-800 text-slate-300'}`}>
                      {stats.total}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentTab('system')}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      currentTab === 'system'
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white font-medium'
                    }`}
                  >
                    <i className="fa-solid fa-sliders"></i>
                    System (Hệ thống)
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${currentTab === 'system' ? 'bg-slate-950/30' : 'bg-slate-800 text-slate-300'}`}>
                      {stats.sysCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('environment')}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      currentTab === 'environment'
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white font-medium'
                    }`}
                  >
                    <i className="fa-solid fa-leaf"></i>
                    Environment (Môi trường)
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${currentTab === 'environment' ? 'bg-slate-950/30' : 'bg-slate-800 text-slate-300'}`}>
                      {stats.envCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('ai')}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
                      currentTab === 'ai'
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white font-medium'
                    }`}
                  >
                    <i className="fa-solid fa-brain"></i>
                    AI Hành vi (AI Vision)
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${currentTab === 'ai' ? 'bg-slate-950/30' : 'bg-slate-800 text-slate-300'}`}>
                      {stats.aiCount}
                    </span>
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setShowClearConfirmModal(true)}
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 sm:text-sm"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm thông báo, thiết bị..."
                    className="w-full rounded-xl border border-slate-700/60 bg-slate-950/70 py-2 pl-9 pr-4 text-xs text-slate-200 transition focus:border-emerald-500/60 focus:outline-none sm:text-sm"
                  />
                </div>

              </div>
            </div>

            {/* Notification Cards List */}
            {filteredNotifications.length > 0 ? (
              <div className="flex min-h-[350px] flex-col gap-3">
                {filteredNotifications.map(item => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onDelete={deleteNotification}
                    onOpenAi={openAiModal}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-[#1e293b]/60 px-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-2xl mb-4">
                  <i className="fa-solid fa-bell-slash"></i>
                </div>
                <h3 className="text-base font-semibold text-slate-300">Không tìm thấy thông báo</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">Không có nội dung nào phù hợp với danh mục hoặc từ khóa lọc hiện tại.</p>
              </div>
            )}

          </main>

          {/* AI Snapshot Detail Modal */}
          {selectedAiItem && (
            <AiSnapshotModal
              item={selectedAiItem}
              onClose={() => setSelectedAiItem(null)}
              onConfirm={(msg) => {
                setSelectedAiItem(null);
                addToast({
                  title: 'Đã xác nhận phản hồi',
                  description: msg,
                  severity: 'info'
                });
              }}
            />
          )}

          {/* Clear All Confirmation Dialog */}
          {showClearConfirmModal && (
            <ConfirmDialog
              title="Xác nhận xóa tất cả"
              message="Bạn có chắc chắn muốn xóa toàn bộ thông báo trong danh sách không?"
              onConfirm={clearAllNotifications}
              onCancel={() => setShowClearConfirmModal(false)}
            />
          )}

          <footer className="mt-auto border-t border-slate-800/80 bg-[#0f172a] py-4 text-center text-xs text-slate-600">
            <p>© 2026 Smart Chicken Farming System — Giám Sát Trang Trại Thông Minh</p>
          </footer>
        </div>
      );
    }

    function NotificationCard({ item, onDelete, onOpenAi }) {
      const categoryPresentation = {
        system: {
          label: 'System',
          icon: 'fa-solid fa-sliders',
          color: 'text-blue-400',
          hoverBorder: 'hover:border-blue-500/50',
          titleHover: 'group-hover:text-blue-300',
          badge: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
          iconBackground: 'border-blue-500/20 bg-blue-500/10'
        },
        environment: {
          label: 'Environment',
          icon: 'fa-solid fa-leaf',
          color: 'text-emerald-400',
          hoverBorder: 'hover:border-emerald-500/50',
          titleHover: 'group-hover:text-emerald-300',
          badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
          iconBackground: 'border-emerald-500/20 bg-emerald-500/10'
        },
        ai: {
          label: 'AI Vision',
          icon: 'fa-solid fa-brain',
          color: 'text-purple-400',
          hoverBorder: 'hover:border-purple-500/50',
          titleHover: 'group-hover:text-purple-300',
          badge: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
          iconBackground: 'border-purple-500/20 bg-purple-500/10'
        }
      }[item.category] || {
        label: 'Thông báo',
        icon: 'fa-solid fa-bell',
        color: 'text-emerald-400',
        hoverBorder: 'hover:border-emerald-500/50',
        titleHover: 'group-hover:text-emerald-300',
        badge: 'border-slate-700/70 bg-slate-900/70 text-slate-300',
        iconBackground: 'border-emerald-500/20 bg-emerald-500/10'
      };

      return (
        <div className={`group relative rounded-2xl border border-slate-700/60 bg-[#1e293b] p-4 transition-colors duration-200 sm:p-5 ${categoryPresentation.hoverBorder}`}>
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            
            <div className="flex items-start gap-3.5 flex-1">
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-slate-950 text-lg shadow-inner ${categoryPresentation.iconBackground}`}>
                <i className={`${categoryPresentation.icon} ${categoryPresentation.color}`}></i>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${categoryPresentation.badge}`}>
                    <i className={`${categoryPresentation.icon} mr-1`}></i>{categoryPresentation.label}
                  </span>

                  <span className="text-xs text-slate-500 ml-auto md:ml-0"><i className="fa-regular fa-clock mr-1"></i>{item.timestamp}</span>
                </div>

                <h4 className={`text-sm font-semibold text-white transition sm:text-base ${categoryPresentation.titleHover}`}>
                  {item.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.description}</p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                  {item.device && (
                    <span className="rounded-lg border border-slate-700/60 bg-slate-950/70 px-2.5 py-1">
                      <i className="fa-solid fa-microchip mr-1.5 text-emerald-400"></i>Thiết bị: <b className="text-slate-200">{item.device}</b>
                    </span>
                  )}
                  {item.actionState && (
                    <span className="rounded-lg border border-slate-700/60 bg-slate-950/70 px-2.5 py-1">
                      <i className="fa-solid fa-power-off mr-1.5 text-emerald-400"></i>Trạng thái: <b className="text-slate-200">{item.actionState}</b>
                    </span>
                  )}
                  {item.sensorValue && (
                    <span className="rounded-lg border border-slate-700/60 bg-slate-950/70 px-2.5 py-1">
                      <i className="fa-solid fa-gauge-high mr-1.5 text-emerald-400"></i>Giá trị: <b className="text-slate-100">{item.sensorValue}</b>
                    </span>
                  )}
                  {item.camera && (
                    <span className="rounded-lg border border-slate-700/60 bg-slate-950/70 px-2.5 py-1">
                      <i className="fa-solid fa-video mr-1.5 text-emerald-400"></i>Camera: <b className="text-slate-200">{item.camera}</b>
                    </span>
                  )}
                  {item.confidence && (
                    <span className="rounded-lg border border-slate-700/60 bg-slate-950/70 px-2.5 py-1">
                      <i className="fa-solid fa-bullseye mr-1.5 text-emerald-400"></i>Độ chính xác: <b className="text-emerald-400">{item.confidence}</b>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center md:flex-col justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              {item.category === 'ai' && (
                <button
                  onClick={() => onOpenAi(item)}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-500 md:flex-none"
                >
                  <i className="fa-solid fa-eye"></i> Xem ảnh AI
                </button>
              )}

              <button
                onClick={() => onDelete(item.id)}
                aria-label={`Xóa thông báo: ${item.title}`}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-white md:flex-none"
              >
                <i className="fa-solid fa-trash-can"></i>
                Xóa thông báo
              </button>
            </div>

          </div>
        </div>
      );
    }

    function AiSnapshotModal({ item, onClose, onConfirm }) {
      useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.body.style.overflow = '';
        };
      }, [onClose]);

      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" role="presentation">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-[#1e293b] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ai-snapshot-title">
            
            <div className="flex items-center justify-between border-b border-slate-700/60 bg-[#172033] p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                  <i className="fa-solid fa-brain"></i>
                </span>
                <div>
                  <h3 id="ai-snapshot-title" className="font-bold text-white text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.camera || 'Camera AI'} • Chuồng #02</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng cửa sổ ảnh AI"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-xl border border-slate-700/60 bg-black">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'}
                  alt={`Ảnh AI: ${item.title}`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <rect x="25" y="30" width="35" height="40" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
                  <text x="26" y="28" fill="#ffffff" fontSize="4" fontWeight="bold">
                    Phát hiện [{item.confidence || '95.0%'}]
                  </text>
                </svg>

                <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-md">
                  <span className="flex items-center gap-1.5"><i className="fa-regular fa-clock text-emerald-400"></i> {item.timestamp}</span>
                  <span className="flex items-center gap-1.5"><i className="fa-solid fa-crosshair text-emerald-400"></i> Độ chính xác: <b className="text-emerald-400">{item.confidence || '95.0%'}</b></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-3">
                  <span className="text-xs text-slate-400 font-medium block mb-1">
                    <i className="fa-solid fa-circle-info mr-1 text-emerald-400"></i> Mô tả sự kiện
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-3">
                  <span className="text-xs text-slate-400 font-medium block mb-1">
                    <i className="fa-solid fa-lightbulb mr-1 text-emerald-400"></i> Đề xuất xử lý
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.recommendation || 'Kiểm tra ngay khu vực phát hiện.'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-700/60 bg-[#172033] p-4 sm:flex-row sm:items-center">
              <span className="text-xs text-slate-500">Mã: <code className="text-slate-400">{item.id}</code></span>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="min-h-11 px-4 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Đóng
                </button>
                <button
                  onClick={() => onConfirm(`Đã gửi xác nhận xử lý cho sự kiện ${item.id}`)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  <i className="fa-solid fa-check"></i> Xác nhận phản hồi
                </button>
              </div>
            </div>

          </div>
        </div>
      );
    }

    function ConfirmDialog({ title, message, onConfirm, onCancel }) {
      return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-700/60 bg-[#1e293b] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              <h3 className="font-bold text-lg text-white">{title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i> Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      );
    }

