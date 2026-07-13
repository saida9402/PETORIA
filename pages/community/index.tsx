import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TabContext, TabPanel } from '@mui/lab';
import { Stack, Typography, Button, Pagination } from '@mui/material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import CommunityFilterSidebar from '../../libs/components/community/CommunityFilterSidebar';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { useUrlSearchFilter } from '../../libs/hooks/useUrlSearchFilter';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Keeps existing inbound deep-links (/community?articleCategory=NEWS) working
 *  when no `?input=` blob is present. */
function deriveCommunityQuery(query: Record<string, any>, fallback: BoardArticlesInquiry): BoardArticlesInquiry {
	if (!query.articleCategory) return fallback;
	return {
		...fallback,
		page: 1,
		search: { ...fallback.search, articleCategory: query.articleCategory as BoardArticleCategory },
	};
}

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	// URL is the single source of truth for the active board category and page.
	const [searchCommunity, setSearchCommunity] = useUrlSearchFilter<BoardArticlesInquiry>(
		initialInput,
		deriveCommunityQuery,
	);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (e: T, value: string) => {
		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({ variables: { articleId: id } });
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="community-list-page">
				<div className="container">
					<TabContext value={searchCommunity.search.articleCategory}>
						<Stack className="main-box">
							<CommunityFilterSidebar
								activeCategory={searchCommunity.search.articleCategory}
								onCategoryChange={tabChangeHandler}
							/>

							<Stack className="right-config">
								<Stack className="panel-config">
									<Stack className="title-box">
										<Stack className="left">
											<Typography className="title">{searchCommunity.search.articleCategory} BOARD</Typography>
											<Typography className="sub-title">
												Share your pet stories, tips, and experiences with the Petoria community!
											</Typography>
										</Stack>
										<Button
											onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
											className="right"
										>
											✍️ Write
										</Button>
									</Stack>

									{['FREE', 'RECOMMEND', 'NEWS', 'HUMOR'].map((cat) => (
										<TabPanel key={cat} value={cat}>
											<Stack className="list-box">
												{totalCount ? (
													boardArticles?.map((boardArticle: BoardArticle) => (
														<CommunityCard
															boardArticle={boardArticle}
															key={boardArticle?._id}
															likeArticleHandler={likeArticleHandler}
														/>
													))
												) : (
													<Stack className={'no-data'}>
														<img src="/img/icons/icoAlert.svg" alt="" />
														<p>No articles found!</p>
													</Stack>
												)}
											</Stack>
										</TabPanel>
									))}
								</Stack>
							</Stack>
						</Stack>
					</TabContext>

					{totalCount > 0 && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(totalCount / searchCommunity.limit)}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>
									Total {totalCount} article{totalCount > 1 ? 's' : ''} available
								</Typography>
							</Stack>
						</Stack>
					)}
				</div>
			</div>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: { articleCategory: 'FREE' },
	},
};

export default withLayoutBasic(Community);
