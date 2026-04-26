from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.custom_llm import router as llm_router
from config import settings

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BolKeOrder Backend API",
    version="0.1.0",
    description="Voice commerce AI platform backend"
)

app.include_router(llm_router, prefix="/api/v1")

# CORS Middleware
origins = [origin.strip() for origin in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.app_env}

from strawberry.fastapi import GraphQLRouter
from graphql_schema.schema import schema

# Mount GraphQL
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

from api.routes import vapi_webhooks

# Mount Webhooks
app.include_router(vapi_webhooks.router, tags=["Vapi"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
