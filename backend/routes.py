from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime

from .database import get_collection
from .models import ConfessionCreate, ReactionRequest

router = APIRouter(prefix="/api", tags=["confessions"])

@router.post("/confessions")
def create_confession(payload: ConfessionCreate):
    doc = {
        "text": payload.text,
        "reactions": {
            "like": 0,
            "love": 0,
            "sad": 0
        },
        "created_at": datetime.utcnow()
    }

    result = get_collection().insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.get("/confessions")
def get_confessions():
    data = []
    for doc in get_collection().find().sort("created_at", -1):
        doc["_id"] = str(doc["_id"])
        data.append(doc)
    return data


@router.patch("/confessions/{confession_id}/react")
def react(confession_id: str, payload: ReactionRequest):
    try:
        oid = ObjectId(confession_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    field = f"reactions.{payload.reaction}"

    result = get_collection().update_one(
        {"_id": oid},
        {"$inc": {field: 1}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Confession not found")

    return {"message": "Reaction added"}
