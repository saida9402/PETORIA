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
				<Stack className={'main'}>
					<Stack className={'left'}>
						{/* Logo — plain div avoids MUI Box TS2590 union-type complexity */}
						<div className={'logo'}>
							<img src="/img/logo/petoriaLogoDark.svg" alt="Petoria" />
							<span>Petoria 🐾</span>
						</div>

						<div className={'info'}>
							<span>{loginView ? 'Welcome back!' : 'Join Petoria'}</span>
							<p>{loginView ? 'Login to your pet lover account.' : 'Create your Petoria account today.'}</p>
						</div>

						<div className={'input-wrap'}>
							<div className={'input-box'}>
								<span>Nickname</span>
								<input
									type="text"
									placeholder={'Enter Nickname'}
									onChange={(e) => handleInput('nick', e.target.value)}
									required
									onKeyDown={(e) => {
										if (e.key === 'Enter' && loginView) doLogin();
										if (e.key === 'Enter' && !loginView) doSignUp();
									}}
								/>
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
									<span className={'text'}>I want to register as:</span>
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
												label="🐾 Pet Lover (User)"
											/>
										</FormGroup>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														name={'SELLER'}
														onChange={checkUserTypeHandler}
														checked={input.type === 'SELLER'}
													/>
												}
												label="🛍 Pet Shop (Seller)"
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
									disabled={!input.nick || !input.password || !input.phone || !input.type}
									onClick={doSignUp}
									endIcon={<img src="/img/icons/rightup.svg" alt="" />}
								>
									SIGN UP
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
					<Stack className={'right'} />
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
