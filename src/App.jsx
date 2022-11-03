import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import PageNotFound from "./pages/PageNotFound";
import UsersList from "./pages/UsersList";
import Study from "./pages/Study";
import Generation from "./pages/Generation";
import FileManager from "./elements/FileUpload";
import Dropzone from "./elements/Dropzone";
import Marker from "./components/Marker";
import Header from "./components/Header";
import PopupWithForm from "./elements/PopupWithForm";
import PopupInfo from "./elements/PopupInfo";
import Preloader from "./components/Preloader";
import { useState } from "react";

function App() {
  const [isSuperUser, setIsSuperUser] = useState(true); //Суперюзер

  const [isOpenEditPopup, setIsOpenEditPopup] = useState(false); //Попап редактирования исследования
  const [isOpenDeletePopup, setIsOpenDeletePopup] = useState(false); //Попап удаления исследования
  const [isOpenAddPopup, setIsOpenAddPopup] = useState(false); //Попап добавления исследования
  const [isOpenErrorPopup, setIsOpenErrorPopup] = useState(false); //Попап ошибки

  const [isGenerated, setIsGenerated] = useState(false); //Сгенерированы ли патологии

  const [isLoading, setIsLoading] = useState(false); //Прелоадер

  function closeAllPopups() {
    setIsOpenEditPopup(false);
    setIsOpenDeletePopup(false);
    setIsOpenAddPopup(false);
    setIsOpenErrorPopup(false);
  }
  function openEditPopup() {
    setIsOpenEditPopup(true);
  }
  function openDeletePopup() {
    setIsOpenDeletePopup(true);
  }
  function openAddPopup() {
    setIsOpenAddPopup(true);
  }
  function openErrorPopup() {
    setIsOpenErrorPopup(true);
  }

  function editStudy() {
    console.log("Сохранить");
  }
  function deleteStudy() {
    console.log("Удалить");
  }
  function addStudy() {
    console.log("Удалить");
  }

  function handleGenerate() {
    setIsGenerated(true);
    console.log("Сгенерировать");
  }

  function onContextMenu() {
    return false;
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
                <Route path="/users" exact element={<UsersList />} />
                <Route
                  path="/study"
                  exact
                  element={
                    <Study
                      openEditPopup={openEditPopup}
                      openDeletePopup={openDeletePopup}
                      openAddPopup={openAddPopup}
                    />
                  }
                />
                <Route
                  path="/generation"
                  exact
                  element={
                    <Generation
                      isGenerated={isGenerated}
                      onSubmit={handleGenerate}
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

      <PopupWithForm
        name="edit"
        title="Редактировать исследование"
        buttonText="Сохранить"
        isOpen={isOpenEditPopup}
        onClose={closeAllPopups}
        onSubmit={editStudy}
      >
        <div className="popup__item">
          <label className="popup__label">ФИО пациента</label>
          <input
            className="popup__input"
            onChange={(e) => onChange(e)}
            type="text"
            name="name"
          />
        </div>
        <div className="popup__item">
          <label className="popup__label">Комментарий</label>
          <textarea
            className="popup__textarea"
            onChange={(e) => onChange(e)}
            name="comment"
          ></textarea>
        </div>
      </PopupWithForm>

      <PopupWithForm
        name="delete"
        title="Удалить исследование"
        buttonText="Да"
        isOpen={isOpenDeletePopup}
        onClose={closeAllPopups}
        onSubmit={deleteStudy}
      >
        <p className="popup__info">Вы уверены?</p>
      </PopupWithForm>

      <PopupWithForm
        name="add"
        title="Добавить исследование"
        buttonText="Добавить"
        isOpen={isOpenAddPopup}
        onClose={closeAllPopups}
        onSubmit={addStudy}
      >
        <Dropzone />
      </PopupWithForm>

      <PopupInfo
        title="Ошибка"
        info="Упс, произошла ошибка!"
        isOpen={isOpenErrorPopup}
        onClose={closeAllPopups}
      />

      <Preloader isLoading={isLoading} />
    </>
  );
}

export default App;
