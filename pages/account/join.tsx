import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

interface JoinInput {
	nick: string;
	password: string;
	phone: string;
	type: string;
}

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState<JoinInput>({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const isSeller = input.type === 'SELLER';

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => setLoginView(state);

	const checkUserTypeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { checked, name } = e.target;
		handleInput('type', checked ? name : 'USER');
	};

	const handleInput = useCallback((name: keyof JoinInput, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	}

	return (
		<Stack className={'join-page'}>
			<Stack className={'container'}>
				<Stack className={`main${isSeller && !loginView ? ' main--seller' : ''}`}>
					<Stack className={'left'}>
						{/* Logo */}
						<div className={'logo'}>
							<img src="/img/logo/petoriaLogoDark.svg" alt="Petoria" />
							<span>Petoria 🐾</span>
						</div>

						{/* Dynamic heading */}
						<div className={'info'}>
							{loginView ? (
								<>
									<span>Welcome back!</span>
									<p>Login to your pet lover account.</p>
								</>
							) : isSeller ? (
								<>
									<span className="seller-heading">Create Your Pet Store</span>
									<p>Launch your pet shop on Petoria marketplace.</p>
								</>
							) : (
								<>
									<span>Join Petoria</span>
									<p>Create your Petoria account today.</p>
								</>
							)}
						</div>

						{/* Seller store perks panel */}
						{!loginView && isSeller && (
							<div className="seller-store-perks">
								<div className="ssp-item">
									<span className="ssp-icon">🏪</span>
									<span>Your own branded store page</span>
								</div>
								<div className="ssp-item">
									<span className="ssp-icon">📦</span>
									<span>List unlimited pet products</span>
								</div>
								<div className="ssp-item">
									<span className="ssp-icon">📊</span>
									<span>Real-time dashboard &amp; analytics</span>
								</div>
								<div className="ssp-item">
									<span className="ssp-icon">✓</span>
									<span>Verified Seller badge on all products</span>
								</div>
							</div>
						)}

						<div className={'input-wrap'}>
							<div className={'input-box'}>
								<span>{!loginView && isSeller ? 'Store Name' : 'Nickname'}</span>
								<input
									type="text"
									placeholder={
										!loginView && isSeller
											? 'Your pet store name (e.g. PawsWorld)'
											: 'Enter Nickname'
									}
									onChange={(e) => handleInput('nick', e.target.value)}
									required
									onKeyDown={(e) => {
										if (e.key === 'Enter' && loginView) doLogin();
										if (e.key === 'Enter' && !loginView) doSignUp();
									}}
								/>
								{!loginView && isSeller && input.nick && (
									<span className="store-url-preview">
										petoria.com/seller/{input.nick.toLowerCase().replace(/\s+/g, '-')}
									</span>
								)}
							</div>
							<div className={'input-box'}>
								<span>Password</span>
								<input
									type="password"
									placeholder={'Enter Password'}
									onChange={(e) => handleInput('password', e.target.value)}
									required
									onKeyDown={(e) => {
										if (e.key === 'Enter' && loginView) doLogin();
										if (e.key === 'Enter' && !loginView) doSignUp();
									}}
								/>
							</div>
							{!loginView && (
								<div className={'input-box'}>
									<span>Phone</span>
									<input
										type="text"
										placeholder={'Enter Phone Number'}
										onChange={(e) => handleInput('phone', e.target.value)}
										required
										onKeyDown={(e) => {
											if (e.key === 'Enter') doSignUp();
										}}
									/>
								</div>
							)}
						</div>

						<div className={'register'}>
							{!loginView && (
								<div className={'type-option'}>
									<span className={'text'}>I want to:</span>
									<div>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														name={'USER'}
														onChange={checkUserTypeHandler}
														checked={input.type === 'USER'}
													/>
												}
												label="🐾 Shop as Pet Lover"
											/>
										</FormGroup>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														name={'SELLER'}
														onChange={checkUserTypeHandler}
														checked={isSeller}
													/>
												}
												label="🛍 Open a Pet Store"
											/>
										</FormGroup>
									</div>
								</div>
							)}

							{loginView && (
								<div className={'remember-info'}>
									<FormGroup>
										<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
									</FormGroup>
									<a>Forgot password?</a>
								</div>
							)}

							{loginView ? (
								<Button
									variant="contained"
									endIcon={<img src="/img/icons/rightup.svg" alt="" />}
									disabled={input.nick === '' || input.password === ''}
									onClick={doLogin}
								>
									LOGIN
								</Button>
							) : (
								<Button
									variant="contained"
									className={isSeller ? 'seller-signup-btn' : ''}
									disabled={!input.nick || !input.password || !input.phone || !input.type}
									onClick={doSignUp}
									endIcon={<img src="/img/icons/rightup.svg" alt="" />}
								>
									{isSeller ? 'CREATE MY STORE' : 'SIGN UP'}
								</Button>
							)}
						</div>

						<div className={'ask-info'}>
							{loginView ? (
								<p>
									New to Petoria?{' '}
									<b onClick={() => viewChangeHandler(false)}>CREATE ACCOUNT</b>
								</p>
							) : (
								<p>
									Already have an account?{' '}
									<b onClick={() => viewChangeHandler(true)}>LOGIN</b>
								</p>
							)}
						</div>
					</Stack>

					{/* Right panel — seller gets branded panel */}
					{!loginView && isSeller ? (
						<Stack className="right right--seller">
							<div className="seller-right-content">
								<div className="src-logo">🐾</div>
								<p className="src-tagline">Join 500+ pet stores on Petoria</p>
								<div className="src-stats">
									<div className="src-stat">
										<strong>10K+</strong>
										<span>Daily Shoppers</span>
									</div>
									<div className="src-stat">
										<strong>500+</strong>
										<span>Active Stores</span>
									</div>
									<div className="src-stat">
										<strong>4.9★</strong>
										<span>Seller Rating</span>
									</div>
								</div>
								<p className="src-quote">
									&ldquo;Petoria helped me grow my pet food business 3x in just 6 months.&rdquo;
								</p>
								<span className="src-author">— PawsWorld Store</span>
							</div>
						</Stack>
					) : (
						<Stack className={'right'} />
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
