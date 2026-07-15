import React from 'react';
import { Chip } from '@mui/material';

/**
 * Shared admin status/type badge. Renders the SAME MUI <Chip> design used by the
 * Notice Management status column (the reference), so every admin list stays
 * legible in dark mode (colors come from the MUI palette, not from page-dependent
 * SCSS tints). Pass `onClick` to make it act as the anchor for a status-change menu.
 */
type MuiChipColor = 'default' | 'success' | 'warning' | 'error';

const COLOR_MAP: Record<string, MuiChipColor> = {
	// statuses
	ACTIVE: 'success',
	SOLD: 'warning',
	PAUSE: 'warning',
	HOLD: 'default',
	DELETE: 'error',
	DELETED: 'error',
	BLOCK: 'error',
	BLOCKED: 'error',
	// member types
	SELLER: 'success',
	AGENT: 'success',
	USER: 'default',
	ADMIN: 'warning',
};

interface StatusChipProps {
	label: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const StatusChip = ({ label, onClick }: StatusChipProps) => (
	<Chip
		label={label}
		color={COLOR_MAP[label] ?? 'default'}
		size="small"
		onClick={onClick}
		clickable={Boolean(onClick)}
		sx={{ fontFamily: 'Nunito', fontSize: 11, fontWeight: 600, cursor: onClick ? 'pointer' : 'default' }}
	/>
);

export default StatusChip;
