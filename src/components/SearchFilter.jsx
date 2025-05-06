import PropTypes from 'prop-types';

const SearchFilter = ({ searchTerm, onSearchChange, filters = [] }) => {
  return (
    <div className="card mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input"
          />
        </div>
        
        {filters.map((filter, index) => (
          <div key={index} className="min-w-[150px]">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="select"
            >
              {filter.options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

SearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      value: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired
    })
  )
};

SearchFilter.defaultProps = {
  filters: []
};

export default SearchFilter;