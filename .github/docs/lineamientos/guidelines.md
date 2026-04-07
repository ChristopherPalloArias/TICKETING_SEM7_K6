# 📋 QA and Performance Guidelines
# Version: 1.0.0

## 1. Code Standards

### Naming
- Metrics: snake_case -> `http_req_duration`
- Variables: camelCase -> `maxWaitTime`
- Constants: UPPER_SNAKE_CASE -> `MAX_VUS`

### Folder Structure
```
k6/
├── config/       <- env, options, thresholds
├── data/         <- test payload scenarios
├── lib/          <- reusable helpers and checks
├── reports/      <- exported metric reports
└── scenarios/    <- load testing scripts
```

## 2. API Standards
Test targets must expect standard REST conventions. Load scenarios should prioritize read-heavy (GET) or high-concurrent transactional endpoints (POST/PUT).

## 3. Security
- No hardcoded credentials (use environment variables)
- Pass tokens dynamically through `__ENV`.
