"use client";

import React from 'react';
import { JourneyState, RouteResult } from '@/types';
import RouteOptions from './RouteOptions';
import StartButton from './StartButton';

interface Props {
  state: JourneyState;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onModeChange: (mode: JourneyState['selectedMode']) => void;
  onSelectRoute: (routeId: string) => void;
  onOpenAdvanced: () => void;
  onTripLogged: () => void;
  routes: RouteResult[];
  selectedRouteId: string | null;
}

export default function JourneyPlanner({ 
  state, 
  onOriginChange, 
  onDestinationChange,
  onModeChange,
  onSelectRoute,
  onOpenAdvanced,
  onTripLogged,
  routes,
  selectedRouteId,
}: Props) {
  const [ecoModeActive, setEcoModeActive] = React.useState(true);
  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--eco-input)',
    border: '1px solid var(--eco-border)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: 'var(--eco-text)',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Section label */}
      <div
        className="section-label"
        style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--eco-muted)',
          marginBottom: '16px',
          fontWeight: 600,
        }}
      >
        Plan Your Journey
      </div>

      {/* Card */}
      <div
        className="journey-card"
        style={{
          background: 'var(--eco-surface)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid var(--eco-border)',
        }}
      >
        {/* Origin */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Enter starting point"
            value={state.origin}
            onChange={(e) => onOriginChange(e.target.value)}
            style={inputStyle}
          />
          {state.originCoords && state.origin && (
            <div style={{ fontSize: '12px', color: 'var(--eco-green)', marginTop: '4px' }}>
              ● {state.origin}
            </div>
          )}
        </div>

        {/* Destination */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Enter destination"
            value={state.destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            style={inputStyle}
          />
          {state.destinationCoords && state.destination && (
            <div style={{ fontSize: '12px', color: 'var(--eco-amber)', marginTop: '4px' }}>
              ● {state.destination}
            </div>
          )}
        </div>

        {/* Mode selector */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--eco-text)',
              marginBottom: '10px',
              fontWeight: 600,
            }}
          >
            <span>🚗</span>
            <span>Select Vehicle</span>
          </div>
          <div
            className="vehicle-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { mode: 'driving', label: 'Petrol Car', icon: '🚗' },
              { mode: 'ev', label: 'Electric', icon: '⚡' },
              { mode: 'cycling', label: 'Bicycle', icon: '🚴' },
              { mode: 'walking', label: 'Walking', icon: '🚶' },
            ].map((option) => {
              const isActive = state.selectedMode === option.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => onModeChange(option.mode as JourneyState['selectedMode'])}
                  className="vehicle-card"
                  style={{
                    minHeight: '72px',
                    borderRadius: '12px',
                    border: `2px solid ${isActive ? 'var(--eco-green)' : 'var(--eco-border)'}`,
                    background: isActive ? 'var(--eco-bg)' : 'var(--eco-surface)',
                    color: 'var(--eco-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: isActive ? '0 6px 18px rgba(82, 183, 136, 0.22)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    className="vehicle-icon"
                    style={{ fontSize: '22px', color: isActive ? 'var(--eco-green)' : 'var(--eco-text)' }}
                  >
                    {option.icon}
                  </span>
                  <span className="vehicle-label">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {state.error && (
          <div style={{ fontSize: '12px', color: 'var(--eco-orange)', marginBottom: '16px' }}>
            {state.error}
          </div>
        )}

        {/* Eco Mode Badge */}
        {(state.origin || state.destination) && (
          <div
            className="eco-mode-badge"
            onClick={() => setEcoModeActive(!ecoModeActive)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--eco-green)',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--eco-green)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span>{ecoModeActive ? '✓' : '○'}</span>
            <span>{ecoModeActive ? 'Eco mode active' : 'Eco mode off'}</span>
          </div>
        )}
      </div>

      <div className="route-options-section">
        {/* Routes section */}
        {state.routes.length > 0 && (
          <>
            <RouteOptions
              routes={state.routes}
              selectedRouteId={state.selectedRouteId}
              onSelectRoute={onSelectRoute}
              isLoading={state.isLoading}
            />

            {/* CTA Button */}
            <div style={{ padding: '0 20px 20px' }}>
              <StartButton
                selectedRoute={selectedRoute}
                origin={state.origin}
                destination={state.destination}
                disabled={!state.routes.length || state.isLoading}
                onTripLogged={onTripLogged}
              />
            </div>
          </>
        )}

        <div style={{ padding: '0 20px 20px' }}>
          <button className="btn-advanced" onClick={onOpenAdvanced}>
            Advanced Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
