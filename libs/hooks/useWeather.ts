import { useState, useEffect } from 'react';

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'windy';

export interface WeatherData {
	temp: number;
	feelsLike: number;
	condition: WeatherCondition;
	description: string;
	city: string;
	country: string;
	humidity: number;
	windSpeed: number;
	visibility: number;
	isFallback: boolean;
}

// Hard fallback — only used when GPS AND IP geolocation both fail.
// Override via env vars so this never needs a code change.
const FALLBACK = {
	lat:  parseFloat(process.env.NEXT_PUBLIC_WEATHER_FALLBACK_LAT  ?? '37.5392'),
	lon:  parseFloat(process.env.NEXT_PUBLIC_WEATHER_FALLBACK_LNG  ?? '127.2149'),
	city: process.env.NEXT_PUBLIC_WEATHER_FALLBACK_CITY ?? '',
};

// Module-level cache — all components share one fetch per session
let _cache: WeatherData | null = null;
let _cacheTime = 0;
let _promise: Promise<WeatherData> | null = null;
const CACHE_TTL = 10 * 60 * 1000;

function mapCondition(id: number): WeatherCondition {
	if (id >= 200 && id < 600) return 'rainy';
	if (id >= 600 && id < 700) return 'snowy';
	if (id >= 700 && id < 800) return 'windy';
	if (id === 800) return 'sunny';
	return 'cloudy';
}

// Step 2: IP geolocation — used when GPS is denied or unavailable.
// ipapi.co free tier: 1 000 req/day, no key required.
async function getCoordsFromIP(): Promise<{ lat: number; lon: number; city: string; country: string } | null> {
	try {
		const res = await fetch('https://ipapi.co/json/');
		if (!res.ok) return null;
		const d = await res.json();
		if (!d.latitude || !d.longitude) return null;
		return {
			lat: d.latitude,
			lon: d.longitude,
			city: d.city ?? '',
			country: d.country_name ?? d.country ?? '',
		};
	} catch {
		return null;
	}
}

interface Coords {
	lat: number;
	lon: number;
	isFallback: boolean;
	/** City name from IP geolocation — use this when GPS was unavailable */
	cityHint?: string;
	countryHint?: string;
}

// Step 1: GPS → Step 2: IP geolocation → Step 3: env/hardcoded fallback
function getCoords(): Promise<Coords> {
	// SSR guard
	if (typeof window === 'undefined' || !navigator?.geolocation) {
		return getCoordsFromIP().then((ip) => {
			if (ip) return { lat: ip.lat, lon: ip.lon, isFallback: false, cityHint: ip.city, countryHint: ip.country };
			return { lat: FALLBACK.lat, lon: FALLBACK.lon, isFallback: true, cityHint: FALLBACK.city };
		});
	}

	return new Promise((resolve) => {
		// Safety net: if the error callback somehow never fires, fall through after 8 s
		const timer = setTimeout(() => {
			getCoordsFromIP().then((ip) => {
				if (ip) resolve({ lat: ip.lat, lon: ip.lon, isFallback: false, cityHint: ip.city, countryHint: ip.country });
				else resolve({ lat: FALLBACK.lat, lon: FALLBACK.lon, isFallback: true, cityHint: FALLBACK.city });
			});
		}, 8000);

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				// GPS granted — use real coordinates; OpenWeather will return the city name
				clearTimeout(timer);
				resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, isFallback: false });
			},
			async () => {
				// GPS denied or unavailable — try IP geolocation before giving up
				clearTimeout(timer);
				const ip = await getCoordsFromIP();
				if (ip) {
					resolve({ lat: ip.lat, lon: ip.lon, isFallback: false, cityHint: ip.city, countryHint: ip.country });
				} else {
					resolve({ lat: FALLBACK.lat, lon: FALLBACK.lon, isFallback: true, cityHint: FALLBACK.city });
				}
			},
			{ enableHighAccuracy: false, timeout: 7000, maximumAge: 300_000 },
		);
	});
}

async function fetchWeatherData(
	lat: number,
	lon: number,
	isFallback: boolean,
	cityHint?: string,
	countryHint?: string,
): Promise<WeatherData> {
	const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? '';

	const res = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
	);

	if (!res.ok) throw new Error(`OpenWeather ${res.status}`);

	const d = await res.json();

	return {
		temp:        Math.round(d.main.temp),
		feelsLike:   Math.round(d.main.feels_like),
		condition:   mapCondition(d.weather[0].id),
		description: (d.weather[0].description as string)
			.split(' ')
			.map((w: string) => w[0].toUpperCase() + w.slice(1))
			.join(' '),
		// When GPS is available OpenWeather's own city name is accurate.
		// When GPS was denied, prefer the city the IP provider returned because
		// OpenWeather may map the same coordinates to a nearby suburb name.
		city:        cityHint ? cityHint : d.name,
		country:     countryHint ? countryHint : d.sys.country,
		humidity:    d.main.humidity,
		windSpeed:   Math.round(d.wind.speed),
		visibility:  Math.round((d.visibility ?? 10000) / 1000),
		isFallback,
	};
}

async function loadWeather(): Promise<WeatherData> {
	if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

	const { lat, lon, isFallback, cityHint, countryHint } = await getCoords();

	try {
		const data = await fetchWeatherData(lat, lon, isFallback, cityHint, countryHint);
		_cache = data;
		_cacheTime = Date.now();
		return data;
	} catch {
		// OpenWeather API failed — retry with the hard fallback coordinates
		if (!isFallback) {
			try {
				const data = await fetchWeatherData(FALLBACK.lat, FALLBACK.lon, true, FALLBACK.city);
				_cache = data;
				_cacheTime = Date.now();
				return data;
			} catch {
				// nothing to do
			}
		}
		throw new Error('Weather fetch failed');
	}
}

export function useWeather() {
	const [weather, setWeather] = useState<WeatherData | null>(_cache);
	const [loading, setLoading] = useState(!_cache);

	useEffect(() => {
		if (_cache) {
			setWeather(_cache);
			setLoading(false);
			return;
		}

		if (!_promise) _promise = loadWeather();

		_promise
			.then((data) => {
				setWeather(data);
			})
			.catch(() => {
				// Total failure — stop loading; UI shows graceful fallback
			})
			.finally(() => {
				setLoading(false);
				_promise = null;
			});
	}, []);

	return { weather, loading };
}
