import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState('');
	const [username, setUsername] = useState('');

	const createNewRoom = e => {
		e.preventDefault();
		const id = uuidV4();
		setRoomId(id);

		toast.success('Created a new room!');
	};

	const joinRoom = () => {
		if (!roomId || !username) {
			toast.error('ROOM ID and Username is required!');
			return;
		}
		navigate(`/editor/${roomId}`, {
			// Passes data from one state to another
			state: {
				username,
			},
		});
	};

	const handleInputEnter = e => {
		if (e.code === 'Enter') {
			joinRoom();
		}
	};
	return (
		<div className='homePageWrapper'>
			<div className='formWrapper'>
				<img
					src='/code-sync.png'
					alt='code-sync-logo'
					className='homePageLogo'
				/>
				<h4 className='mainLabel'>Paste invitation ROOM ID</h4>
				<div className='inputGroup'>
					<input
						type='text'
						className='inputBox'
						placeholder='ROOM ID'
						value={roomId}
						onKeyUp={handleInputEnter}
						onChange={e => setRoomId(e.target.value)}
					/>
					<input
						type='text'
						className='inputBox'
						placeholder='USERNAME'
						value={username}
						onKeyUp={handleInputEnter}
						onChange={e => setUsername(e.target.value)}
					/>
					<button
						onClick={joinRoom}
						className='btn joinBtn'>
						Join
					</button>
					<span className='createInfo'>
						If you don't have an invite then create &nbsp;
						<a
							onClick={createNewRoom}
							href='!#'
							className='createNewBtn'>
							new room
						</a>
					</span>
				</div>
			</div>
			<footer>
				<h4>
					Built with 💛 &nbsp; by &nbsp;
					<a href='https://github.com/harshsharma78?tab=overview&from=2023-04-01&to=2023-04-01'>
						Harsh Sharma
					</a>
				</h4>
			</footer>
		</div>
	);
};
