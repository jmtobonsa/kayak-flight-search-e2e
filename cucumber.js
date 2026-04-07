module.exports = {
  default: {
    paths: ["src/features/**/*.feature"],
    requireModule: ["tsx"],
    require: ["src/step-definitions/**/*.ts", "src/support/**/*.ts"],
    format: [
      "progress-bar",
      ["html", "reports/cucumber-report.html"],
      ["json", "reports/cucumber-report.json"],
    ],
    formatOptions: {
      snippetInterface: "async-await",
    },
    worldParameters: {
      baseUrl: "https://www.kayak.com.co",
      defaultTimeout: 30000,
    },
  },
};
