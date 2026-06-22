import { useThreads } from "@copilotkit/react-core/v2"; 

export default function ThreadSidebar() {
  const { 
    threads,
    isLoading,
    renameThread,
    archiveThread,
    deleteThread,
  } = useThreads({ agentId: "my-agent" });

  if (isLoading) return <div>Loading...</div>;
console.log("Threads data:", threads);

  return (
    <div>
      {threads.map((thread) => (
        <div key={thread.id}>
          <span>{thread.name ?? "New conversation"}</span>
          <button onClick={() => renameThread(thread.id, "Renamed")}>
            Rename
          </button>
          <button onClick={() => archiveThread(thread.id)}>
            Archive
          </button>
        </div>
      ))}
    </div>
  );
}