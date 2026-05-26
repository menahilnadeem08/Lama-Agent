// "use client";
// import { CopilotPopup,CopilotChat, CopilotSidebar, useRenderTool, useHumanInTheLoop, useAgent } from "@copilotkit/react-core/v2";
// import { z } from "zod";
// import { useFrontendTool } from "@copilotkit/react-core/v2";
// // type AgentState = {
// //   searches: {
// //     query: string;
// //     done: boolean;
// //   }[];
// // };

// type AgentState = {
//     language: "english" | "spanish";
// }
// export default function Page() {

//     //interactive

//     //  useHumanInTheLoop({
//     //     name: "offerOptions",
//     //     description: "Give the user a choice between two options and have them select one.",
//     //     parameters: [
//     //       {
//     //         name: "option_1",
//     //         type: "string",
//     //         description: "The first option",
//     //         required: true,
//     //       },
//     //       {
//     //         name: "option_2",
//     //         type: "string",
//     //         description: "The second option",
//     //         required: true,
//     //       },
//     //     ],
//     //     render: ({ args, respond }) => {
//     //       if (!respond) return <></>;
//     //       return (
//     //         <div>
//     //           <button onClick={() => respond(`${args.option_1} was selected`)}>{args.option_1}</button>
//     //           <button onClick={() => respond(`${args.option_2} was selected`)}>{args.option_2}</button>
//     //         </div>
//     //       );
//     //     },
//     //   });
//     // tool render
//     //   useRenderTool({
//     //   name: "getWeather",
//     //   render: ({status, args}) => {
//     //     return (
//     //       <p className="text-gray-500 mt-2">
//     //         {status !== "complete" && "Calling weather API..."}
//     //         {status === "complete" && `Called the weather API for ${args.location}.`}
//     //       </p>
//     //     );
//     //   },
//     // });

//     // reading/writing
//     const { agent } = useAgent({
//         agentId: "my_agent",
//         initialState: { language: "english" }  // optionally provide an initial state
//     });
//     const toggleLanguage = () => {
//         agent.setState({ language: agent.state?.language === "english" ? "spanish" : "english" });
//     };

//   //  state rendering
//     //  useAgent({
//     //   agentId: "my_agent",
//     //   render: ({ state }) => (
//     //     <div>
//     //       {state.searches?.map((search, index) => (
//     //         <div key={index}>
//     //           {search.done ? "✅" : "❌"} {search.query}{search.done ? "" : "..."}
//     //         </div>
//     //       ))}
//     //     </div>
//     //   ),
//     // });


//     //frontend tools
//     // useFrontendTool({
//     //   name: "sayHello",
//     //   description: "Say hello to the user",
//     //   parameters: z.object({
//     //     name: z.string().describe("The name of the user to say hello to"),
//     //   }),
//     //   handler: async ({ name }) => {
//     //     alert(`Hello, ${name}!`);
//     //     return `Said hello to ${name}!`;
//     //   },
//     // });

//     return (
//         <main>
//             <h1>Your main content</h1>
//             <p>Language: {agent.state?.language}</p>
//             {/* <button onClick={toggleLanguage}>Toggle Language</button> */}
// {/* 
//             <CopilotPopup
//                 labels={{
//                     modalHeaderTitle: "Popup Assistant",
//                     welcomeMessageText: "Need any help?",
//                 }}
//             /> */}

//                 {/* <CopilotChat
//       labels={{
//         welcomeMessageText: "Hi! How can I assist you today?",
//       }}
//     /> */}
//       <CopilotSidebar
//         defaultOpen={true}
//         labels={{
//           modalHeaderTitle: "Sidebar Assistant",
//           welcomeMessageText: "How can I help you today?",
//         }}
//       />

//       {/* <CopilotChat
//   // Style slots with Tailwind classes
//   input={{
//     textArea: "text-blue-500",
//     sendButton: "bg-blue-600 hover:bg-blue-700",
//   }}
//   // Customize nested message slots
//   messageView={{
//     assistantMessage: "bg-blue-50 rounded-xl p-2",
//     userMessage: "bg-blue-100 rounded-xl",
//   }}
// /> */}

//         </main>
//     );
// }

"use client";

import { useAgent ,CopilotSidebar} from "@copilotkit/react-core/v2";

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