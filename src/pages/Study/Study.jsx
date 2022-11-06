import TableStudy from "../../components/Table/TableStudy";
import FilterList from "../../components/FilterList/FilterList";
import "./Study.css";
import { useState } from "react";
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Study({
  openEditPopup,
  openDeletePopup,
  openAddPopup,
  studies,
  getStudies,
  choiceStudy,
  isSuperUser,
  getUserStudies
}) {
  const [filteredTable, setFilteredTable] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    date_upload: "",
    date_study: "",
    modality: "",
    state: "",
  });
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isSuperUser) {
      getStudies();
    } else {
      getUserStudies(pathname.slice(7));
    }
  }, []);

  useEffect(() => {
    onClean();
  }, [studies]);

  function onChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleFilter(e) {
    e.preventDefault();

    let table = studies;
    let filterIsClean = true;

    for (let key in filters) {
      if (filters[key] !== "") {
        filterIsClean = false;
        let newTable = [];

        table.map((item) => {
          if (item[key].includes(filters[key])) {
            newTable.push(item);
          }
        });

        table = newTable;
      }
    }

    if (!filterIsClean) {
      setFilteredTable(table);
    } else {
      setFilteredTable(studies);
    }
  }

  function onClean() {
    setFilteredTable(studies);
    setFilters({
      name: "",
      date_upload: "",
      date_study: "",
      modality: "",
      state: "",
    });
  }

  return (
    <div className="study">
      {isSuperUser && (
        <NavLink to="/users" className="study__back-link">
          Вернуться к списку врачей
        </NavLink>
      )}
      <div className="study__header">
        <h1 className="study__title">Список исследований</h1>
      {!isSuperUser &&
        <button type="button" className="study__btn" onClick={openAddPopup}>
          Добавить<span className="study__plus">+</span>
        </button>
      }
      </div>

      <div
        className={`study__container ${
          isSuperUser && "study__container_name_superuser"
        }`}
      >
        <TableStudy
          openEditPopup={openEditPopup}
          openDeletePopup={openDeletePopup}
          filteredTable={filteredTable}
          choiceStudy={choiceStudy}
        />
        <FilterList
          onClean={onClean}
          filters={filters}
          onChange={onChange}
          onSubmit={handleFilter}
        />
      </div>
    </div>
  );
}

export default Study;
