// ตัวช่วยสร้างเสียงแจ้งเตือนผ่าน Web Audio API โดยไม่ต้องพึ่งพาไฟล์เสียงภายนอก

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// เสียงแจ้งเตือนกาแฟพร้อมรับ (Melodic Warm Chime)
export const playReadySound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.65);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// เสียงแจ้งเตือนร้านค้าเมื่อมีออเดอร์ใหม่เข้ามา (Shop Bell Ding-Dong)
export const playNewOrderSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [587.33, 880]; // D5, A5
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.18 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.18);
      osc.stop(ctx.currentTime + idx * 0.18 + 0.85);
    });
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// ขอยื่นคำขอ Web Push Notifications API ของเบราว์เซอร์
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.warn('Notification permission request error:', e);
    }
  }
};

// แสดง Web Notification
export const showBrowserNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100',
        ...options,
      });
    } catch (e) {
      console.warn('Browser notification error:', e);
    }
  }
};
