import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AgentDetailRedirect() {
	const router = useRouter();
	useEffect(() => {
		const { agentId } = router.query;
		router.replace(agentId ? `/seller/detail?sellerId=${agentId}` : '/seller');
	}, [router.query]);
	return null;
}
