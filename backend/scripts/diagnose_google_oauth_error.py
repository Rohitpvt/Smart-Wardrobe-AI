import json
import os

def main():
    artifact_path = os.path.join(os.path.dirname(__file__), "..", "artifacts", "GOOGLE_LATEST_TOKEN_ERROR.json")
    
    if not os.path.exists(artifact_path):
        print(f"Error: {artifact_path} not found.")
        print("Please run the Google Login flow once to generate this file.")
        return

    try:
        with open(artifact_path, "r") as f:
            debug_info = json.load(f)
    except Exception as e:
        print(f"Failed to read JSON: {e}")
        return

    print("--- GOOGLE OAUTH AUTO-DIAGNOSIS ---")
    print(f"Timestamp: {debug_info.get('timestamp')}")
    print(f"Endpoint Context: {debug_info.get('endpoint_context')}")
    print(f"Exception Type: {debug_info.get('exception_type')}")
    print(f"Exception Message: {debug_info.get('exception_message')}")
    print("-" * 35)

    exception_message = str(debug_info.get("exception_message", "")).lower()
    aud_matches = debug_info.get("aud_matches_backend")
    token_segments = debug_info.get("token_segments")

    if aud_matches is False:
        print("Diagnosis:")
        print("Google OAuth Client ID mismatch. Fix NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID.")
    elif "used too early" in exception_message:
        print("Diagnosis:")
        print("System clock skew detected. Sync Windows time and retry.")
    elif "expired" in exception_message:
        print("Diagnosis:")
        print("Expired Google credential. Clear cookies/cache and retry.")
    elif any(term in exception_message for term in ["certificate", "ssl", "timeout", "connection"]):
        print("Diagnosis:")
        print("Backend cannot validate Google certificates. Check internet, VPN, proxy, certifi, or firewall.")
    elif token_segments != 3:
        print("Diagnosis:")
        print("Frontend is not sending a valid Google ID token.")
    else:
        print("Diagnosis:")
        print("Unknown Google token verification failure. Inspect exception_message.")

if __name__ == "__main__":
    main()
