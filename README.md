# DailyFund

Turns the money left until your next payday into a **daily spending budget**, tracks what you spend, and carries any
surplus or overspending forward.

One TypeScript codebase ([Expo](https://expo.dev) + React Native):

- **Android**: native app (APK), with home-screen widget and daily reminder.
- **iPhone**: installable web app (open the link in Safari → Share → Add to Home Screen).

The previous Kotlin Android prototype is kept in tag [`v0.1.0`](../../tree/v0.1.0).

## Getting started

Requires Node.js 22.

```bash
npm ci
npm run web        # web app in the browser
npm run android    # builds and installs the Android app (needs Android Studio's SDK and JDK 17)
```

The Android app uses native code (widget, notifications), so it doesn't run in Expo Go: `npm run android`
builds it locally (`android/` is generated and not committed).

| Script              | What it does                    |
| ------------------- | ------------------------------- |
| `npm run android`   | Build and run on Android        |
| `npm run web`       | Start and open in the browser   |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript check                |
| `npm test`          | Jest unit tests                 |
| `npm run format`    | Format everything with Prettier |

## Project structure

```
src/
  app/        screens and layouts (Expo Router: one file = one route)
  domain/     pure budget logic, no React/Expo imports, fully unit-tested
  store/      app state and persistence
  i18n/       translations (fr, en)
  platform/   Android-only features (widget, reminders), isolated per platform
  ui/         shared components and theme
```

## Contributing

- `main` holds releases (tagged `vX.Y.Z`), `develop` is the integration branch.
- Each change gets its own branch off `develop` (`feature/…`, `fix/…`, `chore/…`, `docs/…`) and is merged
  back through a pull request; CI must pass.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `chore:`, …).
