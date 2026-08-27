---
name: chemical-dosing-calculator
description: Mathematical formulas and dosing guidelines for pool chemical balancing and shock treatments.
---

# Chemical Dosing Calculator Skill

Use this skill to determine exact chemical weights and volumes required to balance pool water based on pool volume ($V$ in Liters or Gallons).

## Dosage Calculation Standards (Per 10,000 Gallons / 37,854 Liters)

### 1. pH & Alkalinity Adjustment
- **Lower pH & TA (Muriatic Acid 31.45% / 20° Baume)**:
  - To lower pH by ~0.2 in 10,000 gal: Add ~350 - 450 mL (12 - 16 fl oz) of Muriatic Acid.
  - Formula: $\text{Volume (mL)} = \frac{V_{\text{liters}}}{37854} \times (\text{Current pH} - \text{Target pH}) \times 2000$ (Approximate, depending on TA).
- **Lower pH (Sodium Bisulfate / Dry Acid)**:
  - To lower pH by ~0.2 in 10,000 gal: Add ~500 g (1.1 lbs) of Sodium Bisulfate.
- **Raise Total Alkalinity (Sodium Bicarbonate / Baking Soda)**:
  - To raise TA by 10 ppm in 10,000 gal: Add ~680 g (1.5 lbs) of Sodium Bicarbonate.
  - Formula: $\text{Grams} = \frac{V_{\text{liters}}}{37854} \times (\text{Target TA} - \text{Current TA}) \times 68$
- **Raise pH (Sodium Carbonate / Soda Ash)**:
  - To raise pH by 0.2 in 10,000 gal: Add ~170 - 250 g (6 - 9 oz) of Soda Ash.

### 2. Chlorination & Shock
- **Raise Free Chlorine by 1.0 ppm**:
  - **Liquid Chlorine (12.5% Sodium Hypochlorite)**: 300 mL (10.7 fl oz) per 10,000 gal.
  - **Liquid Bleach (6.0% Sodium Hypochlorite)**: 625 mL (21 fl oz) per 10,000 gal.
  - **Cal-Hypo (65% Calcium Hypochlorite)**: 60 g (2.1 oz) per 10,000 gal. (Adds ~0.8 ppm Calcium).
  - **Dichlor (56% Sodium Dichloro-s-triazinetrione)**: 70 g (2.4 oz) per 10,000 gal. (Adds ~0.9 ppm CYA).
  - **Trichlor Tabs (90% Trichloro-s-triazinetrione)**: 45 g per 10,000 gal. (Very acidic, adds CYA).

### 3. Calcium Hardness & Cyanuric Acid
- **Raise Calcium Hardness (Calcium Chloride 77%)**:
  - To raise CH by 10 ppm in 10,000 gal: Add ~550 g (1.2 lbs).
- **Raise Cyanuric Acid (Stabilizer / Conditioner 100%)**:
  - To raise CYA by 10 ppm in 10,000 gal: Add ~380 g (13 oz).

### 4. Salt (SWG Chlorinators)
- **Raise Salt by 100 ppm**:
  - Add ~3.8 kg (8.3 lbs) of 99.8% pure pool salt per 10,000 gal.

---

## Safety & Application Rules
1. **Never mix chemicals together dry or concentrated.**
2. **Always add chemical to water, NEVER water to chemical** (especially acids).
3. Pre-dissolve dry powders in a 5-gallon bucket of pool water before pouring into the pool.
4. Broadcast or pour slowly in front of return jets with pump running.
5. Wait at least 4 to 6 hours between adding acid and adding chlorine/alkalinity boosters.
