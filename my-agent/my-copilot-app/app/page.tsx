"use client";
import { CopilotPopup,CopilotChat, CopilotSidebar, useDefaultRenderTool, useHumanInTheLoop, useAgent } from "@copilotkit/react-core/v2";
import { useComponent ,useFrontendTool,useRenderTool} from "@copilotkit/react-core/v2"; 
import { z } from "zod";
import { useCopilotKit } from "@copilotkit/react-core/v2";
import { randomUUID } from "@copilotkit/shared";
import  AgentDashboard  from "./AgentDashboard";

const weatherSchema = z.object({
  city: z.string().describe("City name"),
  temperature: z.number().describe("Temperature in Fahrenheit"),
  condition: z.string().describe("Weather condition"),
});
import ThreadSidebar from "./ThreadSidebar";
import {useEffect} from "react";
function WeatherCard({
  city,
  temperature,
  condition,
}: z.infer<typeof weatherSchema>) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{city}</h3>
      <p className="text-2xl">{temperature}°F</p>
      <p className="text-sm text-gray-500">{condition}</p>
    </div>
  );
}
type AgentState = {
  searches: {
    query: string;
    done: boolean;
  }[];
};

// type AgentState = {
//     language: "english" | "spanish";
// }
import CustomChat from "./custom-chat";
export default function Page() {
  // const { agent } = useAgent({ agentId: "my_agent" });
    //const { copilotkit } = useCopilotKit();

  // useComponent({
  //   name: "showWeather",
  //   description: "Display a weather card for a city.",
  //   parameters: weatherSchema,
  //   render: WeatherCard,
  // });
  //======================Subscribing to AG-UI Events====================
//     useEffect(() => {
//     const subscription = agent.subscribe({
//       // Called on every event
//       onEvent({ event, agent }) {
//         console.log("Event:", event.type, event);
//       },
//       // Text message streaming
//       onTextMessageContentEvent({ event, textMessageBuffer, agent }) {
//         console.log("Streaming text:", textMessageBuffer);
//       },
//       // Tool calls
//       onToolCallEndEvent({ event, toolCallName, toolCallArgs, agent }) {
//         console.log("Tool called:", toolCallName, toolCallArgs);
//       },
//       // State updates
//       onStateSnapshotEvent({ event, agent }) {
//         console.log("State snapshot:", agent.state);
//       },
//       // High-level lifecycle
//       onMessagesChanged({ agent }) {
//         console.log("Messages updated:", agent.messages);
//       },
//       onStateChanged({ agent }) {
//   console.log("State changed:", JSON.stringify(agent.state, null, 2));
// },onCustomEvent: ({ event }) => {
//         console.log("Custom event:", event.name, event.value);
//       },
//       onRunStartedEvent: () => {
//         console.log("Agent started running");
//       },
//       onRunFinalized: () => {
//         console.log("Agent finished running");
//       },

//     });
    
//     return () => subscription.unsubscribe();
//   }, [agent]);
   // interactive

  useHumanInTheLoop({
    name: "humanApprovedCommand",
    description: "Ask human for approval to run a command.",
    parameters: z.object({
      command: z.string().describe("The command to run"),
    }),
    render: ({ args, respond, status }) => {
      if (status !== "executing") return <></>;
      return (
        <div>
          <pre>{args.command}</pre>
          <button onClick={() => respond?.(`Tell the user the command ran`)}>
            Approve
          </button>
          <button
            onClick={() => respond?.(`Tell the user the command wasn't run`)}
          >
            Deny
          </button>
        </div>
      );
    },
  });
//  useRenderTool({
//     name: "getWeather",
//     render: ({status, args}) => {
//       return (
//         <p className="text-gray-500 mt-2">
//           {status !== "complete" && "Calling weather API..."}
//           {status === "complete" && `Called the weather API for ${args.location}.`}
//         </p>
//       );
//     },
//   });
//   // ...
//    // reading/writing
    const { agent } = useAgent({
        agentId: "my_agent",
        initialState: { language: "english" }  // optionally provide an initial state
    });
    const toggleLanguage = () => {
        agent.setState({ language: agent.state?.language === "english" ? "spanish" : "english" });
    };

//    //state rendering
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
//       useFrontendTool({
//         name: "sayHello",
//         description: "Say hello to the user",
//         parameters: z.object({
//           name: z.string().describe("The name of the user to say hello to"),
//         }),
//         handler: async ({ name }) => {
//           alert(`Hello, ${name}!`);
//           return `Said hello to ${name}!`;
//         },
//       });

    return (
        <main>
            <h1>Your main content</h1>
 <div className="flex flex-col gap-2 mt-4">
        {agent.state?.searches?.map((search, index) => (
          <div key={index} className="flex flex-row">
            {search.done ? "✅" : "❌"} {search.query}
          </div>
        ))}
      </div>


            <p>Language: {agent.state?.language}</p> 
            <button onClick={toggleLanguage}>Toggle Language</button>
                  <CustomChat/>

{/* 
            <CopilotPopup
                labels={{
                    modalHeaderTitle: "Popup Assistant",
                    welcomeMessageText: "Need any help?",
                }}
            /> */}
<CopilotSidebar/>
  {/* <AgentDashboard /> */}

      {/* <CopilotChat
  // Style slots with Tailwind classes
  input={{
    textArea: "text-blue-500",
    sendButton: "bg-blue-600 hover:bg-blue-700",
  }}
  // Customize nested message slots
  messageView={{
    assistantMessage: "bg-blue-50 rounded-xl p-2",
    userMessage: "bg-blue-100 rounded-xl",
  }}
/> */}
{/* <ThreadSidebar/> */}
{/* <Chat/> */}
        </main>
    );
}

// ==================SLOTS=======================
const CustomMessageView = ({ messages, isRunning }: { messages: any[]; isRunning: boolean }) => (

    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "user"
                ? "ml-auto bg-blue-100 rounded-lg p-3 max-w-md"
                : "bg-gray-100 rounded-lg p-3 max-w-md"
            }
          >
            <p className="text-sm font-medium">{msg.role}</p>
            <p>
              {typeof msg.content === "string"
                ? msg.content
                : Array.isArray(msg.content)
                ? msg.content.map((part: any, index: number) =>
                    part.type === "text" ? part.text : null
                  )
                : null}
            </p>
          </div>
        ))}
        {isRunning && <div className="text-gray-400">Thinking...</div>}
      </div>
    </div>
);
export function Chat() {
  return (
    <CopilotChat messageView={CustomMessageView} />
  );
}


// ============================Predictive workflow=======================
// "use client";

// import { useAgent ,CopilotSidebar} from "@copilotkit/react-core/v2";

// interface Step {
//     description: string;
// status: 'pending' | 'completed';
// }

// interface AgentState {
//     observed_steps: Step[];
// }

// export default function Page() {
//     // Get access to both predicted and final states
//     const { agent } = useAgent({ agentId: "my_agent" });

//     // Add a state renderer to show progress in the chat
//     useAgent({
//         agentId: "my_agent",
//         render: ({ state, status }) => {
//             if (!state?.observed_steps?.length) return null;
//             return (
//                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 my-2">
//                     <h3 className="font-semibold text-gray-700 mb-2">
//                         {status === 'inProgress' ? '⏳ Progress:' : '✅ Completed:'}
//                     </h3>
//                     <ul className="space-y-1">
//                         {state.observed_steps.map((step, i) => (
//                             <li key={i} className="flex items-center gap-2">
//                                 <span>
//                                     {step.status === 'completed' ? '✅' : '⏳'}
//                                 </span>
//                                 <span className={step.status === 'completed' ? 'text-green-700' : 'text-gray-600'}>
//                                     {step.description}
//                                 </span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             );
//         },
//     });

//     return (
//         <div>
//             <header>
//                 <h1>Agent Progress Demo</h1>
//             </header>

//             <main>
//                 {/* Side panel showing final state */}
//                 <aside>
//                     <h2>Agent State</h2>
//                     {agent.state?.observed_steps?.length > 0 ? (
//                         <ul>
//                             {agent.state.observed_steps.map((step, i) => (
//                                 <li key={i}>
//                                     <span>{step.status === 'completed' ? '✅' : '⏳'}</span>
//                                     <span>{step.description}</span>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>
//                             {"No steps yet. Try asking to build a plan like \"create a recipe for ___\" or \"teach me how to fix a tire.\""}
//                         </p>
//                     )}
//                 </aside>

//                 {/* Chat area */}
//                 <CopilotSidebar
//                     labels={{
//                         welcomeMessageText: "Hi! Ask me to do a task like \"teach me how to fix a tire.\""
//                     }}
//                 />
//             </main>
//         </div>
//     );
// }



//==================WORKFLOW EXECUTION========================

// "use client";

// import { useState } from "react";
// import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

// // Define the agent state type, should match the actual state of your agent
// type AgentState = {
//   question: string;
//   answer: string;
// }

// /* Example usage in a pseudo React component */
// export default function Page() { 
//   const [inputQuestion, setInputQuestion] = useState("What's the capital of France?");
//   const [isLoading, setIsLoading] = useState(false);

//   const { agent } = useAgent({
//     agentId: "my_agent",
//   });
//   const { copilotkit } = useCopilotKit();

//   const askQuestion = async (newQuestion: string) => {
//     setIsLoading(true);

//     // Update the state with the new question
//     agent.setState({ ...agent.state, question: newQuestion, answer: "" });

//     try {
//       // Add a message and trigger the agent to run
//       agent.addMessage({
//         id: crypto.randomUUID(),
//         role: "user",
//         content: newQuestion,
//       });
//       await copilotkit.runAgent({ agent });
//     } catch (error) {
//       console.error("Error running agent:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
//       <h1>Q&A Assistant</h1>
      
//       <div style={{ marginBottom: "1rem" }}>
//         <input
//           type="text"
//           value={inputQuestion}
//           onChange={(e) => setInputQuestion(e.target.value)}
//           placeholder="Enter your question..."
//           style={{ 
//             padding: "0.5rem", 
//             width: "300px", 
//             marginRight: "0.5rem",
//             borderRadius: "4px",
//             border: "1px solid #ccc"
//           }}
//         />
//         <button 
//           onClick={() => askQuestion(inputQuestion)}
// disabled={isLoading || !inputQuestion.trim()}
//           style={{
//             padding: "0.5rem 1rem",
//             borderRadius: "4px",
//             border: "none",
//             backgroundColor: isLoading ? "#ccc" : "#0070f3",
//             color: "white",
//             cursor: isLoading ? "not-allowed" : "pointer"
//           }}
//         >
//           {isLoading ? "Thinking..." : "Ask Question"}
//         </button>
//       </div>

//       <div style={{ marginTop: "1.5rem" }}>
// <p><strong>Question:</strong> {agent.state?.question || "(none yet)"}</p>
// <p><strong>Answer:</strong> {agent.state?.answer || (isLoading ? "Thinking..." : "Waiting for question...")}</p>
//       </div>
//     </div>
//   );
// }
