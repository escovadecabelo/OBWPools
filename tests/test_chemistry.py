"""
Unit tests for WandPool Chemistry Calculation Engine
Validates LSI / CSI, chemical dosage models, and volume calculations.
"""

import pytest
from server.chemistry import calculate_lsi, calculate_pool_volume, calculate_chemical_dosages
from server.hermes_pool_tools import handle_hermes_tool_call

def test_calculate_lsi_balanced_water():
    """Test standard balanced pool water gives balanced LSI status."""
    result = calculate_lsi(
        ph=7.4,
        temperature_c=26.0,
        calcium_hardness_ppm=250.0,
        total_alkalinity_ppm=100.0,
        cyanuric_acid_ppm=30.0,
        total_dissolved_solids_ppm=1000.0
    )
    assert -0.30 <= result["lsi"] <= 0.30
    assert result["status_code"] == "balanced"
    assert "Perfeita" in result["status"] or "Equilibrada" in result["status"]

def test_calculate_lsi_corrosive_water():
    """Test acidic low-calcium water triggers corrosive status."""
    result = calculate_lsi(
        ph=6.8,
        temperature_c=18.0,
        calcium_hardness_ppm=100.0,
        total_alkalinity_ppm=50.0,
        cyanuric_acid_ppm=20.0,
        total_dissolved_solids_ppm=500.0
    )
    assert result["lsi"] < -0.30
    assert result["status_code"] == "corrosive"

def test_calculate_lsi_scaling_water():
    """Test high pH, high calcium water triggers scaling status."""
    result = calculate_lsi(
        ph=8.2,
        temperature_c=32.0,
        calcium_hardness_ppm=600.0,
        total_alkalinity_ppm=180.0,
        cyanuric_acid_ppm=50.0,
        total_dissolved_solids_ppm=1200.0
    )
    assert result["lsi"] > 0.30
    assert result["status_code"] == "scaling"

def test_calculate_pool_volume_rectangular():
    """Test 10m x 5m pool with 1.2m shallow and 1.8m deep (avg 1.5m) gives 75,000 Liters."""
    res = calculate_pool_volume(
        shape="retangular",
        length_m=10.0,
        width_m=5.0,
        shallow_depth_m=1.2,
        deep_depth_m=1.8
    )
    assert res["liters"] == 75000
    assert res["volume_m3"] == 75.0
    assert res["gallons"] > 0

def test_calculate_chemical_dosages():
    """Test chemical dosages for low pH and low chlorine."""
    dosages = calculate_chemical_dosages(
        volume_liters=40000, # 40m3
        current_ph=7.0,
        target_ph=7.4,
        current_fc=0.5,
        target_fc=3.0,
        current_ta=60.0,
        target_ta=100.0
    )
    assert dosages["volume_liters"] == 40000
    assert len(dosages["recommendations"]) >= 3
    # Check that Barrilha, Bicarbonato and Dicloro/Cloro are present
    chem_names = [r["chemical"] for r in dosages["recommendations"]]
    assert any("Barrilha" in name for name in chem_names)
    assert any("Bicarbonato" in name for name in chem_names)
    assert any("Dicloro" in name or "Cloro" in name for name in chem_names)

def test_hermes_tool_troubleshooting():
    """Test Hermes pool tool for green pool diagnostic."""
    res = handle_hermes_tool_call("pool_troubleshoot_symptom", {
        "symptom": "agua_verde",
        "volume_liters": 50000
    })
    assert "title" in res
    assert "steps" in res
    assert len(res["steps"]) > 3
