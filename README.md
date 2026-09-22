# 🎭 Emotion Prediction Web Application & REST API

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15+-FF6F00.svg?style=flat-square&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

An end-to-end Natural Language Processing (NLP) deep learning application that analyzes sentences and predicts human emotions in real time. Powered by a **Bidirectional Gated Recurrent Unit (BiGRU)** neural network, an asynchronous **FastAPI** backend, and an interactive glassmorphic web interface.

---

## 📸 Output & UI Preview

Here are sample outputs of the application analyzing different emotional texts:

### 1. Emotion: Joy 😄
> *"I am so thrilled and proud of our team for winning the championship!"*

![Joy Emotion Prediction Output](assets/emotion_output_joy.png)

---

### 2. Emotion: Sadness 😢
> *"I feel completely heartbroken, lonely, and deeply sad today."*

![Sadness Emotion Prediction Output](assets/emotion_output_sadness.png)

---

## 🌟 Emotion Taxonomy

The neural network classifies input sentences into six core emotional categories:

| Emotion | Emoji | Color Aura | Description |
| :--- | :---: | :---: | :--- |
| **Joy** | 😄 | Amber / Gold | Optimism, happiness, elation, delight |
| **Love** | ❤️ | Rose / Pink | Affection, warmth, gratitude, heartfelt connection |
| **Surprise** | 😲 | Purple | Astonishment, unexpected wonder, curiosity |
| **Sadness** | 😢 | Sky Blue | Melancholy, grief, vulnerability, longing |
| **Fear** | 😨 | Indigo | Apprehension, worry, anxiety, suspense |
| **Anger** | 😡 | Crimson | Frustration, irritation, resentment |

---

## 🚀 Key Features

- **Deep Learning BiGRU Model**: Sequence classification neural network with custom word embedding and post-padded sequences.
- **FastAPI Backend**: Fast, asynchronous REST API with Pydantic v2 schemas and validation.
- **Modern Interactive UI**: Responsive glassmorphism interface featuring dynamic mood ambient glows, real-time confidence gauges, audio feedback, preset prompt chips, and history storage.
- **Vercel Deploy Ready**: Configured with `vercel.json` for serverless deployment on Vercel.
- **Interactive Documentation**: Auto-generated interactive Swagger UI (`/docs`) and ReDoc (`/redoc`).

---

## 📁 Project Structure

```text
Emotion-Prediction-Project/
├── Artifacts/
│   ├── BiGRU_model.keras       # Trained Bidirectional GRU Keras model (~41.5 MB)
│   └── tokenizer.pkl           # Keras text tokenizer (~607 KB)
├── assets/
│   ├── emotion_output_joy.png      # Output preview 1 (Joy)
│   └── emotion_output_sadness.png  # Output preview 2 (Sadness)
├── static/
│   ├── app.js                  # Frontend logic & API interaction
│   ├── index.html              # Web interface
│   └── style.css               # Glassmorphism design system & styles
├── .gitignore                  # Git exclusions (caches, virtualenvs, Project_activ.txt)
├── main.py                     # FastAPI server & inference endpoints
├── requirements.txt            # Python dependencies
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # Project documentation
```

---

## 🛠️ Local Setup & Execution

### Prerequisites
- **Python 3.11** installed
- Git

### 1. Clone or Open the Repository
```bash
cd "Emotion Prediction Project"
```

### 2. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
py -3.11 -m venv emotionpredictionenv
.\emotionpredictionenv\Scripts\activate
```

**Linux / macOS:**
```bash
python3.11 -m venv emotionpredictionenv
source emotionpredictionenv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Development Server
```bash
uvicorn main:app --reload
```
Or run directly:
```bash
python main.py
```

Open your browser and visit:
- **Interactive UI**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 📡 API Endpoints

### 1. Predict Emotion
```http
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "I was totally speechless when they announced our team won first place!"
}
```

**Response (200 OK):**
```json
{
  "text": "I was totally speechless when they announced our team won first place!",
  "predicted_emotion": "surprise",
  "confidence": 0.8924,
  "all_probabilities": {
    "sadness": 0.0081,
    "joy": 0.0712,
    "love": 0.0125,
    "anger": 0.0043,
    "fear": 0.0115,
    "surprise": 0.8924
  }
}
```

---

### 2. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "Server is healthy and running",
  "model_loaded": true
}
```

---

## ☁️ Deploying to Vercel

The project includes `vercel.json` configured for Python serverless deployment on Vercel.

### Method : Deploy via Vercel Dashboard (Git Integration)

1. Push your project to **GitHub** or **GitLab**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New... > Project"**.
3. Import your repository.
4. Vercel automatically detects `vercel.json` and Python configuration.
5. Click **"Deploy"**.

### Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

> **Note on Serverless Functions**: Vercel serverless has a function bundle limit of 250 MB uncompressed. Standard TensorFlow CPU builds are large; if Vercel warns about serverless function package size during build, ensure `requirements.txt` only includes necessary lightweight packages (`tensorflow-cpu`, `fastapi`, `uvicorn`, `pydantic`).

---

## 🧠 Model Architecture

```mermaid
graph LR
    Input["Input Text"] --> Clean["Text Cleaning<br>(Lower, Regex Filter)"]
    Clean --> Tok["Tokenizer<br>(Sequence of IDs)"]
    Tok --> Pad["Padding<br>(max_length = 50)"]
    Pad --> BiGRU["BiGRU Neural Network"]
    BiGRU --> Softmax["Softmax Probabilities<br>(6 Classes)"]
    Softmax --> Output["Predicted Emotion + Confidence"]
```
