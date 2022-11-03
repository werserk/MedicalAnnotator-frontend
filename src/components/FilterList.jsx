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
                <FilterItem onChange={onChange} filters={filters} nameInput="dateDownload" label="Дата загрузки" placeholder="дд.мм.гггг" />
                <FilterItem onChange={onChange} filters={filters} nameInput="dateStudy" label="Дата исследования" placeholder="дд.мм.гггг" />
                
                <li className="filter__item">
                    <label className="filter__label">Модальность</label>
                    <select className="filter__select" name="modal" onChange={(e) => onChange(e)} value={filters.modal}>
                        <option value="" disabled>Выбрать</option>
                        <option value="КТ">КТ</option>
                        <option value="РГ">РГ</option>
                        <option value="МРТ">МРТ</option>
                    </select>
                </li>
                <li className="filter__item">
                    <label className="filter__label">Состояние</label>
                    <select className="filter__select" name="condition" onChange={(e) => onChange(e)} value={filters.condition}>
                        <option value="" disabled>Выбрать</option>
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
