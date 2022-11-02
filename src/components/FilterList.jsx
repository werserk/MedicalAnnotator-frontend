import "./FilterList.css";
import deleteIcon from "../assets/images/deleteIcon.svg";
import FilterItem from "./FilterItem";

function FilterList({ onClean, filters, onChange, onSubmit }) {
    return (
        <form className="filter" onSubmit={onSubmit} >
            <h2 className="filter__title">
                Фильтры
                <button type="button" className="filter__clean" onClick={onClean}>
                    <img className="filter__icon" src={deleteIcon} alt="Очистить" />
                </button>
            </h2>
            <ul className="filter__list">

                <FilterItem onChange={onChange} filters={filters} nameInput="name" label="ФИО пациента" placeholder="" />
                <FilterItem onChange={onChange} filters={filters} nameInput="dateDownloadFrom" label="Дата загрузки от" placeholder="00.00.0000" />
                <FilterItem onChange={onChange} filters={filters} nameInput="dateDownloadTo" label="Дата загрузки по" placeholder="00.00.0000" />
                <FilterItem onChange={onChange} filters={filters} nameInput="dateStudyFrom" label="Дата исследования от" placeholder="00.00.0000" />
                <FilterItem onChange={onChange} filters={filters} nameInput="dateStudyTo" label="Дата исследования по" placeholder="00.00.0000" />
                
                <li className="filter__item">
                    <label className="filter__label">Модальность</label>
                    <select className="filter__select" name="modal" onChange={(e) => onChange(e)} defaultValue="Выбрать">
                        <option value="Выбрать" disabled>Выбрать</option>
                        <option value="CT">CT</option>
                        <option value="Вариант 2">Вариант 2</option>
                        <option value="Вариант 3">Вариант 3</option>
                    </select>
                </li>
                <li className="filter__item">
                    <label className="filter__label">Состояние</label>
                    <select className="filter__select" name="condition" onChange={(e) => onChange(e)} defaultValue="Выбрать">
                        <option value="Выбрать" disabled>Выбрать</option>
                        <option value="Некорректный">Некорректный</option>
                        <option value="Завершено">Завершено</option>
                        <option value="Не завершено">Не завершено</option>
                    </select>
                </li>
            </ul>

            <button className="filter__btn" type="submit">Показать</button>
        </form>
    );
}

export default FilterList;
