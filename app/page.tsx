"use client";
import dynamic from 'next/dynamic';
import JourneyPlanner from '@/components/panel/JourneyPlanner';
import AdvancedDashboardDrawer from '@/components/advanced/AdvancedDashboardDrawer';
import React, { useRef, useState } from 'react';
import { useRoutes } from '@/hooks/useRoutes';

const RouteLayer = dynamic(() => import('@/components/map/RouteLayer'), { ssr: false });
const CarbonSavedWidget = dynamic(() => import('@/components/widgets/CarbonSavedWidget'), { ssr: false });
const EcoMap = dynamic(() => import('@/components/map/EcoMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0d1f12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ color: '#7a9e7e', fontSize: '14px' }}>Loading map...</span>
    </div>
  ),
});
const MarkerLayer = dynamic(() => import('@/components/map/MarkerLayer'), { ssr: false });

export default function HomePage() {
  const mapRef = useRef(null);
  const { state, handleOriginChange, handleDestinationChange, handleSelectRoute, handleModeChange } = useRoutes();
  const [tripRefreshTrigger, setTripRefreshTrigger] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const handleTripLogged = () => {
    setTripRefreshTrigger((prev) => prev + 1);
  };

  const openPanel = () => {
    setMobilePanelOpen(true);
    document.body.classList.add('panel-open');
  };

  const closePanel = () => {
    setMobilePanelOpen(false);
    document.body.classList.remove('panel-open');
  };

  const togglePanel = () => {
    mobilePanelOpen ? closePanel() : openPanel();
  };

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--eco-bg)',
    }}>
      {/* Mobile-only header */}
      <header className="mobile-header">
        <div className="mobile-header-logo">
          <span className="eco-logo-icon">🌿</span>
          <span>
            <span style={{ fontWeight: 400 }}>eco</span>
            <span style={{ fontWeight: 700 }}>route</span>
          </span>
        </div>
        <button
          className={`hamburger-btn ${mobilePanelOpen ? 'open' : ''}`}
          onClick={togglePanel}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobilePanelOpen ? 'active' : ''}`}
        onClick={closePanel}
      />

      <div
        className="app-layout"
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Left panel — 40% width on desktop, bottom sheet on mobile */}
        <div
          className={`sidebar-panel ${mobilePanelOpen ? 'mobile-open' : ''}`}
          style={{
            width: '40%',
            minWidth: '320px',
            maxWidth: '480px',
            height: '100%',
            overflowY: 'auto',
            background: 'var(--eco-bg)',
            borderRight: '1px solid var(--eco-border)',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <div
            className="sidebar-logo-bar"
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--eco-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
          {/* Logo mark placeholder — replaced in Task 006 */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--eco-surface)',
            border: '1px solid var(--eco-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}>
            🌿
          </div>
          {/* Wordmark: "eco" regular + "route" bold */}
          <span style={{ color: 'var(--eco-text)', fontSize: '18px' }}>
            <span style={{ fontWeight: 400 }}>eco</span>
            <span style={{ fontWeight: 700 }}>route</span>
          </span>
          </div>

        {/* Journey planner — implemented Task 002 */}
        <JourneyPlanner
          state={state}
          onOriginChange={handleOriginChange}
          onDestinationChange={handleDestinationChange}
          onModeChange={handleModeChange}
          onSelectRoute={handleSelectRoute}
          onOpenAdvanced={() => setAdvancedOpen(true)}
          onTripLogged={handleTripLogged}
          routes={state.routes}
          selectedRouteId={state.selectedRouteId}
        />
        </div>

        {/* Map panel — 60% width */}
        <div className="map-panel" style={{ flex: 1, position: 'relative', height: '100%' }}>
          <EcoMap mapRef={mapRef} />
          <RouteLayer map={mapRef.current} routes={state.routes} activeRouteId={state.selectedRouteId} />
          <MarkerLayer
            map={mapRef.current}
            originCoords={state.originCoords}
            destinationCoords={state.destinationCoords}
          />
          <CarbonSavedWidget refreshTrigger={tripRefreshTrigger} />
          <AdvancedDashboardDrawer
            isOpen={advancedOpen}
            onClose={() => setAdvancedOpen(false)}
            origin={state.origin}
            destination={state.destination}
            originCoords={state.originCoords}
            destinationCoords={state.destinationCoords}
          />
        </div>
      </div>
    </div>
  );
}
