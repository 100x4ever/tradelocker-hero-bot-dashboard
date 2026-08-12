import { tradeLockerService } from './tradeLockerService.js';

async function runTest() {
  console.log('--- TESTING LIVE TRADELOCKER SYNC ---');
  const auth = await tradeLockerService.authenticate();
  console.log('AUTH SUCCESS:', auth.success);

  if (auth.success) {
    const accounts = await tradeLockerService.fetchAccounts();
    console.log('LIVE ACCOUNTS FETCHED:', JSON.stringify(accounts, null, 2));

    const positions = await tradeLockerService.fetchOpenPositions('812189');
    console.log('LIVE OPEN POSITIONS FETCHED:', JSON.stringify(positions, null, 2));
  }
}

runTest();
