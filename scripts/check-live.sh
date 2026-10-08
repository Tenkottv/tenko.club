#!/usr/bin/env bash
# Verifies the live site: HTTPS home page with expected content, www and http redirects, privacy page.
# Usage: scripts/check-live.sh [origin]   (default https://tenko.club)
set -euo pipefail

origin="${1:-https://tenko.club}"
host="${origin#https://}"
fail=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    printf 'ok    %s\n' "$name"
  else
    printf 'FAIL  %s: expected %q, got %q\n' "$name" "$expected" "$actual"
    fail=1
  fi
}

fetch_status() { curl -sS --max-time 20 -o /dev/null -w '%{http_code}' "$1" || echo "unreachable"; }
fetch_redirect() { curl -sS --max-time 20 -o /dev/null -w '%{http_code} %{redirect_url}' "$1" || echo "unreachable"; }

home="$(curl -sS --max-time 20 "$origin/" || true)"
check "home page is served over HTTPS" "200" "$(fetch_status "$origin/")"
check "home page has the Tenko Club headline" "yes" "$(grep -q 'Built for the quiet hours.' <<<"$home" && echo yes || echo no)"
check "privacy notice is served" "200" "$(fetch_status "$origin/privacy.html")"
check "unknown pages return 404" "404" "$(fetch_status "$origin/this-page-does-not-exist")"
check "http redirects to https" "301 $origin/" "$(fetch_redirect "http://$host/")"
check "www redirects to the bare domain" "301 $origin/" "$(fetch_redirect "https://www.$host/")"

exit "$fail"
