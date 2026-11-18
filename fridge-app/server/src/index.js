import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
createApp().listen(PORT, () => console.log(`API działa na http://localhost:${PORT}`));
