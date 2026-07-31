import asyncio
from typing import Annotated, List, Union, Optional
from pydantic import BaseModel
from fastapi import FastAPI
from llama_index.core.workflow import Context, step, StopEvent, Workflow
from llama_index.protocols.ag_ui.agent import AGUIChatWorkflow, InputEvent, LoopEvent, ToolCallEvent
from llama_index.llms.openai import OpenAI
from llama_index.protocols.ag_ui.events import StateSnapshotWorkflowEvent, CustomWorkflowEvent
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
        await ctx.store.set("state", state)
        ctx.write_event_to_stream(StateSnapshotWorkflowEvent(snapshot=state))
    
    # Simulate execution of each step
    for i, step in enumerate(task.steps):
        await asyncio.sleep(2)
        async with ctx.store.edit_state() as global_state:
            state = global_state.get("state", {})
            state["observed_steps"][i]["status"] = "completed"
            await ctx.store.set("state", state)
            ctx.write_event_to_stream(StateSnapshotWorkflowEvent(snapshot=state))
    
    return "Task completed successfully!"


def getWeather(city: str) -> str:
    """Get the current weather for a city.
    
    Args:
        city: The city name.
    """
    return f"Weather for {city}"


def requestApproval(action: str, reason: str) -> str:
    """Ask the user before a consequential action.
    
    Args:
        action: The action description.
        reason: The reason for the action.
    """
    return "Approval result"


async def triggerInterrupt(ctx: Context) -> str:
    """Trigger a workflow review interrupt for the user.
    
    Args:
        ctx: The workflow context.
    """
    ctx.write_event_to_stream(
        CustomWorkflowEvent(
            name="on_interrupt",
            value={
                "title": "Time Slot Review Required",
                "choices": [
                    {"id": "slot_10am", "label": "10:00 AM"},
                    {"id": "slot_11am", "label": "11:00 AM"}
                ]
            }
        )
    )
    return "Interrupt triggered. Please select a time slot on the frontend."


class CustomAGUIChatWorkflow(AGUIChatWorkflow):
    @step
    async def chat(
        self, ctx: Context, ev: InputEvent | LoopEvent
    ) -> Optional[Union[StopEvent, ToolCallEvent]]:
        if isinstance(ev, InputEvent):
            orig_system_prompt = self.system_prompt
            context = ev.input_data.context
            if context:
                context_str = "\n".join(
                    f"- {c.description}: {c.value}" for c in context
                )
                context_prompt = f"\n\nActive Application Context:\n{context_str}"
                self.system_prompt = (orig_system_prompt or "") + context_prompt
                
            try:
                return await super().chat(ctx, ev)
            finally:
                self.system_prompt = orig_system_prompt
        else:
            return await super().chat(ctx, ev)


# Initialize the LLM
llm = OpenAI(model="gpt-4o")

# Create the workflow factory using our custom workflow
async def custom_workflow_factory():
    return CustomAGUIChatWorkflow(
        llm=llm,
        frontend_tools=[getWeather, requestApproval],
        backend_tools=[execute_task, triggerInterrupt],
        initial_state={"observed_steps": []},
        system_prompt=(
            "You are a helpful assistant that can help the user with their task. "
            "When the user asks you to do any task (like creating a recipe, planning something, etc.), "
            "use the execute_task tool with a list of steps. Use your best judgment to describe the steps. "
            "Always use the tool for any actionable request. "
            "You also have access to a frontend tool called getWeather (for checking weather) and a human-in-the-loop tool called requestApproval. "
            "Before you execute a consequential action (such as performing a task or running a search), you MUST call requestApproval to get the user's permission first. "
            "You should also look at the active application context for parameters like userName and timezone, and use them to personalize your replies if asked. "
            "You also have a backend tool called triggerInterrupt. If the user asks you to trigger an interrupt, review, or slot check, execute this tool."
        ),
    )

# Create the AG-UI workflow router
agentic_chat_router = get_ag_ui_workflow_router(
    workflow_factory=custom_workflow_factory
)

# Create FastAPI app
app = FastAPI(
    title="LlamaIndex Agent",
    description="A LlamaIndex agent integrated with CopilotKit",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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