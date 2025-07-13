"""Checkpointer utilities for LangGraph agents.

Provides persistent state storage using PostgreSQL.
"""

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from utils.settings import settings


def create_checkpointer() -> AsyncPostgresSaver | None:
    """Create PostgreSQL checkpointer if database URL is configured."""
    return (
        AsyncPostgresSaver.from_conn_string(str(settings.database_url))
        if settings.database_url
        else None
    )


async def setup_checkpointer() -> None:
    """Setup checkpointer database tables."""
    if checkpointer := create_checkpointer():
        await checkpointer.setup()

    # Default checkpointer instance
    checkpointer: AsyncPostgresSaver | None = None


async def get_checkpointer() -> AsyncPostgresSaver | None:
    """Get the global checkpointer instance, creating it if necessary."""
    global checkpointer
    if not checkpointer and settings.database_url:
        checkpointer = create_checkpointer()
    return checkpointer


def create_checkpointer_sync() -> AsyncPostgresSaver | None:
    """Create an async PostgreSQL checkpointer without setup (for graph compilation)."""
    return (
        AsyncPostgresSaver.from_conn_string(str(settings.database_url))
        if settings.database_url
        else None
    )
