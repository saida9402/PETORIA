import React, { useState } from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Button, IconButton, Pagination, Stack, Tooltip, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticleStatus } from '../../enums/board-article.enum';
import { LIKE_TARGET_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Messages } from '../../config';

// Same editor used by the Write flow (SSR disabled — Toast UI needs the browser).
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [editingArticle, setEditingArticle] = useState<BoardArticle | null>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: getBoardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeBoArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({ variables: { articleId: id } });
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('Success!', 750);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const editArticleHandler = (e: React.MouseEvent, article: BoardArticle) => {
		e.stopPropagation();
		setEditingArticle(article);
	};

	// Called by the editor after a successful update: leave edit mode and refresh the list.
	const articleUpdatedHandler = async () => {
		setEditingArticle(null);
		await boardArticlesRefetch({ input: searchCommunity });
	};

	// Soft-delete via the same update mutation (backend decrements the article count on DELETE).
	const deleteArticleHandler = async (e: React.MouseEvent, article: BoardArticle) => {
		try {
			e.stopPropagation();
			if (!article?._id) return;
			if (!(await sweetConfirmAlert('Are you sure you want to delete this article?'))) return;

			await updateBoardArticle({
				variables: { input: { _id: article._id, articleStatus: BoardArticleStatus.DELETE } },
			});
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('Article deleted', 750);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/** EDIT MODE — reuse the Write editor, pre-filled with the selected article. **/
	if (editingArticle) {
		return (
			<div id="write-article-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Edit Article ✍️</Typography>
						<Typography className="sub-title">Update your pet community post</Typography>
					</Stack>
					<Button variant="outlined" onClick={() => setEditingArticle(null)} sx={{ height: '40px' }}>
						Cancel
					</Button>
				</Stack>
				<TuiEditor key={editingArticle._id} article={editingArticle} onUpdated={articleUpdatedHandler} />
			</div>
		);
	}

	return (
			<div id="my-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Articles 📝</Typography>
						<Typography className="sub-title">Your pet community posts</Typography>
					</Stack>
				</Stack>

				<Stack className="article-list-box">
					{boardArticles?.length > 0 ? (
						boardArticles?.map((boardArticle: BoardArticle) => (
							<Stack key={boardArticle?._id} sx={{ position: 'relative' }}>
								<CommunityCard
									boardArticle={boardArticle}
									size={'small'}
									likeArticleHandler={likeBoArticleHandler}
								/>
								<Stack
									direction="row"
									spacing={1}
									sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
								>
									<Tooltip title="Edit article">
										<IconButton
											aria-label="Edit article"
											size="small"
											onClick={(e) => editArticleHandler(e, boardArticle)}
											sx={{
												width: 32,
												height: 32,
												color: 'var(--t1, #2D5016)',
												backgroundColor: 'var(--cb, #ffffff)',
												border: '1px solid var(--bd, #C8E6A0)',
												boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
												transition: 'background-color 0.2s ease, color 0.2s ease',
												'&:hover': { backgroundColor: 'var(--nbg, #eaf3de)' },
											}}
										>
											<EditOutlinedIcon sx={{ fontSize: 18 }} />
										</IconButton>
									</Tooltip>
									<Tooltip title="Delete article">
										<IconButton
											aria-label="Delete article"
											size="small"
											onClick={(e) => deleteArticleHandler(e, boardArticle)}
											sx={{
												width: 32,
												height: 32,
												color: 'var(--rose, #e11d48)',
												backgroundColor: 'var(--cb, #ffffff)',
												border: '1px solid var(--bd, #C8E6A0)',
												boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
												transition: 'background-color 0.2s ease, color 0.2s ease',
												'&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.12)' },
											}}
										>
											<DeleteOutlineIcon sx={{ fontSize: 18 }} />
										</IconButton>
									</Tooltip>
								</Stack>
							</Stack>
						))
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No articles yet — share your pet story! 🐾</p>
						</div>
					)}
				</Stack>

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>Total {totalCount ?? 0} article(s)</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
