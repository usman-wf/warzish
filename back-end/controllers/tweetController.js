import Tweet from '../models/tweetModel.js';
import User from '../models/userModel.js';

// Get all tweets
export const getAllTweets = async (req, res) => {
    try {
        const tweets = await Tweet.find()
            .sort({ createdAt: -1 }) // Sort by most recent
            .populate({
                path: 'author',
                select: 'name username profilePicture'
            })
            .populate({
                path: 'comments.author',
                select: 'name username profilePicture'
            });

        res.status(200).json(tweets);
    } catch (error) {
        console.error('Error getting tweets:', error);
        res.status(500).json({ error: 'Failed to fetch tweets' });
    }
};

// Create a new tweet
export const createTweet = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Tweet content is required' });
        }

        const newTweet = new Tweet({
            content,
            author: req.user._id
        });

        await newTweet.save();

        // Populate author details before returning
        await newTweet.populate({
            path: 'author',
            select: 'name username profilePicture'
        });

        res.status(201).json(newTweet);
    } catch (error) {
        console.error('Error creating tweet:', error);
        res.status(500).json({ error: 'Failed to create tweet' });
    }
};

// Like a tweet
export const likeTweet = async (req, res) => {
    try {
        const { tweetId } = req.params;
        const userId = req.user._id;

        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        // Check if user already liked the tweet
        const alreadyLiked = tweet.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike the tweet
            tweet.likes = tweet.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like the tweet
            tweet.likes.push(userId);
        }

        await tweet.save();

        // Populate details before returning
        await tweet.populate([
            {
                path: 'author',
                select: 'name username profilePicture'
            },
            {
                path: 'comments.author',
                select: 'name username profilePicture'
            }
        ]);

        res.status(200).json(tweet);
    } catch (error) {
        console.error('Error liking tweet:', error);
        res.status(500).json({ error: 'Failed to like tweet' });
    }
};

// Add a comment to a tweet
export const commentOnTweet = async (req, res) => {
    try {
        const { tweetId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        // Add comment
        tweet.comments.push({
            content,
            author: userId
        });

        await tweet.save();

        // Populate details before returning
        await tweet.populate([
            {
                path: 'author',
                select: 'name username profilePicture'
            },
            {
                path: 'comments.author',
                select: 'name username profilePicture'
            }
        ]);

        res.status(200).json(tweet);
    } catch (error) {
        console.error('Error commenting on tweet:', error);
        res.status(500).json({ error: 'Failed to comment on tweet' });
    }
};

// Get a single tweet by ID
export const getTweetById = async (req, res) => {
    try {
        const { tweetId } = req.params;

        const tweet = await Tweet.findById(tweetId)
            .populate({
                path: 'author',
                select: 'name username profilePicture'
            })
            .populate({
                path: 'comments.author',
                select: 'name username profilePicture'
            });

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        res.status(200).json(tweet);
    } catch (error) {
        console.error('Error getting tweet:', error);
        res.status(500).json({ error: 'Failed to fetch tweet' });
    }
};

// Delete a tweet
export const deleteTweet = async (req, res) => {
    try {
        const { tweetId } = req.params;
        const userId = req.user._id;

        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            return res.status(404).json({ error: 'Tweet not found' });
        }

        // Check if the user is the author of the tweet
        if (tweet.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this tweet' });
        }

        await Tweet.findByIdAndDelete(tweetId);

        res.status(200).json({ message: 'Tweet deleted successfully' });
    } catch (error) {
        console.error('Error deleting tweet:', error);
        res.status(500).json({ error: 'Failed to delete tweet' });
    }
};