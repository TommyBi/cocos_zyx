#!/usr/bin/env bash
set -euo pipefail
umask 077

app=/opt/tcjstory/apps/cocos-zyx
release=20261119-staging-v21-review-05
previous=20261119-staging-v21-preview
candidate="$app/releases/$release"
backup="/opt/tcjstory/backups/cocos-zyx-staging-$release"
image="cocos-zyx-staging:$release"
base="$app/server/docker-compose.staging.yml"
old_config="$app/releases/$previous/staging-image.override.yml"
new_config="$candidate/staging-image.override.yml"
service=cocos_zyx_api_staging
container=tcjstory-cocos-zyx-staging-cocos_zyx_api_staging-1
production=tcjstory-cocos-zyx-cocos_zyx_api-1
gateway=tcjstory-dawn-gateway-1
staging_health=https://staging-api.tcjstory.cn/v1/cocos-zyx/health
db=/app/data/game-staging.sqlite

test -s "$candidate/image-tests.log"
grep -Eq "^(# fail |ℹ fail )0$" "$candidate/image-tests.log"
mkdir "$backup"
docker inspect -f '{{.Id}} {{.Image}}' "$container" "$production" "$gateway" > "$backup/before-runtime.txt"
test "$(docker inspect -f '{{.Id}}' "$container")" = 1ebadab526d0b17c5decc6229a5785cfd990abc8f0f9747237f132a4d693d6a2
test "$(docker exec "$container" printenv DB_PATH)" = "$db"
test "$(docker compose -f "$base" -f "$new_config" config --services)" = "$service"
test "$(docker image inspect "$image" --format '{{.Id}}')" = "$(cat "$candidate/image-id.txt")"
test "$(docker image inspect "cocos-zyx-staging:$previous" --format '{{.Id}}')" = "sha256:3105e0f285935e01fb3274d684673bae93a0c2d1ffade100a76797aaa6613081"
docker save "cocos-zyx-staging:$previous" | gzip -1 > "$backup/previous-image.tar.gz"
gzip -t "$backup/previous-image.tar.gz"
cp "$old_config" "$backup/previous.override.yml"
cp "$base" "$backup/docker-compose.staging.yml"
install -m 600 "$app/server/.env.staging" "$backup/.env.staging"
if test -f "$app/staging-current-release.json"; then
  cp "$app/staging-current-release.json" "$backup/previous-pointer.json"
fi
cd "$candidate/server"
sha256sum package.json package-lock.json src/*.js > "$backup/expected-runtime.sha256"

rollback() {
  echo 'Staging smoke checks failed. Restoring the preceding image.' >&2
  docker compose -f "$base" -f "$old_config" up -d --no-deps --no-build "$service"
}
trap rollback ERR
docker compose -f "$base" -f "$old_config" stop "$service"
docker cp "$container:$db" "$backup/before.sqlite"
chmod 600 "$backup/before.sqlite"
sha256sum "$backup/before.sqlite" > "$backup/before.sqlite.sha256"
docker compose -f "$base" -f "$new_config" up -d --no-deps --no-build "$service"

for attempt in {1..12}; do
  if curl -fsS --max-time 3 "$staging_health" > "$backup/health.json" &&
     grep -q '"apiVersion":26' "$backup/health.json" &&
     grep -q 'short-opening-v21' "$backup/health.json"; then
    break
  fi
  sleep 2
done
grep -q '"apiVersion":26' "$backup/health.json"
grep -q 'short-opening-v21' "$backup/health.json"
docker cp "$container:$db" "$backup/after.sqlite"
chmod 600 "$backup/after.sqlite"
docker run --rm --network none -v "$backup:/audit:ro" --entrypoint node "$image" src/databaseAudit.js /audit/before.sqlite /audit/after.sqlite | tee "$backup/db-audit.json"
docker run --rm -i --network none -v "$backup:/audit:ro" --entrypoint node "$image" - <<'NODE' | tee "$backup/db-full-audit.json"
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');

function fingerprint(db) {
  const query = sql => db.exec(sql)[0]?.values || [];
  assert.deepEqual(query('PRAGMA integrity_check'), [['ok']]);
  const schema = query("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY type, name");
  const tables = Object.fromEntries(schema.filter(([type]) => type === 'table').map(([, name]) => {
    const rows = query('SELECT * FROM "' + name.replace(/"/g, '""') + '"').map(row => JSON.stringify(row)).sort();
    return [name, { rows: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') }];
  }));
  return { schema, tables, userVersion: query('PRAGMA user_version')[0][0] };
}

require('sql.js')().then(SQL => {
  const before = fingerprint(new SQL.Database(fs.readFileSync('/audit/before.sqlite')));
  const after = fingerprint(new SQL.Database(fs.readFileSync('/audit/after.sqlite')));
  assert.deepEqual(after, before);
  console.log(JSON.stringify({ preserved: true, tables: after.tables, schemaVersion: after.userVersion }));
}).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
NODE
docker exec "$container" sh -c 'cd /app && sha256sum package.json package-lock.json src/*.js' | tee "$backup/actual-runtime.sha256"
diff -u "$backup/expected-runtime.sha256" "$backup/actual-runtime.sha256"
docker inspect -f '{{.Id}} {{.Image}}' "$container" "$production" "$gateway" | tee "$backup/after-runtime.txt"
diff -u <(tail -n 2 "$backup/before-runtime.txt") <(tail -n 2 "$backup/after-runtime.txt")
cat "$backup/health.json"
echo
echo "Staging snapshot and runtime verified. Backup: $backup"
trap - ERR
