
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

app.mount("/", StaticFiles(directory="astraai-ui/frontend/build", html=True), name="static")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join("astraai-ui/frontend/build", full_path)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return FileResponse("astraai-ui/frontend/build/index.html")
