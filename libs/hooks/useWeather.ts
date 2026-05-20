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
	isFallback: boolean; // true when using default location
}

// Fallback: Hanam-si, Gyeonggi-do, KR
const FALLBACK = { lat: 37.5392, lon: 127.2149 };

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

function getCoords(): Promise<{ lat: number; lon: number; isFallback: boolean }> {
	// SSR guard
	if (typeof window === 'undefined' || !navigator?.geolocation) {
		return Promise.resolve({ ...FALLBACK, isFallback: true });
	}

	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			// Timeout — use fallback immediately
			resolve({ ...FALLBACK, isFallback: true });
		}, 8000);

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				clearTimeout(timer);
				resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, isFallback: false });
			},
			() => {
				clearTimeout(timer);
				resolve({ ...FALLBACK, isFallback: true });
			},
			{ enableHighAccuracy: false, timeout: 7000, maximumAge: 300_000 },
		);
	});
}

async function fetchWeatherData(lat: number, lon: number, isFallback: boolean): Promise<WeatherData> {
	const key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? '';

	const res = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
	);

	if (!res.ok) throw new Error(`OpenWeather ${res.status}`);

	const d = await res.json();

	return {
		temp: Math.round(d.main.temp),
		feelsLike: Math.round(d.main.feels_like),
		condition: mapCondition(d.weather[0].id),
		description: (d.weather[0].description as string)
			.split(' ')
			.map((w: string) => w[0].toUpperCase() + w.slice(1))
			.join(' '),
		city: d.name,
		country: d.sys.country,
		humidity: d.main.humidity,
		windSpeed: Math.round(d.wind.speed),
		visibility: Math.round((d.visibility ?? 10000) / 1000),
		isFallback,
	};
}

async function loadWeather(): Promise<WeatherData> {
	if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

	const { lat, lon, isFallback } = await getCoords();

	try {
		const data = await fetchWeatherData(lat, lon, isFallback);
		_cache = data;
		_cacheTime = Date.now();
		return data;
	} catch {
		// API failed — try one more time with fallback coordinates
		if (!isFallback) {
			try {
				const data = await fetchWeatherData(FALLBACK.lat, FALLBACK.lon, true);
				_cache = data;
				_cacheTime = Date.now();
				return data;
			} catch {
				// nothing to do — will use null
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
				// Even on total failure, stop loading — UI shows graceful fallback
			})
			.finally(() => {
				setLoading(false);
				_promise = null;
			});
	}, []);

	return { weather, loading };
}
