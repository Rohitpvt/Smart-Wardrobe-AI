import re
from typing import Any

def sanitize_email(v: str) -> str:
    if not isinstance(v, str):
        raise ValueError("email_type")
    
    # Trim whitespace
    v = v.strip()
    
    # Check length
    if len(v) < 5 or len(v) > 254:
        raise ValueError("email_length")
        
    # Reject null bytes and control characters
    if re.search(r'[\x00-\x1F\x7F]', v):
        raise ValueError("email_invalid_chars")
        
    # Reject obvious HTML/Script payloads
    if "<script" in v.lower() or ">" in v or "<" in v:
        raise ValueError("email_invalid_chars")
        
    return v

def validate_password_security(v: str) -> str:
    if not isinstance(v, str):
        raise ValueError("password_type")
        
    if len(v) < 8 or len(v) > 128:
        raise ValueError("password_length")
        
    # Reject null bytes and control characters
    if re.search(r'[\x00-\x1F\x7F]', v):
        raise ValueError("password_invalid_chars")
        
    # Reject HTML/Script payloads
    if "<script" in v.lower() or "<" in v or ">" in v:
        raise ValueError("password_script_payload")
        
    # We still want to enforce strong password rules (from before)
    if not re.search(r"[A-Z]", v):
        raise ValueError("password_missing_upper")
    if not re.search(r"[a-z]", v):
        raise ValueError("password_missing_lower")
    if not re.search(r"[0-9]", v):
        raise ValueError("password_missing_number")
    if not re.search(r"[^a-zA-Z0-9]", v):
        raise ValueError("password_missing_special")
        
    return v

def sanitize_name(v: str | None) -> str | None:
    if v is None:
        return v
    if not isinstance(v, str):
        raise ValueError("name_type")
        
    # Trim whitespace
    v = v.strip()
    
    if not v:
        return None
        
    if len(v) > 80:
        raise ValueError("name_length")
        
    # Reject null bytes and control characters
    if re.search(r'[\x00-\x1F\x7F]', v):
        raise ValueError("name_invalid_chars")
        
    # Reject HTML tags
    if "<" in v or ">" in v:
        raise ValueError("name_invalid_chars")
        
    # Only allow safe characters (letters, numbers, spaces, hyphen, apostrophe, dot)
    if not re.match(r"^[\w\s\-\'\.]+$", v, re.UNICODE):
        raise ValueError("name_invalid_chars")
        
    return v
