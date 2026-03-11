# Angular 21+ Implementation Guidelines

This document defines the mandatory coding standards for this project. All contributors must follow these rules. Violations are **code-review blockers**.

---

## Table of Contents

1. [Framework Defaults](#1-framework-defaults)
2. [Code Organization Rules](#2-code-organization-rules)
3. [Component & Service Testing Requirements](#3-component--service-testing-requirements)
4. [Event Handling Rules](#4-event-handling-rules)
5. [Memory Management Rules](#5-memory-management-rules)
6. [Import Standards](#6-import-standards)
7. [TypeScript Configuration Rules](#7-typescript-configuration-rules)
8. [Dependency Management Rules](#8-dependency-management-rules)
9. [Change Detection Strategy](#9-change-detection-strategy)
10. [Code Review Failure Conditions](#10-code-review-failure-conditions)
11. [Styling & Design System Rules](#11-styling--design-system-rules)
12. [Dialog Dimension Standards](#12-dialog-dimension-standards)

---

## 1. Framework Defaults

**Standalone Components:**

- Do **NOT** explicitly declare `standalone: true` in component decorators. Standalone is the default in Angular 21.
- Omit it to reduce boilerplate.

---

## 2. Code Organization Rules

**Component files must contain only:**

- Component decorator
- Component class

**Mandatory component files (all four required):**

| File       | Purpose         |
| ---------- | --------------- |
| `.ts`      | Component logic |
| `.html`    | Template        |
| `.scss`    | Styling         |
| `.spec.ts` | Unit tests      |

**Models, Types, Enums, Constants must be in separate files:**

| Kind      | File suffix     |
| --------- | --------------- |
| Interface | `.model.ts`     |
| Type      | `.model.ts`     |
| Enum      | `.model.ts`     |
| Constant  | `.constants.ts` |

**Example:**

- `MenuItemWithRoles` → `app-layout.model.ts`
- `FULL_MENU` → `app-layout.constants.ts`

---

## 3. Component & Service Testing Requirements

- Every component and service **must** have a `.spec.ts` file.
- Deferred test creation is **forbidden**.
- Components/services without `.spec.ts` files **fail code review**.
- All tests must use **Vitest**. Jasmine and Karma are **not allowed**.
- All tests must be covered and passing before merging or release.

---

## 4. Event Handling Rules

- **NEVER** use constructor logic for event listeners.
- **NEVER** use imperative DOM event listeners (`document.addEventListener()`).
- **ALWAYS** use declarative host bindings in the component decorator:

```typescript
host: { '(document:keydown.escape)': 'close()' }
```

Angular handles unbinding automatically — no manual cleanup needed.

---

## 5. Memory Management Rules

- Every Observable subscription **MUST** use `takeUntilDestroyed(destroyRef)`.
- **ALWAYS** inject `DestroyRef` from `@angular/core`.
- **Never** manually call `.unsubscribe()`.

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private readonly destroyRef = inject(DestroyRef);

someObservable$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(…);
```

---

## 6. Import Standards

- **NEVER** import `CommonModule`.
- Import only the exact items needed (e.g. `ReactiveFormsModule`, `AsyncPipe`, individual directives).
- Keep imports minimal and explicit.

---

## 7. TypeScript Configuration Rules

With `isolatedModules: true`, type-only re-exports **must** use:

```typescript
export type { AlertType };
```

**DO NOT** use `export { AlertType }` for types.

---

## 8. Dependency Management Rules

- Flag large dependencies (> 200 KB) or dependencies in maintenance mode.
- Evaluate bundle-size impact before adding any new dependency.
- Prefer modern, actively maintained alternatives over heavy legacy libraries.

---

## 9. Change Detection Strategy

- `ChangeDetectionStrategy.OnPush` is **MANDATORY** on every component.
- Components without OnPush **fail code review**.
- This optimises runtime performance and prevents unnecessary re-renders.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {}
```

---

## 10. Code Review Failure Conditions

The following are **automatic blockers** during code review:

- Missing any of the mandatory component files (`.ts`, `.html`, `.scss`, `.spec.ts`)
- Services missing `.spec.ts` file
- Using Jasmine or Karma
- Missing `ChangeDetectionStrategy.OnPush`
- Using constructor event listeners
- Using imperative DOM listeners (`document.addEventListener`)
- Missing `takeUntilDestroyed()`
- Missing `DestroyRef` injection
- Importing `CommonModule`
- Keeping models/constants inside component files
- Incorrect folder placement
- Adding unreviewed heavy dependencies
- Tests not covered or failing

---

## 11. Styling & Design System Rules

- Use **TailwindCSS** utilities and Design System components for styling.
- Avoid custom CSS/SCSS unless for:
  - Complex animations
  - Third-party library overrides
  - Rare edge cases with no Tailwind equivalent
- **Spacing & sizing:** use `rem` units only — never `px`.
- **Colors:** use Design System tokens; never hardcode hex values.
- **Index files:** do not duplicate inside subfolders; always reuse the parent `index.ts`.
- **Directional classes:** use `start` and `end` instead of `left` and `right` consistently.

---

## 12. Dialog Dimension Standards

| Dialog Type    | Width   | Height | Radius | Flow       | Notes             |
| -------------- | ------- | ------ | ------ | ---------- | ----------------- |
| Add / Edit     | 620px   | 820px  | 16px   | Vertical   | Fixed dimensions  |
| List View      | 1,728px | 840px  | 16px   | Horizontal | Padding top: 40px |
| Delete Confirm | 400px   | auto   | 16px   | —          | Narrow confirm    |
