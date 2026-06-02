import React from 'react';
import { Stack, Typography, Box } from '@mui/material';

const PetArticle = () => {
	return (
			<Stack className="card-config">
				<Stack className="top">
					<img src="/img/banner/community.svg" alt="" />
					<Box component={'div'} className={'date'}>
						<Typography>July 28</Typography>
					</Box>
					{/* Category tag */}
					<Box component={'div'} className={'category-tag'}>
						<Typography>🐾 Pet Tips</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Typography>How to keep your dog healthy this summer</Typography>
						</Stack>
						<Stack className="address">
							<Typography>By Petoria Community · Seoul</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
	);
};

export default PetArticle;
