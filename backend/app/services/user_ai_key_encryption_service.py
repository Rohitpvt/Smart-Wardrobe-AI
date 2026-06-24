import base64
import logging
from cryptography.fernet import Fernet, InvalidToken
from app.core.config import settings

logger = logging.getLogger(__name__)

class UserAIKeyEncryptionService:
    def __init__(self):
        self.secret = settings.USER_AI_KEY_ENCRYPTION_SECRET
        if not self.secret:
            logger.warning("USER_AI_KEY_ENCRYPTION_SECRET is not set. API key encryption will fail.")
            self.fernet = None
        else:
            try:
                self.fernet = Fernet(self.secret.encode('utf-8'))
            except ValueError as e:
                logger.error(f"Invalid USER_AI_KEY_ENCRYPTION_SECRET: {e}")
                self.fernet = None

    def encrypt_key(self, plain_key: str) -> str:
        if not self.fernet:
            raise RuntimeError("Encryption service is not configured with a valid secret.")
        return self.fernet.encrypt(plain_key.encode('utf-8')).decode('utf-8')

    def decrypt_key(self, encrypted_key: str) -> str:
        if not self.fernet:
            raise RuntimeError("Encryption service is not configured with a valid secret.")
        try:
            return self.fernet.decrypt(encrypted_key.encode('utf-8')).decode('utf-8')
        except InvalidToken:
            raise ValueError("Failed to decrypt the API key. It may be corrupted or the secret changed.")

    @staticmethod
    def create_fingerprint(plain_key: str) -> str:
        if not plain_key or len(plain_key) < 10:
            return "****"
        return f"{plain_key[:4]}...{plain_key[-4:]}"

# Singleton instance
encryption_service = UserAIKeyEncryptionService()
