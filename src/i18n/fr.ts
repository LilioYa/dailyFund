import type { Translations } from './en';

export const fr: Translations = {
  appName: 'DailyFund',
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    undo: 'Annuler',
  },
  transactionErrors: {
    'not-set-up': 'Configure d’abord ton budget.',
    'zero-amount': 'Entre un montant différent de 0.',
    'future-date': 'La date ne peut pas être dans le futur.',
  },
  reminder: {
    title: 'DailyFund',
    body: 'Il te reste {{left}} aujourd’hui. Dépenses notées ?',
  },
};
