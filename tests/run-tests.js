const testFiles = [
  "./routing.test",
  "./finance.test",
  "./scoring.test",
  "./events.test",
  "./achievements.test"
];

testFiles.forEach(testFile => require(testFile));

if (process.exitCode) {
  process.exit(process.exitCode);
}
