import React from 'react';
import { Stack, Tab, Tabs, Typography } from '@mui/material';

export interface CommunityFilterSidebarProps {
	activeCategory: string;
	onCategoryChange: (event: React.SyntheticEvent, value: string) => void;
}

const CATEGORY_TABS = [
	{ value: 'FREE', icon: '🐾', label: 'Free Board' },
	{ value: 'RECOMMEND', icon: '⭐', label: 'Recommendations' },
	{ value: 'NEWS', icon: '📰', label: 'Pet News' },
	{ value: 'HUMOR', icon: '😄', label: 'Humor' },
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
						label={
							<>
								<span className={`tab-icon tab-icon--${tab.value.toLowerCase()}`}>{tab.icon}</span> {tab.label}
							</>
						}
						className={`tab-button ${activeCategory === tab.value ? 'active' : ''}`}
					/>
				))}
			</Tabs>
		</Stack>
	);
};

export default CommunityFilterSidebar;
