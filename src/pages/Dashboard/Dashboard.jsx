//import FileManager from "../components/FileManager";
import "./Dashboard.css";
import Instrument from "../../elements/Instrument/Instrument";
import exportIcon from "../../assets/images/instruments/export.svg";
import importIcon from "../../assets/images/instruments/import.svg";
import cancel from "../../assets/images/instruments/cancel.svg";
import repeat from "../../assets/images/instruments/repeat.svg";
import { useState } from "react";
import PullOutMenu from "../../elements/PullOutMenu/PullOutMenu";
import Instruments from "../../elements/Instruments/Instruments";
import Classes from "../../elements/Classes/Classes";
import Workspace from "../../elements/Workspace/Workspace";

function Dashboard() {
  const [formData, setFormData] = useState({
    condition: "notMarked",
  });
  const [instrumentsData, setInstrumentsData] = useState({
    center: 1,
    width: 1,
    base: "",
    bright: 0,
    contrast: 0,
  });
  const [fourImage, setFourImage] = useState(false);

  const onChangeForm = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onChangeInstruments = (e) =>
    setInstrumentsData({ ...instrumentsData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    //setIsAuthenticated(true);
  };

  function onClick() {
    console.log("Клик");
  }

  function onClickView() {
    setFourImage(!fourImage);
  }

  return (
    <>
      <div className="dashboard">
        {/* <div className="dashboard__user_info"></div>
                <FileManager/> */}

        <div className="dashboard__header">
          <div className="dashboard__control">
            <a className="dashboard__back">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.00005 4.54997C7.15005 4.79997 7.05005 5.09997 6.80005 5.24997L2.85005 7.49997H15C15.3 7.49997 15.5 7.69997 15.5 7.99997C15.5 8.29997 15.3 8.49997 15 8.49997H2.85005L6.80005 10.8C7.05005 10.95 7.10005 11.25 7.00005 11.5C6.85005 11.75 6.55005 11.8 6.30005 11.7L0.750049 8.44997C0.400049 8.24997 0.400049 7.79997 0.750049 7.59997L6.30005 4.39997C6.55005 4.19997 6.85005 4.29997 7.00005 4.54997Z"
                  fill="#5693E1"
                />
              </svg>
              <span className="dashboard__back-info">
                Вернуться к списку исследований
              </span>
            </a>
            <ul className="dashboard__control-list">
              <li className="dashboard__control-item">
                <Instrument
                  img={exportIcon}
                  alt="Экспорт"
                  onClick={onClick}
                  disabled={false}
                />
              </li>
              <li className="dashboard__control-item">
                <Instrument
                  img={importIcon}
                  alt="Импорт"
                  onClick={onClick}
                  disabled={false}
                />
              </li>
              <li className="dashboard__control-item">
                <Instrument
                  img={cancel}
                  alt="Отменить"
                  onClick={onClick}
                  disabled={false}
                />
              </li>
              <li className="dashboard__control-item">
                <Instrument
                  img={repeat}
                  alt="Повторить"
                  onClick={onClick}
                  disabled={false}
                />
              </li>
            </ul>
          </div>

          <form className="dashboard__condition" onSubmit={handleSubmit}>
            <select
              className="dashboard__select"
              name="condition"
              onChange={(e) => onChangeForm(e)}
            >
              <option value="Не размечен">Не размечен</option>
              <option value="В процессе разметки">В процессе разметки</option>
              <option value="Размечен">Размечен</option>
              <option value="Отклонён">Отклонён</option>
            </select>
            <button type="submit" className="dashboard__btn">
              Сохранить
            </button>
          </form>
        </div>

        <div className="dashboard__center">
          <Instruments
            onClick={onClick}
          />

          <Workspace
            fourImage={fourImage}
            onClick={onClick}
            onClickView={onClickView}
          />

          <Classes />
        </div>

        <PullOutMenu onChange={onChangeInstruments} data={instrumentsData} />
      </div>
    </>
  );
}

export default Dashboard;
