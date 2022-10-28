import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import FileManager from './elements/FileUpload';
import Marker from './components/Marker';

const App = () => {

  return (
    <>
      <wc-toast></wc-toast>
      <div className="App">
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
    </>
  );
}

export default App