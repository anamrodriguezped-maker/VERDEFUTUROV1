import { AlertaSensor } from '../types/index.ts';

// Reproductor de sonido sintetizado para alertas críticas mediante Web Audio API
export function playAlertBeep(isCritical = true) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isCritical ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isCritical ? 880 : 520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isCritical ? 440 : 660, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    // Silencio si Web Audio no está disponible
  }
}

/**
 * Solicita permisos de notificación Push al navegador
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Emite una notificación push nativa en tiempo real
 */
export function triggerPushNotification(alerta: AlertaSensor) {
  playAlertBeep(alerta.nivel === 'critica');

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const title =
      alerta.nivel === 'critica'
        ? `⚠️ VERDE FUTURO - Alerta Crítica en ${alerta.parametro.toUpperCase()}`
        : `ℹ️ VERDE FUTURO - Advertencia de ${alerta.parametro}`;

    const options: NotificationOptions & { renotify?: boolean } = {
      body: `${alerta.mensaje}\nRecomendación: ${alerta.sugerencia}`,
      icon: '/logo.jpeg',
      badge: '/logo.jpeg',
      tag: alerta.id,
      renotify: true,
    };

    new Notification(title, options);
  } catch {
    // Notificación en segundo plano o fallback silencioso
  }
}
