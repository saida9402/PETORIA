import React, { useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { useRouter } from 'next/router';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, IMAGE_UPLOADER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { API_URL } from '../../config';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null);
	const router = useRouter();

	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	/** HANDLERS **/
	const uploadImage = async (image: any): Promise<string> => {
		try {
			const { data } = await imageUploader({ variables: { file: image, target: 'article' } });
			if (!data?.imageUploader) return '';
			setArticleImage(data.imageUploader);
			return `${API_URL}/${data.imageUploader}`;
		} catch (err: any) {
			console.error('Error, uploadImage:', err);
			return '';
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleTitle(e.target.value);
	};

	const handleRegisterButton = async () => {
		if (submitting) return;
		setSubmitting(true);

		try {
			const editor = editorRef.current;
			const articleContent = (editor?.getInstance().getHTML() as string) ?? '';

			// Validation
			const trimmedTitle = articleTitle.trim();
			const trimmedContent = articleContent.trim();

			if (!trimmedTitle) {
				throw new Error('Please enter a title');
			}
			if (trimmedTitle.length < 3) {
				throw new Error('Title must be at least 3 characters');
			}
			if (trimmedTitle.length > 50) {
				throw new Error('Title must be 50 characters or less');
			}
			if (!trimmedContent || trimmedContent === '<p><br></p>' || trimmedContent === '<p>Type here</p>') {
				throw new Error('Please write some content');
			}
			if (trimmedContent.length < 3) {
				throw new Error('Content is too short');
			}

			await createBoardArticle({
				variables: {
					input: {
						articleCategory,
						articleTitle: trimmedTitle,
						articleContent: trimmedContent,
						articleImage: articleImage || undefined,
					},
				},
			});

			await sweetTopSuccessAlert('Article is created successfully', 700);
			await router.push({
				pathname: '/mypage',
				query: { category: 'myArticles' },
			});
		} catch (err: any) {
			console.error('[ARTICLE SUBMIT ERROR]', err);
			const msg = err?.message || Message.INSERT_ALL_INPUTS;
			sweetErrorHandling(new Error(msg)).then();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						value={articleTitle}
						onChange={articleTitleHandler}
						id="filled-basic"
						label="Type Title (3-50 chars)"
						style={{ width: '300px', background: 'white' }}
						inputProps={{ maxLength: 50 }}
					/>
				</Box>
			</Stack>

			<Editor
				initialValue={''}
				placeholder={'Write your article here...'}
				previewStyle={'vertical'}
				height={'640px'}
				// @ts-ignore
				initialEditType={'WYSIWYG'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						const uploadedImageURL = await uploadImage(image);
						callback(uploadedImageURL);
						return false;
					},
				}}
				events={{
					load: function (param: any) {},
				}}
			/>

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleRegisterButton}
					disabled={submitting}
				>
					{submitting ? 'Submitting...' : 'Register'}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
