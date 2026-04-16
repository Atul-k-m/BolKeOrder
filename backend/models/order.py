from sqlalchemy import Column, String, JSON, DateTime, Float, ForeignKey
from datetime import datetime
import uuid
from models.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    platform = Column(String, nullable=False) # e.g., 'Swiggy', 'Zomato'
    status = Column(String, index=True, default="Intent Detected")
    
    # List of items stored as JSON for simplicity, or we can use the cart_items table
    items = Column(JSON, default=list) 
    
    total_amount = Column(Float, default=0.0)
    delivery_address = Column(JSON, nullable=True)
    payment_method = Column(String, nullable=True)
    call_session_id = Column(String, nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"))
    name = Column(String, nullable=False)
    qty = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    modifiers = Column(JSON, default=list)
