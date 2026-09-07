from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(tags=["Action Items"])

@router.get("/api/meetings/{meeting_id}/action-items", response_model=List[schemas.ActionItemResponse])
def list_action_items(meeting_id: str, db: Session = Depends(get_db)):
    return db.query(models.ActionItem).filter(models.ActionItem.meeting_id == meeting_id).all()

@router.post("/api/meetings/{meeting_id}/action-items", response_model=schemas.ActionItemResponse, status_code=status.HTTP_201_CREATED)
def create_action_item(
    meeting_id: str,
    payload: schemas.ActionItemCreate,
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    action_item = models.ActionItem(
        meeting_id=meeting_id,
        text=payload.text,
        assignee_name=payload.assignee_name,
        assignee_email=payload.assignee_email,
        completed=payload.completed,
        due_date=payload.due_date
    )
    db.add(action_item)
    db.commit()
    db.refresh(action_item)
    return action_item

@router.patch("/api/action-items/{action_id}", response_model=schemas.ActionItemResponse)
def update_action_item(
    action_id: str,
    payload: schemas.ActionItemUpdate,
    db: Session = Depends(get_db)
):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    if payload.text is not None:
        item.text = payload.text
    if payload.assignee_name is not None:
        item.assignee_name = payload.assignee_name
    if payload.assignee_email is not None:
        item.assignee_email = payload.assignee_email
    if payload.completed is not None:
        item.completed = payload.completed
    if payload.due_date is not None:
        item.due_date = payload.due_date

    db.commit()
    db.refresh(item)
    return item

@router.delete("/api/action-items/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action_item(action_id: str, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()
    return None
