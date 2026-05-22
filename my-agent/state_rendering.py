import asyncio
from typing import Annotated
from fastapi import FastAPI
from llama_index.llms.openai import OpenAI
from llama_index.core.workflow import Context
from llama_index.protocols.ag_ui.router import get_ag_ui_workflow_router
from llama_index.protocols.ag_ui.events import StateSnapshotWorkflowEvent

async def addSearch(
    ctx: Context,
    query: Annotated[str, "The search query to add."]
) -> str:
    """Add a search to the agent's list of searches."""
    async with ctx.store.edit_state() as global_state:
        state = global_state.get("state", {})
        if state is None:
            state = {}

        if "searches" not in state:
            state["searches"] = []

        # Add new search
        new_search = {"query": query, "done": False}
        state["searches"].append(new_search)

        # Emit state snapshot to frontend
        ctx.write_event_to_stream(
            StateSnapshotWorkflowEvent(
                snapshot=state
            )
        )

        global_state["state"] = state

    return f"Added search: {query}"

async def runSearches(ctx: Context) -> str:
    """Run all the searches that have been added."""
    async with ctx.store.edit_state() as global_state:
        state = global_state.get("state", {})
        if state is None:
            state = {}

        if "searches" not in state:
            state["searches"] = []

        # Update each search to done
        for search in state["searches"]:
            if not search.get("done", False):
                await asyncio.sleep(1)  # Simulate search execution
                search["done"] = True

                # Emit state update as each search completes
                ctx.write_event_to_stream(
                    StateSnapshotWorkflowEvent(
                        snapshot=state
                    )
                )

        global_state["state"] = state

    return "All searches completed!"

# Initialize the LLM
llm = OpenAI(model="gpt-5.4")

# Create the AG-UI workflow router
agentic_chat_router = get_ag_ui_workflow_router(
    llm=llm,
    system_prompt="""
    You are a helpful assistant for storing searches.

    IMPORTANT:
    - Use the addSearch tool to add a search to the agent's state
    - After using the addSearch tool, YOU MUST ALWAYS use the runSearches tool to run the searches
    - ONLY USE THE addSearch TOOL ONCE FOR A GIVEN QUERY

    When adding searches, update the state to track:
    - query: the search query
    - done: whether the search is complete (false initially, true after running)
    """,
    backend_tools=[addSearch, runSearches],
    initial_state={
        "searches": []
    },
)

# Create FastAPI app
app = FastAPI(
    title="LlamaIndex Agent",
    description="A LlamaIndex agent integrated with CopilotKit",
    version="1.0.0"
)

# Include the router
app.include_router(agentic_chat_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent": "llamaindex"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)