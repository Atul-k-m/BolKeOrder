from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from config import settings
import logging
import asyncio
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

COLLECTION_NAME = "menu"
VECTOR_SIZE = 384  # changed from 1536

# Load embedding model once
_model = SentenceTransformer('all-MiniLM-L6-v2')

qdrant = AsyncQdrantClient(
    url=settings.qdrant_url,
    api_key=settings.qdrant_api_key
)

# ─────────────────────────────────────────────
# EMBEDDINGS via MiniMax API
# ─────────────────────────────────────────────

def get_embedding(text: str) -> list[float]:
    """Local embedding — no API, no rate limits."""
    return _model.encode(text).tolist()

# ─────────────────────────────────────────────
# COLLECTION SETUP
# ─────────────────────────────────────────────

async def ensure_collection():
    """Create the menu collection in Qdrant if it doesn't exist."""
    try:
        collections = await qdrant.get_collections()
        names = [c.name for c in collections.collections]
        if COLLECTION_NAME not in names:
            await qdrant.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.COSINE
                )
            )
            logger.info(f"Created Qdrant collection: {COLLECTION_NAME}")
        else:
            logger.info(f"Collection '{COLLECTION_NAME}' already exists.")
    except Exception as e:
        logger.error(f"Failed to ensure collection: {e}")
        raise


# ─────────────────────────────────────────────
# INGEST MENU
# ─────────────────────────────────────────────

async def ingest_menu(menu_items: list[dict]):
    await ensure_collection()
    points = []

    for item in menu_items:
        searchable_text = f"{item['name']} {item.get('description', '')} {item.get('category', '')}"
        vector = get_embedding(searchable_text)
        points.append(PointStruct(
            id=item["id"],
            vector=vector,
            payload={
                "name": item["name"],
                "price": item["price"],
                "description": item.get("description", ""),
                "category": item.get("category", ""),
                "available": item.get("available", True)
            }
        ))
        await asyncio.sleep(2)
        print(f"✅ Processed: {item['name']}")

    await qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
    logger.info(f"Ingested {len(points)} menu items into Qdrant.")

# ─────────────────────────────────────────────
# SEARCH MENU
# ─────────────────────────────────────────────

async def search_menu(query: str, top_k: int = 3) -> list[dict]:
    """
    Search menu items semantically.
    
    Example: "something spicy with rice" will find Chicken Biryani
    even if those exact words aren't in the name.
    
    Returns list of matched items with name, price, description.
    """
    try:
        query_vector = get_embedding(query)

        results = await qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=top_k,
            with_payload=True,
            score_threshold=0.35  # Only return confident matches
        )

        matched_items = []
        for hit in results:
            item = hit.payload
            item["score"] = round(hit.score, 3)
            matched_items.append(item)

        return matched_items

    except Exception as e:
        logger.error(f"Menu search failed: {e}")
        return []