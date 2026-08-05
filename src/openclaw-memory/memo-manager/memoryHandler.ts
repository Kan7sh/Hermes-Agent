import { appendAFile,createAFile,emptyAFile,fileExists,nowTimeString,readAFile,resolveSafePath,  todayDateString} from "@/helpers/fileSystemHelpers";
import { UserData  } from "@/types/user-types";
import path from "path";

export class MemoryManager{
    private memoryRoot;
    private userData:UserData;

    constructor(memoryRoot:string,userData:UserData){
        this.memoryRoot = memoryRoot;
        this.userData = userData;
    }

    async init(){
        await this.ensureCoreFiles();
    }

    async ensureCoreFiles(){
        const defaults = [
            {
                path:`${this.memoryRoot}/MEMORY-${this.userData.userId}.md`,
                content:"# LONGTERM MEMORY\n\n"
            },
            {
                path:`${this.memoryRoot}/DAILY_LOG_ARCHIVE-${this.userData.userId}.md`,
                content:"# DAILY_LOG_ARCHIVE\n\n"
            },
            {
                path:`${this.memoryRoot}/${todayDateString()}-${this.userData.userId}.md`,
                content:"# Daily notes\n\n"
            },
            {
                path:`${this.memoryRoot}/SOUL-${this.userData.userId}`,
                content:`# SYSTEM PROMPT\n\n
                Follow the policy and be helpful.
                `
            }

        ];

        this.ensureTodayLog();
        for(const file of defaults){
            const fullPath = resolveSafePath(this.memoryRoot,file.path);
            if(!await fileExists(fullPath)){
                await createAFile(this.memoryRoot,file.path,file.content);
            }
        }
    }

    async ensureTodayLog(now = new Date()){
        const relativePath = this.todayLogPath();
        const fullPath = resolveSafePath(this.memoryRoot,relativePath);
        if(!(await fileExists(fullPath))){
            await createAFile(this.memoryRoot,relativePath,`#  Daily log ${todayDateString(now)}\n\n`);
        }

        return relativePath;
    }

    async logInteraction(role:string,content:string,now=new Date()){
        const logPath = await this.ensureTodayLog(now);
        const chunk = `## [Time: ${nowTimeString(now)}] Role:${role}\n${content}\n\n`;
        await appendAFile(this.memoryRoot,logPath,chunk);
        return logPath;
    }

    async logToArchive(role:string,content:string,now = new Date()){
        const logPath = `${this.memoryRoot}/DAILY_LOG_ARCHIVE-${todayDateString()}-${this.userData.userId}.md`;
        const chunk = `## [Time: ${nowTimeString(now)}] Role: ${role}\n${content}\n\n`;
        await appendAFile(this.memoryRoot,logPath,chunk);
        return logPath;
    }

    async emptyAFileContent(){
        await emptyAFile(this.memoryRoot,this.todayLogPath());
    }

    todayLogPath(now=new Date()){
        return `${todayDateString(now)}-${this.userData.userId}.md`
    }

    async readArchiveFile(){
        try{

            const data = await readAFile(this.memoryRoot,`DAILY_LOG_ARCHIVE-${todayDateString()}-${this.userData.userId}.md`);
            return {
                data,
                exist:true
            }

        }catch(error){
            return {
                exists:false
            }
        }
    }
}