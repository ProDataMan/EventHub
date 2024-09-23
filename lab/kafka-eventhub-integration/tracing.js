const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const appInsights = require('applicationinsights');

// Initialize Application Insights
appInsights.setup('INSTRUMENTATION_KEY')
  .setAutoCollectConsole(true, true)
  .setSendLiveMetrics(true)
  .start();

// Set up OpenTelemetry diagnostics
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  traceExporter: new appInsights.TelemetryClient(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();