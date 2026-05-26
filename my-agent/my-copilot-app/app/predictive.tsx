"use client";
import { useAgent } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from '@copilotkit/react-ui';
interface Step {
    description: string;
    status: 'pending' | 'completed';
}
interface AgentState {
    observed_steps: Step[];
}
export default function Page() {
    // Get access to both predicted and final states
    const { agent } = useAgent({ agentId: "my_agent" });
    // Add a state renderer to show progress in the chat
    useAgent({
        agentId: "my_agent",
        render: ({ state, status }) => {
            if (!state?.observed_steps?.length) return null;
            return (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-2">
                    <h3 className="font-semibold text-gray-700 mb-2">
                        {status === 'inProgress' ? '⏳ Progress:' : '✅ Completed:'}
                    </h3>
                    <ul className="space-y-1">
                        {state.observed_steps.map((step, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <span>
                                    {step.status === 'completed' ? '✅' : '⏳'}
                                </span>
                                <span className={step.status === 'completed' ? 'text-green-700' : 'text-gray-600'}>
                                    {step.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        },
    });
    return (
        <div>
            <header>
                <h1>Agent Progress Demo</h1>
            </header>
            <main>
                {/* Side panel showing final state */}
                <aside>
                    <h2>Agent State</h2>
                    {agent.state?.observed_steps?.length > 0 ? (
                        <ul>
                            {agent.state.observed_steps.map((step, i) => (
                                <li key={i}>
                                    <span>{step.status === 'completed' ? '✅' : '⏳'}</span>
                                    <span>{step.description}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            {"No steps yet. Try asking to build a plan like \"create a recipe for ___\" or \"teach me how to fix a tire.\""}
                        </p>
                    )}
                </aside>
                {/* Chat area */}
                <CopilotSidebar
                    labels={{
                        welcomeMessageText: "Hi! Ask me to do a task like \"teach me how to fix a tire.\""
                    }}
                />
            </main>
        </div>
    );
}