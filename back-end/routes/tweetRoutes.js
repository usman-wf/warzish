import { Router } from 'express';
import {
    getAllTweets,
    createTweet,
    likeTweet,
    commentOnTweet,
    getTweetById,
    deleteTweet
} from '../controllers/tweetController.js';
import { authenticateToken } from './authRoutes.js';

const router = Router();

// Get all tweets
router.get('/tweets', authenticateToken, getAllTweets);

// Create a new tweet
router.post('/tweets', authenticateToken, createTweet);

// Get a single tweet
router.get('/tweets/:tweetId', authenticateToken, getTweetById);

// Like/unlike a tweet
router.post('/tweets/:tweetId/like', authenticateToken, likeTweet);

// Comment on a tweet
router.post('/tweets/:tweetId/comment', authenticateToken, commentOnTweet);

// Delete a tweet
router.delete('/tweets/:tweetId', authenticateToken, deleteTweet);

export default router;