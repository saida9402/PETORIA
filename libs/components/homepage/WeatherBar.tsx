import React, { useState } from 'react';

const SEASONS = [
	{ key: 'sun', icon: '☀️', label: 'Summer' },
	{ key: 'rain', icon: '🌧️', label: 'Rainy' },
	{ key: 'snow', icon: '❄️', label: 'Winter' },
	{ key: 'blossom', icon: '🌸', label: 'Spring' },
];

const WeatherBar = () => {
	const [activeSeason, setActiveSeason] = useState('sun');

	return (
		<div className="weather-bar">
			<div className="weather-bar__left">
				<span className="weather-bar__temp-icon">☀️</span>
				<div className="weather-bar__info">
					<strong>24°C</strong>
					<span>Clear &amp; Sunny</span>
				</div>
				<span className="weather-bar__season-badge">🌸 Spring Season</span>
			</div>

			<div className="weather-bar__right">
				<span className="weather-bar__location">
					📍&nbsp;Daejeon, KR
				</span>
				<div className="weather-bar__seasons">
					{SEASONS.map(({ key, icon, label }) => (
						<button
							key={key}
							className={`weather-bar__season-btn${activeSeason === key ? ' weather-bar__season-btn--active' : ''}`}
							aria-label={label}
							onClick={() => setActiveSeason(key)}
						>
							{icon}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default WeatherBar;
