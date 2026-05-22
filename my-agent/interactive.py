from fastapi import FastAPI
from llama_index.llms.openai import OpenAI
from llama_index.protocols.ag_ui.router import get_ag_ui_workflow_router
def offerOptions(option_1: str, option_2: str) -> str:
    """Give the user a choice between two options and have them select one."""
    return f"Presenting options: {option_1} or {option_2}"
# Initialize the LLM
llm = OpenAI(model="gpt-5.4")
# Create the AG-UI workflow router
agentic_chat_router = get_ag_ui_workflow_router(
    llm=llm,
    frontend_tools=[offerOptions],
    system_prompt="You are a helpful AI assistant that can write essays. When the user asks you to choose between two options or when you need to present them with a choice, you MUST use the offerOptions tool to let them select between the options.",
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