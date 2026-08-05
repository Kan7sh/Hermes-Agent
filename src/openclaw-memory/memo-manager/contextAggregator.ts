export class ContextAggregator{
    private memory:MemoryHandler
    private modelContextLimit:number
    private userData:UserData

    constructor(memoryHandler:MemoryHandler,modelContextLimit:number,userData:UserData){
        this.memory = memoryHandler;
        this.modelContextLimit = modelContextLimit;
        this.userData = userData;
    }

    async assemble(userQuery:string,options={}){
        const systemPrompt = await this.memory.readMemoryFiles(`SOUL-${this.userData.userId}.md`);

        const userProfile = await this.memory.readMemoryFiles(`MEMORY-${this.userData.userId}.md`);

        const todayLog = await this.memory.readToday(new Date());

        const fixedLayer = [
            `# System Layer\n${systemPrompt}`,
            `# Profile Layer\n${userProfile}`,
            `# Recent STM Layer\n${todayLog}`
        ];

        const fixedText = fixedLayer.join("\n\n");
        const finalPrompt = `${fixedLayer}\n\n# New Input\n${userQuery}`;
        const numberOfTokens = estimateTokens(finalPrompt);
    }
}

export function estimateTokens(text:unknown):number{
    if(typeof text!="string"){
        return 0;
    }
    const trimmed = text.trim();
    if(!trimmed){
        return 0;
    }
    const words = trimmed.split(/\s+/).length;
    return Math.ceil(words*1.3);
}