// redis.js — mock, replace with real Redis client later
const store = {};
const locks = {};

const client = {
  get: async (key) => store[key] ?? null,

  set: async (key, value, opts = {}) => {
    if (opts.NX && locks[key]) return null; // NX = only set if not exists
    store[key] = String(value);
    locks[key] = true;
    if (opts.EX) {
      setTimeout(() => {
        delete store[key];
        delete locks[key];
      }, opts.EX * 1000);
    }
    return 'OK';
  },

  del: async (key) => {
    delete store[key];
    delete locks[key];
  },

  eval: async (script, { keys }) => {
    const key = keys[0];
    const stock = parseInt(store[key] ?? '0');
    if (stock <= 0) return -1;
    store[key] = String(stock - 1);
    return stock - 1;
  },

  // expose for inspection during dev
  _store: store,
};

module.exports = client;