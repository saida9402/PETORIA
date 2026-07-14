import React, { useEffect, useMemo, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';
import { Box, Stack, CircularProgress } from '@mui/material';
import { API_URL } from '../../config';

// Reuse an existing placeholder asset — no new files.
const IMAGE_PLACEHOLDER = '/img/banner/defaultProduct.svg';

// Current backend origin, derived from API_URL (never a hardcoded port).
const API_ORIGIN = (() => {
	try {
		return API_URL ? new URL(API_URL).origin : '';
	} catch {
		return '';
	}
})();

/**
 * Normalise image sources baked into stored article HTML before it is handed to
 * the Viewer:
 *  - Absolute upload URLs served from a STALE local host/port (e.g.
 *    http://localhost:3002/uploads/…, left over after the backend port changed)
 *    are repointed to the current API_ORIGIN, keeping the /uploads/… path — this
 *    fixes ERR_CONNECTION_REFUSED without touching the DB.
 *  - Relative upload paths (e.g. `uploads/article/x.jpeg`) are prefixed with the
 *    current API_ORIGIN so they resolve.
 *  - Known-missing/relative junk (e.g. `img/community/articleImg.png`) falls back
 *    to the placeholder.
 * Every other valid absolute URL (external https://, /img/… app assets) is left
 * byte-for-byte untouched. Pure render-time string transform — no error
 * listeners, no post-load DOM mutation — so a working image is never affected.
 */
function normalizeArticleImages(html?: string): string {
	if (!html) return html ?? '';
	return html.replace(/<img\b[^>]*>/gi, (tag) => {
		const srcMatch = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
		if (!srcMatch) return tag;
		const quote = srcMatch[1][0];
		const src = (srcMatch[2] ?? srcMatch[3] ?? '').trim();
		const swap = (next: string) => tag.replace(srcMatch[0], `src=${quote}${next}${quote}`);

		// Absolute http(s) URL.
		if (/^https?:\/\//i.test(src)) {
			if (API_ORIGIN) {
				try {
					const u = new URL(src);
					const isLocalHost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)$/i.test(u.hostname);
					if (isLocalHost && /\/uploads\//i.test(u.pathname) && u.origin !== API_ORIGIN) {
						return swap(API_ORIGIN + u.pathname + u.search + u.hash);
					}
				} catch {
					/* malformed URL — leave as-is */
				}
			}
			return tag; // external / already-correct absolute URL — untouched
		}

		const isKnownMissing = /img\/community\/articleImg\.png/i.test(src);
		if (!isKnownMissing) {
			// Relative upload path → prefix the current API origin.
			if (API_ORIGIN && /^\/?uploads\//i.test(src)) {
				return swap(`${API_ORIGIN}/${src.replace(/^\//, '')}`);
			}
			// Other root-relative/protocol-relative assets (/img/…, //…) — untouched.
			if (src.startsWith('/')) return tag;
		}

		return swap(IMAGE_PLACEHOLDER);
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
