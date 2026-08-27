---
name: pool-chemistry-diagnosis
description: Comprehensive pool water chemistry analysis, Saturation Index (LSI/CSI) calculation, and parameter diagnostics.
---

# Pool Chemistry Diagnosis Skill

Use this skill whenever analyzing pool water test results, diagnosing water conditions (turbidity, algae, scaling, corrosion, eye burn), and calculating the Langelier Saturation Index (LSI) or Calcite Saturation Index (CSI).

## Ideal Chemical Parameters

1. **pH (Acidity / Basicity)**
   - Target: `7.4 - 7.6`
   - Tolerable: `7.2 - 7.8`
   - High (>7.8): Reduces active hypochlorous acid (HOCl) efficacy, causes scale formation and eye irritation.
   - Low (<7.2): Corrosive to pool surfaces, heaters, pumps; causes rapid chlorine dissipation and eye discomfort.

2. **Free Available Chlorine (FAC)**
   - Standard Pools: `2.0 - 4.0 ppm`
   - Saltwater (SWG) Pools: `3.0 - 5.0 ppm`
   - Minimum baseline rule: `FAC >= 7.5% of Cyanuric Acid (CYA)` to prevent algae growth.

3. **Combined Chlorine (CC / Chloramines)**
   - Ideal: `0.0 ppm`
   - Maximum allowed: `0.2 ppm`
   - Action threshold: If `CC >= 0.5 ppm`, perform breakpoint chlorination (shock pool with `10x CC` or reach breakpoint).

4. **Total Alkalinity (TA)**
   - Plaster/Gunite Pools: `80 - 100 ppm` (or up to 120 ppm for non-trichlor pools)
   - Vinyl / Fiberglass: `100 - 120 ppm`
   - Function: Acts as a buffer against pH fluctuations.

5. **Calcium Hardness (CH)**
   - Plaster Pools: `250 - 350 ppm`
   - Vinyl / Fiberglass: `175 - 250 ppm` (protects metal heat exchangers)
   - Low CH: Aggressive water leaches calcium from plaster, causing pitting and etching.
   - High CH: Calcium carbonate precipitates out, creating rough scaling on walls and salt cells.

6. **Cyanuric Acid (CYA / Stabilizer)**
   - Outdoor standard: `30 - 50 ppm`
   - Saltwater pools: `60 - 80 ppm`
   - High CYA (>80 ppm): Causes "chlorine lock" where chlorine is over-stabilized and sluggish. Dilution is the only reliable remedy.

7. **Salt (Sodium Chloride for SWG)**
   - Standard SWG systems: `2800 - 3400 ppm` (Target: ~3200 ppm, check manufacturer recommendation).

---

## Langelier Saturation Index (LSI) Formula

$$LSI = pH + TF + CF + AF - 12.1$$

Where:
- $TF = \frac{\log_{10}(T_F) - 1}{10}$ (Temperature Factor)
- $CF = \log_{10}(CH) - 0.4$ (Calcium Factor)
- $AF = \log_{10}(TA - (CYA \times 0.33)) - 0.4$ (Carbonate Alkalinity Factor, adjusted for CYA)

### Interpretation:
- **LSI < -0.30**: **Corrosive / Aggressive**. Water will dissolve grout, etch plaster, and corrode metal equipment.
- **-0.30 <= LSI <= +0.30**: **Balanced / Equilibrium**. Safe for plaster, equipment, and swimmers.
- **LSI > +0.30**: **Scale-Forming / Oversaturated**. Calcium precipitates, causing cloudy water, scale on tiles, and scaling in heaters and salt cells.
