import pensil from "../../assets/images/pensil.svg";
import deleteIcon from "../../assets/images/deleteIcon.svg";

function StudyElement({ study, openEditPopup, openDeletePopup, choiceStudy }) {
    
    function handleEdit() {
        openEditPopup(study);
    }

    function handleDelete() {
        openDeletePopup(study);
    }

    function handleStudy(e) {
      if(!e.target.className.includes("table__icon")) {
        choiceStudy(study);
      }
    }

    return (
        <div className="table__list table__list_name_study" onClick={handleStudy}>
              <div className="table__item">{study.patient_id}</div>
              <div className="table__item">{study.series_id}</div>
              <div className="table__item">{study.name}</div>
              <div className="table__item">{study.date_upload}</div>
              <div className="table__item">{study.date_study}</div>
              <div className="table__item">{study.modality}</div>
              <div className="table__item">{study.state}</div>
              <div className="table__item">
                <button
                  type="button"
                  className="table__btn"
                  onClick={handleEdit}
                >
                  <img className="table__icon" src={pensil} alt="Редактировать" />
                </button>
              </div>
              <div className="table__item">
                <button
                  type="button"
                  className="table__btn"
                  onClick={handleDelete}
                >
                  <img
                    className="table__icon table__icon_name_delete"
                    src={deleteIcon}
                    alt="Удалить"
                  />
                </button>
              </div>
            </div>
    );
}

export default StudyElement;
