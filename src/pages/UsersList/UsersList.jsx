import "./UsersList.css";
import TableUsers from "../../components/Table/TableUsers";
import { useEffect } from "react";

function UsersList({ users, getUsers, choiceUser }) {
  
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="users">
      <h1 className="users__title">Список врачей</h1>
      <TableUsers users={users} choiceUser={choiceUser} />
    </div>
  );
};

export default UsersList;
