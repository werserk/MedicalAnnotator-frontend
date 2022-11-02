function FilterItem({
  onChange,
  filters,
  nameInput,
  label,
  placeholder,
}) {
  return (
    <li className="filter__item">
      <label className="filter__label">{label}</label>
      <input
        className="filter__input"
        onChange={(e) => onChange(e)}
        type="text"
        name={nameInput}
        value={filters[nameInput]}
        placeholder={placeholder}
      />
    </li>
  );
}

export default FilterItem;
