import React from 'react';
import { Chip } from '@mui/material';

/**
 * Shared admin status/type badge. Every chip renders as the neutral MEMBER TYPE
 * pill so shape, fill, text and size are identical everywhere: it is always a MUI
 * `color="default"` filled chip, which picks up the sole dark-mode chip rule
 * (`.MuiChip-filled.MuiChip-colorDefault` → `--nbg` surface + `--t1` text in
 * darkmode.scss) and MUI's neutral grey fill + dark text in light mode. Only the
 * border colour differs per state, driven by the global design tokens (bright in
 * both themes), so ACTIVE reads green, BLOCK/CANCEL red, PENDING amber, etc.
 * Pass `onClick` to make it act as the anchor for a status-change menu.
 */
type MuiChipColor = 'default' | 'success' | 'warning' | 'error' | 'info';

/** Border hue per state — reuses the existing CSS tokens (identical resolution on
 *  admin pages in both themes). `default` keeps the theme's neutral grey border. */
const BORDER_TOKEN: Record<MuiChipColor, string | undefined> = {
	default: undefined,
	success: 'var(--np)',
	warning: 'var(--amber)',
	error: 'var(--rose)',
	info: 'var(--blue)',
};

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
	// order statuses
	PENDING: 'warning',
	PROCESS: 'info',
	CONFIRM: 'info',
	DELIVERED: 'success',
	CANCEL: 'error',
};

interface StatusChipProps {
	label: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const StatusChip = ({ label, onClick }: StatusChipProps) => {
	const borderColor = BORDER_TOKEN[COLOR_MAP[label] ?? 'default'];
	return (
		<Chip
			label={label}
			color="default"
			size="small"
			onClick={onClick}
			clickable={Boolean(onClick)}
			sx={{
				fontFamily: 'Nunito',
				fontSize: 11,
				fontWeight: 600,
				cursor: onClick ? 'pointer' : 'default',
				// Fill + text come from the shared default-chip treatment (see file header),
				// so the only per-state difference is the border hue.
				...(borderColor && { borderColor }),
			}}
		/>
	);
};

export default StatusChip;
