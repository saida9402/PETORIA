import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PropertyIndexRedirect() {
	const router = useRouter();
	useEffect(() => {
		router.replace('/product');
	}, []);
	return null;
}
