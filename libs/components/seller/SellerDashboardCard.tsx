import React from 'react';
import { Stack, Typography } from '@mui/material';

interface SellerDashboardCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	sub?: string;
	accentColor?: string;
}

const SellerDashboardCard = ({
	icon,
	label,
	value,
	sub,
	accentColor = 'var(--np, #4E8A28)',
}: SellerDashboardCardProps) => {
	return (
		<Stack className="sdc-card" style={{ borderTop: `3px solid ${accentColor}` }}>
			<div className="sdc-card__icon">{icon}</div>
			<div className="sdc-card__body">
				<Typography className="sdc-card__value">{value}</Typography>
				<Typography className="sdc-card__label">{label}</Typography>
				{sub && <Typography className="sdc-card__sub">{sub}</Typography>}
			</div>
		</Stack>
	);
};

export default SellerDashboardCard;
