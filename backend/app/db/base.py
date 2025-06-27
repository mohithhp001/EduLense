from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://edulense:edulense@localhost:5432/edulense")
engine = create_async_engine(DATABASE_URL, echo=True, future=True) 