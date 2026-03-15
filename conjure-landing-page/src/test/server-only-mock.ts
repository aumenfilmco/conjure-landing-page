// Mock for 'server-only' package in test environment.
// The real package throws at import time to prevent client-bundle leakage.
// In Vitest (Node/jsdom environment) we simply no-op so server modules can be tested.
export {}
