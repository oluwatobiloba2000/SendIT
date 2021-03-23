import React, { lazy, Suspense }from 'react';
import {Flip } from 'react-toastify';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import UserDashboard from './pages/User/Dashboard/';
import './App.css';
import UserOrder from './pages/User/Order';
import UserProfile from './pages/User/Profile';
import Home from './pages/Home';
import LogisticsCompanyLogin from './pages/LogisticsCompanies/Login';
import CustomLoader from './components/Loader';
import EmailSentPage from './pages/EmailSentPage';
import ResetPassword from './pages/ResetPassword/reset_password';
import axios from 'axios';
import CompanyOrder from './pages/LogisticsCompanies/Order/index'
import CompanyDashboard from './pages/LogisticsCompanies/Dashboard';
import OrderDetails from './pages/User/OrderDetails';
import OrderDetailsCompany from './pages/LogisticsCompanies/OrderDetails_company';
import Profile from './pages/LogisticsCompanies/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
axios.defaults.baseURL = 'https://api-sendit-backend.herokuapp.com/api/v1';
export const CONNECTION_PORT = "https://api-sendit-backend.herokuapp.com/";
// export const CONNECTION_PORT = "http://localhost:4004";
// axios.defaults.baseURL = 'http://localhost:4004/api/v1';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const LogisticsCompanySignup = lazy(() => import('./pages/LogisticsCompanies/Signup'));
const ForgotPassword = lazy(() => import('./pages/forgotPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {


  return (
    <Suspense fallback={<CustomLoader position="fixed" />}>
      <div className="App">
       <Router>
         <Switch>
           <Route path="/" component={Home} exact={true}/>
           <Route path="/user/dashboard" exact={true} component={UserDashboard}/>
           <Route path="/user/order" component={UserOrder} exact={true}/>
           <Route path="/company/signup" component={LogisticsCompanySignup} exact={true}/>
           <Route path="/company/login" component={LogisticsCompanyLogin} exact={true}/>
           <Route path="/company/dashboard" exact={true} component={CompanyDashboard}/>
           <Route path="/user/profile" component={UserProfile} exact={true}/>
           <Route path="/forgotpassword"  component={ForgotPassword}/>
           <Route path="/password/reset"  component={ResetPassword}/>
           <Route path="/email/sent"  component={EmailSentPage}/>
           <Route path="/company/order" exact={true} component={CompanyOrder}/>
           <Route path="/company/profile" exact={true} component={Profile}/>
           <Route path="/user/track/order/:track_number" exact={true} component={OrderDetails}/>
           <Route path="/company/track/order/:track_number" exact={true} component={OrderDetailsCompany}/>
           <Route  component={NotFound}/>
         </Switch>
       </Router>
       <ToastContainer transition={Flip} limit={1}/>
      </div>
    </Suspense>
  );
}

export default App;
