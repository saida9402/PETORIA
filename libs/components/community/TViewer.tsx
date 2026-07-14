import React, { useEffect, useMemo, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';
import { Box, Stack, CircularProgress } from '@mui/material';

// Reuse an existing placeholder asset — no new files.
const IMAGE_PLACEHOLDER = '/img/banner/defaultProduct.svg';

/**
 * Rewrite ONLY broken image sources baked into stored article HTML before it is
 * handed to the Viewer: relative paths (e.g. `img/community/articleImg.png`,
 * which 404s) and the known-missing community placeholder. Absolute upload URLs
 * (http(s)://…) and root-relative app assets (/img/…) are left byte-for-byte
 * untouched, so a valid image's src never changes and it renders normally. This
 * is a pure string transform at render time — no error listeners, no post-load
 * DOM mutation — so it cannot affect an image that loads successfully.
 */
function normalizeArticleImages(html?: string): string {
	if (!html) return html ?? '';
	return html.replace(/<img\b[^>]*>/gi, (tag) => {
		const srcMatch = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
		if (!srcMatch) return tag;
		const quote = srcMatch[1][0];
		const src = srcMatch[2] ?? srcMatch[3] ?? '';
		const isAbsolute = /^https?:\/\//i.test(src) || src.startsWith('//') || src.startsWith('/');
		const isKnownMissing = /img\/community\/articleImg\.png/i.test(src);
		if (isAbsolute && !isKnownMissing) return tag; // valid src — leave as-is
		return tag.replace(srcMatch[0], `src=${quote}${IMAGE_PLACEHOLDER}${quote}`);
	});
}

const TViewer = (props: any) => {
	const [editorLoaded, setEditorLoaded] = useState(false);
	const safeMarkdown = useMemo(() => normalizeArticleImages(props.markdown), [props.markdown]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (props.markdown) {
			setEditorLoaded(true);
		} else {
			setEditorLoaded(false);
		}
	}, [props.markdown]);

	return (
		<Stack sx={{ background: 'white', mt: '30px', borderRadius: '10px' }}>
			<Box component={'div'} sx={{ m: '40px' }}>
				{editorLoaded ? (
					<Viewer
						initialValue={safeMarkdown}
						customHTMLRenderer={{
							htmlBlock: {
								iframe(node: any) {
									return [
										{
											type: 'openTag',
											tagName: 'iframe',
											outerNewLine: true,
											attributes: node.attrs,
										},
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'iframe', outerNewLine: true },
									];
								},
								div(node: any) {
									return [
										{ type: 'openTag', tagName: 'div', outerNewLine: true, attributes: node.attrs },
										{ type: 'html', content: node.childrenHTML ?? '' },
										{ type: 'closeTag', tagName: 'div', outerNewLine: true },
									];
								},
							},
							htmlInline: {
								big(node: any, { entering }: any) {
									return entering
										? { type: 'openTag', tagName: 'big', attributes: node.attrs }
										: { type: 'closeTag', tagName: 'big' };
								},
							},
						}}
					/>
				) : (
					<CircularProgress />
				)}
			</Box>
		</Stack>
	);
};

export default TViewer;
