"""Verify identity with Supabase Auth, then resolve tenant under the user's RLS."""
from typing import Optional
import requests
from fastapi import Header, HTTPException
from config import settings

def _profile(authorization: Optional[str]):
    if not authorization or not authorization.startswith("Bearer ") or not authorization[7:].strip():
        raise HTTPException(status_code=401, detail="Bearer authentication required")
    base = settings.SUPABASE_URL.rstrip("/")
    key = settings.SUPABASE_KEY
    if not base.startswith("https://") or not key or key == "your-supabase-anon-key":
        raise HTTPException(status_code=503, detail="Authentication service not configured")
    headers = {"apikey": key, "Authorization": authorization}
    try:
        identity = requests.get(base + "/auth/v1/user", headers=headers, timeout=10)
        if identity.status_code in (401,403):
            raise HTTPException(status_code=401, detail="Invalid or expired access token")
        if identity.status_code != 200:
            raise HTTPException(status_code=503, detail="Authentication service unavailable")
        user = identity.json()
        if not isinstance(user,dict) or not isinstance(user.get("id"),str) or not user["id"]:
            raise HTTPException(status_code=401, detail="Invalid identity")
        profile = requests.get(base + "/rest/v1/users", headers=headers,
            params={"id": "eq." + user["id"], "select":"tenant_id,role"}, timeout=10)
        if profile.status_code != 200:
            raise HTTPException(status_code=503, detail="Tenant lookup unavailable")
        rows = profile.json()
        if not isinstance(rows,list) or len(rows)!=1 or not isinstance(rows[0],dict) or not rows[0].get("tenant_id"):
            raise HTTPException(status_code=403, detail="No authorized tenant")
        return rows[0]
    except (requests.RequestException, ValueError):
        raise HTTPException(status_code=503, detail="Authentication service unavailable")

def get_current_tenant_id(authorization: Optional[str] = Header(None),
                          x_test_tenant: Optional[str] = Header(None)) -> str:
    # Never trust client-supplied tenant hints, demo tokens, or anonymous fallback.
    return str(_profile(authorization)["tenant_id"])

def require_admin(authorization: Optional[str] = Header(None)) -> str:
    profile = _profile(authorization)
    if profile.get("role") not in ("ADMIN","SUPER_ADMIN"):
        raise HTTPException(status_code=403, detail="Administrator permission required")
    return str(profile["tenant_id"])
