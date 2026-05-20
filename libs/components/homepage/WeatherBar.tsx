import React from 'react';
import { useWeather } from '../../hooks/useWeather';
import type { WeatherCondition } from '../../hooks/useWeather';

const ICON: Record<WeatherCondition, string> = {
	sunny: '☀️',
	rainy: '🌧️',
	cloudy: '⛅',
	snowy: '❄️',
	windy: '💨',
};

const LABEL: Record<WeatherCondition, string> = {
	sunny: 'Sunny',
	rainy: 'Rainy',
	cloudy: 'Cloudy',
	snowy: 'Snowy',
	windy: 'Windy',
};

const WeatherBar = () => {
	const { weather, loading } = useWeather();

	const condition: WeatherCondition = weather?.condition ?? 'sunny';

	/* Loading skeleton — never show --°C */
	if (loading) {
		return (
			<div className="weather-bar weather-bar--loading" aria-busy="true">
				<div className="weather-bar__left">
					<span className="weather-bar__skeleton weather-bar__skeleton--icon" />
					<div className="weather-bar__info">
						<span className="weather-bar__skeleton weather-bar__skeleton--temp" />
						<span className="weather-bar__skeleton weather-bar__skeleton--desc" />
					</div>
					<span className="weather-bar__skeleton weather-bar__skeleton--badge" />
				</div>
				<div className="weather-bar__right">
					<span className="weather-bar__skeleton weather-bar__skeleton--loc" />
				</div>
			</div>
		);
	}

	/* Loaded (real location or Hanam-si fallback) */
	return (
		<div className="weather-bar weather-bar--loaded" data-condition={condition}>
			<div className="weather-bar__left">
				<span
					className={`weather-bar__icon weather-bar__icon--${condition}`}
					aria-label={LABEL[condition]}
				>
					{ICON[condition]}
				</span>

				<div className="weather-bar__info">
					<strong>{weather ? `${weather.temp}°C` : '...'}</strong>
					<span>{weather?.description ?? 'Loading weather...'}</span>
				</div>

				{weather && (
					<>
						<span className="weather-bar__badge">
							{ICON[condition]}&nbsp;{LABEL[condition]}
						</span>
						<span className="weather-bar__feels">
							Feels {weather.feelsLike}°C
						</span>
					</>
				)}
			</div>

			<div className="weather-bar__right">
				<span className="weather-bar__location">
					{weather
						? `📍 ${weather.city}, ${weather.country}`
						: '📍 Detecting location...'}
				</span>

				{weather && (
					<div className="weather-bar__meta">
						<span title="Humidity">💧 {weather.humidity}%</span>
						<span title="Wind">💨 {weather.windSpeed} m/s</span>
						<span title="Visibility">👁 {weather.visibility} km</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default WeatherBar;
