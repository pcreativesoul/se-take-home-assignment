class OrderController {
  constructor(logger = console.log) {
    this.vipQueue = [];
    this.normalQueue = [];
    this.bots = [];
    this.orderIdCounter = 1;
    this.botIdCounter = 1;
    this.logger = logger;
  }

  getTimestamp() {
    const now = new Date();
    // Return HH:MM:SS format
    return now.toTimeString().split(' ')[0];
  }

  log(msg) {
    this.logger(`[${this.getTimestamp()}] ${msg}`);
  }

  createOrder(type) {
    const order = {
      id: this.orderIdCounter++,
      type: type
    };
    return order;
  }

  addNormalOrder() {
    const order = this.createOrder('Normal');
    this.normalQueue.push(order);
    this.log(`New Normal Order #${order.id} placed in PENDING area.`);
    this.processPendingOrders();
    return order;
  }

  addVipOrder() {
    const order = this.createOrder('VIP');
    this.vipQueue.push(order);
    this.log(`New VIP Order #${order.id} placed in PENDING area.`);
    this.processPendingOrders();
    return order;
  }

  addBot() {
    const bot = {
      id: this.botIdCounter++,
      state: 'IDLE',
      order: null,
      timeoutId: null
    };
    this.bots.push(bot);
    this.log(`Bot #${bot.id} added.`);
    this.processPendingOrders();
    return bot;
  }

  removeBot() {
    if (this.bots.length === 0) {
      this.log(`No bots to remove.`);
      return null;
    }

    const bot = this.bots.pop();
    this.log(`Bot #${bot.id} removed.`);

    if (bot.state === 'PROCESSING' && bot.order) {
      clearTimeout(bot.timeoutId);
      this.log(`Bot #${bot.id} stopped processing Order #${bot.order.id}. Returning order to PENDING area.`);

      if (bot.order.type === 'VIP') {
        this.vipQueue.unshift(bot.order);
      } else {
        this.normalQueue.unshift(bot.order);
      }

      this.processPendingOrders();
    }

    return bot;
  }

  processPendingOrders() {
    // Find all idle bots and assign them orders if available
    const idleBots = this.bots.filter(b => b.state === 'IDLE');

    for (const bot of idleBots) {

      let orderToProcess = null;
      if (this.vipQueue.length > 0) {
        orderToProcess = this.vipQueue.shift();
      } else if (this.normalQueue.length > 0) {
        orderToProcess = this.normalQueue.shift();
      }

      if (orderToProcess) {
        this.assignOrderToBot(bot, orderToProcess);
      } else {
        // No more pending orders
        break;
      }
    }
  }

  assignOrderToBot(bot, order) {
    bot.state = 'PROCESSING';
    bot.order = order;
    this.log(`Bot #${bot.id} started processing ${order.type} Order #${order.id}.`);

    bot.timeoutId = setTimeout(() => {
      this.completeOrder(bot);
    }, 10000);
  }

  completeOrder(bot) {
    if (bot.state !== 'PROCESSING' || !bot.order) return;

    const order = bot.order;
    bot.state = 'IDLE';
    bot.order = null;
    bot.timeoutId = null;

    this.log(`Bot #${bot.id} completed ${order.type} Order #${order.id}. Moved to COMPLETE area.`);

    // pick up the next order
    this.processPendingOrders();
  }
}

module.exports = OrderController;
