import OllamaData, { ApiMode } from "./OllamaData";
import { StatItem } from "types/StatItem";
import { ApiStatResponse } from "types/ApiStatResponse";
import { PastActivity } from "types/PastActivity";

class OllamaClient {
    private ollamaData: OllamaData;
    private abortController: AbortController | null = null;

    constructor(ollamaData: OllamaData) {
        this.ollamaData = ollamaData;
    }

    public async getStatistics(): Promise<StatItem[]> {
        const res = await fetch(this.ollamaData.getFullAddressOllamaStatistics());
        
        if (!res.ok) {
            throw new Error(`Failed to fetch statistics: ${res.status} ${res.statusText}`);
        }

        const data: ApiStatResponse = await res.json();

        if (data && Array.isArray(data.message)) {
            return data.message.map((item: { count: string, model: string }) => ({
                count: parseInt(item.count, 10),
                model: item.model
            })) as StatItem[];
        }

        throw new Error('Invalid response format');
    }

    public async getModels(): Promise<string[]> {
        const res = await fetch(this.ollamaData.getFullAddressTags());
        const data = await res.json();
        const models = data.models.map((m: { name: string }) => m.name);
        return models;
    }

    public updateHostAndDns(hostAndDns: string): OllamaClient {
        this.ollamaData.updateServerDns(hostAndDns);
        return this;
    }

    public async getResponse(
        mode: ApiMode, 
        model: string, 
        prompt: string, 
        systemPrompt = '',
        historyChatData: PastActivity[] = [],
        settings: { [key: string]: unknown } = {}
    ): Promise<Response> {
        this.abortController = new AbortController();
        const response = await fetch(this.ollamaData.getFullAddress(mode), {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                this.ollamaData.getQueryObject(mode, model, prompt, systemPrompt, historyChatData, settings)
            ),
            signal: this.abortController.signal,
        });

        return response;
    }

    public abort() {
        this.abortController?.abort();
    }

    public cleanAbord() {
        this.abortController = null;
    }
}

export default OllamaClient;