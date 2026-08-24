import type MessageChatSend from "./MessageChatSend"

type ChatSend = {
    model: string,
    messages: MessageChatSend[],
    stream: boolean,
    chatId: string,
    clientVersion: string,
    options: { [key: string]: any }
};

export default ChatSend;