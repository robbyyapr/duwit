import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 8080;
const CLIENT_DIST = path.resolve(__dirname, '../dist');
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(__dirname, '../data');
const DATA_FILE_NAME = process.env.DATA_FILE ?? 'store.json';
const DATA_FILE_PATH = path.join(DATA_DIR, DATA_FILE_NAME);

const defaultStore = {
  settings: {
    theme: 'light',
    notifGranted: false,
    deductZakatFromBalance: false,
  },
  balances: {
    current: 0,
    history: [],
  },
  zakat: {
    weekly: [],
  },
  lastActivityAt: new Date().toISOString(),
  lastDailyNotif: '',
};

const ensureDataFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(defaultStore, null, 2), 'utf-8');
  }
};

const readStore = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  return {
    ...defaultStore,
    ...parsed,
    settings: {
      ...defaultStore.settings,
      ...(parsed.settings ?? {}),
    },
    balances: {
      current: parsed?.balances?.current ?? defaultStore.balances.current,
      history: Array.isArray(parsed?.balances?.history) ? parsed.balances.history : defaultStore.balances.history,
    },
    zakat: {
      weekly: Array.isArray(parsed?.zakat?.weekly) ? parsed.zakat.weekly : defaultStore.zakat.weekly,
    },
    lastActivityAt: parsed?.lastActivityAt ?? defaultStore.lastActivityAt,
    lastDailyNotif: parsed?.lastDailyNotif ?? defaultStore.lastDailyNotif,
  };
};

const writeStore = async (store) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
};

app.use(express.json({ limit: '1mb' }));

app.get('/api/store', async (_req, res) => {
  try {
    const store = await readStore();
    res.json(store);
  } catch (error) {
    console.error('Failed to read store file', error);
    res.status(500).json({ message: 'Failed to load data' });
  }
});

app.put('/api/store', async (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    const current = await readStore();
    const merged = {
      ...current,
      ...incoming,
      settings: {
        ...current.settings,
        ...(incoming.settings ?? {}),
      },
      balances: {
        current: incoming?.balances?.current ?? current.balances.current,
        history: Array.isArray(incoming?.balances?.history) ? incoming.balances.history : current.balances.history,
      },
      zakat: {
        weekly: Array.isArray(incoming?.zakat?.weekly) ? incoming.zakat.weekly : current.zakat.weekly,
      },
      lastActivityAt: incoming?.lastActivityAt ?? current.lastActivityAt,
      lastDailyNotif: incoming?.lastDailyNotif ?? current.lastDailyNotif,
    };

    await writeStore(merged);
    res.status(204).end();
  } catch (error) {
    console.error('Failed to write store file', error);
    res.status(500).json({ message: 'Failed to save data' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(CLIENT_DIST));

app.use('*', async (_req, res, next) => {
  try {
    await fs.access(path.join(CLIENT_DIST, 'index.html'));
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  } catch (error) {
    next();
  }
});

const start = async () => {
  await ensureDataFile();
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
