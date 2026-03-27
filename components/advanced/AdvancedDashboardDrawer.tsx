"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculateCO2 } from "@/lib/co2";
import type { TransportMode } from "@/types";

const OSRM_BASE = "https://router.project-osrm.org";
const POSITIONSTACK_KEY = "e6f0ea0834309fc6dedfda1927d73d67";

const COORDS_FULL_REGEX = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/;
const COORDS_PREFIX_REGEX = /^-?\d+(?:\.\d+)?\s*,/;

const OSRM_PROFILE_MAP: Record<TransportMode, string> = {
  walking: "foot",
  cycling: "bike",
  driving: "driving",
  ev: "driving",
};

type MultiModalOption = {
  mode: TransportMode;
  label: string;
  icon: string;
  distanceKm: string;
  durationMin: string;
  co2Kg: string;
  ecoScore: string;
  isBest: boolean;
  grade: { label: string; cls: string };
};

type AltRouteOption = {
  label: string;
  rowCls: string;
  distanceKm: string;
  durationMin: string;
  co2Kg: string;
  grade: { label: string; cls: string };
};

type OptimizeStats = {
  distanceKm: string;
  durationMin: string;
  co2Kg: string;
  stops: number;
};

type MatrixData = {
  labels: string[];
  rows: Array<Array<string>>;
};

type EcoStats = {
  score: string;
  co2Kg: string;
  distanceKm: string;
  durationMin: string;
  savedKg: string;
  grade: { label: string; cls: string };
};

type RealtimeStats = {
  count: number;
  distanceKm: string;
  durationMin: string;
  traffic: "Normal" | "Heavy";
};

type GeoSuggestion = {
  label: string;
  lon: number;
  lat: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
}

function minutes(seconds: number): string {
  return (seconds / 60).toFixed(1);
}

function kilometers(meters: number): string {
  return (meters / 1000).toFixed(2);
}

function gradeForScore(score: number) {
  if (score >= 80) return { label: "Grade A", cls: "grade-a" };
  if (score >= 60) return { label: "Grade B", cls: "grade-b" };
  if (score >= 40) return { label: "Grade C", cls: "grade-c" };
  return { label: "Grade D", cls: "grade-d" };
}

export default function AdvancedDashboardDrawer({
  isOpen,
  onClose,
  origin,
  destination,
  originCoords,
  destinationCoords,
}: Props) {
  const [multiStart, setMultiStart] = useState("77.2090,28.6139");
  const [multiEnd, setMultiEnd] = useState("77.2295,28.6358");
  const [multiError, setMultiError] = useState<string | null>(null);
  const [multiOptions, setMultiOptions] = useState<MultiModalOption[]>([]);

  const [altStart, setAltStart] = useState("78.4867,17.3850");
  const [altEnd, setAltEnd] = useState("78.3479,17.4401");
  const [altError, setAltError] = useState<string | null>(null);
  const [altOptions, setAltOptions] = useState<AltRouteOption[]>([]);

  const [waypointStart, setWaypointStart] = useState("");
  const [waypoints, setWaypoints] = useState("");
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [optimizeStats, setOptimizeStats] = useState<OptimizeStats | null>(null);

  const [matrixPoint1, setMatrixPoint1] = useState("");
  const [matrixPoint2, setMatrixPoint2] = useState("");
  const [matrixInput, setMatrixInput] = useState(
    "72.8777,19.0760;77.5946,12.9716;78.4867,17.3850"
  );
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);

  const [ecoStart, setEcoStart] = useState("77.2090,28.6139");
  const [ecoEnd, setEcoEnd] = useState("77.5946,12.9716");
  const [ecoMode, setEcoMode] = useState<TransportMode>("driving");
  const [ecoError, setEcoError] = useState<string | null>(null);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);

  const [realtimeStart, setRealtimeStart] = useState("77.2090,28.6139");
  const [realtimeEnd, setRealtimeEnd] = useState("77.2295,28.6358");
  const [realtimeIntervalSec, setRealtimeIntervalSec] = useState(5);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const realtimeTimerRef = useRef<number | null>(null);
  const realtimeHistoryRef = useRef<Array<Record<string, string | number>>>([]);
  const searchTimerRef = useRef<number | null>(null);

  const [coordMap, setCoordMap] = useState<Record<string, string>>({});
  const [syncedMap, setSyncedMap] = useState<Record<string, boolean>>({});
  const [openSuggId, setOpenSuggId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, GeoSuggestion[]>>({});
  const [searchingMap, setSearchingMap] = useState<Record<string, boolean>>({});
  const [noResultsMap, setNoResultsMap] = useState<Record<string, boolean>>({});

  const drawerClass = useMemo(
    () => (isOpen ? "advanced-drawer open" : "advanced-drawer"),
    [isOpen]
  );

  useEffect(() => {
    if (!isOpen) {
      stopRealtime();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopRealtime();
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".adv-input-wrapper")) {
        closeSuggestions();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    syncFromMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, originCoords, destinationCoords]);

  useEffect(() => {
    if (isOpen) {
      syncFromMain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleMultiModal = async () => {
    try {
      setMultiError(null);
      const start = getCoordsFor("advMultiStart", multiStart);
      const end = getCoordsFor("advMultiEnd", multiEnd);
      const modes: Array<{ mode: TransportMode; label: string; icon: string }> = [
        { mode: "driving", label: "Driving", icon: "🚗" },
        { mode: "cycling", label: "Cycling", icon: "🚴" },
        { mode: "walking", label: "Walking", icon: "🚶" },
      ];

      const results = await Promise.all(
        modes.map(async (entry) => {
          const profile = OSRM_PROFILE_MAP[entry.mode];
          const res = await fetch(
            `${OSRM_BASE}/route/v1/${profile}/${start};${end}?overview=false`
          );
          const data = await res.json();
          if (data.code !== "Ok") return null;
          const route = data.routes[0];
          const co2Kg = calculateCO2(route.distance, entry.mode);
          const ecoScore = co2Kg === 0 ? 100 : Math.max(0, 100 - co2Kg * 10);
          return {
            mode: entry.mode,
            label: entry.label,
            icon: entry.icon,
            distanceKm: kilometers(route.distance),
            durationMin: minutes(route.duration),
            co2Kg: co2Kg.toFixed(3),
            ecoScore: ecoScore.toFixed(0),
            grade: gradeForScore(ecoScore),
          };
        })
      );

      const valid = results.filter(Boolean) as Array<{
        mode: TransportMode;
        label: string;
        icon: string;
        distanceKm: string;
        durationMin: string;
        co2Kg: string;
        ecoScore: string;
        grade: { label: string; cls: string };
      }>;

      if (!valid.length) {
        setMultiError("No route data found.");
        return;
      }

      const best = valid.reduce((acc, current) =>
        Number(current.co2Kg) < Number(acc.co2Kg) ? current : acc
      );

      const options = valid.map((option) => ({
        ...option,
        isBest: option.mode === best.mode,
      }));

      setMultiOptions(options);
    } catch (err) {
      setMultiError("Failed to fetch multimodal routes.");
    }
  };

  const handleAlternatives = async () => {
    try {
      setAltError(null);
      const start = getCoordsFor("advAltStart", altStart);
      const end = getCoordsFor("advAltEnd", altEnd);
      const res = await fetch(
        `${OSRM_BASE}/route/v1/driving/${start};${end}?alternatives=true&overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.code !== "Ok") {
        setAltError("No alternative routes found.");
        return;
      }

      const routes = (data.routes || []).slice(0, 3).map((route: any, idx: number) => {
        const distanceKm = Number(kilometers(route.distance));
        const co2Kg = calculateCO2(route.distance, "driving");
        const score = distanceKm === 0 ? 0 : Math.max(0, 100 - (co2Kg / distanceKm) * 50);
        const rowCls = idx === 0 ? "fastest-row" : idx === 2 ? "alt-row" : "";
        const label = idx === 0 ? "Fastest" : idx === 1 ? "Eco" : "Alternative";
        return {
          label,
          rowCls,
          distanceKm: kilometers(route.distance),
          durationMin: minutes(route.duration),
          co2Kg: co2Kg.toFixed(3),
          grade: gradeForScore(score),
        };
      });

      setAltOptions(routes);
    } catch {
      setAltError("Failed to fetch alternative routes.");
    }
  };

  const handleOptimization = async () => {
    try {
      setOptimizeError(null);
      const res = await fetch(
        `${OSRM_BASE}/trip/v1/driving/${waypoints}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.code !== "Ok") {
        setOptimizeError("No optimized trip found.");
        return;
      }

      const trip = data.trips[0];
      const co2Kg = calculateCO2(trip.distance, "driving");
      setOptimizeStats({
        distanceKm: kilometers(trip.distance),
        durationMin: minutes(trip.duration),
        co2Kg: co2Kg.toFixed(3),
        stops: data.waypoints?.length || 0,
      });
    } catch {
      setOptimizeError("Failed to optimize route.");
    }
  };

  const handleMatrix = async () => {
    try {
      setMatrixError(null);
      const res = await fetch(`${OSRM_BASE}/table/v1/driving/${matrixInput}`);
      const data = await res.json();
      if (data.code !== "Ok") {
        setMatrixError("No matrix data returned.");
        return;
      }

      const labels = matrixInput.split(";").map((_, idx) => `Point ${idx + 1}`);
      const rows = (data.durations || []).map((row: number[]) =>
        row.map((value) => (value ? `${Math.round(value / 60)} min` : "—"))
      );
      setMatrixData({ labels, rows });
    } catch {
      setMatrixError("Failed to fetch duration matrix.");
    }
  };

  const handleEcoComparison = async () => {
    try {
      setEcoError(null);
      const start = getCoordsFor("advEcoStart", ecoStart);
      const end = getCoordsFor("advEcoEnd", ecoEnd);
      const profile = OSRM_PROFILE_MAP[ecoMode];
      const res = await fetch(
        `${OSRM_BASE}/route/v1/${profile}/${start};${end}?overview=false`
      );
      const data = await res.json();
      if (data.code !== "Ok") {
        setEcoError("No eco comparison route found.");
        return;
      }

      const route = data.routes[0];
      const distanceKm = kilometers(route.distance);
      const durationMin = minutes(route.duration);
      const co2Kg = calculateCO2(route.distance, ecoMode);
      const ecoScore = co2Kg === 0 ? 100 : Math.max(0, 100 - co2Kg * 10);
      const petrolCo2 = calculateCO2(route.distance, "driving");
      const savedKg = Math.max(0, petrolCo2 - co2Kg);

      setEcoStats({
        score: ecoScore.toFixed(0),
        co2Kg: co2Kg.toFixed(2),
        distanceKm: Number(distanceKm).toFixed(0),
        durationMin: Number(durationMin).toFixed(0),
        savedKg: savedKg.toFixed(3),
        grade: gradeForScore(ecoScore),
      });
    } catch {
      setEcoError("Failed to calculate eco score.");
    }
  };

  const stopRealtime = () => {
    if (realtimeTimerRef.current) {
      window.clearInterval(realtimeTimerRef.current);
      realtimeTimerRef.current = null;
    }
    setRealtimeActive(false);
  };

  const handleRealtime = async () => {
    if (realtimeActive) {
      stopRealtime();
      return;
    }

    setRealtimeError(null);
    setRealtimeActive(true);
    realtimeHistoryRef.current = [];

    const start = getCoordsFor("advRealtimeStart", realtimeStart);
    const end = getCoordsFor("advRealtimeEnd", realtimeEnd);

    realtimeTimerRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(
          `${OSRM_BASE}/route/v1/driving/${start};${end}?overview=false`
        );
        const data = await res.json();
        if (data.code !== "Ok") return;

        const route = data.routes[0];
        const traffic = Math.random() > 0.5 ? "Normal" : "Heavy";
        const update = {
          time: new Date().toLocaleTimeString(),
          distanceKm: kilometers(route.distance),
          durationMin: minutes(route.duration),
          traffic,
        };

        realtimeHistoryRef.current = [update, ...realtimeHistoryRef.current].slice(0, 5);
        setRealtimeStats({
          count: realtimeHistoryRef.current.length,
          distanceKm: update.distanceKm,
          durationMin: update.durationMin,
          traffic,
        });
      } catch {
        setRealtimeError("Realtime update failed.");
      }
    }, Math.max(3000, realtimeIntervalSec * 1000));
  };

  const getCoordsFor = (inputId: string, fallback: string) => {
    return coordMap[inputId] || fallback.trim();
  };

  const setCoordFor = (inputId: string, coords: string) => {
    setCoordMap((prev) => ({ ...prev, [inputId]: coords }));
  };

  const clearCoordFor = (inputId: string) => {
    setCoordMap((prev) => {
      if (!(inputId in prev)) return prev;
      const next = { ...prev };
      delete next[inputId];
      return next;
    });
  };

  const setSynced = (inputId: string, synced: boolean) => {
    setSyncedMap((prev) => ({ ...prev, [inputId]: synced }));
  };

  const setInputValue = (inputId: string, value: string) => {
    switch (inputId) {
      case "advMultiStart":
        setMultiStart(value);
        break;
      case "advMultiEnd":
        setMultiEnd(value);
        break;
      case "advAltStart":
        setAltStart(value);
        break;
      case "advAltEnd":
        setAltEnd(value);
        break;
      case "advEcoStart":
        setEcoStart(value);
        break;
      case "advEcoEnd":
        setEcoEnd(value);
        break;
      case "advRealtimeStart":
        setRealtimeStart(value);
        break;
      case "advRealtimeEnd":
        setRealtimeEnd(value);
        break;
      case "advWaypointStart":
        setWaypointStart(value);
        break;
      case "advMatrixP1":
        setMatrixPoint1(value);
        break;
      case "advMatrixP2":
        setMatrixPoint2(value);
        break;
      default:
        break;
    }
  };

  const closeSuggestions = () => {
    setOpenSuggId(null);
    setSearchingMap({});
    setNoResultsMap({});
  };

  const advGeocode = async (query: string) => {
    if (COORDS_FULL_REGEX.test(query.trim())) return [];
    const url = `https://api.positionstack.com/v1/forward?access_key=${POSITIONSTACK_KEY}&query=${encodeURIComponent(
      query
    )}&limit=5&output=json`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      return (data.data || []).map((item: any) => ({
        label: item.label || `${item.name}, ${item.country}`,
        lon: item.longitude,
        lat: item.latitude,
      }));
    } catch (error) {
      console.error("Positionstack error:", error);
      return [];
    }
  };

  const handleSearch = (inputId: string, rawValue: string) => {
    const query = rawValue.trim();

    if (query.length < 3 || COORDS_PREFIX_REGEX.test(query)) {
      if (openSuggId === inputId) closeSuggestions();
      return;
    }

    setOpenSuggId(inputId);
    setSearchingMap((prev) => ({ ...prev, [inputId]: true }));
    setNoResultsMap((prev) => ({ ...prev, [inputId]: false }));

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = window.setTimeout(async () => {
      const results = await advGeocode(query);
      setSuggestions((prev) => ({ ...prev, [inputId]: results }));
      setSearchingMap((prev) => ({ ...prev, [inputId]: false }));
      setNoResultsMap((prev) => ({ ...prev, [inputId]: results.length === 0 }));
    }, 400);
  };

  const handleSelectPlace = (inputId: string, suggestion: GeoSuggestion) => {
    const coords = `${suggestion.lon},${suggestion.lat}`;
    setInputValue(inputId, suggestion.label);
    setCoordFor(inputId, coords);
    setSynced(inputId, true);
    closeSuggestions();
    updateTextareasFromInputs(inputId, coords);
  };

  const handleInputChange = (inputId: string, value: string) => {
    setInputValue(inputId, value);
    setSynced(inputId, false);

    if (COORDS_FULL_REGEX.test(value.trim())) {
      const coords = value.trim();
      setCoordFor(inputId, coords);
      updateTextareasFromInputs(inputId, coords);
    } else {
      clearCoordFor(inputId);
    }

    handleSearch(inputId, value);
  };

  const updateTextareasFromInputs = (inputId: string, coords: string) => {
    if (inputId === "advWaypointStart") {
      setWaypoints((prev) => {
        if (!coords) return prev;
        const parts = prev.split(";").filter(Boolean);
        if (parts[0] === coords) return prev;
        if (parts.length === 0) return coords;
        parts[0] = coords;
        return parts.join(";");
      });
    }

    if (inputId === "advMatrixP1" || inputId === "advMatrixP2") {
      setMatrixInput((prev) => {
        const parts = prev.split(";").filter(Boolean);
        const next = [...parts];
        if (inputId === "advMatrixP1") next[0] = coords;
        if (inputId === "advMatrixP2") next[1] = coords;
        return next.filter(Boolean).join(";");
      });
    }
  };

  const syncFromMain = () => {
    if (!originCoords && !destinationCoords) return;

    const fromStr = originCoords ? `${originCoords[0]},${originCoords[1]}` : "";
    const toStr = destinationCoords ? `${destinationCoords[0]},${destinationCoords[1]}` : "";
    const fromName = origin || fromStr;
    const toName = destination || toStr;

    const fills: Array<[string, string, string]> = [
      ["advMultiStart", fromName, fromStr],
      ["advMultiEnd", toName, toStr],
      ["advAltStart", fromName, fromStr],
      ["advAltEnd", toName, toStr],
      ["advEcoStart", fromName, fromStr],
      ["advEcoEnd", toName, toStr],
      ["advRealtimeStart", fromName, fromStr],
      ["advRealtimeEnd", toName, toStr],
      ["advWaypointStart", fromName, fromStr],
      ["advMatrixP1", fromName, fromStr],
      ["advMatrixP2", toName, toStr],
    ];

    fills.forEach(([id, displayValue, coordValue]) => {
      if (!displayValue) return;
      setInputValue(id, displayValue);
      if (coordValue) setCoordFor(id, coordValue);
      setSynced(id, true);
    });

    if (fromStr) updateTextareasFromInputs("advWaypointStart", fromStr);
    if (fromStr) updateTextareasFromInputs("advMatrixP1", fromStr);
    if (toStr) updateTextareasFromInputs("advMatrixP2", toStr);
  };

  const renderSuggestions = (inputId: string) => {
    const isOpen = openSuggId === inputId;
    const items = suggestions[inputId] || [];
    const isSearching = searchingMap[inputId];
    const hasNoResults = noResultsMap[inputId];

    return (
      <div className={`adv-suggestions ${isOpen ? "open" : ""}`}>
        {isOpen && isSearching && <div className="adv-searching">Searching...</div>}
        {isOpen && !isSearching && hasNoResults && (
          <div className="adv-searching">No results found</div>
        )}
        {isOpen &&
          !isSearching &&
          !hasNoResults &&
          items.map((item) => (
            <div
              key={`${item.label}-${item.lon}-${item.lat}`}
              className="adv-suggestion-item"
              onClick={() => handleSelectPlace(inputId, item)}
            >
              <span className="adv-sugg-icon">📍</span>
              <span className="adv-sugg-label">{item.label}</span>
            </div>
          ))}
      </div>
    );
  };

  const renderAutocompleteInput = (
    inputId: string,
    label: string,
    value: string,
    placeholder: string
  ) => (
    <div className="adv-input-group">
      <label>{label}</label>
      <div className="adv-input-wrapper">
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(inputId, e.target.value)}
          onFocus={() => handleSearch(inputId, value)}
          autoComplete="off"
          className={syncedMap[inputId] ? "adv-input-synced" : ""}
        />
        {renderSuggestions(inputId)}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />
      <div className={drawerClass}>
        <div className="drawer-header">
          <h2>Advanced Dashboard</h2>
          <button className="drawer-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="adv-grid">
          <div className="adv-card">
            <h3>Multi-Modal Transport</h3>
            <div className="adv-subtitle">Compare driving, cycling, and walking</div>
            {renderAutocompleteInput(
              "advMultiStart",
              "From — city name or coordinates",
              multiStart,
              "e.g. Hyderabad or 78.4867,17.3850"
            )}
            {renderAutocompleteInput(
              "advMultiEnd",
              "To — city name or coordinates",
              multiEnd,
              "e.g. Chennai or 80.2707,13.0827"
            )}
            <button className="adv-btn" onClick={handleMultiModal}>
              Compare Modes
            </button>
            {multiError && <div className="adv-alert-error">{multiError}</div>}
            {!multiError && multiOptions.length > 0 && (
              <div className="adv-result-header">
                <h4>🚌 Transport Mode Comparison</h4>
                <div className="adv-modal-grid">
                  {multiOptions.map((option) => (
                    <div
                      key={option.mode}
                      className={`adv-modal-card ${option.isBest ? "best-mode" : ""}`}
                    >
                      {option.isBest && <div className="adv-best-badge">Best</div>}
                      <div className="mode-icon">{option.icon}</div>
                      <div className="mode-name">{option.label}</div>
                      <div className="mode-stat">
                        📏 {option.distanceKm} km
                        <br />
                        ⏱️ {option.durationMin} min
                        <br />
                        💨 {option.co2Kg} kg CO₂
                      </div>
                      <div className="mode-score">Score {option.ecoScore}/100</div>
                      <span className={`adv-grade-pill ${option.grade.cls}`}>
                        {option.grade.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="adv-card">
            <h3>Alternative Routes</h3>
            <div className="adv-subtitle">View alternative driving paths</div>
            {renderAutocompleteInput(
              "advAltStart",
              "From — city name or coordinates",
              altStart,
              "e.g. Hyderabad"
            )}
            {renderAutocompleteInput(
              "advAltEnd",
              "To — city name or coordinates",
              altEnd,
              "e.g. Gachibowli"
            )}
            <button className="adv-btn" onClick={handleAlternatives}>
              Find Alternatives
            </button>
            {altError && <div className="adv-alert-error">{altError}</div>}
            {!altError && altOptions.length > 0 && (
              <div className="adv-result-header">
                <h4>🛣️ {altOptions.length} Routes Found</h4>
                <div className="adv-route-cards">
                  {altOptions.map((route) => (
                    <div
                      key={`${route.label}-${route.distanceKm}`}
                      className={`adv-route-row ${route.rowCls}`}
                    >
                      <div>
                        <div className="route-label">{route.label}</div>
                        <div className="route-meta">
                          {route.distanceKm} km · {route.durationMin} min
                        </div>
                        <span className={`adv-grade-pill ${route.grade.cls}`}>
                          {route.grade.label}
                        </span>
                      </div>
                      <div>
                        <div className="route-co2">{route.co2Kg} kg</div>
                        <div className="route-co2-label">CO₂</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="adv-card">
            <h3>Route Optimization</h3>
            <div className="adv-subtitle">Optimize stop order (TSP)</div>
            {renderAutocompleteInput(
              "advWaypointStart",
              "Start Waypoint — city name or coordinates",
              waypointStart,
              "e.g. Delhi — auto-filled from main map"
            )}
            <div className="adv-input-group">
              <label>All Waypoints (semicolon separated lon,lat)</label>
              <textarea
                rows={3}
                value={waypoints}
                onChange={(e) => setWaypoints(e.target.value)}
                placeholder="Your start is auto-filled. Add more stops separated by semicolons e.g. 78.4867,17.3850;80.2707,13.0827"
              />
            </div>
            <button className="adv-btn" onClick={handleOptimization}>
              Optimize Route
            </button>
            {optimizeError && <div className="adv-alert-error">{optimizeError}</div>}
            {!optimizeError && optimizeStats && (
              <div className="adv-result-header">
                <h4>📍 Optimized Route</h4>
                <div className="adv-stat-grid">
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Total Distance</div>
                    <div className="adv-stat-value">{optimizeStats.distanceKm} km</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Total Time</div>
                    <div className="adv-stat-value">{optimizeStats.durationMin} min</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">CO₂ Emissions</div>
                    <div className="adv-stat-value">{optimizeStats.co2Kg} kg</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Stops</div>
                    <div className="adv-stat-value">{optimizeStats.stops}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="adv-card">
            <h3>Duration Matrix</h3>
            <div className="adv-subtitle">Travel time between all points</div>
            {renderAutocompleteInput(
              "advMatrixP1",
              "Point 1 (From) — auto-filled from main map",
              matrixPoint1,
              "e.g. Mumbai"
            )}
            {renderAutocompleteInput(
              "advMatrixP2",
              "Point 2 (To) — auto-filled from main map",
              matrixPoint2,
              "e.g. Bangalore"
            )}
            <div className="adv-input-group">
              <label>All Locations (semicolon separated lon,lat)</label>
              <textarea
                rows={2}
                value={matrixInput}
                onChange={(e) => setMatrixInput(e.target.value)}
                placeholder="Auto-updated when you pick points above."
              />
            </div>
            <button className="adv-btn" onClick={handleMatrix}>
              Calculate Matrix
            </button>
            {matrixError && <div className="adv-alert-error">{matrixError}</div>}
            {!matrixError && matrixData && (
              <div className="adv-result-header">
                <h4>⏱️ Duration Matrix</h4>
                <div style={{ overflowX: "auto" }}>
                  <table className="adv-matrix-table">
                    <thead>
                      <tr>
                        <th></th>
                        {matrixData.labels.map((label) => (
                          <th key={label}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.rows.map((row, idx) => (
                        <tr key={matrixData.labels[idx]}>
                          <th>{matrixData.labels[idx]}</th>
                          {row.map((cell, cellIdx) => (
                            <td key={`${idx}-${cellIdx}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="adv-card">
            <h3>Eco Score Comparison</h3>
            <div className="adv-subtitle">Compare emissions per mode</div>
            {renderAutocompleteInput(
              "advEcoStart",
              "From — city name or coordinates",
              ecoStart,
              "e.g. Delhi"
            )}
            {renderAutocompleteInput(
              "advEcoEnd",
              "To — city name or coordinates",
              ecoEnd,
              "e.g. Bangalore"
            )}
            <div className="adv-input-group">
              <label>Mode</label>
              <select value={ecoMode} onChange={(e) => setEcoMode(e.target.value as TransportMode)}>
                <option value="driving">Driving</option>
                <option value="cycling">Cycling</option>
                <option value="walking">Walking</option>
              </select>
            </div>
            <button className="adv-btn" onClick={handleEcoComparison}>
              Calculate Eco Score
            </button>
            {ecoError && <div className="adv-alert-error">{ecoError}</div>}
            {!ecoError && ecoStats && (
              <div className="adv-result-header">
                <h4>🌿 Eco Score: {ecoStats.score}/100</h4>
                <div className="adv-stat-grid">
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">CO₂ Emissions</div>
                    <div className="adv-stat-value">{ecoStats.co2Kg} kg</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Distance</div>
                    <div className="adv-stat-value">{ecoStats.distanceKm} km</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Duration</div>
                    <div className="adv-stat-value">{ecoStats.durationMin} min</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Saved vs Petrol</div>
                    <div className="adv-stat-value">{ecoStats.savedKg} kg</div>
                  </div>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <span className={`adv-grade-pill ${ecoStats.grade.cls}`}>
                    {ecoStats.grade.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="adv-card">
            <h3>Real-time Updates</h3>
            <div className="adv-subtitle">Simulated live recalculation</div>
            {renderAutocompleteInput(
              "advRealtimeStart",
              "From — city name or coordinates",
              realtimeStart,
              "e.g. Delhi"
            )}
            {renderAutocompleteInput(
              "advRealtimeEnd",
              "To — city name or coordinates",
              realtimeEnd,
              "e.g. Noida"
            )}
            <div className="adv-input-group">
              <label>Update Interval (seconds)</label>
              <input
                type="number"
                min={3}
                max={30}
                value={realtimeIntervalSec}
                onChange={(e) => setRealtimeIntervalSec(Number(e.target.value))}
              />
            </div>
            <button
              className={`adv-btn ${realtimeActive ? "adv-btn-stop" : ""}`}
              onClick={handleRealtime}
            >
              {realtimeActive ? "Stop Updates" : "Start Real-time Updates"}
            </button>
            {realtimeError && <div className="adv-alert-error">{realtimeError}</div>}
            {!realtimeError && realtimeStats && (
              <div className="adv-result-header">
                <h4>
                  <span className="adv-live-dot" />Live Update #{realtimeStats.count}
                </h4>
                <div className="adv-stat-grid">
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Distance</div>
                    <div className="adv-stat-value">{realtimeStats.distanceKm} km</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Duration</div>
                    <div className="adv-stat-value">{realtimeStats.durationMin} min</div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Traffic</div>
                    <div
                      className="adv-stat-value"
                      style={{
                        color: realtimeStats.traffic === "Heavy" ? "#f59e0b" : "#4ade80",
                      }}
                    >
                      {realtimeStats.traffic}
                    </div>
                  </div>
                  <div className="adv-stat-box">
                    <div className="adv-stat-label">Total Updates</div>
                    <div className="adv-stat-value">{realtimeStats.count}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
