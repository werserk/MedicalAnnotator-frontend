import "./UsersList.css";
import TableUsers from "../components/TableUsers";

const UsersList = () => {
  return (
    <div className="users">
      <h1 className="users__title">Список врачей</h1>
      <TableUsers />
    </div>
  );
};

export default UsersList;
