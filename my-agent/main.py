import asyncio
from typing import Annotated, List
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from llama_index.core.workflow import Context
from llama_index.llms.openai import OpenAI
from llama_index.protocols.ag_ui.events import StateSnapshotWorkflowEvent
from llama_index.protocols.ag_ui.router import get_ag_ui_workflow_router


class Step(BaseModel):
    """A single step in a task."""
    description: str


class Task(BaseModel):
    """A task with a list of steps to execute."""
    steps: List[Step]


async def execute_task(ctx: Context, task: Task) -> str:
    """Execute a list of steps for any task. Use this for any task the user wants to accomplish.
    
    Args:
        ctx: The workflow context for accessing and updating state.
        task: The task containing the list of steps to execute.
    
    Returns:
        str: Confirmation that the task was completed.
    """
    task = Task.model_validate(task)
    
    async with ctx.store.edit_state() as global_state:
        state = global_state.get("state", {})
        if state is None:
            state = {}
        
        # Initialize all steps as pending
        state["observed_steps"] = [
            {"description": step.description, "status": "pending"}
            for step in task.steps
        ]
        
        # Send initial state snapshot
        ctx.write_event_to_stream(
            StateSnapshotWorkflowEvent(snapshot=state)
        )
        
        # Simulate step execution with delays
        await asyncio.sleep(0.5)
        
        # Update each step to completed one by one
        for i in range(len(state["observed_steps"])):
            state["observed_steps"][i]["status"] = "completed"
            
            # Emit updated state after each step
            ctx.write_event_to_stream(
                StateSnapshotWorkflowEvent(snapshot=state)
            )
            
            # Small delay between steps for visual effect
            await asyncio.sleep(0.5)
        
        global_state["state"] = state
    
    return "Task completed successfully!"


# Initialize the LLM
llm = OpenAI(model="gpt-5.4")

# Create the AG-UI workflow router
agentic_chat_router = get_ag_ui_workflow_router(
    llm=llm,
    system_prompt=(
        "You are a helpful assistant that can help the user with their task. "
        "When the user asks you to do any task (like creating a recipe, planning something, etc.), "
        "use the execute_task tool with a list of steps. Use your best judgment to describe the steps. "
        "Always use the tool for any actionable request."
    ),
    backend_tools=[execute_task],
    initial_state={
        "observed_steps": [],
    },
)

# Create FastAPI app
app = FastAPI(
    title="LlamaIndex Agent",
    description="A LlamaIndex agent integrated with CopilotKit",
    version="1.0.0"
)

# Allow browser preflight requests from local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
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