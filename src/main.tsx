// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.tsx'
//import "bootstrap/dist/css/bootstrap.min.css";
// import { RouterProvider } from 'react-router-dom'
// import {router} from './routes/main-router'
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { CustomToast } from './components/toast/notificiation-toast';
import App from './App.tsx';
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CustomToast />
      <App />
    </GoogleOAuthProvider>
  </Provider>

)
