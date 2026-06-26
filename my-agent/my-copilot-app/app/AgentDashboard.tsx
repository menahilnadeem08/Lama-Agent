"use client";
import { useEffect } from "react";
import {
  useAgent,
  useCopilotKit,
  useRenderToolCall,
  defineToolCallRenderer,
} from "@copilotkit/react-core/v2";
import type { AgentSubscriber } from "@ag-ui/client";
import { z } from "zod";
import { randomUUID } from "@copilotkit/shared";

// Message content can be a plain string or a structured content-block array;
// collapse it to a string for plain-text rendering.
function renderContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content == null) return "";
  return JSON.stringify(content);
}

// --- Tool call renderer -----------------------------------------------
export const weatherToolRender = defineToolCallRenderer({
  name: "get_weather",
  args: z.object({ location: z.string() }),
  render: ({ args, status }) => {
    return <WeatherCard location={args.location} status={status} />;
  },
});

function WeatherCard({
  location,
  status,
}: {
  location?: string;
  status: string;
}) {
  return (
    <div className="rounded-lg border p-6 shadow-sm text-black">
      <h3 className="text-xl font-semibold">Weather in {location}</h3>
      <div className="mt-4">
        <span className="text-5xl font-light">70°F</span>
      </div>
      {status === "executing" && <div className="spinner">Loading...</div>}
    </div>
  );
}

// --- Status / identity --------------------------------------------------
export function AgentInfo() {
  const { agent } = useAgent({ agentId: "my_agent" });
  return (
    <div className="text-sm space-y-1">
      <p>Agent ID: {agent.agentId}</p>
      <p>Thread ID: {agent.threadId}</p>
      <p>Status: {agent.isRunning ? "Running" : "Idle"}</p>
      <p>Messages: {agent.messages.length}</p>
    </div>
  );
}

export function AgentStatus() {
  const { agent } = useAgent({ agentId: "my_agent" });
  return (
    <div className="flex items-center gap-2 text-sm">
      {agent.isRunning ? (
        <>
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span>Agent is processing...</span>
        </>
      ) : (
        <span>Ready</span>
      )}
    </div>
  );
}

// --- Messages -------------------------------------------------------------
// Read-only message log. For a full send/stop/input chat UI, use
// components/custom-chat.tsx's <CustomChat /> instead - that already covers
// this plus RunAgent/AgentStatus in one piece.
export function MessageList() {
  const { agent } = useAgent({ agentId: "my_agent" });
  return (
    <div className="space-y-2 text-sm">
      {agent.messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> <span>{renderContent(msg.content)}</span>
        </div>
      ))}
    </div>
  );
}

// Same message log, but resolves a renderer (e.g. weatherToolRender above)
// for any tool calls attached to assistant messages. Requires
// renderToolCalls={[weatherToolRender]} to be set on <CopilotKit> in layout.tsx.
export function ToolCallMessageList() {
  const { agent } = useAgent({ agentId: "my_agent" });
  const renderToolCall = useRenderToolCall();
  return (
    <div className="space-y-2 text-sm">
      {agent.messages.map((message) => (
        <div key={message.id}>
          {message.content && <p>{renderContent(message.content)}</p>}
          {message.role === "assistant" &&
            message.toolCalls?.map((toolCall) => {
              const toolMessage = agent.messages.find(
                (m) => m.role === "tool" && m.toolCallId === toolCall.id,
              ) as Extract<typeof agent.messages[number], { role: "tool" }> | undefined;
              return (
                <div key={toolCall.id}>
                  {renderToolCall({ toolCall, toolMessage })}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}

// --- Running the agent programmatically -----------------------------------
export function RunAgentButton({ message }: { message: string }) {
  const { agent } = useAgent({ agentId: "my_agent" });
  const { copilotkit } = useCopilotKit();
  const handleRun = async () => {
    agent.addMessage({
      id: randomUUID(),
      role: "user",
      content: message,
    });
    await copilotkit.runAgent({ agent });
  };
  return <button onClick={handleRun}>Send: "{message}"</button>;
}

export function StopAgentButton() {
  const { agent } = useAgent({ agentId: "my_agent" });
  const { copilotkit } = useCopilotKit();
  if (!agent.isRunning) return null;
  return (
    <button onClick={() => copilotkit.stopAgent({ agent })}>
      Stop Agent
    </button>
  );
}

// --- State ------------------------------------------------------------
export function StateDisplay() {
  const { agent } = useAgent({ agentId: "my_agent" });
  return (
    <div>
      <h3>Agent State</h3>
      <pre>{JSON.stringify(agent.state, null, 2)}</pre>
      {/* Access specific properties */}
      {agent.state.user_name && <p>User: {agent.state.user_name}</p>}
      {agent.state.preferences && (
        <p>Preferences: {JSON.stringify(agent.state.preferences)}</p>
      )}
    </div>
  );
}

export function ThemeSelector() {
  const { agent } = useAgent({ agentId: "my_agent" });
  const updateTheme = (theme: string) => {
    agent.setState({
      ...agent.state,
      user_theme: theme,
    });
  };
  return (
    <div className="flex items-center gap-2 text-sm">
      <button onClick={() => updateTheme("dark")}>Dark Mode</button>
      <button onClick={() => updateTheme("light")}>Light Mode</button>
      <p>Current: {agent.state.user_theme ?? "default"}</p>
    </div>
  );
}

// --- Event logging ---------------------------------------------------
export function EventLogger() {
  const { agent } = useAgent({ agentId: "my_agent" });
  useEffect(() => {
    const subscriber: AgentSubscriber = {
      onCustomEvent: ({ event }) => {
        console.log("Custom event:", event.name, event.value);
      },
      onRunStartedEvent: () => {
        console.log("Agent started running");
      },
      onRunFinalized: () => {
        console.log("Agent finished running");
      },
      onStateChanged: (state) => {
        console.log("State changed:", state);
      },
      onMessagesChanged: ({ messages }) => {
        console.log("Messages changed:", messages);
      },
    };
    const { unsubscribe } = agent.subscribe(subscriber);
    return () => unsubscribe();
  }, [agent]);
  return null;
}

// --- Combined dashboard ------------------------------------------------
export default function AgentDashboard() {
  const { agent } = useAgent({ agentId: "my_agent" });
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 text-black">
      <EventLogger />

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Agent Status</h2>
        <AgentInfo />
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Run Agent</h2>
        <RunAgentButton message="Summarize the latest sales data" />
        <StopAgentButton />
      </div>

      <div className="p-6 bg-white rounded-lg shadow space-y-4">
        <h2 className="text-xl font-bold">Agent State</h2>
        <StateDisplay />
        <ThemeSelector />
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Conversation</h2>
        <div className="space-y-3">
          {agent.messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.role === "user" ? "bg-blue-50 ml-8" : "bg-gray-50 mr-8"
              }`}
            >
              <div className="font-semibold text-sm mb-1">
                {msg.role === "user" ? "You" : "Agent"}
              </div>
              <div>{renderContent(msg.content)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
