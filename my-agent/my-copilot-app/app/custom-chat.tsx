import { useAgent, useCopilotKit ,CopilotChat} from "@copilotkit/react-core/v2";

export default function CustomChat() {
  const { agent } = useAgent({ agentId: "my_agent" });
  const { copilotkit } = useCopilotKit();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agent.messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "user"
                ? "ml-auto bg-blue-100 rounded-lg p-3 max-w-md"
                : "bg-gray-100 rounded-lg p-3 max-w-md"
            }
          >
            <p className="text-sm font-medium">{msg.role}</p>
            <p>{msg.content}</p>
          </div>
        ))}
        {agent.isRunning && <div className="text-gray-400">Thinking...</div>}
        <CopilotChat/>
      </div>
    </div>
  );
}