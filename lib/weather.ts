export interface WeatherData {
  temperature: number;
  windspeed: number;
  humidity: number;
  weatherCode: number;
  description: string;
  icon: string;
  isRainy: boolean;
  isHot: boolean;
}

const WMO_CODES: Record<number, { icon: string; description: string }> = {
  0: { icon: '☀️', description: 'Clear sky' },
  1: { icon: '🌤', description: 'Mainly clear' },
  2: { icon: '⛅', description: 'Partly cloudy' },
  3: { icon: '☁️', description: 'Overcast' },
  45: { icon: '🌫', description: 'Foggy' },
  48: { icon: '🌫', description: 'Icy fog' },
  51: { icon: '🌦', description: 'Light drizzle' },
  53: { icon: '🌦', description: 'Moderate drizzle' },
  55: { icon: '🌧', description: 'Heavy drizzle' },
  61: { icon: '🌧', description: 'Light rain' },
  63: { icon: '🌧', description: 'Moderate rain' },
  65: { icon: '🌧', description: 'Heavy rain' },
  71: { icon: '🌨', description: 'Light snow' },
  73: { icon: '❄️', description: 'Moderate snow' },
  75: { icon: '❄️', description: 'Heavy snow' },
  80: { icon: '🌦', description: 'Light showers' },
  81: { icon: '🌧', description: 'Moderate showers' },
  82: { icon: '⛈', description: 'Violent showers' },
  95: { icon: '⛈', description: 'Thunderstorm' },
  99: { icon: '⛈', description: 'Thunderstorm + hail' },
};

const RAINY_CODES = new Set([51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95, 99]);

export async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,windspeed_10m,weathercode'
    );
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;

    const code = current.weathercode as number;
    const wmo = WMO_CODES[code] ?? { icon: '🌡', description: 'Unknown' };

    return {
      temperature: Math.round(current.temperature_2m),
      windspeed: Math.round(current.windspeed_10m),
      humidity: Math.round(current.relative_humidity_2m),
      weatherCode: code,
      description: wmo.description,
      icon: wmo.icon,
      isRainy: RAINY_CODES.has(code),
      isHot: current.temperature_2m > 35,
    };
  } catch (err) {
    console.error('Weather fetch failed:', err);
    return null;
  }
}

export function getWeatherAdvice(
  origin: WeatherData | null,
  destination: WeatherData | null
): string | null {
  if (!origin && !destination) return null;

  const destRainy = destination?.isRainy ?? false;
  const originRainy = origin?.isRainy ?? false;
  const destHot = destination?.isHot ?? false;
  const highWind = (destination?.windspeed ?? 0) > 30;

  if (destRainy && originRainy) {
    return '🌧 Rain at both ends — bring a raincoat if cycling or walking';
  }
  if (destRainy) {
    return '🌧 Rain at destination — consider cycling gear or an umbrella';
  }
  if (originRainy) {
    return '🌧 Rain at your start — stay dry on the way out';
  }
  if (destHot) {
    return '🌡 Very hot at destination — stay hydrated if walking or cycling';
  }
  if (highWind) {
    return '💨 Strong winds at destination — cycling may be tougher than usual';
  }
  return null;
}
