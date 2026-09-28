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

const S = [11, 10, 3, 8, 4, 6];

export function bv2av(bvid: string): number {
  if (bvid.startsWith('BV1') || bvid.startsWith('bv1')) {
    bvid = bvid.substring(2);
  } else if (bvid.startsWith('1')) {
    bvid = bvid;
  } else {
    return 0; // Invalid
  }
  
  if (bvid.length !== 10) return 0;
  
  let r = 0n;
  for (let i = 0; i < 6; i++) {
    r += TR[bvid[S[i]]] * (BASE ** BigInt(i));
  }
  return Number((r & MASK_CODE) ^ XOR_CODE);
}

export function av2bv(avid: number): string {
  let bv = Array.from('1  4 1 7  ');
  let n = (BigInt(avid) ^ XOR_CODE) & MASK_CODE;
  for (let i = 0; i < 6; i++) {
    bv[S[i]] = ALPHABET[Number((n / (BASE ** BigInt(i))) % BASE)];
  }
  return 'BV' + bv.join('');
}
