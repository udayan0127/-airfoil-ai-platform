/**
 * NACA 4-digit airfoil coordinate generator.
 *
 * Given a NACA designation like "NACA 2412", returns an array of
 * {x, y} points that define the upper and lower surface of the airfoil.
 *
 * NACA 2412 interpretation:
 *   2 → max camber = 2% of chord
 *   4 → max camber location = 40% of chord from leading edge
 *   12 → max thickness = 12% of chord
 */

export function parseNacaCode(name) {
  // Extract 4 digits from names like "NACA 2412", "NACA 0012", etc.
  const match = name.match(/(\d{4,5})/);
  if (!match) return { m: 0, p: 0, t: 12 };

  const digits = match[1];

  // Handle 5-digit codes (e.g., NACA 23012) - approximate as reflexed camber
  if (digits.length === 5) {
    const m = 2;  // approximated
    const p = 3;  // approximated
    const t = parseInt(digits.slice(3, 5), 10);
    return { m, p, t };
  }

  const m = parseInt(digits[0], 10);       // camber %
  const p = parseInt(digits[1], 10);       // camber position (tenths)
  const t = parseInt(digits.slice(2, 4), 10); // thickness %
  return { m, p, t };
}

/**
 * Generate airfoil coordinates using NACA 4-digit formulas.
 * Returns an array of [x, y] pairs traversing upper surface then lower surface.
 */
export function generateNacaCoords(name, numPoints = 60) {
  const { m: mPct, p: pTenths, t: tPct } = parseNacaCode(name);

  const m = mPct / 100;      // max camber
  const p = pTenths / 10;    // camber position
  const t = tPct / 100;      // max thickness

  const coords = [];

  // Use cosine spacing for finer points near leading edge (looks better in 3D)
  for (let i = 0; i <= numPoints; i++) {
    const beta = (i / numPoints) * Math.PI;
    const x = 0.5 * (1 - Math.cos(beta));

    // Thickness distribution (symmetric part)
    const yt = 5 * t * (
      0.2969 * Math.sqrt(x)
      - 0.1260 * x
      - 0.3516 * x * x
      + 0.2843 * x * x * x
      - 0.1015 * x * x * x * x
    );

    // Camber line
    let yc, dycdx;
    if (m === 0 || p === 0) {
      yc = 0;
      dycdx = 0;
    } else if (x < p) {
      yc = (m / (p * p)) * (2 * p * x - x * x);
      dycdx = (2 * m / (p * p)) * (p - x);
    } else {
      yc = (m / ((1 - p) * (1 - p))) * ((1 - 2 * p) + 2 * p * x - x * x);
      dycdx = (2 * m / ((1 - p) * (1 - p))) * (p - x);
    }

    const theta = Math.atan(dycdx);
    const xu = x - yt * Math.sin(theta);
    const yu = yc + yt * Math.cos(theta);
    const xl = x + yt * Math.sin(theta);
    const yl = yc - yt * Math.cos(theta);

    coords.push({ upper: [xu, yu], lower: [xl, yl] });
  }

  // Build a closed loop: leading edge → upper surface → trailing edge → lower surface back
  const upper = coords.map((c) => c.upper);
  const lower = coords.map((c) => c.lower).reverse();

  // Return as a single closed loop of [x, y] points
  return [...upper, ...lower];
}