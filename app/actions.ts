"use server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { SYSTEM_PROMPT } from "./constants";

export async function generate(input: string) {
  const stream = createStreamableValue("");

  async () => {
    const { textStream } = streamText({
      model: openai("chatgpt-4o-latest"),
      system: SYSTEM_PROMPT,
      prompt: input,
    });
    for await (const delta of textStream) {
      stream.update(delta);
    }
    stream.done();
  };
  return { output: stream.value };
}
