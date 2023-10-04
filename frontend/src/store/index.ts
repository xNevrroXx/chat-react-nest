import {type Action, type Middleware, configureStore} from "@reduxjs/toolkit";
import reduxThunk from "redux-thunk";
// reducers
import authentication from "./slices/authentication";
import chat from "./slices/chat.ts";
import users from "./slices/users";

const loggerMiddleware: Middleware = (api) => (next: AppDispatch) => <A extends Action>(action: A) => {
    console.log("will dispatch: ", action);
    next(action);
    console.log("after dispatch: ", api.getState());
};

const store = configureStore({
    reducer: {authentication, chat, users},
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: {
              ignoredActionPaths: ["authentication/login/rejected"],
              ignoredActions: ["chat/socket-create/fulfilled"],
              ignoredPaths: ["chat.socket"]
          }
        }).concat(reduxThunk, loggerMiddleware),
    enhancers: [],
    preloadedState: undefined,
    devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {store};