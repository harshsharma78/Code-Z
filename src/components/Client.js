import React from 'react';
import Avatar from 'react-avatar';

function Client({ username }) {
	return (
		<div className='client'>
			<Avatar
				name={username}
				size={40}
				round='14px'
			/>
			<span className='userName'>{username}</span>
		</div>
	);
}

export default Client;

/*      "start-front": "react-scripts start",
		"start": "npm run build && npm run server-prod",
		"build": "react-scripts build",
		"server-dev": "nodemon server.js",
		"server-prod": "node server.js",
		"test": "react-scripts test",
		"eject": "react-scripts eject" */
