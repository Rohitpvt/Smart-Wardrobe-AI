# Troubleshooting

## AI Analysis Returns Error

### NVIDIA 401/403 — Authentication Failed
- Verify `NVIDIA_API_KEY` is set correctly in `backend/.env`
- Ensure the key starts with `nvapi-` and was generated at [build.nvidia.com](https://build.nvidia.com)
- Do NOT wrap the key in extra quotes beyond the `.env` format

### NVIDIA 429 — Quota/Rate Limit
- The NVIDIA API key has exceeded its rate limit or credits
- Wait and retry, or check your NVIDIA account billing/credits at [build.nvidia.com](https://build.nvidia.com)
- As a temporary workaround, set `AI_PROVIDER=mock` in `backend/.env`

### NVIDIA 400 — Bad Request / Model Error
- The configured `NVIDIA_MODEL` may not support vision/image input
- Ensure you are using a vision-capable model (e.g. `meta/llama-3.2-11b-vision-instruct`)
- Check the model availability at [build.nvidia.com](https://build.nvidia.com)

### 502 Bad Gateway — AI Response Parse Error
- The model returned text that could not be parsed as valid JSON
- This can happen if the model wraps its response in markdown or adds extra commentary
- The backend strips markdown fences automatically, but unusual formatting may still fail
- Try a different `NVIDIA_MODEL` or set `AI_PROVIDER=mock` for testing

### Gemini Provider (DEPRECATED)
- `AI_PROVIDER=gemini` is no longer supported
- Setting it will return a clear deprecation error
- Switch to `AI_PROVIDER=nvidia` or `AI_PROVIDER=mock`

## S3 Upload Fails
- Verify `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_S3_BUCKET_NAME` are correct
- Ensure the IAM user has `s3:PutObject` and `s3:GetObject` permissions on the bucket
- Check CORS configuration on the S3 bucket allows `http://localhost:3000`

## Frontend Cannot Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local` points to the running backend (e.g. `http://localhost:8000/api/v1`)
- Verify `CORS_ORIGINS` in `backend/.env` includes the frontend origin
