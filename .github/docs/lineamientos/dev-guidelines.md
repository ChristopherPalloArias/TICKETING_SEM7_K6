# 📋 Performance Development Guidelines
# Version: 1.0.0

## 1. General Principles
- Scripts must be self-contained and modular.
- Emphasize ES6+ JavaScript.
- Favor `scenarios` and target goals over arbitrary VU counts.

## 2. Configuration Strategy
- Do NOT hardcode credentials.
- Use `__ENV` for API URLs, Tokens, and Data seeds.
- Define explicit thresholds for metrics like `http_req_duration`, `http_req_failed`, etc.
