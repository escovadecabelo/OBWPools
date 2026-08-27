# OBW Pools - Intelligent Pool Maintenance & Field Service Platform

Welcome to the **OBW Pools** project. OBW Pools combines precision pool chemistry calculations, route optimization with GPS navigation, photo proofing, truck inventory management, work order quoting, equipment health monitoring, and maintenance routine automation with **Nous Research's Hermes Agent** and **obra's Superpowers** skill architecture.

---

## 🏊 Project Purpose & Architecture

WandPool is designed for both residential pool owners and commercial pool service technicians:
1. **Precision Water Chemistry**: Accurate computation of pH, Free Available Chlorine (FAC), Total Available Chlorine (TAC), Combined Chlorine (CC), Total Alkalinity (TA), Calcium Hardness (CH), Cyanuric Acid (CYA), Salt, Temperature, and Borates.
2. **LSI & CSI Saturation Index**: Continuous monitoring of the Langelier Saturation Index ($LSI$) and Calcite Saturation Index ($CSI$) to prevent corrosive etching of plaster/equipment and scaling or cloudy water.
3. **Chemical Dosing Engine**: Mathematical determination of exact chemical additions (Muriatic Acid, Dry Acid, Soda Ash, Sodium Bicarbonate, Calcium Chloride, Liquid Chlorine, Cal-Hypo, Dichlor, Trichlor, Stabilizer).
4. **Equipment Health**: Filter pressure tracker ($\Delta \text{PSI}$ baseline alert), pump turnover calculators, heater and salt cell maintenance schedules.
5. **Hermes Agent Copilot**: Autonomous AI assistant equipped with pool diagnostic tools, visual diagnosis guides (algae blooms, metals, stains, foam), and conversational maintenance assistance.
6. **Superpowers Integration**: Structured development and reasoning skills (`skills/`) enforcing TDD, verification, and domain playbooks.

---

## 🧪 Pool Chemistry Standard Reference Ranges

| Parameter | Ideal Range (Standard) | Ideal Range (Saltwater) | Description & Risks if Out of Range |
| :--- | :--- | :--- | :--- |
| **pH** | 7.4 - 7.6 | 7.4 - 7.6 | < 7.2: Corrosive, eye sting; > 7.8: Scaling, lowers chlorine effectiveness |
| **Free Chlorine (FC)** | 2.0 - 4.0 ppm | 3.0 - 5.0 ppm | < 1.0: Algae/bacteria growth; > 10.0: High oxidation, swimmer discomfort |
| **Combined Chlorine (CC)** | < 0.2 ppm (Max 0.5) | < 0.2 ppm | > 0.5: Chloramines present, strong chlorine smell, shock needed |
| **Total Alkalinity (TA)** | 80 - 120 ppm | 70 - 100 ppm | < 80: pH bounce, corrosion; > 120: High pH lock, cloudiness |
| **Calcium Hardness (CH)** | 200 - 400 ppm | 200 - 400 ppm | < 200: Plaster etching, heater corrosion; > 400: Scaling, calcification |
| **Cyanuric Acid (CYA)** | 30 - 50 ppm | 60 - 80 ppm | < 30: UV rapidly destroys chlorine; > 80: Chlorine lock (ineffective FC) |
| **Salt (for SWG)** | N/A | 2700 - 3400 ppm | < 2700: SWG cuts out; > 4000: Salty taste, potential corrosion |
| **LSI (Saturation Index)** | -0.30 to +0.30 | -0.30 to +0.30 | < -0.30: Corrosive/Etching; > +0.30: Scale-forming/Turbid |

---

## 🛠️ Directory Structure

```
OBWPools/
├── AGENTS.md                  # Project rules & chemistry guidelines
├── skills/                    # Domain skills & Superpowers playbooks
│   ├── pool-chemistry-diagnosis/
│   ├── chemical-dosing-calculator/
│   ├── equipment-troubleshooting/
│   └── seasonal-care/
├── server/                    # Python FastAPI backend & Hermes Agent bridge
│   ├── main.py                # REST API
│   ├── chemistry.py           # Mathematical & dosing calculation engine
│   ├── models.py              # Pydantic schemas
│   ├── db.py                  # SQLite storage & seed data
│   └── hermes_pool_tools.py   # Hermes tool definitions
├── client/                    # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/        # UI components (Lab, Dashboard, Dosing, Hermes)
│   │   ├── lib/chemistry.ts   # Client chemistry helpers
│   │   └── types/pool.ts      # TypeScript interfaces
│   └── package.json
└── tests/                     # Unit & integration tests
```
