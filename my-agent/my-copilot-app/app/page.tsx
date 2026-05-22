// "use client";
// import { CopilotPopup, useRenderTool, useHumanInTheLoop, useAgent } from "@copilotkit/react-core/v2";
// import { z } from "zod";
// import { useFrontendTool } from "@copilotkit/react-core/v2"; 
// // type AgentState = {
// //   searches: {
// //     query: string;
// //     done: boolean;
// //   }[];
// // };

// type AgentState = {
// language: "english" | "spanish";
// }
// export default function YourApp() {
//   //interactive

// //  useHumanInTheLoop({
// //     name: "offerOptions",
// //     description: "Give the user a choice between two options and have them select one.",
// //     parameters: [
// //       {
// //         name: "option_1",
// //         type: "string",
// //         description: "The first option",
// //         required: true,
// //       },
// //       {
// //         name: "option_2",
// //         type: "string",
// //         description: "The second option",
// //         required: true,
// //       },
// //     ],
// //     render: ({ args, respond }) => {
// //       if (!respond) return <></>;
// //       return (
// //         <div>
// //           <button onClick={() => respond(`${args.option_1} was selected`)}>{args.option_1}</button>
// //           <button onClick={() => respond(`${args.option_2} was selected`)}>{args.option_2}</button>
// //         </div>
// //       );
// //     },
// //   });
// // tool render
//   //   useRenderTool({
//   //   name: "getWeather",
//   //   render: ({status, args}) => {
//   //     return (
//   //       <p className="text-gray-500 mt-2">
//   //         {status !== "complete" && "Calling weather API..."}
//   //         {status === "complete" && `Called the weather API for ${args.location}.`}
//   //       </p>
//   //     );
//   //   },
//   // });

// // reading/writing
//   // const { agent } = useAgent({
//   //   agentId: "my_agent",
//   //   initialState: { language: "english" }  // optionally provide an initial state
//   // });
//   //   const toggleLanguage = () => {
//   //   agent.setState({ language: agent.state?.language === "english" ? "spanish" : "english" }); 
//   // };
  
//   //state rendering
//   //  useAgent({
//   //   agentId: "my_agent",
//   //   render: ({ state }) => (
//   //     <div>
//   //       {state.searches?.map((search, index) => (
//   //         <div key={index}>
//   //           {search.done ? "✅" : "❌"} {search.query}{search.done ? "" : "..."}
//   //         </div>
//   //       ))}
//   //     </div>
//   //   ),
//   // });
// //frontend tools
//   // useFrontendTool({
//   //   name: "sayHello",
//   //   description: "Say hello to the user",
//   //   parameters: z.object({
//   //     name: z.string().describe("The name of the user to say hello to"),
//   //   }),
//   //   handler: async ({ name }) => {
//   //     alert(`Hello, ${name}!`);
//   //     return `Said hello to ${name}!`;
//   //   },
//   // });

//   return (
//     <main>
//        <h1>Your main content</h1>
//       <p>Language: {agent.state?.language}</p>
//       <button onClick={toggleLanguage}>Toggle Language</button>

//       <CopilotPopup
//         labels={{
//           modalHeaderTitle: "Popup Assistant",
//           welcomeMessageText: "Need any help?",
//         }}
//       />
//     </main>
//   );
// }

