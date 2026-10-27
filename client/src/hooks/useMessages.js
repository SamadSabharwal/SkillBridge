import { useState } from 'react';
import api from '../lib/api.js';
import { err } from '../lib/format.js';

/** Manage a message draft and refresh the selected conversation. */
export function useMessages({ modal, setModal, notify }) {
    const [messageDraft, setMessageDraft] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const getConversation = async (mode, item) => {
        try {
            const response = await api.get(`/messages/${mode}/${item._id}`);
            setModal({ type: 'messages', mode, item, rows: response.data });
        } catch (error) {
            notify(err(error));
        }
    };

    const sendConversationMessage = async (event) => {
        event.preventDefault();

        if (sendingMessage || !messageDraft.trim() || modal?.type !== 'messages') {
            return;
        }

        const body = messageDraft.trim();
        const { mode, item } = modal;
        setSendingMessage(true);

        try {
            await api.post(`/messages/${mode}/${item._id}`, { body });
            setMessageDraft('');
            await getConversation(mode, item);
        } catch (error) {
            notify(err(error));
        } finally {
            setSendingMessage(false);
        }
    };

    return {
        messageDraft,
        setMessageDraft,
        sendingMessage,
        sendConversationMessage,
        getConversation
    };
}
