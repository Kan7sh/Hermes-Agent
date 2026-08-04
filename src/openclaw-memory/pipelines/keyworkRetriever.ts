import {BM25Retriever} from "@langchain/community/retrievers/bm25";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const formatDocumentAsString=(document:Document[])=>{
    return document.map((doc)=>doc?.pageContent).join("\n\n");
}

export async function bM25Retriever(document:string,query:string){
    const newDoc = new Document({
        pageContent:document,
        metadata:{
            title:"user :"+"DAILY_LOG_ARCHIEVE"
        }
    });
    const docSplitter = new RecursiveCharacterTextSplitter({chunkSize:800,chunkOverlap:200});
    const splitDocs = await docSplitter.splitDocuments([newDoc]);
    const retriever = BM25Retriever.fromDocuments([...splitDocs],{k:4});
    const data = await retriever.invoke(query);
    const docToString = formatDocumentAsString(data);
    return docToString;
}