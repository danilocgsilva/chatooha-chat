type GenerateSend = {
    model: string,
    prompt: string,
    system?: string,
    stream: boolean,
    options?: { [key: string]: unknown }
};

export default GenerateSend;