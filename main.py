import os
import re
import pickle
from contextlib import asynccontextmanager
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences


# Base Directory & Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Model Path (BiGRU) - handles case variations
model_path = os.path.join(BASE_DIR, "Artifacts", "BiGRU_model.keras")
if not os.path.exists(model_path):
    model_path = os.path.join(BASE_DIR, "Artifacts", "BiGRU_Model.keras")

# Tokenizer Path
tokenizer_path = os.path.join(BASE_DIR, "Artifacts", "tokenizer.pkl")

# Max Sequence Length (matches training config)
max_sequence_length = 50

# Emotion Labels
emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']

# Emotion Emojis Mapping
Emotion_Emojis = {
    "sadness": "😢",
    "joy": "😄",
    "love": "❤️",
    "anger": "😡",
    "fear": "😨",
    "surprise": "😲"
}


# Preprocess the incoming text
def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"'", "", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# Request and Response Schemas
class TextInput(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The sentence to analyze for emotion",
        json_schema_extra={"example": "I feel so happy and excited today!"}
    )


class PredictionResponse(BaseModel):
    text: str
    predicted_emotion: str
    confidence: float
    all_probabilities: dict[str, float]
    all_probabilites: dict[str, float] | None = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


# Model Cache and Lifespan Management
dl_model = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading the BiGRU model and tokenizer...")
    try:
        if os.path.exists(model_path):
            dl_model["BiGRU"] = load_model(model_path)
            print(f"BiGRU model loaded successfully from {model_path}.")
        else:
            print(f"Warning: Model file not found at {model_path}")

        if os.path.exists(tokenizer_path):
            with open(tokenizer_path, "rb") as file:
                dl_model["Tokenizer"] = pickle.load(file)
            print(f"Tokenizer loaded successfully from {tokenizer_path}.")
        else:
            print(f"Warning: Tokenizer file not found at {tokenizer_path}")
    except Exception as exc:
        print(f"Error loading models during startup: {exc}")

    yield

    dl_model.clear()


# Initialize FastAPI App
app = FastAPI(
    title="Emotion Prediction API",
    description="Deep Learning API for text emotion classification using BiGRU",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for flexible integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files
static_dir = os.path.join(BASE_DIR, "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


# API Endpoints
@app.get("/", include_in_schema=False)
def serve_ui():
    index_file = os.path.join(BASE_DIR, "static", "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Frontend UI file not found in static directory"}


@app.get("/health", response_model=HealthResponse)
def health_check():
    is_loaded = bool(dl_model.get("BiGRU") and dl_model.get("Tokenizer"))
    return HealthResponse(
        status="Server is healthy and running",
        model_loaded=is_loaded
    )


@app.post("/predict", response_model=PredictionResponse)
def predict_emotions(text_input: TextInput):
    BiGRU_model = dl_model.get("BiGRU")
    tokenizer_model = dl_model.get("Tokenizer")

    if BiGRU_model is None or tokenizer_model is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded yet. Please ensure artifact files exist in Artifacts/ folder."
        )

    # 1. Clean the input sentence
    cleaned_text = preprocess_text(text_input.text)

    # 2. Convert words to numeric sequences using tokenizer
    tokenized_text = tokenizer_model.texts_to_sequences([cleaned_text])

    # 3. Pad the sequences to ensure uniform length
    padded_sequence = pad_sequences(
        tokenized_text,
        maxlen=max_sequence_length,
        padding="post",
        truncating="post"
    )

    # 4. Run prediction using BiGRU model
    raw_predictions = BiGRU_model.predict(padded_sequence, verbose=0)
    probabilities = raw_predictions[0]

    # 5. Extract top emotion & format breakdown
    top_emotion_index = int(np.argmax(probabilities))
    all_probabilities = {
        label: round(float(prob), 4) for label, prob in zip(emotion_labels, probabilities)
    }

    predicted_label = emotion_labels[top_emotion_index]
    confidence_score = round(float(probabilities[top_emotion_index]), 4)

    return PredictionResponse(
        text=text_input.text,
        predicted_emotion=predicted_label,
        confidence=confidence_score,
        all_probabilities=all_probabilities,
        all_probabilites=all_probabilities
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

