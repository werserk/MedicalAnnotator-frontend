import "./Table.css";
import UserElement from "../../elements/UserElement/UserElement";

function TableUsers({ users, choiceUser }) {
  return (
    <div className="table">
      <div className="table__list table__list_title table__list_name_users">
        <div className="table__item table__item_name_title">ID</div>
        <div className="table__item table__item_name_title">ФИО</div>
        {/* <div className="table__item table__item_name_title">
          Название задачи
        </div> */}
        <div className="table__item table__item_name_title">Обработано</div>
        {/* <div className="table__item table__item_name_title">Дата создания</div> */}
      </div>

      {users.map((user, i) => {
        return (
          <UserElement key={i} id={i + 1} user={user} choiceUser={choiceUser} />
        );
      })}
    </div>
  );
}

export default TableUsers;
