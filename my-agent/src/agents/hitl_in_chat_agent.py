import json
import os
from typing import Annotated

from llama_index.llms.openai import OpenAI
from llama_index.protocols.ag_ui.router import get_ag_ui_workflow_router

# The user snippet had this import, but it causes circular dependency if this file IS hitl_in_chat_agent.
# from agents.hitl_in_chat_agent import FixedAGUIChatWorkflow

# Providing mock tools so the app can start
def get_weather_impl(location: str):
    return {"temperature": 22, "conditions": "sunny", "humidity": 50, "wind_speed": 10, "feels_like": 24}

# --- Frontend tools (executed client-side, agent just returns a confirmation) ---

def change_background(
    background: Annotated[str, "CSS background value. Prefer gradients."],
) -> str:
    """Change the background color/gradient of the chat area."""
    return f"Background changed to {background}"

def generate_haiku(
    japanese: Annotated[list[str], "3 lines of haiku in Japanese"],
    english: Annotated[list[str], "3 lines of haiku translated to English"],
    image_name: Annotated[str, "One relevant image name from the valid set"],
    gradient: Annotated[str, "CSS Gradient color for the background"],
) -> str:
    """Generate a haiku with Japanese text, English translation, and a background image."""
    return "Haiku generated!"

def generate_task_steps(
    steps: Annotated[
        list[dict],
        "Array of step objects with 'description' (string) and 'status' ('enabled' or 'disabled')",
    ],
) -> str:
    """Generate a list of task steps for the user to review and approve."""
    return f"Generated {len(steps)} steps for review"

def book_call(
    topic: Annotated[str, "What the call is about (e.g. 'Intro with sales')"],
    attendee: Annotated[str, "Who the call is with (e.g. 'Alice from Sales')"],
) -> str:
    """Ask the user to pick a time slot for a call. The picker UI presents fixed candidate slots; the user's choice is returned to the agent."""
    return f"Booking call about {topic} with {attendee}"

def show_card(
    title: Annotated[str, "Short heading for the card."],
    body: Annotated[str, "Body text for the card."],
) -> str:
    """Display a titled card with a short body of text. Rendered on the frontend via useComponent."""
    return f"Displayed card: {title}"

# --- Backend tools (executed server-side, using shared implementations) ---

async def get_weather(
    location: Annotated[str, "The location to get the weather for."],
) -> str:
    """Get the weather for a given location. Returns temperature, conditions, humidity, wind speed, and feels-like temperature."""
    return json.dumps(get_weather_impl(location))

# Let's create the router with these tools so it can be hooked up to main.py
frontend_tools_list = [change_background, generate_haiku, generate_task_steps, book_call, show_card]
backend_tools_list = [get_weather]

hitl_router = get_ag_ui_workflow_router(
    llm=OpenAI(model="gpt-5.4"),
    frontend_tools=frontend_tools_list,
    backend_tools=backend_tools_list,
    system_prompt="You are a helpful AI assistant. When asked about weather, use get_weather. When asked to change background, use change_background. When asked for a haiku, use generate_haiku. When asked for task steps, use generate_task_steps. When asked to book a call, use book_call. When asked to show a card, use show_card.",
)
