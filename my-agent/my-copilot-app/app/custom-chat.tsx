"use client";

import { useState, useCallback } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";

export default function CustomChat() {
  const { agent } = useAgent({agentId:"my_agent"});
  const { copilotkit } = useCopilotKit();

  const [input, setInput] = useState("");

  const sendMessage = useCallback(async () => {
    if (!input.trim() || agent.isRunning) return;

    agent.addMessage({
      id: randomUUID(),
      role: "user",
      content: input,
    });

    setInput("");

    await copilotkit.runAgent({ agent });
  }, [input, agent, copilotkit]);

  const stopAgent = useCallback(() => {
    copilotkit.stopAgent({ agent });
  }, [agent, copilotkit]);

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto border rounded-lg bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agent.messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] rounded-lg p-3 ${
              msg.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-100 text-black"
            }`}
          >
            <div className="text-xs font-semibold mb-1 uppercase">
              {msg.role}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}

        {agent.isRunning && (
          <div className="text-gray-500 italic">Thinking...</div>
        )}
      </div>

      {/* Input */}
      <form
        className="border-t p-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 outline-none"
          placeholder="Type a message..."
          value={input}
          disabled={agent.isRunning}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          type="submit"
          disabled={agent.isRunning || !input.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          Send
        </button>

        {agent.isRunning && (
          <button
            type="button"
            onClick={stopAgent}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Stop
          </button>
        )}
      </form>
    </div>
  );
}