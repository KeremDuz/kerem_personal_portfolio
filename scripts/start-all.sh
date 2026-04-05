#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"
mkdir -p "$RUN_DIR"

FRONTEND_PORT=3000
BACKEND_PORT=5000
CREWAI_PORT=8010
CREWAI_ENV_FILE="$ROOT_DIR/.env.crewai.local"

port_open() {
	local port="$1"
	timeout 1 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/${port}" >/dev/null 2>&1
}

start_service() {
	local name="$1"
	local port="$2"
	local command="$3"
	local pid_file="$RUN_DIR/${name}.pid"
	local log_file="$RUN_DIR/${name}.log"

	if port_open "$port"; then
		echo "[SKIP] ${name}: :${port} zaten açık"
		return 0
	fi

	echo "[START] ${name} başlatılıyor..."
	nohup bash -lc "$command" >"$log_file" 2>&1 &
	echo $! >"$pid_file"

	for _ in {1..30}; do
		if port_open "$port"; then
			echo "[OK] ${name}: :${port} aktif"
			return 0
		fi
		sleep 1
	done

	echo "[ERR] ${name}: :${port} açılmadı. Log: $log_file"
	tail -n 30 "$log_file" || true
	return 1
}

if [[ -z "${OPENAI_API_KEY:-}" && -f "$CREWAI_ENV_FILE" ]]; then
	set -a
	source "$CREWAI_ENV_FILE"
	set +a
	echo "[INFO] OPENAI_API_KEY .env.crewai.local dosyasından yüklendi"
fi

start_service \
	"frontend" \
	"$FRONTEND_PORT" \
	"cd '$ROOT_DIR/frontend' && npm run dev"

start_service \
	"backend" \
	"$BACKEND_PORT" \
	"cd '$ROOT_DIR/backend' && npm run dev"

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
	echo "[WARN] OPENAI_API_KEY yok. CrewAI API başlatılmadı."
	echo "       Ya ortam değişkeni verin ya da $CREWAI_ENV_FILE dosyası oluşturun."
else
	start_service \
		"crewai_api" \
		"$CREWAI_PORT" \
		"cd '$ROOT_DIR' && OPENAI_API_KEY='$OPENAI_API_KEY' '$ROOT_DIR/.venv-crewai/bin/uvicorn' app:app --app-dir '$ROOT_DIR/crewai_api' --host 0.0.0.0 --port $CREWAI_PORT"
fi

echo
echo "Servis URL'leri:"
echo "- Frontend : http://127.0.0.1:${FRONTEND_PORT}/tr"
echo "- Backend  : http://127.0.0.1:${BACKEND_PORT}/api/health"
echo "- CrewAI   : http://127.0.0.1:${CREWAI_PORT}/health"
echo
echo "Loglar: $RUN_DIR"
