import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import { PaperPlaneTilt, ArrowsIn, ChatCircleDots } from 'phosphor-react';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar, chatOpenVar, onlineUsersVar, unreadMsgCountVar, chatMessagesVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	// ─── PETORIA FIX START (BUG 3) ───
	const messagesList = useReactiveVar(chatMessagesVar);
	// ─── PETORIA FIX END (BUG 3) ───
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const textInput = useRef(null);
	const [messageInput, setMessageInput] = useState<string>('');
	const open = useReactiveVar(chatOpenVar);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!socket) return;
		socket.onmessage = (msg) => {
			const data = JSON.parse(msg.data);
			switch (data.event) {
				case 'info': {
					const newInfo: InfoPayload = data;
					setOnlineUsers(newInfo.totalClients);
					onlineUsersVar(newInfo.totalClients);
					break;
				}
				case 'getMessages': {
					const list: MessagePayload[] = data.list;
					// ─── PETORIA FIX START (BUG 3) ───
					chatMessagesVar(list);
					// ─── PETORIA FIX END (BUG 3) ───
					break;
				}
				case 'message': {
					const newMessage: MessagePayload = data;
					// ─── PETORIA FIX START (BUG 3) ───
					chatMessagesVar([...chatMessagesVar(), newMessage]);
					// ─── PETORIA FIX END (BUG 3) ───
					if (!chatOpenVar() && newMessage.memberData?._id !== userVar()._id) {
						unreadMsgCountVar(unreadMsgCountVar() + 1);
					}
					break;
				}
			}
		};
		return () => {
			socket.onmessage = null;
		};
	}, [socket]);

	useEffect(() => {
		if (open) {
			unreadMsgCountVar(0);
			// ─── PETORIA FIX START (BUG 3) ───
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ event: 'getMessages' }));
			}
			// ─── PETORIA FIX END (BUG 3) ───
		}
	}, [open, socket]);

	// ─── PETORIA FIX START (BUG 3) ───
	useEffect(() => {
		const timeoutId = setTimeout(() => setOpenButton(true), 100);
		return () => clearTimeout(timeoutId);
	}, [router.pathname]);
	// ─── PETORIA FIX END (BUG 3) ───

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => chatOpenVar(!chatOpenVar());

	const getInputMessageHandler = useCallback(
		(e: any) => setMessageInput(e.target.value),
		[],
	);

	const getKeyHandler = (e: any) => {
		if (e.key === 'Enter') onClickHandler();
	};

	const onClickHandler = () => {
		if (!messageInput) sweetErrorAlert(Messages.error4);
		else {
			socket.send(JSON.stringify({ event: 'message', data: messageInput }));
			setMessageInput('');
		}
	};

	return (
		<Stack className="chatting">
			{openButton && (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <ArrowsIn size={22} /> : <ChatCircleDots size={22} />}
				</button>
			)}

			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				{/* Header */}
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>🐾 Petoria Live Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
				</Box>

				{/* Messages */}
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>
									🐾 Welcome to Petoria Live Chat! Ask us anything about your pets!
								</div>
							</Box>

							{messagesList.map((ele: MessagePayload, idx: number) => {
								const { text, memberData } = ele;
								const memberImage = memberData?.memberImage
									? `${API_URL}/${memberData.memberImage}`
									: '/img/profile/defaultUser.svg';

								return memberData?._id === user?._id ? (
									<Box
										key={idx}
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-right'}>{text}</div>
									</Box>
								) : (
									<Box
										key={idx}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										sx={{ m: '10px 0px' }}
										component={'div'}
									>
										<Avatar alt={memberData?.memberNick} src={memberImage} />
										<div className={'msg-left'}>{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>

				{/* Input */}
				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={textInput}
						type={'text'}
						name={'message'}
						value={messageInput}
						className={'msg-input'}
						placeholder={'Type a message... 🐾'}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<PaperPlaneTilt size={20} color="#fff" />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
