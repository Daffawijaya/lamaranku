const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const moduleExports = {};
const code = ts.transpileModule(fs.readFileSync('lib/supabase/avatar.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
new Function('exports', code)(moduleExports);
test('Profile avatar signs only the owner folder and retains a safe OAuth fallback', async () => {
  const calls = [];
  const client = { storage: { from(bucket) { return { async createSignedUrl(path, expires) { calls.push({ bucket, path, expires }); return { data: { signedUrl: 'https://example.test/signed-avatar' } }; } }; } } };
  assert.equal(await moduleExports.profileAvatar(client, { id: 'owner', user_metadata: { avatar_path: 'owner/avatar.jpg' } }), 'https://example.test/signed-avatar');
  assert.deepEqual(calls, [{ bucket: 'profile-avatars', path: 'owner/avatar.jpg', expires: 86400 }]);
  assert.equal(await moduleExports.profileAvatar(client, { id: 'owner', user_metadata: { avatar_path: 'other/avatar.jpg', avatar_url: 'https://example.test/oauth.jpg' } }), 'https://example.test/oauth.jpg');
  assert.equal(calls.length, 1);
  assert.equal(await moduleExports.profileAvatar(client, { id: 'owner', user_metadata: { avatar_url: 'data:image/jpeg;base64,large' } }), '');
});
