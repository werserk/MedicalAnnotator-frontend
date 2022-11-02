import TableStudy from "../components/TableStudy";
import FilterList from "../components/FilterList";
import "./Study.css";
import { useState } from "react";
import { tableStudy } from "../constans";
import { useEffect } from "react";

function Study({ openEditPopup, openDeletePopup, openAddPopup }) {
  const [filteredTable, setFilteredTable] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    dateDownloadFrom: "",
    dateDownloadTo: "",
    dateStudyFrom: "",
    dateStudyTo: "",
    modal: "",
    condition: "",
  });

  useEffect(() => {
    setFilteredTable(tableStudy);
  }, []);

  function onChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleFilter(e) {
    e.preventDefault();

    for (let key in filters) {
      if (filters[key] !== "") {
        console.log(key);
        console.log(filteredTable[key]);
      }
    }
  }

  function onClean() {
    setFilteredTable(tableStudy);
    setFilters({
      name: "",
      dateDownloadFrom: "",
      dateDownloadTo: "",
      dateStudyFrom: "",
      dateStudyTo: "",
      modal: "",
      condition: "",
    });
  }

  return (
    <div className="study">
      <div className="study__header">
        <h1 className="study__title">Список исследований</h1>
        <button type="button" className="study__btn" onClick={openAddPopup}>
          Добавить<span className="study__plus">+</span>
        </button>
      </div>

      <div className="study__container">
        <TableStudy
          openEditPopup={openEditPopup}
          openDeletePopup={openDeletePopup}
          filteredTable={filteredTable}
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
