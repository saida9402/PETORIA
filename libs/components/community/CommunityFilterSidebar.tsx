import React from 'react';
import { Stack, Tab, Tabs, Typography } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import StarIcon from '@mui/icons-material/Star';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MoodIcon from '@mui/icons-material/Mood';

export interface CommunityFilterSidebarProps {
	activeCategory: string;
	onCategoryChange: (event: React.SyntheticEvent, value: string) => void;
}

// Icons inherit the tab's font-size (13px) and color via currentColor, so they
// recolor automatically for the active/dark states — no per-emoji CSS hacks.
const ICON_SX = { fontSize: 'inherit', verticalAlign: 'middle' } as const;

const CATEGORY_TABS = [
	{ value: 'FREE', icon: <PetsIcon sx={ICON_SX} />, label: 'Free Board' },
	{ value: 'RECOMMEND', icon: <StarIcon sx={ICON_SX} />, label: 'Recommendations' },
	{ value: 'NEWS', icon: <NewspaperIcon sx={ICON_SX} />, label: 'Pet News' },
	{ value: 'HUMOR', icon: <MoodIcon sx={ICON_SX} />, label: 'Humor' },
];

const CommunityFilterSidebar = ({ activeCategory, onCategoryChange }: CommunityFilterSidebarProps) => {
	return (
		<Stack className="left-config">
			<Stack className={'image-info'}>
				<img src={'/img/logo/petoriaLogoText.svg'} alt="Petoria" />
				<Stack className={'community-name'}>
					<Typography className={'name'}>
						<PetsIcon sx={ICON_SX} /> Petoria Community
					</Typography>
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
