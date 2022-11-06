import { useNavigate } from "react-router-dom";

function UserElement({ user, choiceUser, id }) {
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
                <div className="table__item">{id}</div>
                <div className="table__item">{user.full_name}</div>
                {/* <div className="table__item">{user.taskName}</div> */}
                <div className="table__item">{percentage !== "0 / 0 (NaN%)" ? percentage : "0 / 0"}</div>
                {/* <div className="table__item">{user.date}</div> */}
            </div>
    );
}

export default UserElement;
