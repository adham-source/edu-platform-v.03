import session from 'express-session';
import Keycloak from 'keycloak-connect';

import { KeycloakConfig } from 'keycloak-connect';

// Use a memory store for sessions, suitable for development
const memoryStore = new session.MemoryStore();

const keycloakConfig: KeycloakConfig = {
  "auth-server-url": process.env.KEYCLOAK_URL || 'http://localhost:8080',
  "realm": process.env.KEYCLOAK_REALM || 'master',
  "resource": process.env.KEYCLOAK_CLIENT_ID || 'admin-cli',
  "bearer-only": true,
  "ssl-required": "none", // For development
  "confidential-port": 0,
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export const sessionMiddleware = session({
  secret: 'some-secret-string-you-should-change',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
});

export default keycloak;
