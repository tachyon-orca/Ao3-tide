export default async function globalTeardown() {
  const server = (globalThis as any).__staticServer;
  if (server) {
    await new Promise<void>((resolve) => server.close(resolve));
  }
}
