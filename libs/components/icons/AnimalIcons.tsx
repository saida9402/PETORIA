import React from 'react';

interface AnimalIconProps {
	size?: number;
	className?: string;
	style?: React.CSSProperties;
}

export function DogIcon({ size = 18, className, style }: AnimalIconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			style={style}
			aria-hidden="true"
		>
			<path d="M10 3L8 7H4l2 3-1 4 4-2 4 2-1-4 2-3h-4z" />
			<ellipse cx="12" cy="17" rx="5" ry="4" />
			<path d="M7 21c0-1 1-2 2-2M17 21c0-1-1-2-2-2" />
		</svg>
	);
}

export function CatIcon({ size = 18, className, style }: AnimalIconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			style={style}
			aria-hidden="true"
		>
			<path d="M12 5C8 5 5 8 5 12s3 7 7 7 7-3 7-7-3-7-7-7z" />
			<path d="M8 5V2l3 3M16 5V2l-3 3" />
			<path d="M9 14s1 1 3 1 3-1 3-1" />
			<circle cx="9.5" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
			<circle cx="14.5" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function BirdIcon({ size = 18, className, style }: AnimalIconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			style={style}
			aria-hidden="true"
		>
			<path d="M20 4c-4 0-7 2-9 5H5a2 2 0 000 4h1l1 4h4l1-2c1 0 2 0 3-1" />
			<path d="M20 4l-2 4" />
			<circle cx="18" cy="7" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function FishIcon({ size = 18, className, style }: AnimalIconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			style={style}
			aria-hidden="true"
		>
			<path d="M6 12c0-3 3-6 8-6 2 0 4 1 5 2l1 4-1 4c-1 1-3 2-5 2-5 0-8-3-8-6z" />
			<path d="M6 12L2 8v8l4-4z" />
			<circle cx="17" cy="10" r="1" fill="currentColor" stroke="none" />
		</svg>
	);
}
