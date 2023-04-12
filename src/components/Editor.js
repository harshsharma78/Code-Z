import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Action';

function Editor({ socketRef, roomId, onCodeChange }) {
	const editorRef = useRef(null);

	useEffect(() => {
		const init = async () => {
			editorRef.current = Codemirror.fromTextArea(
				document.getElementById('realtimeEditor'),
				{
					mode: {
						name: 'javascript',
						json: true,
					},
					theme: 'dracula',
					autoCloseTags: true,
					autoCloseBrackets: true,
					lineNumbers: true,
				},
			);
			/* Handling for change on codemirror and syncing it with other users */
			editorRef.current.on('change', (instance, changes) => {
				const { origin } = changes;
				const code = instance.getValue();
				onCodeChange(code);
				if (origin !== 'setValue') {
					socketRef.current.emit(ACTIONS.CODE_CHANGE, {
						roomId,
						code,
					});
				}
			});
		};

		init();
	}, [roomId, socketRef]);

	useEffect(() => {
		/* Listening for change event on codemirror and syncing it with other users */
		if (socketRef.current) {
			socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
				if (code !== null) {
					editorRef.current.setValue(code);
				}
			});
		}
		return () => {
			socketRef.current.off(ACTIONS.CODE_CHANGE);
		};
	}, [socketRef.current]);

	return <textarea id='realtimeEditor' />;
}

export default Editor;
