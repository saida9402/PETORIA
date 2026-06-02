import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CONTACT_CARDS = [
	{
		icon: '📞',
		title: 'Phone Support',
		desc: 'Mon–Fri, 9 AM – 6 PM KST',
		action: '010-1234-5678',
		href: 'tel:+821012345678',
		btnLabel: 'Call now',
		colorBg: '#dbeafe',
		colorText: '#1e40af',
	},
	{
		icon: '✉️',
		title: 'Email Support',
		desc: 'Response within 24 hours',
		action: 'support@petoria.com',
		href: 'mailto:support@petoria.com',
		btnLabel: 'Send email',
		colorBg: '#d1fae5',
		colorText: '#065f46',
	},
	{
		icon: '💬',
		title: 'Live Chat',
		desc: 'AI assistant — always online',
		action: 'Start chatting instantly',
		href: '#',
		btnLabel: 'Open chat',
		colorBg: '#fef3c7',
		colorText: '#92400e',
	},
];

const CS: NextPage = () => {
	const router = useRouter();
	const tab = (router.query.tab as string) ?? 'notice';

	const changeTabHandler = (t: string) => {
		router.push({ pathname: '/cs', query: { tab: t } }, undefined, { scroll: false });
	};

	return (
		<Stack className="cs-page">
			<div className="wrap">

				{/* Contact cards */}
				<div className="cs-contacts">
					{CONTACT_CARDS.map((c) => (
						<div key={c.title} className="cs-contact" style={{ background: c.colorBg }}>
							<span className="cs-contact__icon">{c.icon}</span>
							<div className="cs-contact__body">
								<h3 style={{ color: c.colorText }}>{c.title}</h3>
								<p>{c.desc}</p>
								<strong style={{ color: c.colorText }}>{c.action}</strong>
							</div>
							<a
								href={c.href}
								className="cs-contact__btn"
								style={{ borderColor: c.colorText, color: c.colorText }}
							>
								{c.btnLabel}
							</a>
						</div>
					))}
				</div>

				{/* Tab switcher */}
				<div className="cs-tabs">
					<button
						className={`cs-tab${tab === 'notice' ? ' cs-tab--active' : ''}`}
						onClick={() => changeTabHandler('notice')}
					>
						📋 Notice Board
					</button>
					<button
						className={`cs-tab${tab === 'faq' ? ' cs-tab--active' : ''}`}
						onClick={() => changeTabHandler('faq')}
					>
						❓ FAQ
					</button>
				</div>

				<div className="cs-content">
					{tab === 'notice' && <Notice />}
					{tab === 'faq' && <Faq />}
				</div>

			</div>
		</Stack>
	);
};

export default withLayoutBasic(CS);
