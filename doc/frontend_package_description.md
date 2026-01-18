# Frontend Package Descriptions

This document outlines the architectural structure of the **SportZone Frontend** application, organized into layers as defined in the package diagram.

## 01 Presentation Layer
Directly responsible for what the user sees and interacts with.

- **01 Pages**: Represents the main application structure, including all page-level modules. Each page serves as a route entry point and defines the overall layout and logic for its specific feature.
  - *Location*: `src/pages`
- **02 Components**: Contains reusable UI components organized into functional sections. These components form the building blocks of the user interface and are imported across multiple pages.
  - *Location*: `src/components`

## 02 Logic Layer
Handles the state, business logic, and side effects of the application.

- **03 Hooks**: Contains custom React hooks. These hooks encapsulate reusable logic for state management, data fetching, and user interaction handling.
  - *Location*: `src/hooks`
- **04 Store**: Manages the global state using Redux Toolkit. It includes the store initialization and integration of all feature-specific slices.
  - *Location*: `src/store`
- **05 Thunks**: Handles asynchronous business logic and API interactions. Thunks are responsible for dispatching actions based on the lifecycle of data fetching operations (pending, fulfilled, rejected).
  - *Location*: `src/features/*/*Thunk.ts`
- **06 Slices**: Contains feature-specific Redux reducers and state logic. Each slice manages a distinct domain of the application state (e.g., auth, matching, booking).
  - *Location*: `src/features/*/*Slice.ts`
- **07 Context**: Provides local state management and configuration through the React Context API, used for shallow prop-drilling avoidance and specific feature state.
  - *Location*: `src/context`

## 03 Core Layer
Provides foundational utilities, types, and configurations shared across the app.

- **08 Services (API)**: The Service Layer is responsible for communicating with the backend API. It defines functions for authentication, data retrieval, submission, and management of asynchronous operations.
  - *Location*: `src/features/*/*API.ts`
- **09 Types**: Defines all TypeScript type declarations and interfaces. This ensures type safety, consistency, and better code readability across all layers.
  - *Location*: `src/types`
- **10 Utils & Lib**: Contains helper functions and utility functions along with core library configurations. These functions simplify common operations and promote cleaner code architecture.
  - *Location*: `src/utils`, `src/lib`
- **11 Routes**: Holds the global routing configuration. It defines path mappings to pages and handles access control (e.g., protected routes).
  - *Location*: `src/routes`

## 04 Assets
Static resources used by the application.

- **12 Public**: Static files such as icons, images, manifests, and specialized scripts. These files are served directly to the client.
  - *Location*: `/public`
