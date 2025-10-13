import client from 'prom-client';

const register = new client.Registry();

// Collect default metrics like CPU, memory, etc.
client.collectDefaultMetrics({ register });

// Example custom metric
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000],
});

register.registerMetric(httpRequestDurationMicroseconds);

export default register;
