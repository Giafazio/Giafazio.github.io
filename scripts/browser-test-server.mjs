import { preview } from 'astro';

// Keep the server attached to Playwright. Astro's CLI can background itself
// when it detects an agent, causing the runner to lose ownership of the process.
const server = await preview({ server: { host: '127.0.0.1', port: 4392, open: false } });
if (server.port !== 4392) {
  await server.stop();
  throw new Error('Browser test port 4392 is occupied.');
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
