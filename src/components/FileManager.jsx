import FileUpload from "../elements/FileUpload";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../constans";
import { errorMsg } from "../elements/Notifications";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import context from "../context";

const FileManager = () => {
  const { authRequestHeader } = useContext(context);

  const [studies, setStudies] = useState([]);
  const [instances, setInstances] = useState([]);
  const [instanceStudy, setInstanceStudy] = useState();

  const navigateTo = useNavigate();

  const getStudies = () => {
    setInstances([]);
    const url = BASE_URL + "api/studies/";

    const config = {
      headers: authRequestHeader,
    };

    try {
      axios.get(url, config).then((response) => {
        setStudies(response.data);
      });
    } catch (e) {
      console.error(e);
      errorMsg("Не смогли получить список исследований");
    }
  };

  const getInstances = (study) => {
    setInstanceStudy(study);
    setStudies([]);
    const url = BASE_URL + `api/instances/${study}/`;

    const config = {
      headers: authRequestHeader,
    };

    try {
      axios.get(url, config).then((response) => {
        setInstances(response.data);
      });
    } catch (e) {
      console.error(e);
      errorMsg("Не смогли получить список экземпляров исследований");
    }
  };

  const markerInstance = (instaceName) => {
    navigateTo(`/marker/${instanceStudy}/${instaceName}/`);
  };

  useEffect(() => {
    getStudies();
  }, []);

  return (
    <div className="file_manager">
      <FileUpload getStudies={getStudies} />
      {studies.length > 0 ? (
        <div className="file_manager__list">
          {studies.map((study, i) => (
            <div
              key={i}
              onClick={() => getInstances(study.name)}
              className="file_manager__list__item"
            >
              <span className="file_manager__list__item__name">
                {study.name}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {instances.length > 0 ? (
        <div className="file_manager__list">
          <button
            onClick={getStudies}
            className="file_manager__list_button_back"
          >
            Back to studies
          </button>
          {instances.map((instance, i) => (
            <div
              key={i}
              onClick={() => markerInstance(instance.name)}
              className="file_manager__list__item"
            >
              <span className="file_manager__list__item__name">
                {instance.name}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default FileManager;
