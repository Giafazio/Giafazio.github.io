import type { Locator } from '@playwright/test';

// Read positions every animation frame, relative to a stable container so
// page scrolling cannot masquerade as card movement.
export async function samplePositions(elements: Locator, durationMs = 500) {
  return elements.evaluateAll((nodes, duration) => new Promise<{ x: number; y: number }[][]>(resolve => {
    const samples: { x: number; y: number }[][] = [];
    const started = performance.now();
    function sample() {
      samples.push(nodes.map(node => {
        const box = node.getBoundingClientRect();
        const parent = node.parentElement!.getBoundingClientRect();
        return { x: box.x - parent.x, y: box.y - parent.y };
      }));
      if (performance.now() - started >= duration) resolve(samples);
      else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }), durationMs);
}

export function motionSpans(samples: Awaited<ReturnType<typeof samplePositions>>) {
  return samples[0].map((_, index) => {
    const points = samples.map(sample => sample[index]);
    return Math.max(
      Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x)),
      Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)),
    );
  });
}
