import './App.css';
import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import FileManager from './elements/FileUpload';
import Marker from './components/Marker';
import PropTypes from "prop-types"
import { connect } from 'react-redux'
import { refreshToken } from './actions/auth';
import context from './context';
import { useEffect } from 'react';

const App = ({token, refresh, refreshToken}) => {

  const checkToken = () => {
    if (refresh !== null && token !== null) {
      try {
        refreshToken(refresh)
      } catch (e) {
          console.log(e)
          window.location = "/"
      }
    }
  }

  useEffect(() => {
    setInterval(() => {
          checkToken()
    }, 590000)
    checkToken()
  }, [])

  const authRequestHeader = {
    "Authorization": `Bearer ${token}`
  }

  const contextValue = {
    authRequestHeader, 
  }


  return (
      <context.Provider value={contextValue}>
      <wc-toast></wc-toast>
      <div className="App">
        <canvas id="canvas"></canvas>
        <Router>
            <Routes>
              <Route path='*' element={<h1>Not Found</h1>} />
              <Route path="/" exact element={<SignIn/>}/>
              <Route path="/dashboard/" exact element={
                <Dashboard>
                  <FileManager/>
                </Dashboard>
              }/>
              
              <Route path="/marker/:study/:instance/" element={<Marker/>}/>
            </Routes>
        </Router>
      </div>
      </context.Provider>
  );
}

App.propTypes = {
  token: PropTypes.string,
  refresh: PropTypes.string,
  refreshToken: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  token: state.auth.token,
  refresh: state.auth.refresh,
})

export default connect(mapStateToProps, {refreshToken})(App)