import "./Table.css";
import StudyElement from "../../elements/StudyElement/StudyElement";

function TableStudy({
  openEditPopup,
  openDeletePopup,
  filteredTable,
  choiceStudy,
}) {
  return (
    <div className="table">
      <div className="table__list table__list_title table__list_name_study">
        <div className="table__item table__item_name_title">ID пациента</div>
        <div className="table__item table__item_name_title">
          ID исследования
        </div>
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
        filteredTable.map((study, i) => {
          return (
            <StudyElement
              study={study}
              key={i}
              openEditPopup={openEditPopup}
              openDeletePopup={openDeletePopup}
              choiceStudy={choiceStudy}
            />
          );
        })
      ) : (
        <div className="table__nothing">Ничего не найдено</div>
      )}
    </div>
  );
}

export default TableStudy;
