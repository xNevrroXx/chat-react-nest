import {type Action, type Middleware, configureStore} from "@reduxjs/toolkit";
import reduxThunk from "redux-thunk";
// reducers
import authentication from "./slices/authentication";
import chats from "./slices/chats";
import users from "./slices/users";

const loggerMiddleware: Middleware = (api) => (next: AppDispatch) => <A extends Action>(action: A) => {
    console.log("will dispatch: ", action);
    next(action);
    console.log("after dispatch: ", api.getState());
};

const store = configureStore({
    reducer: {authentication, chats, users},
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(reduxThunk, loggerMiddleware),
    enhancers: [],
    preloadedState: undefined,
    devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export {store};