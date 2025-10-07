import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange, language }) => {
    const [value, setValue] = useState('');
    const editorRef = useRef(null);

    // When the editor mounts
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editor.focus();
    }

    // Handle typing and emit to socket
    const handleChange = (newValue) => {
        setValue(newValue);
        onCodeChange(newValue);
        if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code: newValue,
            });
        }
    };

    // Receive updates from other users
    useEffect(() => {
        if (!socketRef.current) return;

        const handleCodeChange = ({ code }) => {
            if (code !== null && code !== value) {
                setValue(code);
            }
        };

        socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        };
    }, [socketRef.current, value]);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MonacoEditor
                height="100%"
                language={language || 'javascript'}
                theme="vs-dark"
                value={value}
                onMount={handleEditorDidMount}
                onChange={handleChange}
                options={{
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    formatOnType: true,
                    formatOnPaste: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 15,
                    wordWrap: 'on',
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default Editor;
