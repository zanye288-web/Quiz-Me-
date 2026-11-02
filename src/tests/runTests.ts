import { runAllTests } from './domain.test';
import { runAscensionTests } from './ascension.test';
import { runSupabaseTests } from './supabase.test';

async function main() {
  const domainResults = runAllTests();
  const ascensionResults = runAscensionTests();
  const supabaseResults = await runSupabaseTests();

  const totalPassed = domainResults.passed + ascensionResults.passed + supabaseResults.passed;
  const totalFailed = domainResults.failed + ascensionResults.failed + supabaseResults.failed;

  console.log(`\n========================================`);
  console.log(`TOTAL TEST RESULTS: ${totalPassed} passed, ${totalFailed} failed.`);
  console.log(`========================================\n`);

  if (totalFailed > 0) {
    console.error(`Tests failed: ${totalFailed} failures.`);
    process.exit(1);
  } else {
    console.log(`All ${totalPassed} tests passed successfully!`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
