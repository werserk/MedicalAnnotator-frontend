import "./Table.css";
import { tableUsers } from "../constans";

function TableUsers() {
  return (
    <div className="table">
      <div className="table__list table__list_title table__list_name_users">
        <div className="table__item table__item_name_title">ID</div>
        <div className="table__item table__item_name_title">ФИО</div>
        {/* <div className="table__item table__item_name_title">
          Название задачи
        </div> */}
        <div className="table__item table__item_name_title">Обработано</div>
        <div className="table__item table__item_name_title">Дата создания</div>
      </div>

      {tableUsers.map((user) => {
        const percentage = `${user.performed} / ${user.total} (${Math.round(
          (user.performed * 100) / user.total
        )}%)`;

        return (
          <div className="table__list table__list_name_users" key={user.id}>
            <div className="table__item">{user.id}</div>
            <div className="table__item">{user.name}</div>
            {/* <div className="table__item">{user.taskName}</div> */}
            <div className="table__item">{percentage}</div>
            <div className="table__item">{user.date}</div>
          </div>
        );
      })}
    </div>
  );
}

export default TableUsers;
