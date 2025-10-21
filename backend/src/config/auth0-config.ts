import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { ManagementClient } from 'auth0';

// Auth0 configuration
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'your-client-secret',
  audience: process.env.AUTH0_AUDIENCE || 'https://your-api.com',
  issuer: process.env.AUTH0_ISSUER || `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'] as const,
};

// JWT middleware for protecting routes
export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${auth0Config.domain}/.well-known/jwks.json`
  }),
  audience: auth0Config.audience,
  issuer: auth0Config.issuer,
  algorithms: auth0Config.algorithms
});

// Auth0 Management API client
export const managementClient = new ManagementClient({
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  clientSecret: auth0Config.clientSecret,
  scope: 'read:users update:users create:users delete:users'
});

// Helper function to get user from Auth0
export const getAuth0User = async (userId: string) => {
  try {
    const user = await managementClient.users.get({ id: userId });
    return user.data;
  } catch (error) {
    console.error('Error fetching Auth0 user:', error);
    throw error;
  }
};

// Helper function to update user metadata in Auth0
export const updateAuth0UserMetadata = async (userId: string, metadata: any) => {
  try {
    const result = await managementClient.users.update(
      { id: userId },
      { user_metadata: metadata }
    );
    return result.data;
  } catch (error) {
    console.error('Error updating Auth0 user metadata:', error);
    throw error;
  }
};

// Helper function to get user roles from token
export const getUserRoles = (req: any): string[] => {
  const token = req.auth;
  if (!token) return [];
  
  // Extract roles from token claims
  const roles = token['https://your-app.com/roles'] || token.roles || [];
  return Array.isArray(roles) ? roles : [roles];
};

// Helper function to check if user has specific role
export const hasRole = (req: any, role: string): boolean => {
  const roles = getUserRoles(req);
  return roles.includes(role);
};