import {tool} from "@langchain/core/tools";
import {z} from "zod";
import path from "path";
import { queryVectordb } from "../pipelines/retriever";
import { bM25Retriever, formatDocumentAsString } from "../pipelines/keyworkRetriever";
import { customLLMExtractor } from "../custom-extractor/customLLMExtractor";

export const searchMemoryTool = tool(
    async ({query},config)=>{

        const userId = config.configurable?.userId;
        const memoryRoot = path.resolve(process.cwd(),"public","memory");

        const memoryStr = new MemoryHandler(memoryRoot,{userId,projectId});
        let relevanLongTermMemory = ''
        const archiveLog = await memoryStr.readArchiveFile()
        const vectorData = await queryVectordb({userId:userId,query});
        const docToString = formatDocumentAsString(vectorData?.retrievedDocs);
        relevanLongTermMemory+=`\n\n#<data_retrieved_from_vector_db>  \n${docToString}\n\n</data_retrieved_from_vector_db>`

        if(archiveLog.exists){
            const bm25Data = await bM25Retriever(archiveLog?.data as string,query);
            relevanLongTermMemory+=`\n\n#<data_retrieved_from_daily_log_access>${bm25Data}</data_retrieved_from_daily_log_access>`
        }

        const filteredData = await customLLMExtractor(query,relevanLongTermMemory);
        const longTermMemory = `# Relevant LTM Layer\n${filteredData||"No relevant long-term memories found."}`
        return `${longTermMemory}`;


    },{
        name:"search_memory",
        description:`
        Retrieve relevant long-term memory (LTM) entries based on the user query.

This tool searches a vector database of previously stored summaries and returns
high-level contextual information about the user, such as preferences, goals,
past interactions, and important background knowledge.

Use this tool when:
- The query depends on past conversations or long-term context
- You need to recall user-specific information (preferences, habits, goals, etc.)
- The current input is ambiguous and may benefit from historical context
- Personalization or continuity is required

Do NOT use this tool for:
- Simple factual questions that do not depend on user history
- Real-time or short-term conversation context (use short-term memory instead)

Returns:
- A list of summarized memory entries relevant to the query
        `,
        schema:z.object({
            query:z.string().describe("The semantic search query used to retrive relevant  long-term memory.")
        })
    }
)