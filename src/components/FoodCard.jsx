import PropTypes from 'prop-types';
import { useState } from 'react';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div 
      className={`nutrition-card food-card ${expanded ? 'expanded' : ''}`} 
      onClick={toggleExpand}
    >
      <div className="food-card-category">
        {food.category || 'Food'}
      </div>
      
      <h3 className="food-card-title">{food.name}</h3>
      
      <div className="food-card-content">
        <div className="nutrition-highlights">
          <div className="nutrition-stat">
            <span className="stat-value">{food.calories || 0}</span>
            <span className="stat-label">Calories</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{food.protein || 0}g</span>
            <span className="stat-label">Protein</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{food.carbs || 0}g</span>
            <span className="stat-label">Carbs</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{food.fat || 0}g</span>
            <span className="stat-label">Fat</span>
          </div>
        </div>
        
        {expanded && (
          <div className="expanded-details">
            <div className="nutrition-detail">
              <span className="detail-label">Fiber:</span>
              <span className="detail-value">{food.fiber || 0}g</span>
            </div>
            <div className="nutrition-detail">
              <span className="detail-label">Sugar:</span>
              <span className="detail-value">{food.sugar || 0}g</span>
            </div>
            <div className="nutrition-detail">
              <span className="detail-label">Sodium:</span>
              <span className="detail-value">{food.sodium || 0}mg</span>
            </div>
            <div className="nutrition-detail">
              <span className="detail-label">Serving Size:</span>
              <span className="detail-value">
                {food.servingSize ? `${food.servingSize.value} ${food.servingSize.unit}` : 'Not specified'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FoodCard.propTypes = {
  food: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    calories: PropTypes.number,
    protein: PropTypes.number,
    carbs: PropTypes.number,
    fat: PropTypes.number,
    fiber: PropTypes.number,
    sugar: PropTypes.number,
    sodium: PropTypes.number,
    category: PropTypes.string,
    servingSize: PropTypes.shape({
      value: PropTypes.number,
      unit: PropTypes.string
    })
  }).isRequired
};

export default FoodCard;