
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

def embed_cv_json(cv_json, item_id=None):
    """Embed a CV JSON object into Pinecone.

    - Reads PINECONE_API_KEY and optional PINECONE_INDEX from environment.
    - If PINECONE_DISABLED=1 is set, embedding is skipped (useful for local tests).
    - Accepts color keys in either `dominantcolor` or `dominant_color` formats.

    Returns the upserted item id on success. Raises RuntimeError on configuration/import errors.
    """

    # generate a stable id if none provided
    if item_id is None:
        item_id = f"item_{uuid.uuid4().hex}"

    # Support a test mode where embedding is skipped
    if os.getenv('PINECONE_DISABLED') == '1':
        print("PINECONE_DISABLED=1 -> skipping embedding (dry run).")
        return item_id

    # lazy import to avoid import errors when pinecone isn't installed
    try:
        from pinecone import Pinecone
    except Exception as e:
        raise RuntimeError(f"pinecone library import failed: {e}")

    api_key = os.getenv('PINECONE_API_KEY')
    if not api_key:
        raise RuntimeError("PINECONE_API_KEY environment variable not set")

    pc = Pinecone(api_key=api_key)
    index_name = os.getenv('PINECONE_INDEX', 'closetsensei')
    index = pc.Index(index_name)

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
    embedding_response = pc.inference.embed(
        model=os.getenv('PINECONE_EMBED_MODEL', 'llama-text-embed-v2'),
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
    index.upsert(vectors=[{
        'id': item_id,
        'values': embedding,
        'metadata': metadata
    }])

    print(f"✓ Embedded {item_id}: {text_to_embed}")
    return item_id