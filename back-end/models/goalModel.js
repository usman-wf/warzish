import { Schema, model } from 'mongoose';

const ProgressEntrySchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lb'],
            default: 'kg'
        }
    },
    bodyFatPercentage: Number
});

const GoalSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goalType: {
        type: String,
        enum: ['lose_weight', 'gain_weight', 'maintain_weight'],
        required: true
    },
    startWeight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lb'],
            default: 'kg'
        }
    },
    targetWeight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lb'],
            default: 'kg'
        }
    },
    targetBodyFatPercentage: {
        type: Number,
        min: 1,
        max: 40
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    targetDate: {
        type: Date,
        required: true
    },
    timeframe: {
        type: Number, // in months
        required: true,
        min: 1,
        max: 36 // Maximum 3 years
    },
    progressEntries: [ProgressEntrySchema],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate progress percentage
GoalSchema.methods.calculateProgress = function () {
    if (!this.progressEntries || this.progressEntries.length === 0) {
        return 0;
    }

    // Get latest progress entry
    const latestEntry = this.progressEntries[this.progressEntries.length - 1];

    if (this.goalType === 'lose_weight' && this.targetWeight && this.startWeight) {
        const totalWeightToLose = this.startWeight.value - this.targetWeight.value;
        const weightLostSoFar = this.startWeight.value - latestEntry.weight.value;

        if (totalWeightToLose <= 0) return 0;
        return Math.min(100, Math.max(0, (weightLostSoFar / totalWeightToLose) * 100));
    }
    else if (this.goalType === 'gain_weight' && this.targetWeight && this.startWeight) {
        const totalWeightToGain = this.targetWeight.value - this.startWeight.value;
        const weightGainedSoFar = latestEntry.weight.value - this.startWeight.value;

        if (totalWeightToGain <= 0) return 0;
        return Math.min(100, Math.max(0, (weightGainedSoFar / totalWeightToGain) * 100));
    }

    return 0;
};

const Goal = model('Goal', GoalSchema);
export default Goal; 