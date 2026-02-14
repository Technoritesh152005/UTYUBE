import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { subscriptionModel } from "../models/subscription.js";
import { userModel } from "../models/user.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channelExists = await userModel.findById(channelId);
    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }
    
    const existingSubscription = await subscriptionModel.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        await subscriptionModel.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, "Unsubscribed successfully", { subscribed: false }));
    } else {
        await subscriptionModel.create({
            subscriber: userId,
            channel: channelId,
        });
        return res
            .status(200)
            .json(new ApiResponse(200, "Subscribed successfully", { subscribed: true }));
    }
});

const getSubscriberCount = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const count = await subscriptionModel.countDocuments({ channel: channelId });

    return res
        .status(200)
        .json(new ApiResponse(200, "Subscriber count fetched", { subscribersCount: count }));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id;

    const subscriptions = await subscriptionModel
        .find({ subscriber: subscriberId })
        .populate("channel", "username fullname avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Subscribed channels fetched",
                subscriptions.map((sub) => sub.channel)
            )
        );
});

const checkSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const isSubscribed = await subscriptionModel.findOne({
        subscriber: userId,
        channel: channelId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Subscription status fetched", {
                subscribed: !!isSubscribed,
            })
        );
});

export {
    toggleSubscription,
    getSubscriberCount,
    getSubscribedChannels,
    checkSubscriptionStatus,
};  