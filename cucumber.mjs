export default {
  requireModule: ['tsx/cjs'],
  require: ['features/support/**/*.ts', 'features/step_definitions/**/*.ts'],
  format: ['progress-bar', 'html:reports/cucumber-report.html', 'junit:reports/junit.xml'],
  formatOptions: { snippetInterface: 'async-await' },
  parallel: 2,
  retry: 0,
};
