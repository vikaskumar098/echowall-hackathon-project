from pydantic import BaseModel, Field
from typing import Literal

class ConfessionCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)

class ReactionRequest(BaseModel):
    reaction: Literal["like", "love", "sad"]
