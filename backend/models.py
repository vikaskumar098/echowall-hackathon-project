from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class Reactions(BaseModel):
    like: int = 0
    love: int = 0
    sad: int = 0

class ConfessionCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

class ConfessionOut(BaseModel):
    id: str
    text: str
    reactions: Reactions
    created_at: datetime

class ReactionRequest(BaseModel):
    reaction: Literal["like", "love", "sad"]
