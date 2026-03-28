'use client';

import { useEffect, useState } from 'react';
import { getWeather, getWeatherAdvice, WeatherData } from '@/lib/weather';

interface Props {
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  originName: string;
  destinationName: string;
}

export default function WeatherWidget({
  originCoords,
  destinationCoords,
  originName,
  destinationName,
}: Props) {
  const [originWeather, setOriginWeather] = useState<WeatherData | null>(null);
  const [destWeather, setDestWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!originCoords && !destinationCoords) return;

    setLoading(true);
    setOriginWeather(null);
    setDestWeather(null);

    const fetches: Promise<void>[] = [];

    if (originCoords) {
      fetches.push(
        getWeather(originCoords[1], originCoords[0]).then((weather) => setOriginWeather(weather))
      );
    }

    if (destinationCoords) {
      fetches.push(
        getWeather(destinationCoords[1], destinationCoords[0]).then((weather) => setDestWeather(weather))
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [
    originCoords?.[0],
    originCoords?.[1],
    destinationCoords?.[0],
    destinationCoords?.[1],
  ]);

  if (!originCoords && !destinationCoords) return null;

  const advice = getWeatherAdvice(originWeather, destWeather);

  const cardStyle: React.CSSProperties = {
    background: '#1e4030',
    border: '1px solid #2d5a3d',
    borderRadius: '12px',
    padding: '14px',
    flex: 1,
    minWidth: 0,
  };

  return (
    <div
      style={{
        background: '#122b1c',
        border: '1px solid #2d5a3d',
        borderRadius: '16px',
        padding: '18px',
        marginTop: '16px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b9e7a',
          fontWeight: 600,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        🌤 Weather Along Route
      </div>

      {loading && (
        <div style={{ color: '#6b9e7a', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
          Loading weather...
        </div>
      )}

      {!loading && (
        <>
          <div className="weather-widget-cards" style={{ display: 'flex', gap: '10px' }}>
            {originCoords && (
              <div style={cardStyle}>
                <div
                  style={{
                    color: '#6b9e7a',
                    fontSize: '11px',
                    marginBottom: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  📍 {originName || 'Origin'}
                </div>
                {originWeather ? (
                  <WeatherCard weather={originWeather} />
                ) : (
                  <div style={{ color: '#6b9e7a', fontSize: '12px' }}>Unavailable</div>
                )}
              </div>
            )}

            {destinationCoords && (
              <div style={cardStyle}>
                <div
                  style={{
                    color: '#6b9e7a',
                    fontSize: '11px',
                    marginBottom: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  🏁 {destinationName || 'Destination'}
                </div>
                {destWeather ? (
                  <WeatherCard weather={destWeather} />
                ) : (
                  <div style={{ color: '#6b9e7a', fontSize: '12px' }}>Unavailable</div>
                )}
              </div>
            )}
          </div>

          {advice && (
            <div
              style={{
                marginTop: '12px',
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#fbbf24',
                lineHeight: 1.5,
              }}
            >
              {advice}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WeatherCard({ weather }: { weather: WeatherData }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.5em' }}>{weather.icon}</span>
        <span style={{ color: '#4ade80', fontSize: '1.3em', fontWeight: 700 }}>
          {weather.temperature}°C
        </span>
      </div>
      <div style={{ color: '#a3c4a8', fontSize: '12px', marginBottom: '6px' }}>
        {weather.description}
      </div>
      <div style={{ color: '#6b9e7a', fontSize: '11px', lineHeight: 1.8 }}>
        <div>💨 {weather.windspeed} km/h</div>
        <div>💧 {weather.humidity}%</div>
      </div>
    </div>
  );
}
