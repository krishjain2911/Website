// TODO: move to env/DB
// Hardcoded credentials for initial administrative access.
// Only the scrypt-derived hash and salt are committed.
export const ADMIN_CREDENTIALS = {
  email: 'admin@rhsp.solutions',
  salt: '808f1e898c668cfc81ea3d6680831fd4',
  hash: '2ca38d821f3a2b6c4776495124aa0acf69ee6088dfc735969544c98d8f367ad47858b60dd9e08eafa419fec001f1b9365b83105997156c3f8ea9aec8f35115f5',
  keyLength: 64
};
