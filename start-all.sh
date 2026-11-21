#!/bin/bash
# Demarrage de tous les services Onyx (patterns detaches testes)
# NB: ne lance un service que si son port est libre.

env_file=/tmp/onyx-env.txt
[ -f "$env_file" ] || cat > "$env_file" <<'EOF'
ONYX_REDIS_URL=redis://127.0.0.1:6379/1
ONYX_OPENSEARCH_HOST=http://127.0.0.1:9200
ONYX_POSTGRES_URI=postgresql://postgres@127.0.0.1:5432/postgres
EOF

# 1. Postgres (pgserver python)
if ! ss -tln | grep -q 5432; then
  ( setsid bash -c 'cd /home/z/onyx-services && nohup /home/z/pgenv/bin/python -c "import pgserver; pgserver.get_server('"'"'/home/z/onyx-services/pgdata'"'"')" > /tmp/pg-run.log 2>&1' & )
  sleep 8
fi

# 2. Redis
if ! ss -tln | grep -q 6379; then
  ( setsid bash -c 'cd /home/z/onyx-services/redis && nohup ./bin/redis-server --port 6379 --save "" --appendonly no --maxmemory 128mb --maxmemory-policy noeviction > /tmp/redis-run.log 2>&1' & )
  sleep 3
fi

# 3. OpenSearch (heap 512m pour laisser la memoire au frontend)
if ! curl -s -m 3 http://localhost:9200 | grep -q tagline; then
  ( setsid bash -c 'cd /home/z/onyx-services/opensearch && OPENSEARCH_JAVA_OPTS="-Xms512m -Xmx512m" nohup ./bin/opensearch > /tmp/os-run.log 2>&1' & )
  sleep 45
fi

# 4. Backend API TS (bun) :8080
if ! ss -tln | grep -q 8080; then
  ( setsid bash -c "cd /home/z/my-project/mini-services/onyx-ts && exec env \$(cat $env_file | tr '\n' ' ') nohup bun run src/index.ts >> /tmp/onyx-ts-run.log 2>&1" & )
  sleep 6
fi

# 5. Worker (bun)
if ! pgrep -f "src/worker.ts" > /dev/null; then
  ( setsid bash -c "cd /home/z/my-project/mini-services/onyx-ts && exec env \$(cat $env_file | tr '\n' ' ') nohup bun run src/worker.ts >> /tmp/onyx-worker.log 2>&1" & )
  sleep 3
fi

# 6. Frontend Next.js :3000 (turbopack, heap 1536m — NE PAS compiler avec d'autres gros services actifs)
if ! ss -tln | grep -q 3000; then
  ( setsid bash -c 'cd /home/z/onyx/web && MALLOC_ARENA_MAX=2 NODE_OPTIONS=--max-old-space-size=1536 nohup node node_modules/next/dist/bin/next dev -p 3000 > /home/z/my-project/dev.log 2>&1' & )
  sleep 15
fi

echo "=== STATUS ==="
ss -tln | grep -E '5432|6379|9200|8080|3000'
pgrep -f "src/worker.ts" > /dev/null && echo "worker: up" || echo "worker: DOWN"
curl -s -m 5 http://localhost:8080/version
echo ""
