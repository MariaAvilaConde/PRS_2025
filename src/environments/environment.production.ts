export const environment = {
  production: true,
  apiUrl: 'https://lab.vallegrande.edu.pe/jass',

  // Microservicios - URLs reales
  services: {
    gateway: 'https://lab.vallegrande.edu.pe/jass/ms-gateway',
    authentication: 'https://auth.sistemajass.com',
    users: 'https://users.sistemajass.com',
    organizations: 'https://orgs.sistemajass.com',
    waterQuality: 'https://water.sistemajass.com',
    paymentsBilling: 'https://billing.sistemajass.com',
    inventoryPurchases: 'https://inventory.sistemajass.com',
    infrastructure: 'https://infra.sistemajass.com',
    distribution: 'https://distribution.sistemajass.com',
    claimsIncidents: 'https://claims.sistemajass.com'
  },

  // Keycloak - Producción
  keycloak: {
    url: 'https://auth.sistemajass.com',
    realm: 'jass-multiempresa',
    clientId: 'vg-web-frontend'
  },

  // Configuración de seguridad
  security: {
    tokenRefreshTime: 5 * 60 * 1000,
    sessionTimeout: 30 * 60 * 1000,
    enableAuditLog: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    sanitizePayloads: true,           // Nueva propiedad para controlar la sanitización
    hideConsoleLogsInProduction: true, // Nueva propiedad para ocultar logs en producción
    logLevel: 'error'                 // Solo mostrar errores en producción
  },

  // Features flags
  features: {
    multiOrganization: true,
    reportTemplates: true,
    advancedSecurity: true,
    realTimeNotifications: true
  }
};
