/** English strings. The source of truth for keys: `fr.ts` must have the same shape. */
export const en = {
  appName: 'DailyFund',
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    undo: 'Undo',
  },
  tabs: {
    today: 'Today',
    transactions: 'Transactions',
    settings: 'Settings',
  },
  setup: {
    step: 'Step {{step}} of {{total}}',
    incomeTitle: 'Where does your money come from?',
    incomeIntro: 'Your main income sets the period: your budget runs from one payday to the next.',
    mainIncome: 'Main income (net)',
    payDay: 'Received on',
    savings: 'Savings set aside each month',
    otherIncomes: 'Other regular income (optional)',
    otherIncomesHint: 'Added to your reserve on their day.',
    continue: 'Continue',
    moneyTitle: 'Your bills and your money',
    fixedCharges: 'Fixed monthly charges',
    fixedChargesHint:
      'Set aside on each payday, so your daily budget only covers everyday spending.',
    currentMoney: 'How much is on your account now?',
    chargesPaid: 'Are this month’s charges already paid?',
    yes: 'Yes',
    notYet: 'Not yet',
    previewIntro: 'That makes',
    previewPerDay: '{{amount}} per day',
    previewUntil_one: 'until {{date}} ({{count}} day)',
    previewUntil_other: 'until {{date}} ({{count}} days)',
    start: 'Start',
    errors: {
      mainIncome: 'Enter your main income.',
      currentMoney: 'Enter how much you have now (negative if overdrawn).',
    },
  },
  items: {
    name: 'Name',
    amount: 'Amount',
    day: 'Day',
    dayOfMonth: 'Day {{day}} of the month',
    dayOfMonth_first: 'Day 1 of the month',
    lastDayHint: '31 = last day of the month',
    previousDay: 'Previous day',
    nextDay: 'Next day',
    addIncome: 'Add an income',
    addCharge: 'Add a charge',
    errors: {
      name: 'Enter a name.',
      amount: 'Enter a valid amount.',
    },
  },
  transactionErrors: {
    'not-set-up': 'Set up your budget first.',
    'zero-amount': 'Enter an amount other than 0.',
    'future-date': "The date can't be in the future.",
  },
  reminder: {
    channel: 'Daily reminder',
    title: 'DailyFund',
    body: '{{left}} left today. Logged your expenses?',
  },
};

/** Same keys as `en`, any string values. */
export type Translations = { [K in keyof typeof en]: DeepStrings<(typeof en)[K]> };
type DeepStrings<T> = T extends string ? string : { [K in keyof T]: DeepStrings<T[K]> };
