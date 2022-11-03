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
    dateDownload: "",
    dateStudy: "",
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

    let table = tableStudy;
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
      setFilteredTable(tableStudy);
    }
  }

  function onClean() {
    setFilteredTable(tableStudy);
    setFilters({
      name: "",
      dateDownload: "",
      dateStudy: "",
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
