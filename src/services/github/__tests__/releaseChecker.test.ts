import { isNewerVersion } from '../releaseChecker';

describe('isNewerVersion', () => {
  it('returns true when latest major is higher', () => {
    expect(isNewerVersion('2.0.0', '1.0.0')).toBe(true);
  });

  it('returns true when latest minor is higher', () => {
    expect(isNewerVersion('1.1.0', '1.0.0')).toBe(true);
  });

  it('returns true when latest patch is higher', () => {
    expect(isNewerVersion('1.0.1', '1.0.0')).toBe(true);
  });

  it('returns false when versions are equal', () => {
    expect(isNewerVersion('1.0.0', '1.0.0')).toBe(false);
  });

  it('returns false when current is newer', () => {
    expect(isNewerVersion('1.0.0', '2.0.0')).toBe(false);
    expect(isNewerVersion('1.0.0', '1.1.0')).toBe(false);
    expect(isNewerVersion('1.0.0', '1.0.1')).toBe(false);
  });

  it('handles v prefix', () => {
    expect(isNewerVersion('v2.0.0', 'v1.0.0')).toBe(true);
    expect(isNewerVersion('v1.0.0', '1.0.0')).toBe(false);
  });

  it('returns false for invalid version strings', () => {
    expect(isNewerVersion('invalid', '1.0.0')).toBe(false);
    expect(isNewerVersion('1.0.0', 'invalid')).toBe(false);
    expect(isNewerVersion('', '')).toBe(false);
  });

  it('returns false for versions with wrong segment count', () => {
    expect(isNewerVersion('1.0', '1.0.0')).toBe(false);
    expect(isNewerVersion('1.0.0.0', '1.0.0')).toBe(false);
  });

  it('compares major before minor before patch', () => {
    expect(isNewerVersion('2.0.0', '1.9.9')).toBe(true);
    expect(isNewerVersion('1.2.0', '1.1.9')).toBe(true);
  });
});
