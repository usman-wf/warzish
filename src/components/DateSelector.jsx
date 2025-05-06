import PropTypes from 'prop-types';
import { format, addDays, subDays } from 'date-fns';

const DateSelector = ({ selectedDate, onChange }) => {
  const handlePreviousDay = () => {
    onChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onChange(addDays(selectedDate, 1));
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handlePreviousDay}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        &lt;
      </button>
      <span className="font-medium">
        {format(selectedDate, 'MMMM d, yyyy')}
      </span>
      <button
        onClick={handleNextDay}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        &gt;
      </button>
    </div>
  );
};

DateSelector.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired
};

export default DateSelector;