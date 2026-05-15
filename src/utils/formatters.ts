export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN');
};

export const formatTimestamp = () => {
  return new Date().toLocaleTimeString('vi-VN');
};
