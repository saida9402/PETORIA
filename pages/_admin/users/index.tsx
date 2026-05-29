import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export { default } from './AdminUsers';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
