import { NavLink, useNavigate } from "react-router-dom";

function UserElement({ user, choiceUser }) {
    const percentage = `${user.studies_completed} / ${user.studies} (${Math.round(
        (user.studies_completed * 100) / user.studies
      )}%)`;

      const navigate = useNavigate();

      function handleUser() {
        choiceUser(user.unique_id);
        navigate(user.unique_id);
      }

    return (
            <div className="table__list table__list_name_users" onClick={handleUser}>
                <div className="table__item">{user.unique_id}</div>
                <div className="table__item">{user.username}</div>
                {/* <div className="table__item">{user.taskName}</div> */}
                <div className="table__item">{percentage}</div>
                {/* <div className="table__item">{user.date}</div> */}
            </div>
    );
}

export default UserElement;
