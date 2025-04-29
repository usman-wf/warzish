 
import star from '../assets/star.svg'
import './WorkoutCard.css'

const WorkoutCard = ({workout, clicked}) => {

    return (
        <div className="WorkoutCard" key={workout.id}>
            <h2 className="CardTitle">
                {workout.title}
            </h2>
            <div className="Status">
                <div className="Difficulty StatusWrapper">
                    {workout.difficulty}
                </div>
                <div className="Category StatusWrapper">
                    {workout.category}
                </div>
            </div>
            <div className="Rating">
                <img src={star} alt="" />
                <img src={star} alt="" />
                <img src={star} alt="" />
                <img src={star} alt="" />
            </div>
            <div className="LineBreak"></div>
            <p className="Description">
                {workout.description}
            </p>
            <button className="button secondary" onClick={() => clicked(workout.id)}>
                View Workout
            </button>
        </div>
    )
}

export default WorkoutCard