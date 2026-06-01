import React, { useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface UserAvatarProps {
	src?: string | null;
	alt?: string;
	/** Pixel size — only applied when the parent CSS doesn't control dimensions. */
	size?: number;
	className?: string;
	style?: React.CSSProperties;
	onClick?: (e: React.MouseEvent) => void;
}

/**
 * Drop-in replacement for <img> user avatars.
 * - Shows a neutral AccountCircle icon when src is empty/null/undefined.
 * - On network/404 error, switches to the same icon (onerror=null prevents loops).
 * - Rounds corners to 50% and covers like object-fit: cover.
 */
const UserAvatar = ({ src, alt = '', size, className = '', style, onClick }: UserAvatarProps) => {
	const [broken, setBroken] = useState(false);

	const sizeStyle: React.CSSProperties = size ? { width: size, height: size } : {};
	const sharedStyle: React.CSSProperties = {
		borderRadius: '50%',
		display: 'block',
		flexShrink: 0,
		...sizeStyle,
		...style,
	};

	if (!src || broken) {
		return (
			<AccountCircleIcon
				className={className}
				onClick={onClick}
				sx={{
					color: '#bdbdbd',
					borderRadius: '50%',
					...(size ? { width: size, height: size } : {}),
				}}
				style={{ flexShrink: 0, display: 'block', ...style }}
			/>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className={className}
			style={{ objectFit: 'cover', ...sharedStyle }}
			onClick={onClick}
			onError={(e) => {
				(e.currentTarget as HTMLImageElement).onerror = null; // prevent infinite loop
				setBroken(true);
			}}
		/>
	);
};

export default UserAvatar;
