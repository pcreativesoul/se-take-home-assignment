const OrderController = require('../src/OrderController');

jest.useFakeTimers();

describe('OrderController', () => {
  let controller;
  let mockLogger;

  beforeEach(() => {
    mockLogger = jest.fn();
    controller = new OrderController(mockLogger);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('Order numbers should be unique and increasing', () => {
    const o1 = controller.addNormalOrder();
    const o2 = controller.addVipOrder();
    const o3 = controller.addNormalOrder();

    expect(o1.id).toBe(1);
    expect(o2.id).toBe(2);
    expect(o3.id).toBe(3);
  });

  test('VIP orders should be processed before Normal orders', () => {
    // Add orders when no bots are available
    controller.addNormalOrder();
    controller.addNormalOrder();
    controller.addVipOrder(); // id: 3

    // Add a bot
    const bot = controller.addBot();

    // Bot should pick up the VIP order first
    expect(bot.state).toBe('PROCESSING');
    expect(bot.order.id).toBe(3);
    expect(bot.order.type).toBe('VIP');
  });

  test('When no more orders, bot should become IDLE', () => {
    controller.addNormalOrder();
    const bot = controller.addBot();

    expect(bot.state).toBe('PROCESSING');

    // Fast-forward 10 seconds
    jest.advanceTimersByTime(10000);

    // No more orders in queue
    expect(bot.state).toBe('IDLE');
    expect(bot.order).toBeNull();
  });

  test('Removing newest bot returns order to front of respective queue', () => {
    controller.addNormalOrder(); // id: 1
    controller.addNormalOrder(); // id: 2

    // Bot 1 picks up Normal order 1
    const bot1 = controller.addBot();
    expect(bot1.order.id).toBe(1);

    // VIP order 3 is added
    controller.addVipOrder(); // id: 3

    // Bot 2 picks up VIP order 3
    const bot2 = controller.addBot();
    expect(bot2.order.id).toBe(3);

    // Bot 3 picks up Normal order 2
    const bot3 = controller.addBot();
    expect(bot3.order.id).toBe(2);

    // Remove newest bot (Bot 3, processing Normal order 2)
    const removedBot = controller.removeBot();
    expect(removedBot.id).toBe(3);

    // Normal order 2 should be back at the front of normalQueue
    expect(controller.normalQueue[0].id).toBe(2);

    // Remove newest bot (Bot 2, processing VIP order 3)
    const removedBot2 = controller.removeBot();
    expect(removedBot2.id).toBe(2);

    // VIP order 3 should be back at the front of vipQueue
    expect(controller.vipQueue[0].id).toBe(3);

    // Bot 1 completes its order
    jest.advanceTimersByTime(10000);

    // Bot 1 should now pick up the VIP order 3 because it was returned to the queue
    expect(bot1.order.id).toBe(3);
  });
});
