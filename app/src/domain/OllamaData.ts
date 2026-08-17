export type ApiMode = 'chat' | 'generate';
import ChatSend from "types/ChatSend";
import GenerateSend from "types/GenerateSend";
import { PastActivity } from "types/PastActivity";

class OllamaData {
    private generatePath = 'api/generate';
    private chatPath = 'api/chat';
    private tagsPath = 'api/tags';
    private ollamaStatistics = 'alooha_api/stats';

    constructor(private serverDns: string, private chatId: string) {
    }

    public getDnsAndPort(): string {
        return this.serverDns;
    }

    public getFullAddress(mode: ApiMode): string {
        return `http://${this.serverDns}/${mode === 'chat' ? this.chatPath : this.generatePath}`;
    }

    public getFullAddressTags(): string {
        return `http://${this.serverDns}/${this.tagsPath}`;
    }

    public getFullAddressOllamaStatistics(): string {
        return `http://${this.serverDns}/${this.ollamaStatistics}`;
    }

    public updateServerDns(serverDns: string): OllamaData {
        this.serverDns = serverDns;
        return this;
    }

    public getQueryObject(
        mode: ApiMode,
        model: string,
        prompt: string,
        systemPrompt = "",
        historyChatData: PastActivity[] = []
    ): ChatSend | GenerateSend {
        const messages = []
        if (systemPrompt !== "") {
            messages.push({ role: 'system', content: systemPrompt });
        }
        for (const historyChatDataEntry of historyChatData) {
            messages.push({ 
                role: 'user', 
                content: historyChatDataEntry.question 
            });
            messages.push({
                role: 'assistant', 
                content: historyChatDataEntry.answer
            });
        }
        messages.push({ role: 'user', content: prompt });

        if (mode === 'chat') {
            return { 
                model, 
                messages, 
                stream: true,
                chatId: this.chatId
            };
        }
        if (mode === 'generate') {
            return { model, prompt, system: systemPrompt, stream: true };
        }
        throw new Error("Wrong mode given.");
    }
}

export default OllamaData;