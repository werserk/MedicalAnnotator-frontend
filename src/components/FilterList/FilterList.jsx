import "./FilterList.css";
import deleteIcon from "../../assets/images/deleteIcon.svg";
import FilterItem from "../FilterItem/FilterItem";

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
                <FilterItem onChange={onChange} filters={filters} nameInput="date_upload" label="Дата загрузки" placeholder="дд.мм.гггг" />
                <FilterItem onChange={onChange} filters={filters} nameInput="date_study" label="Дата исследования" placeholder="дд.мм.гггг" />
                
                <li className="filter__item">
                    <label className="filter__label">Модальность</label>
                    <select className="filter__select" name="modality" onChange={(e) => onChange(e)} value={filters.modal}>
                        <option value="" disabled>Выбрать</option>
                        <option value="CT">CT</option>
                        <option value="WG">WG</option>
                        <option value="MRI">MRI</option>
                    </select>
                </li>
                <li className="filter__item">
                    <label className="filter__label">Состояние</label>
                    <select className="filter__select" name="state" onChange={(e) => onChange(e)} value={filters.condition}>
                        <option value="" disabled>Выбрать</option>
                        <option value="Не размечен">Не размечен</option>
                        <option value="В процессе разметки">В процессе разметки</option>
                        <option value="Размечен">Размечен</option>
                        <option value="Отклонён">Отклонён</option>
                    </select>
                </li>
            </ul>

            <button className="filter__btn" type="submit">Показать</button>
        </form>
    );
}

export default FilterList;
