import { createApp } from './app.js';
import { sendDueReminders } from './auth.js';

const PORT = Number(process.env.PORT) || 3001;
createApp().listen(PORT, () => console.log(`API działa na http://localhost:${PORT}`));

let sendingReminders = false;
const reminderTimer = setInterval(() => {
  if (sendingReminders) return;
  sendingReminders = true;
  sendDueReminders()
    .catch((error) => console.error('Nie udało się wysłać przypomnień:', error))
    .finally(() => { sendingReminders = false; });
}, 30_000);
reminderTimer.unref();
