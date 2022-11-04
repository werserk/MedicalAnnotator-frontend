import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import Dashboard from "./pages/Dashboard/Dashboard";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import UsersList from "./pages/UsersList/UsersList";
import Study from "./pages/Study/Study";
import Generation from "./pages/Generation/Generation";
import FileManager from "./elements/FileUpload";
import Marker from "./components/Marker";
import Header from "./components/Header/Header";
import PopupInfo from "./elements/Popup/PopupInfo";
import Preloader from "./components/Preloader/Preloader";
import { useState } from "react";
import studiesApi from "./utils/StudiesApi";
import EditPopup from "./components/EditPopup/EditPopup";
import DeletePopup from "./components/DeletePopup/DeletePopup";
import AddPopup from "./components/AddPopup/AddPopup";

function App() {
  const [isSuperUser, setIsSuperUser] = useState(true); //Суперюзер

  const [isOpenEditPopup, setIsOpenEditPopup] = useState(false); //Попап редактирования исследования
  const [isOpenDeletePopup, setIsOpenDeletePopup] = useState(false); //Попап удаления исследования
  const [isOpenAddPopup, setIsOpenAddPopup] = useState(false); //Попап добавления исследования
  const [isOpenErrorPopup, setIsOpenErrorPopup] = useState(false); //Попап ошибки
  const [infoText, setInfoText] = useState("");

  const [isGenerated, setIsGenerated] = useState(false); //Сгенерированы ли патологии

  const [isLoading, setIsLoading] = useState(false); //Прелоадер

  const [studies, setStudies] = useState([]); // Все исследования
  const [study, setStudy] = useState({}); // Исследование
  const [users, setUsers] = useState([]); // Все врачи

  function getStudies() {
    setIsLoading(true);

    studiesApi
      .getAllStudies()
      .then((res) => {
        setStudies(res);
      })
      .catch((err) => {
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function getUsers() {
    setIsLoading(true);

    studiesApi
      .getAllUsers()
      .then((res) => {
        setUsers(res);
      })
      .catch((err) => {
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function closeAllPopups() {
    setIsOpenEditPopup(false);
    setIsOpenDeletePopup(false);
    setIsOpenAddPopup(false);
    setIsOpenErrorPopup(false);
  }

  function openEditPopup(study) {
    setStudy(study);
    setIsOpenEditPopup(true);
  }

  function openDeletePopup(study) {
    setStudy(study);
    setIsOpenDeletePopup(true);
  }

  function openAddPopup() {
    setIsOpenAddPopup(true);
  }

  function openErrorPopup(errorText) {
    setInfoText(errorText);
    setIsOpenErrorPopup(true);
  }

  function editStudy(id, newComment) {
    setIsLoading(true);

    studiesApi
      .editStudy(id, {
        comment: newComment,
      })
      .then((res) => {
        closeAllPopups();
      })
      .catch((err) => {
        closeAllPopups();
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function deleteStudy(id) {
    setIsLoading(true);

    studiesApi
      .deleteStudy(50)
      .then((res) => {
        setStudies(studies.filter((study) => study.unique_id !== id));
        closeAllPopups();
      })
      .catch((err) => {
        closeAllPopups();
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function addStudy(newStudy) {
    console.log(newStudy);

    setIsLoading(true);

    studiesApi
      .addNewStudy(newStudy)
      .then((res) => {
        setStudies([newStudy, ...studies]);
        closeAllPopups();
      })
      .catch((err) => {
        closeAllPopups();
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function handleGenerate() {
    setIsGenerated(true);
    console.log("Сгенерировать");
  }

  function onContextMenu() {
    return false;
  }

  function choiceUser(userId) {
    setIsLoading(true);

    studiesApi
      .getUserStudies(userId)
      .then((res) => {
        setStudies(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
        closeAllPopups();
        openErrorPopup(err.statusText);
      })
      .finally(setIsLoading(false));
  }

  function choiceStudy(study) {
    console.log(study);
  }

  function generateStudies(studies) {
    console.log(studies);
  }

  return (
    <>
      <wc-toast></wc-toast>
      <div className="App" onContextMenu={onContextMenu}>
        <div className="page">
          <Router>
            <Header isSuperUser={isSuperUser} />

            <main className="content">
              <Routes>
                <Route path="*" element={<PageNotFound />} />
                <Route path="/signin" exact element={<SignIn />} />
                <Route path="/signup" exact element={<SignUp />} />
                <Route
                  path="/users"
                  exact
                  element={
                    <UsersList
                      users={users}
                      getUsers={getUsers}
                      choiceUser={choiceUser}
                    />
                  }
                />
                <Route
                  path="/users/:id"
                  exact
                  element={
                    <Study
                      openEditPopup={openEditPopup}
                      openDeletePopup={openDeletePopup}
                      openAddPopup={openAddPopup}
                      studies={studies}
                      getStudies={getStudies}
                      choiceStudy={choiceStudy}
                      isSuperUser={isSuperUser}
                      getUserStudies={choiceUser}
                    />
                  }
                />
                {!isSuperUser && 
                <Route
                path="/study"
                exact
                element={
                  <Study
                    openEditPopup={openEditPopup}
                    openDeletePopup={openDeletePopup}
                    openAddPopup={openAddPopup}
                    studies={studies}
                    getStudies={getStudies}
                    choiceStudy={choiceStudy}
                    isSuperUser={isSuperUser}
                  />
                }
              />}
                
                <Route
                  path="/generation"
                  exact
                  element={
                    <Generation
                      isGenerated={isGenerated}
                      onSubmit={handleGenerate}
                      generateStudies={generateStudies}
                    />
                  }
                />
                <Route
                  path="/dashboard"
                  exact
                  element={
                    <Dashboard>
                      <FileManager />
                    </Dashboard>
                  }
                />

                <Route path="/marker/:study/:instance/" element={<Marker />} />
              </Routes>
            </main>
          </Router>
        </div>
      </div>

      <EditPopup
        study={study}
        isOpen={isOpenEditPopup}
        onClose={closeAllPopups}
        onEdit={editStudy}
      />

      <DeletePopup
        study={study}
        isOpenDeletePopup={isOpenDeletePopup}
        closeAllPopups={closeAllPopups}
        deleteStudy={deleteStudy}
      />

      <AddPopup
        isOpenAddPopup={isOpenAddPopup}
        closeAllPopups={closeAllPopups}
        addStudy={addStudy}
      />

      <PopupInfo
        title="Ошибка"
        info={infoText}
        isOpen={isOpenErrorPopup}
        onClose={closeAllPopups}
      />

      <Preloader isLoading={isLoading} />
    </>
  );
}

export default App;
