import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatCerebras } from "@langchain/cerebras";

type LLMType = "fireworks" | "cerebras" | "fireworks_minimax" | "fireworks_glm";

export class LLM {
  private static instances: Partial<Record<LLMType, any>> = {};
  private constructor() {}

  public static getInstance(type: LLMType = "fireworks") {
    if (!LLM.instances[type]) {
      switch (type) {
        case "fireworks":
          if (!process.env.FIRE_WORKS_API_KEY) {
            throw new Error("FIRE_WORKS_API_KEY is not set");
          }
          LLM.instances[type] = new ChatFireworks({
            model: "accounts/fireworks/models/qwen3-vl-30b-a3b-thinking",
            temperature: 0.7,
            apiKey: process.env.FIRE_WORKS_API_KEY,
          });
          break;
        case "fireworks_minimax":
          if (!process.env.FIRE_WORKS_API_KEY) {
            throw new Error("FIRE_WORKS_API_KEY is not set");
          }
          LLM.instances[type] = new ChatFireworks({
            model: "accounts/fireworks/models/minimax-m2p7",
            temperature: 0.7,
            apiKey: process.env.FIRE_WORKS_API_KEY,
          });
          break;
        default:
          throw new Error(`Unsupported LLM type: ${type}`);
      }
    }
    return LLM.instances[type];
  }
}

export const fireworksModel = LLM.getInstance("fireworks");
