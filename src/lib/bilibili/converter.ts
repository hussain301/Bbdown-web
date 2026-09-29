const XOR_CODE = 23442827791579n;
const MASK_CODE = (1n << 51n) - 1n;
const ALPHABET = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';
const BASE = BigInt(ALPHABET.length);

const TR = (() => {
  const map: Record<string, bigint> = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    map[ALPHABET[i]] = BigInt(i);
  }
  return map;
})();

// Old BV format (BV1xx..., 10 chars after BV)
const S_OLD = [11, 10, 3, 8, 4, 6];


export function bv2av(bvid: string): number {
  // Strip BV prefix
  let bv = bvid;
  if (bv.toLowerCase().startsWith('bv')) {
    bv = bv.substring(2);
  }

  try {
    if (bv.length === 10) {
      // Old format: 10 chars
      let r = 0n;
      for (let i = 0; i < 6; i++) {
        const ch = bv[S_OLD[i]];
        if (!(ch in TR)) return 0;
        r += TR[ch] * (BASE ** BigInt(i));
      }
      return Number((r & MASK_CODE) ^ XOR_CODE);
    } else if (bv.length >= 11) {
      // New format: 12 chars (or 11) - use different algorithm
      // Try direct API approach - just pass BV ID to API
      return 0; // Signal to use bvid directly
    }
  } catch (e) {
    return 0;
  }
  
  return 0;
}

export function av2bv(avid: number): string {
  let bv = Array.from('1  4 1 7  ');
  let n = (BigInt(avid) ^ XOR_CODE) & MASK_CODE;
  for (let i = 0; i < 6; i++) {
    bv[S_OLD[i]] = ALPHABET[Number((n / (BASE ** BigInt(i))) % BASE)];
  }
  return 'BV' + bv.join('');
}
