FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000
# Seed demo data the first time the database is created
CMD ["sh", "-c", "[ -f /data/leadflow.db ] || python seed.py; uvicorn main:app --host 0.0.0.0 --port 8000"]
