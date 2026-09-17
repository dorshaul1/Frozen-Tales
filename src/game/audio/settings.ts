export const CHANNELS = ['master', 'music', 'ambience', 'sfx'] as const;
export type Channel = typeof CHANNELS[number];
export type AudioSettings = Record<Channel, { volume: number; muted: boolean }>;
export function audioSettings(value?: unknown): AudioSettings {
  const defaults = { master: .7, music: .5, ambience: .22, sfx: .55 };
  return Object.fromEntries(CHANNELS.map(id => {
    const setting = (value as Partial<AudioSettings> | undefined)?.[id];
    return [id, { volume: typeof setting?.volume === 'number' && Number.isFinite(setting.volume) ? Math.max(0, Math.min(1, setting.volume)) : defaults[id], muted: setting?.muted === true }];
  })) as AudioSettings;
}
