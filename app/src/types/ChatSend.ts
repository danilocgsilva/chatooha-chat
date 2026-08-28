import type MessageChatSend from "./MessageChatSend"

type ChatSend = {
    model: string,
    messages: MessageChatSend[],
    stream: boolean,
    chatId: string,
    clientVersion: string,
    options: { [key: string]: unknown }
};

export default ChatSend;