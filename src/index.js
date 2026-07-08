const readline = require('readline');
const OrderController = require('./OrderController');

const controller = new OrderController();

// Check if running in interactive mode
const args = process.argv.slice(2);
const isInteractive = args.includes('--interactive');

if (isInteractive) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("McDonald's Order Controller (Interactive Mode)");
  console.log("Commands: add-normal, add-vip, add-bot, remove-bot, exit");
  rl.prompt();

  rl.on('line', (input) => {
    const cmd = input.trim().toLowerCase();
    switch (cmd) {
      case 'add-normal':
        controller.addNormalOrder();
        break;
      case 'add-vip':
        controller.addVipOrder();
        break;
      case 'add-bot':
        controller.addBot();
        break;
      case 'remove-bot':
        controller.removeBot();
        break;
      case 'exit':
        rl.close();
        break;
      default:
        console.log("Unknown command. Valid commands: add-normal, add-vip, add-bot, remove-bot, exit");
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log("Exiting...");
    process.exit(0);
  });
} else {
  // Simulation mode for GitHub Actions
  console.log("Running Simulation Mode...");

  // Step 1: Add some orders
  controller.addNormalOrder();
  controller.addVipOrder();

  // Step 2: Add a bot to process the VIP order
  controller.addBot();

  // Step 3: Add another bot to process a normal order
  setTimeout(() => {
    controller.addBot();
  }, 1000);

  // Step 4: Remove a bot while it's processing
  setTimeout(() => {
    controller.removeBot();
  }, 3000);

  // Give enough time for the bots to complete their 10-second orders
  setTimeout(() => {
    console.log("Simulation complete.");
    process.exit(0);
  }, 15000);
}
