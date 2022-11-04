import TableStudy from "../../components/Table/TableStudy";
import FilterList from "../../components/FilterList/FilterList";
import "./Study.css";
import { useState } from "react";
import { useEffect } from "react";

function Study({ openEditPopup, openDeletePopup, openAddPopup, studies, getStudies, choiceStudy }) {
  const [filteredTable, setFilteredTable] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    date_upload: "",
    date_study: "",
    modality: "",
    state: "",
  });

  useEffect(() => {
    getStudies();
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
