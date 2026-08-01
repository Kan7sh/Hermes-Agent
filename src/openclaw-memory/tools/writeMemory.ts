import { appendAFile } from "@/helpers/fileSystemHelpers";
import { UserData } from "@/types/user-types";
import {tool} from "@langchain/core/tools";
import {z} from "zod";

export function writeMemoryTool(memoryRoot:string,userData:UserData){
const writeMemoryTool = tool(
    async ({content})=>{
        const now = new Date();
        const formattedDate = now.toTimeString().slice(0,8);
        const memoryContent = `##[Time: ${formattedDate}] \n${content}\n\n`
        try{
            return appendAFile(memoryRoot,`Memory-${userData.userId}.md`,memoryContent);
        }catch(error){
            return JSON.stringify({message:"file your trying to read doesnt exist"})
        }
    },{
        name:"write_memory",
        description:"this tool allows you to write into the Longterm  memory MEMORY.md",
        schema:z.object({
            content:z.string(),
        })
    }
)
}