import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [280, 'Comment cannot exceed 280 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Tweet content is required'],
        trim: true,
        maxlength: [280, 'Tweet cannot exceed 280 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for checking if a user has liked this tweet
tweetSchema.virtual('isLikedBy').get(function(userId) {
    return this.likes.includes(userId);
});

const Tweet = mongoose.model('Tweet', tweetSchema);

export default Tweet;