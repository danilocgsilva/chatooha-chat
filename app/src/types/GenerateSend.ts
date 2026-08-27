type GenerateSend = {
    model: string,
    prompt: string,
    system?: string,
    stream: boolean,
    options?: { [key: string]: any }
};

export default GenerateSend;