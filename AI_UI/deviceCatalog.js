export const DEVICE_CATALOG = [
  { id: 'FAN_01', name: 'Quạt hút thông gió' },
  { id: 'HEATER_01', name: 'Đèn sưởi hồng ngoại' },
  { id: 'MIST_01', name: 'Máy phun sương làm mát' },
  { id: 'WINDOW_01', name: 'Mô-tơ cửa gió tự động' },
  { id: 'LIGHT_01', name: 'Hệ thống đèn LED chiếu sáng' }
];

export const DEVICE_NAMES = Object.fromEntries(
  DEVICE_CATALOG.map(({ id, name }) => [id, name])
);
