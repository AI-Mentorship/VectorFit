
'''
# ==========================================
# embed_clothing.py
# Use Pinecone Inference (your configured model)
# ==========================================

from pinecone import Pinecone

# cv model mock data
cv_json = {
    "clothing": {
        "confidence": 99.34,
        "predicted_class": "Trousers/Long Pants",
        "top_predictions": [
            {"class": "Trousers/Long Pants", "confidence": 99.34},
            {"class": "Skirt", "confidence": 0.61},
            {"class": "Shorts", "confidence": 0.05}
        ]
    },
    "colors": {
        "dominantcolor": {
            "name": "Gray",
            "rgb": [153, 138, 119]
        },
        "palette": [
            {"name": "Gray", "rgb": [153, 138, 119]},
            {"name": "Gray", "rgb": [215, 205, 196]},
            {"name": "Mixed", "rgb": [56, 44, 29]},
            {"name": "Gray", "rgb": [224, 204, 178]},
            {"name": "Mixed", "rgb": [76, 59, 42]}
        ]
    },
    "success": True
}

# Initialize Pinecone
pinecone_api_key = "pcsk_KCExm_KrTzKgGa7i7d9itQTEvBaCv5C5xTNnwCFnQtt6VvRm6qSsgDCCatR5evC35ZyF3"
pc = Pinecone(api_key=pinecone_api_key)

# Your index name
index_name = "closetsensei"
index = pc.Index(index_name)

# 1. Extract text to embed
text_to_embed = f"{cv_json['clothing']['predicted_class']} {cv_json['colors']['dominantcolor']['name']}"
print(f"Text to embed: {text_to_embed}")

# 2. pinecone inference embedding call
embedding_response = pc.inference.embed(
    model="llama-text-embed-v2",  # Your configured model
    inputs=[text_to_embed],
    parameters={"input_type": "passage"}
)

# extract the embedding vector
embedding = embedding_response[0].values
print(f"Generated embedding with {len(embedding)} dimensions")

#prepare metadata
metadata = {
    "type": cv_json['clothing']['predicted_class'],
    "confidence": cv_json['clothing']['confidence'],
    "dominant_color": cv_json['colors']['dominantcolor']['name'],
    "dominant_color_rgb": str(cv_json['colors']['dominantcolor']['rgb'])
}

# upsert to Pinecone
index.upsert(vectors=[{
    "id": "item_trousers_001",
    "values": embedding,
    "metadata": metadata
}])

print("✓ Successfully embedded in Pinecone!")
print(f"  ID: item_trousers_001")
print(f"  Type: {metadata['type']}")
print(f"  Color: {metadata['dominant_color']}")

'''

# code above wrapped in function

import os
import uuid


class PineconeEmbedder:
    """Namespace class that wraps Pinecone embedding/upsert logic.

    Usage:
      from embed import embedder
      embedder.embed(cv_json)

    The class lazily imports Pinecone and reads configuration from environment
    variables: PINECONE_API_KEY, PINECONE_INDEX, PINECONE_EMBED_MODEL, PINECONE_DISABLED.
    """

    def __init__(self, api_key=None, index_name=None, model_name=None, disabled=None):
        # allow explicit params or fallback to env
        self.api_key = api_key or os.getenv('PINECONE_API_KEY')
        self.index_name = index_name or os.getenv('PINECONE_INDEX', 'closetsensei')
        self.model_name = model_name or os.getenv('PINECONE_EMBED_MODEL', 'llama-text-embed-v2')
        self.disabled = (disabled if disabled is not None else os.getenv('PINECONE_DISABLED') == '1')
        self._pc = None
        self._index = None

    def _ensure_client(self):
        if self.disabled:
            return
        if self._pc is None:
            try:
                from pinecone import Pinecone
            except Exception as e:
                raise RuntimeError(f"pinecone library import failed: {e}")

            if not self.api_key:
                raise RuntimeError("PINECONE_API_KEY environment variable not set")

            self._pc = Pinecone(api_key=self.api_key)
            self._index = self._pc.Index(self.index_name)

    def embed(self, cv_json, item_id=None):
        # generate id
        if item_id is None:
            item_id = f"item_{uuid.uuid4().hex}"

        if self.disabled:
            print("PINECONE_DISABLED=1 -> skipping embedding (dry run).")
            return item_id

        # ensure Pinecone client/index are available
        self._ensure_client()

        # robustly extract predicted class
        clothing = cv_json.get('clothing', {})
        predicted_class = clothing.get('predicted_class') or clothing.get('predicted') or clothing.get('class') or 'Unknown'

        # robustly extract dominant color (accept both dominantcolor and dominant_color)
        colors = cv_json.get('colors', {})
        dominant = colors.get('dominantcolor') or colors.get('dominant_color') or {}
        dominant_name = dominant.get('name') or dominant.get('colour') or 'Unknown'
        dominant_rgb = dominant.get('rgb') or dominant.get('RGB') or []

        text_to_embed = f"{predicted_class} {dominant_name}".strip()

        # generate embedding via Pinecone inference
        embedding_response = self._pc.inference.embed(
            model=self.model_name,
            inputs=[text_to_embed],
            parameters={"input_type": "passage"}
        )

        embedding = embedding_response[0].values

        # prepare metadata
        metadata = {
            'type': predicted_class,
            'confidence': clothing.get('confidence'),
            'dominant_color': dominant_name,
            'dominant_color_rgb': str(dominant_rgb)
        }

        # upsert vector
        self._index.upsert(vectors=[{
            'id': item_id,
            'values': embedding,
            'metadata': metadata
        }])

        print(f"✓ Embedded {item_id}: {text_to_embed}")
        return item_id


# module-level default namespace instance
embedder = PineconeEmbedder()


def embed_cv_json(cv_json, item_id=None):
    """Backward-compatible wrapper that calls the module-level `embedder`.

    Prefer using `embedder.embed(...)` for namespaced access.
    """
    return embedder.embed(cv_json, item_id=item_id)


__all__ = ["PineconeEmbedder", "embedder", "embed_cv_json"]


