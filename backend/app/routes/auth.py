from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_token
from app.models.user import new_user_doc
from app.config.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])
bearer = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest):
    db = get_db()
    if db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = new_user_doc(data.email, hash_password(data.password), data.name)
    result = db.users.insert_one(doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "email": data.email.lower(), "name": data.name})
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "name": data.name, "email": data.email.lower()},
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    db = get_db()
    user = db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"], "name": user["name"]})
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "name": user["name"], "email": user["email"]},
    )


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user
