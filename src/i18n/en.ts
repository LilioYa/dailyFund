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
