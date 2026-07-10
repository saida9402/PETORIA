import React from 'react';
import { Stack, Tab, Tabs, Typography } from '@mui/material';

export interface CommunityFilterSidebarProps {
	activeCategory: string;
	onCategoryChange: (event: React.SyntheticEvent, value: string) => void;
}

const CATEGORY_TABS = [
	{ value: 'FREE', label: '🐾 Free Board' },
	{ value: 'RECOMMEND', label: '⭐ Recommendations' },
	{ value: 'NEWS', label: '📰 Pet News' },
	{ value: 'HUMOR', label: '😄 Humor' },
];

const CommunityFilterSidebar = ({ activeCategory, onCategoryChange }: CommunityFilterSidebarProps) => {
	return (
		<Stack className="left-config">
			<Stack className={'image-info'}>
				<img src={'/img/logo/petoriaLogoText.svg'} alt="Petoria" />
				<Stack className={'community-name'}>
					<Typography className={'name'}>🐾 Petoria Community</Typography>
				</Stack>
			</Stack>

			<Tabs
				orientation="vertical"
				aria-label="community tabs"
				TabIndicatorProps={{ style: { display: 'none' } }}
				onChange={onCategoryChange}
				value={activeCategory}
			>
				{CATEGORY_TABS.map((tab) => (
					<Tab
						key={tab.value}
						value={tab.value}
						label={tab.label}
						className={`tab-button ${activeCategory === tab.value ? 'active' : ''}`}
					/>
				))}
			</Tabs>
		</Stack>
	);
};

export default CommunityFilterSidebar;
