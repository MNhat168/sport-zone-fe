# SportZone Frontend Coding Principles

## 1. DRY (Don't Repeat Yourself)
Tạo custom hooks/components chung cho logic được sử dụng nhiều lần. Sử dụng utility functions và Higher-Order Components.

## 2. Say no to hard-code and magic numbers
Sử dụng enums, constants, theme tokens, và environment variables. Tránh hardcode strings, numbers và styles trong components.

## 3. Change less, do most
Thiết kế generic components và reusable hooks. Sử dụng TypeScript generics và component composition patterns.

## 4. Say no to unnecessary re-renders
Sử dụng React.memo, useMemo, useCallback để optimize performance. Batch API calls và implement proper loading states.

## 5. RIGHT first, then optimize later
Làm đúng UI/UX và business logic trước, sau đó optimize performance với React DevTools. Focus vào maintainability.

## 6. Don't use any types and anonymous objects
Tạo TypeScript interfaces riêng với JSDoc documentation thay vì any types. Ensure type safety cho tất cả props và API responses.

## 7. Don't ignore error handling
Sử dụng Error Boundaries và proper error states. Implement user-friendly error messages và loading states cho tất cả async operations.
