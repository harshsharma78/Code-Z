import React, { useRef, useState, useEffect } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import ACTIONS from '../Action';
import {
	useLocation,
	useNavigate,
	Navigate,
	useParams,
} from 'react-router-dom';
import { initSocket } from '../socket';
import { toast } from 'react-hot-toast';

const EditorPage = () => {
	const [clients, setClients] = useState([]);
	const socketRef = useRef(null);
	const codeRef = useRef(null);
	const location = useLocation();
	const reactNavigator = useNavigate();
	const { roomId } = useParams();

	useEffect(() => {
		function handleErrors(e) {
			console.log('socket error', e);
			toast.error('Socket connection failed, try again later...');
			reactNavigator('/');
		}

		const init = async () => {
			socketRef.current = await initSocket();

			socketRef.current.on('connect_error', err => handleErrors(err));
			socketRef.current.on('connect_failed', err => handleErrors(err));

			/* User is emitting the request to server for the join info */
			socketRef.current.emit(ACTIONS.JOIN, {
				roomId,
				username: location.state?.username,
			});

			/* Listening for JOINED EVENT from the server */
			socketRef.current.on(
				ACTIONS.JOINED,
				({ clients, username, socketId }) => {
					if (username !== location.state?.username) {
						toast.success(`${username} has joined the room.`);
					}
					setClients(clients);
					/* Setting the already existing code for the new user */
					socketRef.current.emit(ACTIONS.SYNC_CODE, {
						code: codeRef.current,
						socketId,
					});
				},
			);

			/* Listening for DISCONNECTING EVENT from the server */
			socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
				toast.success(`${username} has left the room.`);
				/* Updating the client list when any user leave the room */
				setClients(prev => {
					return prev.filter(client => client.socketId !== socketId);
				});
			});
		};
		init();

		return () => {
			socketRef.current.disconnect();
			socketRef.current.off(ACTIONS.JOINED);
			socketRef.current.off(ACTIONS.DISCONNECTED);
		};
	}, [location.state?.username, reactNavigator, roomId]);

	const copyRoomId = async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			toast.success('Room ID has been copied to your clipboard.');
		} catch (err) {
			toast.error('Could not copy the Room ID.');
			console.error(err);
		}
	};

	const leaveRoom = () => {
		reactNavigator('/');
	};

	if (!location.state) {
		return <Navigate to='/' />;
	}
	return (
		<div className='mainWrap'>
			<div className='aside'>
				<div className='asideInner'>
					<div className='logo'>
						<img
							className='logoImage'
							src='/code-sync.png'
							alt='logo'
						/>
					</div>
					<h3>Connected</h3>
					<div className='clientsList'>
						{clients.map(client => (
							<Client
								key={client.socketId}
								username={client.username}
							/>
						))}
					</div>
				</div>
				<button
					className='btn copyBtn'
					onClick={copyRoomId}>
					Copy Room ID
				</button>
				<button
					className='btn leaveBtn'
					onClick={leaveRoom}>
					Leave
				</button>
			</div>
			<div className='editorWrap'>
				<Editor
					socketRef={socketRef}
					roomId={roomId}
					onCodeChange={code => {
						codeRef.current = code;
					}}
				/>
			</div>
		</div>
	);
};

export default EditorPage;
