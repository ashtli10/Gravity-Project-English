import { Platform, GameConfig } from "./types";

export function generateInitialPlatforms(config: GameConfig): Platform[] {
  const platforms: Platform[] = [];
  const groundY = config.canvasHeight * 0.75;

  // Starting platform (wide and safe)
  platforms.push({
    x: -50,
    y: groundY,
    width: 300,
    height: 400,
  });

  let lastX = 250;
  for (let i = 0; i < 10; i++) {
    const gap = config.gapMinWidth + Math.random() * (config.gapMaxWidth - config.gapMinWidth);
    const width = config.platformMinWidth + Math.random() * (config.platformMaxWidth - config.platformMinWidth);
    const yVariation = (Math.random() - 0.5) * 40;
    platforms.push({
      x: lastX + gap,
      y: groundY + yVariation,
      width,
      height: 400,
    });
    lastX = lastX + gap + width;
  }

  return platforms;
}

export function generateAhead(
  platforms: Platform[],
  cameraX: number,
  canvasWidth: number,
  config: GameConfig
): void {
  if (platforms.length === 0) return;
  const lastPlatform = platforms[platforms.length - 1];
  const generateUntil = cameraX + canvasWidth * 3;

  while (lastPlatform.x + lastPlatform.width < generateUntil) {
    const gap = config.gapMinWidth + Math.random() * (config.gapMaxWidth - config.gapMinWidth);
    const width = config.platformMinWidth + Math.random() * (config.platformMaxWidth - config.platformMinWidth);
    const baseY = config.canvasHeight * 0.75;
    const yVariation = (Math.random() - 0.5) * 50;

    const newPlatform: Platform = {
      x: lastPlatform.x + lastPlatform.width + gap,
      y: baseY + yVariation,
      width,
      height: 400,
    };

    platforms.push(newPlatform);
  }
}

export function pruneBehind(platforms: Platform[], cameraX: number): void {
  while (platforms.length > 0 && platforms[0].x + platforms[0].width < cameraX - 200) {
    platforms.shift();
  }
}
