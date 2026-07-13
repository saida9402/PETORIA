import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';

type RouterQuery = NextRouter['query'];

function safeParse<T>(raw: string | string[] | undefined, fallback: T): T {
	try {
		return raw ? (JSON.parse(raw as string) as T) : fallback;
	} catch {
		return fallback;
	}
}

export type SetSearchFilter<T> = (next: T | ((prev: T) => T)) => void;

/**
 * Keeps a search / filter / sort / pagination inquiry object in sync with the
 * URL query string, so the current state survives a browser refresh, supports
 * deep-linking and works with Back / Forward navigation.
 *
 * The URL is the single source of truth: the full inquiry is serialized into a
 * single `?input=<json>` param (the convention already used across this
 * codebase). `deriveFromQuery` optionally maps human-friendly inbound params
 * (e.g. `/shop?type=DOG`, `/community?articleCategory=NEWS`) into the inquiry
 * when no `input` param is present, so existing deep-links keep working.
 *
 * Returns `[searchFilter, setSearchFilter]`. `setSearchFilter` accepts either a
 * value or an updater function; every call updates state AND the URL.
 */
export function useUrlSearchFilter<T>(
	defaultInput: T,
	deriveFromQuery?: (query: RouterQuery, fallback: T) => T,
): [T, SetSearchFilter<T>] {
	const router = useRouter();

	// Reads the inquiry from the URL: `?input=` blob wins, otherwise fall back to
	// page-specific inbound params, otherwise the default.
	const readFromUrl = useRef((query: RouterQuery): T => {
		if (query.input !== undefined) return safeParse<T>(query.input, defaultInput);
		if (deriveFromQuery) return deriveFromQuery(query, defaultInput);
		return defaultInput;
	}).current;

	const [searchFilter, setState] = useState<T>(() => readFromUrl(router.query));
	const stateRef = useRef(searchFilter);
	stateRef.current = searchFilter;

	// URL -> state: handles refresh hydration (query is empty until isReady on
	// statically-generated pages), deep-links and Back / Forward navigation.
	useEffect(() => {
		if (!router.isReady) return;
		const fromUrl = readFromUrl(router.query);
		if (JSON.stringify(fromUrl) !== JSON.stringify(stateRef.current)) {
			setState(fromUrl);
		}
		// asPath changes on every URL change (blob or pretty params); the JSON
		// guard above prevents the state->URL push below from looping back.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, router.asPath]);

	// state -> URL: every filter / sort / pagination change is reflected in the URL.
	const setSearchFilter = useCallback<SetSearchFilter<T>>(
		(next) => {
			const resolved = typeof next === 'function' ? (next as (prev: T) => T)(stateRef.current) : next;
			stateRef.current = resolved;
			setState(resolved);
			router.push(
				{ pathname: router.pathname, query: { ...router.query, input: JSON.stringify(resolved) } },
				undefined,
				{ shallow: true, scroll: false },
			);
		},
		[router],
	);

	return [searchFilter, setSearchFilter];
}
