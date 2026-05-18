import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PropertyDetailRedirect() {
	const router = useRouter();
	useEffect(() => {
		const { id } = router.query;
		router.replace(id ? `/shop/detail?id=${id}` : '/product');
	}, [router.query]);
	return null;
}
