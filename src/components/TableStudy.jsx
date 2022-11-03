import "./Table.css";
import pensil from "../assets/images/pensil.svg";
import deleteIcon from "../assets/images/deleteIcon.svg";

function TableStudy({ openEditPopup, openDeletePopup, filteredTable }) {
  return (
    <div className="table">
      <div className="table__list table__list_title table__list_name_study">
        <div className="table__item table__item_name_title">ID пациента</div>
        <div className="table__item table__item_name_title">ФИО пациента</div>
        <div className="table__item table__item_name_title">Дата загрузки</div>
        <div className="table__item table__item_name_title">
          Дата исследования
        </div>
        <div className="table__item table__item_name_title">Модальность</div>
        <div className="table__item table__item_name_title">Состояние</div>
        <div></div>
        <div></div>
      </div>

      {filteredTable.length !== 0 ? (
        filteredTable.map((study) => {
          return (
            <div className="table__list table__list_name_study" key={study.id}>
              <div className="table__item">{study.id}</div>
              <div className="table__item">{study.name}</div>
              <div className="table__item">{study.dateDownload}</div>
              <div className="table__item">{study.dateStudy}</div>
              <div className="table__item">{study.modal}</div>
              <div className="table__item">{study.condition}</div>
              <div className="table__item">
                <button
                  type="button"
                  className="table__btn"
                  onClick={openEditPopup}
                >
                  <img className="table__icon" src={pensil} alt="Редактировать" />
                </button>
              </div>
              <div className="table__item">
                <button
                  type="button"
                  className="table__btn"
                  onClick={openDeletePopup}
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
        })
      ) : (
        <div className="table__nothing">Ничего не найдено</div>
      )}
    </div>
  );
}

export default TableStudy;
