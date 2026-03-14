# Contributing to Realize Together

## Pflichtregeln für jeden neuen Code

### Jede neue Komponente braucht:
- Unit Test in `tests/unit/components/`
- Abdeckung: Rendering, Props, User Interaction

### Jede neue Page braucht:
- Unit Test in `tests/unit/pages/` (Rendering, Key Elements)
- E2E Test in `tests/e2e/` falls sie eine Route ist

### Jede neue Server Action braucht:
- Unit Test in `tests/unit/actions/`

### Checkliste vor jedem Commit:
- [ ] Tests für neuen Code geschrieben
- [ ] `npx tsc --noEmit` — keine TypeScript Fehler
- [ ] `npm run lint` — keine Lint-Fehler
- [ ] `npm run test:unit` — alle Unit Tests grün
- [ ] Husky pre-commit läuft automatisch durch

### Checkliste vor jedem Push:
- [ ] `npm run test:e2e` — alle E2E Tests grün
- [ ] Husky pre-push läuft automatisch durch
